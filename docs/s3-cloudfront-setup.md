# AWS S3 + CloudFront Setup Guide (from zero)

> For someone who has never touched AWS. Follow top to bottom. By the end you'll have two
> S3 buckets, a set of credentials, and a CloudFront CDN — and you'll know exactly which
> values to paste into the app's `.env`. Companion to `offerings-type-flows.md` (§5 Storage).

---

## 0. The mental model (read this first)

We store two *kinds* of files, so we use **two buckets**:

| Bucket | Holds | Who can read | How it's served |
|--------|-------|--------------|-----------------|
| **Public** | profile photos, banners, offering thumbnails | anyone (these are meant to be seen) | through **CloudFront** (CDN), bucket itself stays private |
| **Private** | paid digital product files (PDF, video, zip) | only a buyer after payment | **presigned URLs** that expire in minutes |

Key idea: **neither bucket is ever "public" in the AWS sense.** "Public" images are still
served through CloudFront so we control caching and the bucket stays locked. Private files
are never on the CDN at all — they're handed out one short-lived link at a time.

You will create, in order:
1. Two S3 buckets
2. One IAM user (the app's robot account) + its access keys ← these are the creds the app needs
3. One CloudFront distribution (the CDN) in front of the public bucket
4. Paste values into `.env`

**Region:** use **`ap-south-1` (Mumbai)** — closest to Indian users. Use the same region everywhere.

---

## Part A — Create the two S3 buckets

AWS Console → search **S3** → **Create bucket**. Do this twice.

### A1. Public bucket (images)
- **Bucket name:** `creonex-public` (must be globally unique — add a suffix if taken, e.g. `creonex-public-prod`)
- **Region:** Asia Pacific (Mumbai) `ap-south-1`
- **Block Public Access:** ✅ **leave ALL four boxes CHECKED** (fully blocked). CloudFront will read it, not the public.
- **Bucket Versioning:** Disabled (fine for images)
- **Encryption:** keep default (SSE-S3 / Amazon-managed) — leave on
- Create.

### A2. Private bucket (digital products)
- **Bucket name:** `creonex-private` (or `-prod`)
- **Region:** same `ap-south-1`
- **Block Public Access:** ✅ **ALL four CHECKED** (absolutely no public access)
- **Bucket Versioning:** **Enabled** (lets you keep old versions if a creator replaces a file)
- **Encryption:** default on
- Create.

### A3. CORS on the PUBLIC bucket (so browser uploads work)
The browser uploads directly to S3 via a presigned URL, so S3 must allow your site's origin.
Open `creonex-public` → **Permissions** tab → **Cross-origin resource sharing (CORS)** → Edit → paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": [
      "http://localhost:3001",
      "https://YOUR-PRODUCTION-DOMAIN"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```
Do the **same CORS** on `creonex-private` (digital uploads also go browser→S3). For
multipart (big files) `ExposeHeaders: ["ETag"]` is required — keep it.

### A4. Lifecycle rules (auto-cleanup of orphans) — on BOTH buckets
Bucket → **Management** tab → **Create lifecycle rule**:
- Rule 1: prefix `uploads/pending/` → **Expire current versions after 2 days** (kills abandoned uploads).
- Rule 2 (whole bucket): **Delete incomplete multipart uploads after 2 days** (there's a checkbox for exactly this).

---

## Part B — Create the app's credentials (IAM user)

> **What is IAM?** "Identity and Access Management" — AWS's system for *who can do what*.
> Your app is a program, not a human, so it can't log in with your email/password. Instead
> you create a **robot account** = an **IAM user** with its own **Access Key ID** (username)
> and **Secret Access Key** (password). The backend uses those 2 keys to talk to AWS.
> You scope it (Part B1) so it can touch *only* these two buckets — if the key ever leaks,
> the damage is tiny, unlike your personal AWS login which can do everything.

This is the "robot account" the NestJS API uses to sign URLs and delete files. **The
frontend never gets these.**

AWS Console → search **IAM** → **Users** → **Create user**.
- **User name:** `creonex-api`
- **Do NOT** enable console access (programmatic only).
- Skip "add to group" for now → Create.

### B1. Attach a permissions policy
On the new user → **Add permissions** → **Attach policies directly** → **Create policy** →
JSON tab → paste (replace bucket names if you changed them):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadWritePublic",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:AbortMultipartUpload", "s3:ListMultipartUploadParts"],
      "Resource": "arn:aws:s3:::creonex-public/*"
    },
    {
      "Sid": "ReadWritePrivate",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:AbortMultipartUpload", "s3:ListMultipartUploadParts"],
      "Resource": "arn:aws:s3:::creonex-private/*"
    },
    {
      "Sid": "ListBuckets",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::creonex-public", "arn:aws:s3:::creonex-private"]
    }
  ]
}
```
Name it `creonex-s3-access` → Create → go back and attach it to `creonex-api`.

> Least privilege: this user can only touch these two buckets, nothing else in your account.

### B2. Generate access keys (THE CREDS)
User `creonex-api` → **Security credentials** tab → **Create access key** → use case
**Application running outside AWS** → Create.

**Copy both now (the secret is shown only once):**
- **Access key ID** → `AWS_ACCESS_KEY_ID`
- **Secret access key** → `AWS_SECRET_ACCESS_KEY`

Store in a password manager. If lost, you delete and make a new key.

**So the creds you "bring" = 2 values:** `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`
(plus the region `ap-south-1`, which isn't secret).

---

## Part C — Set up the CDN (CloudFront) in front of the PUBLIC bucket

The CDN caches images near users (fast) and is the **only** thing allowed to read the public bucket.

AWS Console → search **CloudFront** → **Create distribution**.

### C1. Origin
- **Origin domain:** pick your `creonex-public` bucket from the dropdown.
- **Origin access:** choose **Origin access control settings (recommended)** → **Create
  new OAC** → accept defaults → Create. (OAC = the modern, secure way to let *only*
  CloudFront read a private bucket.)
- After creating the distribution, AWS shows a **yellow banner with a bucket policy to
  copy** → click **Copy policy** → it deep-links you to the bucket's policy editor → paste →
  Save. (This is what lets CloudFront read the otherwise-blocked bucket.)

### C2. Default cache behavior
- **Viewer protocol policy:** **Redirect HTTP to HTTPS**
- **Allowed HTTP methods:** **GET, HEAD** (CDN only serves reads; uploads go straight to S3)
- **Cache policy:** **CachingOptimized** (default)

### C3. Settings
- **Price class:** "Use only North America, Europe, **Asia, Middle East**" (or All) — make
  sure Asia is included for India.
- **Default root object:** leave blank.
- Create. Wait ~5–10 min for **Status: Enabled / Deployed**.

### C4. Grab the CDN domain
The distribution shows a **Distribution domain name** like
`d1234abcd.cloudfront.net` → this is `CDN_PUBLIC_HOST`. (Later you can put a custom domain
like `cdn.creonex.in` in front with ACM cert + CNAME — optional, not needed to launch.)

> **Private bucket gets NO CloudFront.** Digital files are never cached/served by the CDN —
> the API hands out short-lived presigned S3 URLs instead. Nothing to set up here for it.

---

## Part D — Wire it into the app

Add to `apps/api/.env` (backend only — these are secret):

```ini
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...          # from B2
AWS_SECRET_ACCESS_KEY=...          # from B2
S3_PUBLIC_BUCKET=creonex-public
S3_PRIVATE_BUCKET=creonex-private
CDN_PUBLIC_HOST=d1234abcd.cloudfront.net   # from C4
PRESIGN_EXPIRY_SECONDS=900          # 15 min for download links
```

Add the CDN host to image loading on the web side — `apps/web/next.config.ts`
`images.remotePatterns` → add `{ protocol: 'https', hostname: 'd1234abcd.cloudfront.net' }`
(keep Cloudinary entry until the backfill migration is done, then remove).

Public image URL the app stores = `https://<CDN_PUBLIC_HOST>/<key>`
(e.g. `https://d1234abcd.cloudfront.net/profiles/usr_123/abc.webp`).

---

## Part E — Requirements checklist / what you need before starting

- [ ] An AWS account (root email + billing/card added).
- [ ] Decide region = `ap-south-1` (Mumbai) and use it everywhere.
- [ ] Two globally-unique bucket names.
- [ ] Your site origins for CORS: `http://localhost:3001` (dev) + production domain.
- [ ] (Optional, later) a custom CDN subdomain + ACM TLS certificate (must be issued in
      **us-east-1** for CloudFront) if you don't want the raw `*.cloudfront.net` URL.

## Part F — Security sanity checks (do not skip)

- [ ] Both buckets show **"Block all public access: On"**.
- [ ] Public bucket is readable **only** via the CloudFront OAC bucket policy — test the raw
      S3 URL in a browser; it must return **AccessDenied**, while the CloudFront URL works.
- [ ] Private bucket has **no** bucket policy granting public/CloudFront read at all.
- [ ] IAM user is scoped to just these two buckets (Part B policy), not `*`.
- [ ] Secret access key stored in a password manager / secrets manager — never committed,
      never sent to the frontend.
- [ ] CORS `AllowedOrigins` lists only your real origins (no `*`).
- [ ] Lifecycle rules active (pending-prefix expiry + incomplete-multipart abort).

---

## Quick glossary

- **S3** — file storage ("buckets" of "objects").
- **Bucket** — a top-level container of files, globally-unique name.
- **IAM user / access key** — a non-human login the app uses to call AWS.
- **CloudFront** — AWS's CDN; caches files at edge locations worldwide for speed.
- **OAC (Origin Access Control)** — lets *only* CloudFront read a private bucket.
- **Presigned URL** — a temporary, signed link that grants time-limited access to one
  private object (used for both browser uploads and gated paid downloads).
- **Multipart upload** — splitting a big file into parts so large/slow uploads can resume.
