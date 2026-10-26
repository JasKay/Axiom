# Storage, growth and pricing proposal

Checked 26 October 2026. USD, excluding tax and exchange-rate changes. These are resource calculations, not a measured user-capacity guarantee or an actual invoice.

## Current system

- All churches share the current Neon database and private Vercel Blob store. A church account does not provision a fresh free allowance.
- The connected Neon integration reports Free: 1 GB database storage and 100 CU-hours per project. Neon's current public pricing agrees. Actual database size and remaining monthly compute have not been measured.
- Blob currently contains roughly 1.16 MB in four objects. Its configured 100 MiB upload limit is an Axiom limit, not a storage allocation for each church.
- The app has no enforced aggregate byte quota per church, retention expiry or storage-upgrade billing yet. A weekly file-count restriction alone does not control byte usage.
- Vercel hosting tier and current invoice have not been established through the available billing metadata. Do not treat the cost model below as the current bill.

## Verified unit prices

| Service | Price used for planning |
| --- | --- |
| Vercel Pro | $20/month, one deploying developer seat, $20 eligible infrastructure usage credit |
| Additional deploying developer | $20/month; church app users are not Vercel dashboard seats |
| Neon Launch compute | $0.106/CU-hour |
| Neon database storage | $0.35/GB-month |
| Vercel Blob storage | $0.023/GB-month, illustrative listed rate |
| Vercel Blob transfer | $0.05/GB illustrative rate; delivery and regional rates may add costs |
| R2 Standard storage, alternative only | $0.015/GB-month, first 10 GB-month free; invoice units rounded up |
| R2 direct Internet egress | No R2 egress fee; operations and any other services still have costs |

Vercel Blob Hobby's listed allowance is 1 GB storage and 10 GB Blob transfer, shared across the relevant usage scope. Hobby is for personal, non-commercial use; the paid church SaaS should be budgeted on a suitable commercial hosting plan.

Vercel private Blob is currently fetched by a Function and streamed to the client. That path involves Blob transfer plus function/CDN delivery. It is incorrect to quote Blob's storage price as the whole bill. Eligible Vercel usage credit must be applied before calculating its invoice; it does not pay Neon or Cloudflare bills.

## Same media workload, different scale

Assumptions: every church uploads 1 decimal GB/week, files expire after 30 days, two recipients download every file once, and the system is already at steady state. Monthly uploads use 52/12 weeks. This is not a concurrency benchmark. The first month of a new, empty store generally has a lower average stored volume.

| Churches | Steady stored GB | Monthly downloaded GB | Blob storage + Blob transfer, gross | R2 Standard storage, after 10 GB free |
| --- | ---: | ---: | ---: | ---: |
| 10 | 42.86 | 86.67 | $5.32 | $0.50 |
| 100 | 428.57 | 866.67 | $53.19 | $6.29 |
| 1,000 | 4,285.71 | 8,666.67 | $531.90 | $64.14 |

Both price columns exclude operations, database compute/storage, hosting, delivery through other metered services, tax, backups and support. Blob figures precede Vercel credit and any applicable included allowances. R2 figures assume direct authorized delivery from R2, not proxying every video through Vercel; proxying would retain the proxy's transfer costs. Other apps can consume shared free allowances. R2 is not currently connected to Axiom.

Database example: a 0.25-CU compute active for 730 hours uses 182.5 CU-hours, approximately $19.35/month before database storage. At 2 CU continuously, compute is about $154.76/month. This shows why active compute and query efficiency matter; neither example establishes how many churches that compute can serve. A 5 GB database at $0.35/GB-month adds $1.75, before history/backup and any other charges.

General storage formula: churches × GB uploaded/week × retention days ÷ 7. Without expiration or deletions, retained files accumulate indefinitely. More team members multiply downloads only when they actually download files; they also add authentication, messaging and database activity. Congregation reading should receive published text and links, not automatically download private service videos.

## Suggested church plans, not enabled limits or retail prices

| Proposed tier | New uploads per rolling 7 days | Stored cloud files | Retention |
| --- | ---: | ---: | --- |
| Church Essentials | 250 MB | 2 GB | 30 days |
| Church Team | 1 GB | 10 GB | 60 days |
| Church Media | 5 GB | 100 GB | 90 days |
| Archive add-on | Contracted allowance | Purchased blocks, e.g. 250 GB / 1 TB | Explicit agreed retention |

These limits are per church across Leader and Pro, not multiplied by the number of team members. Keep collaboration available when a file allowance is exhausted. Block only new uploads; allow existing downloads, messages, agendas, publishing, and local Pro presentation. Retained-file and upload limits are separate: deleting a file frees storage but should not reset upload usage. The stricter limit applies first.

Do not market infinite storage. Expanded storage is a priced allocation with known retention, download/request policy and an explicit upgrade. Larger per-file limits additionally need reliable multipart/resumable transfers. Do not switch on a higher per-file limit alone and assume that solves heavy media handling.

## Usage experience

- Show actual "Used in the last 7 days", "Available now", "Cloud storage used" and file-expiry dates in both Leader and Pro. A rolling window avoids hidden church-timezone reset rules; usage returns as uploads age out.
- Warn near 80% and before an upload would exceed the quota. Show Download, Manage files and Upgrade storage actions.
- Use server-measured bytes and atomic upload reservations. Count pending uploads across concurrent team members, release failed/expired reservations, and finalize recorded usage only once.
- Give advance warning and a download option before scheduled deletion. Retention applies to cloud file bytes, not the service identity, agenda or messages. Do not delete someone's durable local Pro copy.
- Never show invented meter values. Build the authoritative accounting and retention process before presenting usage as enforced.

## Scaling work before broad onboarding

Load-test concurrent sessions and church isolation; share/batch real-time update checks rather than repeatedly scanning counts per connected user; paginate message/file/member histories; add relevant indexes and observability; implement idempotent retries, durable local downloads and retention; test database backup/restore; enforce per-tenant quotas and global spending alerts/limits. No current test proves a maximum simultaneous church/user count.

Recommendation: keep the existing stack for the pilot. Benchmark direct private R2 delivery as an alternative for video-heavy growth before choosing a storage provider. No new provider, paid plan, billing change, data migration or automatic deletion has been performed.

## Sources

- https://vercel.com/docs/plans/pro-plan
- https://vercel.com/docs/vercel-blob/usage-and-pricing
- https://vercel.com/docs/plans/hobby
- https://neon.com/pricing
- https://developers.cloudflare.com/r2/pricing/
