# Search & Discovery — Scaling Roadmap

How Creonex search/discovery works **today**, and how to grow it into a real
discovery engine (full-text search, typo tolerance, semantic/AI recommendations,
ranking) **without rewriting the frontend**. Each phase is additive and swappable
behind the same API contract.

---

## 1. Where we are today (Phase 0)

Everything is **Postgres + Drizzle**, queried directly. No external search infra.

| Surface | Endpoint | Backed by |
|---|---|---|
| Typeahead suggestions | `GET /api/v1/search/suggestions?q=` | `search.repository.ts` — `ILIKE` over `creator_profiles` + `offerings`, plus in-memory niche-label matches |
| Explore browse/search grid | `GET /api/v1/explore` | `explore.repository.ts` — `offerings ⋈ creator_profiles`, `ILIKE` on title/description/creator, filters + sort + offset pagination |
| Personalized rail | `GET /api/v1/explore/recommended` | `learner_profiles.interested_niches` → offerings in those niches, quality-ranked |

**Ranking today** = a hand-written `ORDER BY`: `inDiscoveryBoost → qualityScore → smoothedRating → createdAt`.
**Filtering** = exact `eq()` on `type`/`primaryNiche`. **Text** = substring `ILIKE '%term%'`.

### The architectural seam that makes scaling cheap
The whole stack is layered: **controller → service → repository → Drizzle**, and the
web app only ever sees the stable DTOs `SearchResult` and `ExploreItem` (via
`page → dal → service → lib/api`). Every phase below swaps the **repository/service
internals only**. As long as we keep returning `SearchResult[]` / `BrowseOfferingsResponse`,
the frontend never changes.

```
web (unchanged)  →  SearchService / ExploreService  →  [ swap this layer ]
                                                         Phase 0: Postgres
                                                         Phase 1: Postgres FTS
                                                         Phase 2: Elasticsearch / Typesense
                                                         Phase 3: + Recommender
                                                         Phase 4: Discovery Engine
```

### Limits of Phase 0 (the "why scale")
- `ILIKE '%term%'` has a **leading wildcard** → cannot use a B-tree index → sequential scan. Fine at hundreds of rows, slow at tens of thousands.
- **No typo tolerance** ("figam" finds nothing), no stemming ("design" ≠ "designing"), no synonyms.
- **No relevance scoring** — a title match and a creator-name match rank the same; order is purely by creator quality, not query match strength.
- **No facets/aggregations** (counts per niche/price bucket) without extra queries.
- **Recommendations are rule-based** (niche overlap), not behavioral.

---

## 2. Phase 1 — Postgres-native FTS + trigram (no new infra)

The cheapest large win. Stay on Neon/Postgres; add two capabilities.

### 2a. Trigram fuzzy matching (`pg_trgm`)
Makes `ILIKE '%term%'` index-accelerated **and** adds typo tolerance via similarity.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_offerings_title_trgm ON offerings USING gin (title gin_trgm_ops);
CREATE INDEX idx_creator_display_trgm ON creator_profiles USING gin (display_name gin_trgm_ops);
```
Then `ORDER BY similarity(title, :q) DESC` for fuzzy ranking; `WHERE title % :q` for "close enough" matches. **Connect:** add the migration under `apps/api/src/database/`, change the `ilike(...)` calls in `search.repository.ts` / `explore.repository.ts` to similarity-based ordering. No API/DTO change.

### 2b. Full-text search (`tsvector`)
Real word search: stemming, ranking (`ts_rank`), multi-field weighting.

```sql
ALTER TABLE offerings ADD COLUMN search_doc tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(description,'')), 'B')
  ) STORED;
CREATE INDEX idx_offerings_fts ON offerings USING gin (search_doc);
-- query: WHERE search_doc @@ websearch_to_tsquery('english', :q)
--        ORDER BY ts_rank(search_doc, websearch_to_tsquery('english', :q)) DESC
```

**When Phase 1 is enough:** up to ~100k offerings, single language, no need for
faceted aggregations or cross-entity unified ranking. Most startups live here for years.

---

## 3. Phase 2 — Dedicated search engine (Elasticsearch / OpenSearch / Typesense / Meilisearch)

Adopt when you need: instant search-as-you-type at scale, faceted filtering with
live counts, multi-field relevance tuning, synonyms, multi-language, or >100k–1M docs.

**Engine choice:**
- **Typesense / Meilisearch** — fastest to adopt, typo-tolerant out of the box, great for autocomplete, low ops. Recommended first step up from Postgres.
- **Elasticsearch / OpenSearch** — most powerful (aggregations, custom scoring, LTR plugin, vector search), heavier ops. Choose when you need advanced relevance or already run the stack.

### Architecture
```
Postgres (source of truth)
   │  (keep writing here — engine is a derived read model)
   ▼
[sync] ──►  Search engine index (creators, offerings)
   ▲
SearchService → SearchEngineClient.query()  (replaces repository SQL)
```

**Index sync — keep Postgres as source of truth, engine as a derived read model.** Three options, increasing robustness:
1. **App-level dual-write**: on offering create/update/status-change/go-live and profile go-live, call `engine.upsert(doc)`. Simplest; add a `revalidateTag`-style hook in `offerings.service` / `creators.service`. Risk: drift if a write fails → backstop with a nightly full reindex job.
2. **Outbox pattern**: writes append to an `outbox` table in the same DB transaction; a worker drains it to the engine. Exactly-once-ish, no drift.
3. **CDC (Debezium / logical replication)**: stream Postgres WAL → engine. Most robust at scale, most infra.

**What it buys us:**
- BM25 relevance + per-field boosts (title^3, creator name^2, description^1) + business boosts (quality, boost flag, recency) in one scoring function.
- **Facets/aggregations**: live counts per niche / price bucket / rating — powers the faceted-filter sidebar the explore plan deferred.
- **Autocomplete**: edge-ngram / search-as-you-type field → replaces the suggestions repository directly.
- Typo tolerance, synonyms, stop-words, multi-language analyzers.

**Connect:** new `SearchEngineModule` providing a `SearchEngineClient`. `SearchService` and `ExploreService` call it instead of the SQL repositories. DTOs (`SearchResult`, `ExploreItem`) unchanged → **web untouched**. Keep the Postgres repositories as a fallback/source for reindexing.

---

## 4. Phase 3 — Recommendations & personalization (AI)

Search = "user told us what they want." Recommendations = "predict what they want."
Today the `recommended` rail is rule-based (niche overlap). Real recs need **behavioral
data** first.

### Prerequisite: an events/telemetry pipeline (build this early — it's the fuel)
Log every impression, click, search query, and booking with `{userId, itemId, action, context, ts}`. Start as a Postgres `events` table or pipe to a warehouse (BigQuery/ClickHouse). **Without this, no recommender can be trained.** This is the single most important thing to start collecting now, even before building any model.

### The standard two-stage recommender
```
1. Candidate generation  (fast, ~thousands → hundreds)
     • Collaborative filtering: "learners like you booked…"
     • Content-based: niche/tag/text similarity
     • Vector / embedding nearest-neighbor (semantic)
2. Ranking  (precise, hundreds → ordered N)
     • Gradient-boosted / two-tower model scoring (user features × item features)
```

### Semantic search & embeddings (the "AI" layer)
- Generate **embeddings** for each offering (title + description) and each creator. Store as `pgvector` (stays in Postgres — `CREATE EXTENSION vector`, a `vector(1536)` column, HNSW index) or a vector DB (Qdrant / Pinecone / Weaviate).
- **Semantic search**: embed the query, nearest-neighbor over item vectors → finds "interview coaching" when the user typed "help me crack FAANG." Complements keyword search (hybrid: combine BM25 + vector scores).
- **Content-based recs**: recommend offerings whose vectors are near ones the learner engaged with.
- **LLM query understanding (Claude)**: parse messy queries into structured filters ("cheap weekend yoga classes" → `{niche: ayurveda_yoga, price_max, type: live_event}`), expand synonyms, or **rerank** the top-K candidates with a cross-encoder/LLM for precision. Use the latest Claude model via the Anthropic API.

**Connect:** a new `RecommendationModule` / `recommended` endpoint backed by candidate-gen + ranking instead of the niche query. The `RecommendedRail` web component already exists and consumes `BrowseOfferingsResponse` — **swap the data source, keep the contract.** Embeddings are generated by a background job on offering create/update.

---

## 5. Phase 4 — Unified Discovery Engine

At scale, search and recommendations converge into one **ranking service** with shared
infra: a feature store, online model serving, experimentation (A/B), and
learning-to-rank (LTR) trained on the click/booking events from Phase 3.

```
                    ┌─────────────── Feature store (user + item + context) ───┐
query / context ──► │  candidate gen (search index + recs + vector)           │ ──► ranked results
                    │  ranking model (LTR / two-tower, online-served)         │
                    └─── logs impressions/clicks/bookings → retrain loop ──────┘
```

**Managed option:** **Google Vertex AI Search (formerly Discovery Engine)** or
Algolia/Coveo give search + recommendations + ranking as a hosted product — feed it a
catalog + an event stream and it returns ranked results. Trade control for speed.
**Self-built option:** Elasticsearch LTR plugin + a model service + a feature store
(Feast) + an experimentation layer.

**Connect:** still the same seam — `ExploreService`/`SearchService` call the discovery
service. The whole platform was built so this final swap touches only the API service
layer, never the web app.

---

## 6. Decision guide — adopt when, not before

| Signal | Do this |
|---|---|
| Now → ~100k rows, exact/simple search | **Phase 0** (current) |
| Searches feel slow, want typo tolerance, still on Postgres | **Phase 1** (`pg_trgm` + `tsvector`) |
| Need faceted counts, search-as-you-type, synonyms, >100k–1M docs | **Phase 2** (Typesense/Meili → Elasticsearch) |
| Have a few months of click/booking events; want "for you" that learns | **Phase 3** (embeddings + two-stage recommender; pgvector first) |
| Multiple ranking surfaces, need A/B + LTR + feature store | **Phase 4** (discovery engine / Vertex AI Search) |

**Start now, regardless of phase:** the **events/telemetry pipeline** (§4). It is the
prerequisite for every AI/ranking improvement and is cheap to begin (an `events` table).

**Golden rule:** never break the `SearchResult` / `ExploreItem` contract. Every upgrade
is a repository/service swap behind it — the frontend should never know which phase
we're on.
