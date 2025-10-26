# SwaedUAE on Google Cloud: Services and Current Pricing (as of 2025-10-27)

## Executive Summary

SwaedUAE’s platform requirements point to a set of Google Cloud services that can satisfy authentication, relational data, document persistence, file storage, serverless logic, and global delivery—while preserving optionality to evolve the architecture as the product scales. Based on the Product Requirements Document (PRD), we recommend the following service selection and cost strategy:

- Authentication: Firebase Authentication (Spark plan) backed by Google Cloud Identity Platform for any phone-based one-time passwords (OTP) and enterprise federation (SAML/OpenID Connect) needs. This provides unified developer ergonomics, a generous free Monthly Active User (MAU) allowance, and straightforward billing, with phone authentication priced via Identity Platform and subject to per-SMS rates by destination country.[^1][^2][^3]
- Primary relational database: Cloud SQL for PostgreSQL, leveraging Enterprise or Enterprise Plus editions depending on performance and availability expectations. Dedicated-core instances (N2/N4/C4A machine series) and High Availability (HA) configurations are supported. Committed Use Discounts (CUDs) can materially reduce spend for steady-state workloads.[^4][^7][^6]
- Secondary/document store: Cloud Firestore Standard edition as a flexible, serverless document database for profile metadata, notifications, and audit logs, with granular read/write/delete pricing, modest storage rates, and free quotas to soften early-stage costs.[^13][^14]
- File storage: Cloud Storage for avatars, event media, and certificate PDFs, using Standard storage for frequent access and lifecycle transitions to Nearline/Coldline/Archive for archives. Carefully manage Class A/B operation volumes and egress destinations to control costs.[^15][^19]
- Serverless compute: Cloud Functions (1st gen) and Cloud Run functions (2nd gen). For event-driven HTTP and background tasks with modest memory/CPU footprints and spiky traffic, 1st gen remains cost-effective; for containerized workloads, longer timeouts, and higher concurrency, 2nd gen (Cloud Run) is generally superior with predictable per-100ms billing and regional price tiers.[^9][^10][^11]
- Hosting and CDN: Use Firebase Hosting for static assets and single-page applications (SPA), or Cloud Storage static website hosting combined with Cloud CDN for more control and predictable egress. Hosting free allowances are modest, and CDN data transfer out (DTO) varies by destination and volume.[^8][^12][^18]

Top cost levers for SwaedUAE include:
- Region selection for databases and storage (me-central1 or me-west1 for low-latency UAE access) to reduce egress and inter-region transfer overheads.[^21][^15]
- Firestore query shaping (batching, avoiding deep offsets, using cursors) to minimize reads; Storage lifecycle policies to transition colder data and reduce Class A operations.[^13][^15]
- Cloud Run functions (2nd gen) concurrency and right-sized memory/CPU to compress billable time; evaluate CUDs once workloads stabilize.[^10]
- Cloud SQL HA only where needed, appropriate machine series/sizing, and CUDs for predictable usage.[^4][^6]
- Auth method mix: leverage free MAUs for email/password and OAuth; avoid phone OTP unless necessary; if phone auth is required, carefully track per-SMS rates via Identity Platform.[^1][^2][^3]

Key pricing takeaways:
- Authentication: 50,000 MAUs free on Spark; SAML/OIDC limited to 50 MAUs free. Phone OTP billed per SMS; up-to-date rates must be confirmed in Identity Platform or the calculator.[^1][^2][^3]
- Cloud SQL: Dedicated-core pricing varies by machine series and edition (Enterprise vs Enterprise Plus); HA roughly doubles CPU/memory rates. Storage, backups, and network egress are billed separately; extended support has special waivers through April 30, 2025, then billed per vCPU-hour.[^4]
- Firestore: Free quotas (daily reset) for storage and operations; beyond free, priced per 100k operations and modest GiB-month storage. Internet egress beyond free is tiered by destination region.[^13]
- Cloud Storage: Standard/Nearline/Coldline/Archive classes with minimum storage durations and retrieval fees; operation Class A/B charges drive costs at scale.[^15]
- Functions/Cloud Run: Generous free tiers, with 1st gen priced per invocation and per 100ms compute; 2nd gen priced on vCPU/GiB seconds with monthly free allowances and CUD options.[^9][^10][^11]
- Hosting/Cloud CDN: Firebase Hosting includes 10 GB/month CDN DTO free, then $0.15/GB; storage beyond 10 GB is $0.026/GB. Standalone Cloud CDN has destination-tiered DTO rates and cache-fill fees.[^8][^12]

Information gaps that will impact final estimates:
- UAE region selection (me-central1 vs me-west1) and resultant SKU prices.
- Monthly Active Users (MAUs), method mix (email/password, OAuth, phone), and OTP volume.
- Cloud SQL instance shape, storage footprint, backup retention, and HA needs.
- Firestore operation mix (reads/writes/deletes per day) and average document size.
- Cloud Storage data volumes (GB-month), object sizes, operation counts, egress destinations, and lifecycle configuration.
- Functions vs Cloud Run usage (invocations, memory/CPU/time per invocation).
- Hosting and CDN traffic distribution by geography.

To illustrate service fit, the following table summarizes each recommended component, its role, free tiers, and main pricing dimensions.

Table 1. Service-to-function mapping and primary cost drivers

| Service | Primary role in SwaedUAE | Free tier highlights | Primary cost drivers |
|---|---|---|---|
| Firebase Authentication (Spark) + Identity Platform | User auth for volunteers and org admins; phone OTP (via Identity Platform); optional SAML/OIDC | 50,000 MAUs free; SAML/OIDC 50 MAUs free | MAUs beyond free; phone OTP per-SMS rates (destination-dependent) |
| Cloud SQL for PostgreSQL | Primary relational store for events, attendance, org data | None | vCPU/GiB-hours (edition/series/HA), SSD/HDD/Hyperdisk backups, egress, extended support |
| Cloud Firestore (Standard) | Document store for profiles, notifications, audit logs | Daily free quotas (e.g., 1 GiB storage, 50k reads, 20k writes, 20k deletes); 10 GiB monthly outbound free | Reads/writes/deletes per 100k; storage GiB-month; internet egress tiers |
| Cloud Storage | Avatars, event media, certificates; lifecycle to NL/CL/Archive | 5 GB-months Standard in select US regions (Free Program) | Storage class $/GB-month; Class A/B ops; retrieval fees; egress destinations |
| Cloud Functions (1st gen) | Lightweight HTTP/background tasks | 2M invocations/month; 400k GB-s; 200k GHz-s; 5 GB egress | Invocations $/million; compute per 100ms; outbound $/GB |
| Cloud Run functions (2nd gen) | Containerized APIs, webhooks, longer tasks | Monthly vCPU/GiB-s and 2M requests free in us-central1 | vCPU/GiB-second pricing; request charges; egress; CUDs |
| Firebase Hosting + CDN | SPA/static hosting; global CDN | 10 GB storage and 10 GB DTO/month free | Storage beyond 10 GB ($/GB); CDN DTO ($/GB) by destination |
| Cloud CDN (with GCS or GKE/Cloud Run) | Custom CDN strategy for static assets | N/A | Cache DTO per GiB by region/volume; cache fill $/GiB; request fees |

References: Firebase Pricing and Auth limits; Cloud SQL pricing; Firestore pricing; Cloud Storage pricing; Functions/Cloud Run pricing; Firebase Hosting pricing; Cloud CDN pricing.[^1][^2][^4][^13][^15][^9][^10][^8][^12]

---

## Architecture Context from PRD

SwaedUAE is a bilingual volunteer management platform for the UAE, designed to connect volunteers with verified organizations and administrators. It must support multiple authentication methods (email/password, social logins, and a future government UAE Pass), event management, QR/GPS attendance tracking, certificate issuance, and real-time features such as notifications and live dashboards. The PRD anticipates growth to 10,000+ volunteers and 500+ organizations, with a target of 99.9% uptime and sub-2-second page loads.

These requirements imply:

- A robust user authentication layer supporting consumer OAuth (Google, Apple, Facebook), email/password, and phone-based OTP (for organizations and admins). Federation (SAML/OpenID Connect) may be required for enterprise relationships.
- A primary relational store for transactional integrity—events, attendance sessions, approvals, certificates—where PostgreSQL is a natural fit.
- A secondary, flexible document store to handle diverse profile metadata, notification payloads, and audit log entries.
- Durable object storage for user-uploaded images, PDFs, and generated certificates, with lifecycle policies to control costs.
- Serverless compute to implement webhooks, event-driven notifications, and scheduled jobs without managing servers.
- A global content delivery path for static assets and API responses to ensure performance across the UAE and beyond.

From a cost perspective, this architectural mix benefits from carefully balancing service selection: leverage serverless databases and compute for agility while reserving relational capacity for transactional correctness. Region selection in the Middle East is important to minimize latency and egress charges.

Table 2. PRD requirements to cloud capabilities

| PRD requirement | Cloud capability needed | Cost angle |
|---|---|---|
| Multi-method auth (email/password, OAuth, phone, SAML/OIDC) | Firebase Authentication + Identity Platform | MAUs free tier; per-SMS phone auth costs |
| Event lifecycle and approvals | Cloud SQL PostgreSQL | Instance shape, HA, storage, backups |
| Flexible profile and metadata | Cloud Firestore | Operations per 100k, storage GiB-month |
| QR/GPS attendance with audit logs | Firestore (fast writes) + Cloud SQL (authoritative records) | Read/write pricing; HA costs |
| Certificates (PDFs), media uploads | Cloud Storage + lifecycle | Storage class, operation Class A/B, egress |
| Real-time notifications and webhooks | Cloud Functions/Cloud Run | Invocations or vCPU/GiB-s; egress |
| Global delivery of SPA and static assets | Firebase Hosting + CDN or Cloud Storage + CDN | CDN DTO by destination; free allowances |

Reference: PRD-derived mapping; costs aligned to service SKUs and pricing pages.[^1][^4][^13][^15][^9][^10][^8][^12]

---

## Google Cloud Pricing Models and UAE Region Considerations

Google Cloud uses a pay-as-you-go model with regional pricing variation, monthly free tiers for selected products, and discount instruments such as Committed Use Discounts (CUDs). New customers receive $300 in credits to bootstrap workloads. Free tiers are monthly and do not roll over; they are designed to support evaluation and small-scale production, but usage above thresholds is billed at standard rates. CUDs can reduce prices for predictable workloads (e.g., Cloud Run or Cloud SQL CPU/memory), typically for 1-year or 3-year terms.[^16][^5][^6]

Region selection has a direct impact on latency and cost. For SwaedUAE, choosing a Middle East region—Doha (me-central1), Dammam (me-central2), or Tel Aviv (me-west1)—generally reduces round-trip latency to UAE users. The Region Picker indicates how latency, price, and carbon footprint vary, helping teams pick an appropriate balance. In many cases, keeping data and compute in the same multi-region or region avoids inter-region charges and simplifies cost modeling. Pricing differences across regions can be meaningful, so aligning workload placement to UAE traffic is recommended.[^21][^16]

For planning, the Google Cloud Pricing Calculator should be used to estimate monthly costs for the chosen region. Once workloads stabilize and traffic patterns are known, enabling CUDs on Cloud Run and Cloud SQL can yield substantial savings.[^22][^6]

Table 3. Pricing levers by service

| Service | Free tier | Discount instruments | Regional nuance |
|---|---|---|---|
| Firebase Authentication | 50k MAUs free (email/password, OAuth); 50 MAUs for SAML/OIDC | N/A | Phone OTP priced via Identity Platform by destination |
| Cloud SQL for PostgreSQL | None | CUDs on CPU/memory for dedicated-core instances | Edition, HA, and storage differ by region |
| Cloud Firestore | Daily free quotas; monthly free outbound | CUDs for Firestore available | Operations/storage vary by location |
| Cloud Storage | Free Program allowances in select US regions | N/A | Storage class, egress, and operations vary by region |
| Cloud Functions (1st gen) | 2M invocations; 400k GB-s; 200k GHz-s; 5 GB egress | N/A | Tier 1/Tier 2 regions; outbound $/GB |
| Cloud Run functions (2nd gen) | vCPU/GiB-s and 2M requests free monthly | Cloud Run CUDs; Compute Flexible CUDs | Tier 1/Tier 2 regions; egress differences |
| Firebase Hosting | 10 GB storage; 10 GB DTO/month | N/A | CDN DTO billed per destination |
| Cloud CDN | N/A | Volume discounts >500 TiB/month | DTO per GiB varies by destination and volume |

References: Pricing models and discount instruments; Free Program; CUDs; Region Picker.[^16][^5][^6][^21]

---

## Authentication and Identity

Firebase Authentication on the Spark plan provides generous free allowances: up to 50,000 MAUs for standard authentication (email/password and OAuth providers) and 50 MAUs for SAML/OpenID Connect. Phone authentication is not included in the no-cost allowance; OTPs are billed per SMS through Google Cloud Identity Platform. Pricing for phone authentication depends on destination country and carrier, so the latest rate card should be consulted before enabling phone sign-in at scale.[^1][^2][^3]

For SwaedUAE, the practical approach is to:
- Use email/password and social logins for volunteers and organization accounts where possible to stay within the 50,000 MAU free tier in early stages.
- Reserve phone OTP for high-assurance flows (e.g., admin accounts) and measure OTP volumes; every OTP has a per-SMS cost that accumulates with retries and delivery failures.
- Enable SAML/OIDC only when external identity federation is required; given the 50 MAU free cap, plan for paid usage.

Table 4. Authentication allowances and overages

| Method | Free tier | What counts | Overage/billing |
|---|---|---|---|
| Email/Password, OAuth (Google, Apple, Facebook) | 50,000 MAUs/month (Spark) | MAUs are unique active users per month | Beyond free: per MAU pricing via Google Cloud Identity Platform |
| Phone OTP (SMS) | None | Each SMS sent | Per-SMS rate varies by destination; confirm current rates |
| SAML/OIDC | 50 MAUs/month (Spark) | Unique active federated users | Beyond free: per MAU pricing via Identity Platform |

References: Firebase pricing and limits; Identity Platform pricing for phone authentication.[^1][^2][^3]

### Firebase Authentication (Spark/Blaze) Pricing

- Spark plan (no-cost): 50,000 MAUs for standard auth; 50 MAUs for SAML/OIDC; daily usage limits apply at the project level.
- Blaze plan (pay-as-you-go): Includes Spark free usage; beyond free quotas, pricing follows Google Cloud Identity Platform. Phone OTP is billed per SMS, with rates varying by destination country. SwaedUAE should confirm current per-SMS pricing before enabling phone authentication in production.[^1][^3]

---

## Databases

The PRD implies a conventional split between transactional data (events, attendance, approvals, certificates) and flexible metadata (profiles, notifications, audit logs). Cloud SQL for PostgreSQL should serve as the primary source of truth for attendance and approvals, while Cloud Firestore complements it for flexible, high-churn data.

Table 5. Relational vs document store roles

| Use-case | Preferred service | Why | Key cost unit |
|---|---|---|---|
| Event lifecycle and approvals | Cloud SQL (PostgreSQL) | Transactional integrity, relational joins | vCPU/GiB-hour, storage GiB-month, backups, egress |
| Attendance records (authoritative) | Cloud SQL (PostgreSQL) | Consistency and HA options | HA premium, backup retention |
| Profiles and preferences | Cloud Firestore | Flexible schema, fast writes | Reads/writes per 100k, storage GiB-month |
| Notifications and audit logs | Cloud Firestore | Append-heavy, low-latency writes | Operations pricing, egress |
| Certificates metadata | Cloud Firestore | Lightweight documents | Operations, storage |

Reference: Cloud SQL pricing; Firestore pricing.[^4][^13]

### Cloud SQL for PostgreSQL: Editions, Tiers, and Costs

Cloud SQL offers Enterprise and Enterprise Plus editions, with dedicated-core and shared-core machine types. For SwaedUAE, dedicated-core instances (e.g., N2, N4, C4A series) provide predictable performance and eligibility for CUDs. HA (regional) roughly doubles CPU/memory rates versus non-HA. Storage options include SSD, HDD, and Hyperdisk Balanced; backups are billed per GiB-hour. Network egress is charged separately, with some intra-region and inter-Google transfers free or discounted. Extended support applies to major versions past end-of-life and had a waiver from February 1 through April 30, 2025; charges resume May 1, 2025.[^4]

Illustrative example: non-HA db-n1-standard-2 in us-central1 lists approximately $0.0826/hour for vCPU and $0.014/GiB-hour for memory. HA doubles those rates to roughly $0.1652/hour vCPU and $0.028/GiB-hour memory (illustrative values from the pricing schedule; actual selection should use N2/N4/C4A or Enterprise Plus equivalents sized to workload).[^4][^7]

Table 6. Example Cloud SQL configurations (illustrative)

| Configuration | CPU/memory price indicator | Storage options | When to choose |
|---|---|---|---|
| Small non-HA (2 vCPU, 7.5 GiB) | ~$0.1652/hour vCPU (non-HA example); memory billed per GiB-hour | SSD/HDD/Hyperdisk Balanced | Dev/test, low criticality |
| Medium HA (4 vCPU, 15 GiB) | ~$0.3304/hour vCPU (HA example) | SSD/HDD/Hyperdisk Balanced | Production read-heavy, moderate criticality |
| Large HA (8 vCPU, 30 GiB) | ~$0.6608/hour vCPU (HA example) | SSD/HDD/Hyperdisk Balanced | Peak events, reporting, analytics adjunct |

Notes: Use the Pricing Calculator to get region-specific instance costs; apply 1-year/3-year CUDs once steady usage is known.[^4][^7][^22]

### Firestore: Pricing Structure and Quotas

Cloud Firestore Standard edition offers a free quota per project with daily reset: 1 GiB storage, 50,000 document reads, 20,000 writes, 20,000 deletes per day; plus 10 GiB per month of outbound data transfer. Beyond free, pricing is granular: reads/writes/deletes are billed per 100,000 operations; storage is billed per GiB-month. Internet egress to worldwide destinations is free up to 10 GiB/month, then tiered by destination; first tier is commonly $0.12/GiB (excluding Asia/Australia) up to 1 TiB. Firestore also supports optional discounts via 1-year or 3-year CUDs.[^13][^14]

Table 7. Firestore free quotas and overages (Standard edition)

| Metric | Free quota | Overage pricing (indicative) |
|---|---|---|
| Storage | 1 GiB/day | ~$0.000205479/GiB-month |
| Reads | 50,000/day | ~$0.03 per 100k |
| Writes | 20,000/day | ~$0.09 per 100k |
| Deletes | 20,000/day | ~$0.01 per 100k |
| Outbound data | 10 GiB/month | Tiered by destination; first tier often $0.12/GiB up to 1 TiB |

CUDs can lower operation unit prices by ~20% (1-year) to ~40% (3-year) for steady workloads. The daily reset of free quotas requires careful monitoring to avoid unexpected spikes.[^13][^14]

---

## Storage and Delivery

File storage spans avatars, event images, and certificate PDFs. The cost profile is determined by storage class, object sizes and counts, operation mix (Class A vs Class B), retrieval behavior, and destination egress.

Table 8. Cloud Storage classes quick reference (selected Middle East regions)

| Region | Standard $/GB-month | Nearline $/GB-month | Coldline $/GB-month | Archive $/GB-month |
|---|---|---|---|---|
| Doha (me-central1) | ~$0.023 | ~$0.013 | ~$0.006 | ~$0.0025 |
| Dammam (me-central2) | ~$0.030 | ~$0.018 | ~$0.006 | ~$0.0027 |
| Tel Aviv (me-west1) | ~$0.021 | ~$0.0125 | ~$0.004 | ~$0.0012 |

Minimum storage duration and retrieval fees: Nearline (30 days, $0.01/GB retrieval), Coldline (90 days, $0.02/GB), Archive (365 days, $0.05/GB). Lifecycle transitions can reduce costs but may incur retrieval fees and early delete charges depending on the class.[^15]

Table 9. Cloud Storage operation classes and representative charges

| Operation class | Examples | Single-region $/1k ops (Standard) |
|---|---|---|
| Class A | PUT, POST, list, compose, setIamPolicy | ~$0.005 |
| Class B | GET, GET bucket config, HEAD | ~$0.0004 |
| Free | DELETE | Free |

For delivery, Firebase Hosting offers a built-in global CDN with 10 GB/month of data transfer out (DTO) free, then $0.15/GB; storage beyond 10 GB is $0.026/GB. Cloud Storage static hosting combined with Cloud CDN provides more control: CDN DTO per GiB is tiered by destination and monthly volume (e.g., Middle East often falls under “All other destinations” with $0.09/GiB under 10 TiB), plus cache fill fees (often ~$0.01–$0.04/GiB depending on region) and modest request charges.[^8][^12][^18][^15]

Table 10. Hosting and CDN options

| Option | Pros | Cons | Cost highlights |
|---|---|---|---|
| Firebase Hosting | Simple SPA/static hosting; integrated CDN | Less control over cache behavior | 10 GB DTO/month free; then $0.15/GB |
| Cloud Storage + Cloud CDN | Full control of caching and CDN | More setup complexity | DTO varies by destination; cache fill per GiB; request fees |

References: Cloud Storage pricing; Firebase Hosting quotas/pricing; Cloud CDN pricing.[^15][^8][^12]

---

## Compute and Serverless

Google offers two serverless compute families that fit distinct workloads:

- Cloud Functions (1st gen): Lightweight functions triggered by HTTP or events; billed per invocation plus compute time (GB-seconds and GHz-seconds) in 100ms increments. Generous free tiers—2 million invocations per month, 400,000 GB-seconds, 200,000 GHz-seconds, and 5 GB outbound data—can cover early growth. Outbound data beyond free is typically $0.12/GB. Minimum instances can keep latency low but incur idle-time costs.[^9][^11]
- Cloud Run functions (2nd gen): Containerized, stateful services with per-100ms billing for vCPU and memory. Offers monthly free allowances (e.g., 2 million requests, 180k–240k vCPU-seconds, 360k–450k GiB-seconds depending on billing model) and CUDs for sustained workloads. Outbound data shares Google Cloud networking rates.[^10][^11]

Table 11. Free tier comparison: 1st gen vs 2nd gen (selected)

| Metric | 1st gen (Cloud Functions) | 2nd gen (Cloud Run functions) |
|---|---|---|
| Invocations/Requests | 2M invocations/month | 2M requests/month |
| Compute | 400k GB-s; 200k GHz-s | 180k–240k vCPU-s; 360k–450k GiB-s |
| Egress | 5 GB/month free | 1 GiB/month free (North America baseline) |

References: Cloud Functions (1st gen) pricing; Cloud Run pricing; Free Program overview.[^9][^10][^11]

Table 12. Example cost scenarios (illustrative)

| Scenario | Assumptions | 1st gen monthly cost | 2nd gen monthly cost |
|---|---|---|---|
| 5M invocations, 128MB, 200ms avg | 1st gen: 5M invocations (2M free); compute 1,000,000 GB-s; outbound 10 GB | Invocations: ~$1.20 (3M paid); compute: ~$2.50; egress: ~$0.60 | Requests: ~$1.20 (3M paid); compute: ~$1.80; egress: depends on region |
| 1M invocations, 256MB, 500ms avg | Lower volume; still within free tiers partially | Often near $0 if within free quotas | Requests within free; compute modest; egress minimal |

These examples illustrate methodology rather than precise region-specific values; use the calculator and the relevant pricing pages for final estimates.[^9][^10][^22]

---

## Infrastructure Cost Factors

Three categories drive monthly variability:

- Compute: Instance types, HA, right-sized CPU/memory, concurrency, and minimum instances. CUDs reduce costs for steady workloads on Cloud Run and Cloud SQL CPU/memory.[^6][^10][^4]
- Storage: Class selection, object sizes, lifecycle policies, and backup retention. Retrievals and early deletes can add cost.[^15]
- Network: Egress destinations and volumes; cache behavior on CDN; inter-region transfers. Firestore and Cloud Storage have destination-specific egress tiers.[^13][^15]

Monitoring and budgets: Use billing reports and set budgets/alerts to catch anomalies; quarterly reviews should validate region choices and revisit CUD eligibility.[^23][^24]

Table 13. Cost factor checklist by service

| Service | Key knobs | Risk flags |
|---|---|---|
| Cloud SQL | Instance series/size, HA, storage type, backup retention | Unused capacity, excessive HA, long retention |
| Firestore | Read-heavy queries, offsets, large result sets | Index bloat, hot partitions, deep pagination |
| Cloud Storage | Lifecycle to NL/CL/Archive, object sizes, operation volume | Class A spikes, retrieval fees, egress concentration |
| Cloud Functions/Run | Memory/CPU sizing, concurrency, min instances | Idle billing, over-provisioned memory |
| Hosting/CDN | Cache hit ratio, geography mix | DTO surprises, cacheable vs non-cacheable paths |

References: Cloud SQL pricing; Firestore pricing; Cloud Storage pricing; Billing reports; SKUs.[^4][^13][^15][^23][^20]

---

## Free Tier Allowances and Usage Limits

Firebase Authentication, Firestore, Cloud Functions, Cloud Storage, and Cloud Run have monthly free allowances. Free quotas reset monthly (Firestore’s daily quotas reset daily). Excess usage is billed at standard rates. The $300 new customer credit can offset early-stage costs but is not a substitute for free tiers.[^5][^11][^14][^13]

Table 14. Free tier summary for SwaedUAE

| Service | Free allowance highlights |
|---|---|
| Firebase Authentication | 50k MAUs (standard); 50 MAUs (SAML/OIDC) |
| Firestore | 1 GiB storage/day; 50k reads/day; 20k writes/day; 20k deletes/day; 10 GiB/month egress |
| Cloud Functions (1st gen) | 2M invocations; 400k GB-s; 200k GHz-s; 5 GB egress |
| Cloud Run (2nd gen) | 2M requests; ~180k–240k vCPU-s; ~360k–450k GiB-s; 1 GiB egress (NA baseline) |
| Cloud Storage | 5 GB-months Standard (US regions); 5k Class A; 50k Class B; 100 GB egress (NA) |
| Firebase Hosting | 10 GB storage; 10 GB DTO/month |

References: Free Program overview; Cloud Functions free tier; Firestore quotas.[^5][^11][^14][^13]

---

## Scenario-based Cost Estimates and Trade-offs

To ground recommendations, consider three usage scenarios aligned to the PRD’s growth trajectory.

Table 15. Scenario inputs (illustrative placeholders to be refined)

| Dimension | Pilot | Year 1 | Year 1+ (scale) |
|---|---|---|---|
| MAUs (Auth) | 5,000 | 50,000 | 200,000 |
| Auth method mix | 90% email/OAuth; 10% phone OTP | 85% email/OAuth; 15% phone OTP | 80% email/OAuth; 20% phone OTP |
| Firestore ops/day | 5k reads; 1k writes; 200 deletes | 50k reads; 10k writes; 2k deletes | 200k reads; 40k writes; 8k deletes |
| Storage (GB-month) | 20 GB | 200 GB | 2,000 GB |
| Functions/Run | 1M invocations; 128MB; 200ms | 5M invocations; 256MB; 300ms | 20M requests; 512MB; 400ms |
| Hosting/CDN | 5 GB DTO/month | 50 GB DTO/month | 500 GB DTO/month |
| Cloud SQL | Small non-HA | Medium HA | Large HA |
| Region | me-west1 | me-central1 | me-central1 |

Table 16. Scenario outputs (indicative, not including phone OTP)

| Service | Pilot | Year 1 | Year 1+ (scale) |
|---|---|---|---|
| Firebase Authentication | Mostly free | At free limit | Paid MAUs beyond 50k (confirm Identity Platform rates) |
| Firestore | Often within free quotas | Near or beyond free | Paid ops/storage; consider CUDs |
| Cloud Storage | Standard storage modest | Lifecycle to NL for older media | NL/CL for archives; manage Class A ops |
| Functions/Run | Often within free tiers | Moderate charges | Material charges; evaluate CUDs |
| Hosting/CDN | Within Firebase Hosting free | Exceeds Hosting free; choose CDN path | CDN preferable for cost control |
| Cloud SQL | Non-HA small | HA medium | HA large; apply CUDs |

Trade-offs:
- Hosting vs CDN: Firebase Hosting simplifies deployment and CDN integration; beyond 10 GB DTO/month, Cloud CDN may offer more predictable DTO pricing depending on destination mix.[^8][^12]
- Firestore vs Cloud SQL: Use Firestore for flexible metadata and append-heavy logs; keep transactional records in Cloud SQL to avoid overpaying for complex relational operations in a document store.[^13][^4]
- Functions vs Cloud Run: Prefer 1st gen for simple, spiky, short-lived functions; switch to 2nd gen for containerized services, longer execution times, and better concurrency. Monitor egress and per-request charges.[^9][^10]

Use the Pricing Calculator to validate final numbers for the chosen region (me-central1 or me-west1) and current SKUs.[^22]

---

## Recommendations and Next Steps

1. Authentication strategy:
   - Default to email/password and OAuth (Google/Apple) to stay within the 50,000 MAU free tier. Reserve phone OTP for privileged flows and confirm per-SMS rates in Identity Platform before enabling widely.[^1][^2][^3]
   - Evaluate SAML/OIDC only for enterprise integrations; budget for paid MAUs beyond the 50 free.

2. Database selection:
   - Use Cloud SQL PostgreSQL for authoritative transactional data (events, attendance, approvals). Select the instance series and HA configuration based on required uptime; enable backups and monitor storage growth.[^4]
   - Use Firestore for flexible metadata and audit logs. Shape queries to avoid costly offsets; batch writes; consider 1-year/3-year CUDs if steady-state operations justify discounts.[^13][^14]

3. Storage lifecycle and delivery:
   - Store active media in Cloud Storage Standard; transition older content to Nearline/Coldline/Archive via lifecycle rules. Track Class A operation counts to prevent cost spikes.[^15]
   - For SPA and static assets, start with Firebase Hosting for simplicity. If DTO grows or geo mix diversifies, consider Cloud Storage + Cloud CDN for predictable per-destination DTO pricing.[^8][^12]

4. Compute approach:
   - Use Cloud Functions (1st gen) for light event-driven tasks. For containerized workloads or services requiring longer execution and higher concurrency, standardize on Cloud Run functions (2nd gen). Right-size memory/CPU and use CUDs once workloads stabilize.[^9][^10][^6]

5. Governance:
   - Set budgets and alerts; export billing data for analysis. Revisit region choices and discount eligibility quarterly. Use the Region Picker to reconfirm latency/cost balance for the UAE and the Pricing Calculator to estimate changes.[^23][^24][^21][^22]

Table 17. Action plan and decision gates

| Timeline | Decision gate | Owner | Cost impact |
|---|---|---|---|
| Pre-launch | Confirm region (me-central1 vs me-west1) | CTO/Architect | Latency and egress |
| Month 1 | Enable budgets/alerts; export billing | FinOps/Engineering | Spend visibility |
| Month 2 | Auth method mix baseline; phone OTP rates | Product/FinOps | MAU/SMS costs |
| Quarter 1 | Revisit Firestore CUD; Cloud SQL instance sizing | Engineering/FinOps | Ops & CPU/Memory |
| Quarter 2 | Hosting vs CDN strategy; lifecycle rules | Engineering | DTO and storage |
| Ongoing | CUD eligibility review | FinOps | Sustained savings |

References: Identity Platform pricing; Cloud SQL pricing and CUDs; Firestore pricing; Cloud Storage pricing; Cloud Run pricing; Cost management tooling.[^3][^4][^6][^13][^15][^10][^23][^24]

---

## References

[^1]: Firebase Pricing — https://firebase.google.com/pricing  
[^2]: Firebase Authentication Limits — https://firebase.google.com/docs/auth/limits  
[^3]: Google Cloud Identity Platform Pricing — https://cloud.google.com/identity-platform/pricing  
[^4]: Cloud SQL Pricing — https://cloud.google.com/sql/pricing  
[^5]: Google Cloud Free Program: Free cloud features and trial offer — https://docs.cloud.google.com/free/docs/free-cloud-features  
[^6]: Committed Use Discounts | Google Cloud — https://cloud.google.com/cud  
[^7]: Pricing examples | Cloud SQL for PostgreSQL — https://cloud.google.com/sql/docs/postgres/pricing-examples  
[^8]: Hosting usage, quotas, and pricing | Firebase — https://firebase.google.com/docs/hosting/usage-quotas-pricing  
[^9]: Cloud Run functions (1st gen) pricing — https://cloud.google.com/functions/pricing-1stgen  
[^10]: Cloud Run functions pricing (2nd gen) — https://cloud.google.com/run/pricing  
[^11]: Google Cloud Free Program — https://cloud.google.com/free  
[^12]: Cloud CDN pricing — https://docs.cloud.google.com/cdn/pricing  
[^13]: Firestore pricing (Standard edition) — https://cloud.google.com/firestore/pricing  
[^14]: Understand Cloud Firestore billing | Firebase — https://firebase.google.com/docs/firestore/pricing  
[^15]: Cloud Storage pricing — https://docs.cloud.google.com/storage/pricing  
[^16]: Pricing Overview | Google Cloud — https://cloud.google.com/pricing  
[^17]: View and download prices for Google’s cloud services (SKU price list) — https://docs.cloud.google.com/billing/docs/how-to/pricing-table  
[^18]: Host a static website | Cloud Storage — https://docs.cloud.google.com/storage/docs/hosting-static-website  
[^19]: Cloud Storage locations — https://cloud.google.com/storage/docs/locations  
[^20]: Cloud Platform SKUs — https://cloud.google.com/skus  
[^21]: Google Cloud Region Picker — https://cloud.withgoogle.com/region-picker/  
[^22]: Google Cloud Pricing Calculator — https://cloud.google.com/products/calculator  
[^23]: Analyze billing data and cost trends with Reports — https://docs.cloud.google.com/billing/docs/how-to/reports  
[^24]: Set budgets and alerts | Cloud Billing — https://cloud.google.com/billing/docs/how-to/budgets