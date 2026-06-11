# Code Standards — Creonex Frontend

TypeScript, React, Next.js, Icons, and Tailwind rules with examples.

---

## File Naming

**kebab-case only** — every file in the entire codebase. No exceptions.

```
# ✅ correct
components/shared/course-card.tsx
components/layout/navbar.tsx
features/courses/hooks/use-courses.ts
features/courses/types/course.types.ts
features/auth/components/auth-guard.tsx
lib/query-client.ts
dal/courses.dal.ts

# ❌ never
CourseCard.tsx          ← PascalCase
courseCard.tsx          ← camelCase
course_card.tsx         ← snake_case
useCourses.ts           ← camelCase
```

This applies to: components, hooks, types, utils, dal, lib, pages, layouts — everything.

---

## TypeScript

### Strictness

`tsconfig.json` has `"strict": true` — `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`. No exceptions. Never add `// @ts-ignore` without a comment explaining the exact limitation.

### Type vs Interface

```ts
// ✅ interface for object shapes
interface Course {
  id: string;
  title: string;
  slug: string;
  instructor: Instructor;
}

// ✅ type for unions, mapped types, utility types
type CourseStatus = "draft" | "published" | "archived";
type CourseFilters = Partial<Pick<Course, "category" | "level">>;
```

### No `any`

```ts
// ❌
const data: any = await fetchCourses();

// ✅ unknown + type guard
const data: unknown = await response.json();
if (isCourse(data)) { ... }

// ✅ typed fetch wrapper
const data = await apiGet<Course[]>("/courses");
```

### Function Signatures

```ts
// ✅ explicit return type on all exported functions
export function formatPrice(cents: number): string {
  return `₹${(cents / 100).toFixed(0)}`;
}

// ✅ async
export async function fetchCourse(slug: string): Promise<Course> {
  return apiGet<Course>(`/courses/${slug}`);
}

// ❌ never React.FC
const Card: React.FC<CardProps> = () => {};

// ✅ plain function
function Card({ title }: CardProps): JSX.Element {
  return <div>{title}</div>;
}
```

---

## React

### Component Files

One default export per file (the component). Named exports for types only.

```ts
export interface CourseCardProps {
  course: Course;
  onWishlist?: (id: string) => void;
}

export default function CourseCard({ course, onWishlist }: CourseCardProps): JSX.Element {
  // ...
}
```

### Server vs Client Components

Add `"use client"` only when the component uses:
- `useState`, `useReducer`, `useEffect`, `useRef`, `useContext`
- `useRouter`, `usePathname`, `useSearchParams`
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers that trigger state changes
- TanStack Query hooks
- `react-hook-form`

```tsx
// ✅ Server Component — no directive
export default function CourseCard({ course }: CourseCardProps) {
  return <div className="card-feature-hover"><h3>{course.title}</h3></div>;
}

// ✅ Client Component — only when needed
"use client";
export default function WishlistButton({ courseId }: { courseId: string }) {
  const [saved, setSaved] = useState(false);
  return <button onClick={() => setSaved(!saved)}>...</button>;
}
```

### Hooks

- Live in `lib/hooks/` (generic) or `features/{domain}/hooks/` (domain-specific). Never inside a component file.
- Always prefix with `use`. Must be pure — no side effects beyond what React allows.

### Key Props

```tsx
// ✅ stable key
{courses.map((course) => <CourseCard key={course.id} course={course} />)}

// ❌ index as key (breaks on reorder/filter)
{courses.map((course, i) => <CourseCard key={i} course={course} />)}
```

### Conditional Rendering

```tsx
{isLoading && <Spinner />}
{isLoading ? <Spinner /> : <CourseGrid courses={data} />}

// complex — extract to variable
const content = error ? <ErrorState /> : isLoading ? <Spinner /> : <CourseGrid />;
return <section>{content}</section>;
```

---

## Icons

**Font Awesome only.** Never `lucide-react` or `react-icons`. Import named icons individually — never the full icon set.

```tsx
// ✅ Solid
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
<FontAwesomeIcon icon={faArrowRight} className="size-4" />

// ✅ Brand / social
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
<FontAwesomeIcon icon={faGithub} className="size-5 text-[var(--charcoal)]" />

// ✅ Regular (outline)
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
<FontAwesomeIcon icon={faBookmark} className="size-4" />

// ❌ never
import { ArrowRight } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
```

---

## Forms

Forms use **react-hook-form** for state and **zod** for schema validation. Only use forms in Client Components.

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => { /* call API */ };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <p className="body-sm text-red-500">{errors.email.message}</p>}
    </form>
  );
}
```

Define zod schemas in `features/{domain}/schemas/` and reuse across form + API validation.

---

## Next.js

### Image

```tsx
import Image from "next/image";

<Image src={course.thumbnailUrl} alt={course.title} width={400} height={225}
       className="rounded-xl object-cover" />

// fill (responsive container)
<div className="relative aspect-video">
  <Image src={url} alt={alt} fill className="object-cover" />
</div>
```

### Link

```tsx
import Link from "next/link";
<Link href={`/courses/${course.slug}`}>View Course</Link>

// ❌ never bare <a> for internal navigation
```

### Metadata

Every `page.tsx` must export `Metadata`:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses — Creonex",
  description: "Browse courses taught by India's top creators.",
  openGraph: {
    title: "Courses — Creonex",
    description: "...",
    images: [{ url: "/og/courses.jpg" }],
  },
};

// Dynamic routes
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await fetchCourse(params.slug);
  return { title: `${course.title} — Creonex` };
}
```

### Server-First Data Fetching

**This project is server-first.** The default for any data need is an `async` Server Component fetching directly via the DAL. Never reach for TanStack Query unless the data must change in response to client interaction (filters, pagination, user actions).

```
Need data for render?
  └── Does it change based on user interaction (filters, tabs, load-more, live updates)?
        ├── NO  → async Server Component + DAL directly (no TanStack, no "use client")
        └── YES → Server prefetch + HydrationBoundary → Client Component with useQuery
```

Direct Server Component fetch — the default for all non-interactive data:

```tsx
// app/(marketing)/courses/[slug]/page.tsx
// No TanStack. No "use client". Just async + DAL.
export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug);
  return <CourseDetail course={course} />;
}
```

### Parallel Fetching with `Promise.all`

When a page needs multiple independent data sources, always fetch them in parallel. Sequential `await` chains add latency equal to the sum of all requests; `Promise.all` reduces it to the slowest one.

```tsx
// ✅ Parallel — total wait = max(getCourse, getRelated, getInstructor)
export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const [course, relatedCourses, instructor] = await Promise.all([
    getCourse(params.slug),
    getRelatedCourses(params.slug),
    getInstructor(params.slug),
  ]);
  return <CourseDetail course={course} related={relatedCourses} instructor={instructor} />;
}


Use `Promise.all` whenever two or more DAL calls in the same Server Component or layout have no dependency on each other's results.

For sections that can load independently and stream, split into child Server Components each wrapped in `<Suspense>` — Next.js fetches them in parallel and streams each as it resolves:

```tsx
// Streaming — shell renders immediately, each section streams in when its data resolves
export default async function ExpertPage({ params }: { params: { username: string } }) {
  return (
    <>
      <ExpertHeader username={params.username} />        {/* fetches inline, blocks shell */}
      <Suspense fallback={<CoursesSkeleton />}>
        <ExpertCourses username={params.username} />     {/* streams independently */}
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <ExpertReviews username={params.username} />     {/* streams independently */}
      </Suspense>
    </>
  );
}
```

### Rendering Patterns

Route-to-strategy table → `CLAUDE.md`. Implementation below.

**SSG** — static at build, no dynamic data:

```tsx
// app/(auth)/login/page.tsx
export default function LoginPage() {
  return <SignIn />;
}
```

**ISR** — cached at first request, regenerated after `revalidate` seconds. Use `Promise.all` when multiple sources needed:

```tsx
// app/(marketing)/courses/[slug]/page.tsx
export const revalidate = 3600;

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const [course, relatedCourses] = await Promise.all([
    getCourse(params.slug),
    getRelatedCourses(params.slug),
  ]);
  return <CourseDetail course={course} related={relatedCourses} />;
}
```

**SSR + TanStack prefetch** — only when a section must re-fetch based on client interaction (e.g. filter changes the course list). Not for pages that just need fresh data on every request — use a plain `async` Server Component for that:

```tsx
// app/(marketing)/courses/page.tsx
// FilterBar is a Client Component — changing it must re-fetch the grid on the client.
// TanStack is justified here; it would not be justified on a page with no interactive data.
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/tanstack/query-client";
import { getCourses } from "@/dal/courses.dal";
import { queryKeys } from "@/lib/tanstack/query-keys";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const queryClient = getQueryClient();
  // Prefetch gives the client an immediate cache hit — no loading state on first render
  await queryClient.prefetchQuery({
    queryKey: queryKeys.courses.list(),
    queryFn: getCourses,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FilterBar />                              {/* "use client" — drives URL params */}
      <Suspense fallback={<CourseGridSkeleton />}>
        <CourseGrid />                           {/* "use client" — useQuery, re-fetches on filter change */}
      </Suspense>
    </HydrationBoundary>
  );
}
```

**CSR** — client-only, behind Clerk auth, no server prefetch:

```tsx
// app/(dashboard)/dashboard/page.tsx — useQuery runs on mount, no SSR needed
```

### TanStack Query — Client Hook

DAL functions are `server-only` — client `queryFn` must hit the `/api` proxy, not import from `dal/`:

```tsx
// features/courses/components/CourseGrid.tsx
"use client";
import { useQuery } from "@tanstack/react-query";

export default function CourseGrid() {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: queryKeys.courses.list(),
    queryFn: () => fetch("/api/courses").then((r) => r.json()),
    // If HydrationBoundary was used on the server, this hits the dehydrated cache — no network request on first render
  });
}
```

### Suspense Boundaries

Wrap every Client Component that uses TanStack Query in `<Suspense>`. Also use `<Suspense>` on Server Components to enable streaming (each boundary renders independently):

```tsx
// Client: TanStack + HydrationBoundary
<HydrationBoundary state={dehydrate(queryClient)}>
  <Suspense fallback={<CourseGridSkeleton />}>
    <CourseGrid />
  </Suspense>
</HydrationBoundary>

// Server: streaming — no HydrationBoundary needed
<Suspense fallback={<ReviewsSkeleton />}>
  <ExpertReviews username={username} />
</Suspense>
```

## Global CSS Utilities

Defined in `app/globals.css`. Use these — don't reinvent with raw Tailwind where a class already exists.

### Layout
| Class | Use |
|---|---|
| `.page-container` | Every page's root content wrapper. 1280px max, responsive px. |
| `.section-py` | Standard section vertical spacing (`py-16 md:py-24`). |
| `.section-py-sm` | Tighter section spacing (`py-10 md:py-16`). |

### Typography
| Class | Use |
|---|---|
| `.text-display` | Hero / marketing headline. 48px → 60px. |
| `.text-h1` | Page title. 36px → 48px. |
| `.text-h2` | Section title. 24px → 30px. |
| `.text-h3` | Card / subsection title. 20px → 24px. |
| `.text-h4` | Small header. 16px → 18px. |
| `.text-body` | Standard body copy. 16px, relaxed leading. |
| `.text-body-sm` | Secondary body / meta. 14px, relaxed leading. |
| `.text-label` | Badge / tag / overline text. 12px, uppercase, tracked. |

Pair `.text-balance` utility on any heading to fix awkward line breaks.

### Surfaces
| Class | Use |
|---|---|
| `.card-base` | Base card: rounded-xl, border, bg-card, p-6. |

### Utilities
| Class | Use |
|---|---|
| `.text-balance` | `text-wrap: balance` — use on all headings. |
| `.scrollbar-hide` | Hide scrollbar on horizontal carousels. |

---

## Component Placement

Folder structure is physically configured. Follow these rules to place every component:

| Where to put it | Condition |
|-----------------|-----------|
| `features/{domain}/components/` | Used only within that domain |
| `components/shared/` | Used across 3+ features or pages |
| `components/layout/` | Global layout shells (Navbar, Footer, Sidebar) |
| `components/sections/` | Homepage-only section blocks (Hero, CTA, etc.) |
| `components/ui/` | shadcn primitives — CLI only, never hand-written |

**Decision tree:**
```
New component?
  └── Is it a shadcn primitive?
        ├── YES → npx shadcn add <name> → components/ui/
        └── NO → Is it a global layout shell?
                  ├── YES → components/layout/
                  └── NO → Is it a homepage section?
                            ├── YES → components/sections/
                            └── NO → Is it used in only 1 domain?
                                      ├── YES → features/{domain}/components/
                                      └── NO (3+ places) → components/shared/
```

```ts
// ✅ domain-specific
// features/courses/components/CourseCard.tsx

// ✅ shared across features
// components/shared/Avatar.tsx
// components/shared/RatingStars.tsx

// ✅ layout
// components/layout/Navbar.tsx
// components/layout/Footer.tsx

// ✅ homepage section
// components/sections/HeroSection.tsx
// components/sections/FeaturedCourses.tsx
```

---

## File Exports & Imports

### Import Paths

Always use the `@/` alias. Never `../../` across feature boundaries.

```ts
import { cn } from "@/lib/utils";
import { CourseCard } from "@/components/shared/CourseCard";
import { useCourses } from "@/features/courses/hooks/useCourses";
import type { Course } from "@/types/course.types";
```

### Barrel Exports

Barrel `index.ts` only for `features/{domain}/` public APIs. Never in `components/`.

```ts
// features/courses/index.ts
export { default as CourseGrid } from "./components/CourseGrid";
export { useCourses } from "./hooks/useCourses";
export type { Course } from "./types/course.types";
```

Never re-export shadcn primitives — import them directly at the use site:

```ts
// ✅
import { Button } from "@/components/ui/button";
```

---

## Linting

```bash
npm run lint   # run before every commit
```

ESLint (`eslint-config-next`) enforces: no `<img>` without `next/image`, no `<a>` without `next/link`, no unused variables, no missing `key` props.

VS Code `@apply` warnings in `globals.css` are IDE-only — not build errors. Suppress with `{ "css.lint.unknownAtRules": "ignore" }` in VS Code settings.
