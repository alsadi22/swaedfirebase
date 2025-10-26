# SwaedUAE QR & Geolocation Services: Libraries, APIs, Pricing, and Implementation Blueprint

## Executive Summary

SwaedUAE’s mission is to make volunteer engagement in the United Arab Emirates verifiable, transparent, and scalable. The platform’s Product Requirements Document (PRD) specifies a dual-mode attendance flow—QR code check-in/out plus GPS validation—supported by real-time dashboards, certificate issuance, and bilingual (English/Arabic) user experiences. The engineering choices must therefore deliver secure QR generation and scanning, accurate geolocation, reliable geofencing, real-time streaming for dashboards, and mapping layers suitable for both web and mobile.

Based on a structured evaluation of current libraries and cloud services, the recommended approach is as follows:

- QR generation: Use the “qrcode” Node/JS package for server-side generation (PNG/SVG) and two React components for client-side rendering—qrcode.react (for SVG/Canvas rendering and TypeScript support) and @devmehq/react-qr-code (for image embedding and styling flexibility). The combination balances performance, customization, and maintainability in Next.js and React contexts.[^16][^17][^18][^19][^20]
- QR scanning: For native mobile (PWA/React Native), adopt React Native Vision Camera for high-performance camera pipelines and QR decoding. For the web, pair MediaDevices.getUserMedia with jsQR for in-browser decoding; this works across modern browsers and is straightforward to integrate.[^21][^24][^22]
- Mapping and tiles: Use Google Maps Platform’s Map Tiles API for vector/3D needs where justified, and Leaflet + MapTiler as a cost-efficient baseline for interactive maps. Leaflet provides a lightweight, open-source web mapping experience, while MapTiler offers competitive pricing, MapLibre compatibility, and migration paths from Mapbox.[^8][^25][^26]
- Geolocation: In the browser, rely on the W3C Geolocation API (getCurrentPosition, watchPosition), available in secure contexts (HTTPS) with user consent. For network-based positioning or fallback, use the Google Geolocation API.[^24][^6]
- Geofencing: For advanced geofencing (polygons, dwell-time, chained/time-based triggers) with enterprise scale, prefer Radar’s geofencing APIs. Mapbox’s Geofencing API remains an alternative where its mapping stack is already in use. A custom server-side geofencer is viable for circular geofences, but lacks advanced triggers.[^10][^12][^11]
- Real-time transport: Use PubNub for a managed, globally distributed pub/sub network priced by Monthly Active Users (MAU), avoiding per-message charges and enabling Functions-based geo-triggering. SSE (Server-Sent Events) can backstop uni-directional live updates in web contexts; WebSockets remain an option for bespoke deployments.[^27][^28]
- Google Maps pricing: As of March 1, 2025, Google Maps Platform introduces per-SKU free monthly calls (Essentials, Pro, Enterprise) and SKU-specific pricing per 1,000 events. Dynamic Maps and Map Tiles 2D are relevant to SwaedUAE’s web maps; Geocoding and Places support event address normalization and place details. Volume discounts apply at higher tiers.[^1][^2][^3][^4][^5]

Compliance and privacy obligations under the UAE Personal Data Protection Law (PDPL) require explicit consent, data minimization, breach notification, and controls for cross-border data transfer. Location data is personal data; retention, transparency, and appropriate technical safeguards must be baked into the product, with a DPO (Data Protection Officer) for high-risk processing.[^29][^30]

Cost guardrails should leverage:
- Google’s free monthly calls by SKU (post–Mar 1, 2025), tiered pricing, and Map Tiles 2D’s 100,000 free calls/month.
- MapTiler’s competitive pricing for map loads, geocoding, and static maps, and Radar’s free up to 100,000 requests/month, then $0.50 per 1,000 calls—often 50–90% less expensive than Mapbox for geofencing-heavy use cases.[^2][^11][^26][^10]

Risks include GPS spoofing, billing shocks from map loads, browser permission friction, and regional API nuances (e.g., the vanilla Geolocation API may be unavailable in China). Mitigations combine anti-spoofing techniques (motion/heading coherence, emulator detection), quota monitoring and alerting, fallbacks to network-based positioning, and user education flows that explain why location access matters.[^24][^6][^31][^32][^33]

Overall, the recommended stack is technically feasible, cost-aware, compliant with PDPL, and aligned to SwaedUAE’s PRD requirements for QR+GPS attendance validation and real-time operations.

## Context and Requirements from SwaedUAE PRD

SwaedUAE’s PRD lays out an attendance flow in which volunteers arrive at an event, scan a QR code, and validate their location via GPS. Separate codes are used for check-in and check-out, and timestamps are recorded for hour calculations. The system should support manual overrides for GPS issues, offline scanning with deferred sync, and a configurable geofence radius between 50 and 500 meters (default 100 meters). Real-time monitoring and violation detection are built in, with severity classification and alerts. The certificate system issues PDF certificates with verification codes or QR codes, backed by tamper detection and revocation capabilities.

From an architectural standpoint, the PRD specifies Next.js (TypeScript) on the frontend, a Node.js API layer, PostgreSQL for persistence, S3-compatible storage for files, and web sockets or Server-Sent Events (SSE) for real-time features. Bilingual UX (Arabic/English) is a first-class requirement, and the platform should be extensible to future government integrations and blockchain-based verification. Key endpoints include:

- Attendance: POST /api/attendance/checkin and POST /api/attendance/checkout, with GPS payloads.
- Geofencing: POST /api/geofencing/check, returning inside/outside status, distance, accuracy, and warnings.
- Certificates: POST /api/certificates/generate and GET /api/certificates/verify.

These requirements drive the selection criteria for the libraries and services assessed in this report: security of QR payloads, robustness of scanning in mobile/web contexts, accuracy of geolocation, effectiveness and scalability of geofencing, cost transparency of mapping services, and reliable real-time streaming for dashboards.

## QR Code Generation Libraries (Client and Server)

The platform needs both server-side and client-side QR generation. Server-side generation is preferred for attendance tokens and certificates, ensuring reproducible artifacts (PNG/SVG) and centralized control of cryptographic parameters. Client-side generation is helpful for previews and certain admin workflows.

We evaluated libraries and components on:
- Rendering modes (SVG/Canvas), control over error correction level (ECL), colors, margins, and image embedding.
- TypeScript support and React integration.
- Output formats and API ergonomics (browser/Node).
- Licensing and maintainability.

To illustrate the recommended choices, Table 1 summarizes the comparison.

Table 1. QR generation libraries: capabilities and fit for SwaedUAE

| Library / Component | Rendering modes | ECL support | Image embedding | TypeScript | Formats / Output | Typical use |
|---|---|---|---|---|---|---|
| qrcode (NPM) | Canvas, SVG (via toString/toDataURL/toFile) | L/M/Q/H | Via overlay or SVG composition | Yes | PNG, SVG, UTF-8, Terminal | Server-side generation (Node), CLI, browser data URLs[^16][^17] |
| qrcode.react | SVG, Canvas | L/M/Q/H | Yes (imageSettings) | Yes | Component props control rendering | React client components, admin previews, volunteer portal[^18][^20] |
| @devmehq/react-qr-code | SVG, Canvas | L/M/Q/H | Yes (multiple images, excavate) | Yes | Component props control rendering | Branded QR codes, logo embedding in React UIs[^19] |

The “qrcode” package is mature and widely used (millions of weekly downloads) and supports Node.js, browsers, and even React Native with SVG output. It offers comprehensive control over ECL, margins, and colors, and can save to files or produce data URLs—ideal for attendance tokens and certificate QR images. In React UIs, qrcode.react and @devmehq/react-qr-code cover most rendering and styling needs, with TypeScript-friendly APIs and image embedding for brand assets. A fallback to react-qr-code exists if simpler component-only generation is preferred.[^16][^17][^18][^19][^20]

### Server-side Generation

For server-side generation, use the “qrcode” NPM package to render PNG or SVG assets and store them alongside event records or certificate metadata. For dynamic attendance payloads, generate a signed token (eventId, sessionId, volunteerId, timestamp, nonce) and include it as the QR value. The backend should verify the token on scan to prevent replay and forgery. Rendering PNGs ensures consistent output across devices; SVGs are suitable for high-resolution print or scalable branding in certificates.[^16]

### Client-side Generation

For React-based admin portals and volunteer self-service pages, use qrcode.react or @devmehq/react-qr-code to render QR codes on demand. Prefer SVG for crisp scaling and easy CSS styling; Canvas is useful for programmatic export workflows. Both components offer ECL control, margins, and image embedding for logos. Ensure consistent token formats with server-side generation so the scanner backend recognizes payloads without format drift.[^18][^19][^20]

## QR Scanner Libraries (Web and Mobile)

Scanning must be reliable under variable lighting and motion, tolerant of code size and print quality, and integrated into a permission-aware UX. In the web context, camera access is requested via getUserMedia; on mobile PWA/React Native, camera permissions and hardware acceleration drive throughput.

Table 2 provides a concise comparison.

Table 2. QR scanning libraries: web vs mobile fit

| Library | Platform | License | Performance notes | Integration complexity | Best fit |
|---|---|---|---|---|---|
| jsQR | Browser (web) | Apache-2.0 | Pure JS; decodes from RGBA ImageData; configurable inversion attempts | Low; pair with getUserMedia | Web scanning via canvas and video frames[^22][^24] |
| react-native-qrcode-scanner | React Native | (NPM package; check repository) | Uses camera view; community-maintained | Moderate; legacy package | Legacy React Native projects[^23] |
| React Native Vision Camera | React Native (native) | MIT | High-performance, GPU-accelerated pipeline; frame processors for QR | Higher; native setup and permissions | Production-grade mobile scanning with advanced performance[^21] |

For the web, the combination of MediaDevices.getUserMedia and jsQR provides a robust path: capture frames to a canvas, pass ImageData to jsQR, and decode the QR payload. For mobile, React Native Vision Camera delivers performant scanning with frame processors, multi-camera support, and fine-grained control over resolution and FPS, making it our recommendation for PWA/React Native deployments. Legacy React Native apps can consider react-native-qrcode-scanner, but Vision Camera is preferred for greenfield builds.[^24][^22][^21][^23]

### Web Scanner

Implement getUserMedia to access the camera stream, draw frames to a canvas, and invoke jsQR with the RGBA pixel buffer. Handle permissions gracefully and provide UI cues for alignment and focus. Debounce scanning to reduce CPU usage and battery drain, and use backoff strategies if the camera feed is temporarily unavailable.[^24][^22]

### Mobile Scanner (React Native / PWA)

Set up camera permissions for iOS and Android, then integrate Vision Camera’s frame processors for high-throughput decoding. Allow users to toggle flash, switch cameras, and lock focus on the QR region. Manage power consumption by limiting frame rates and pausing scanning when the QR region is not visible in the viewport.[^21]

## Google Maps Platform: Features and Pricing (2025)

Google’s March 1, 2025 pricing changes introduce product categories (Essentials, Pro, Enterprise) with per-SKU free monthly calls and more granular SKU pricing. For SwaedUAE, the relevant SKUs are Dynamic Maps, Static Maps, Map Tiles API (2D and Street View tiles), Geocoding, Places (Autocomplete, Place Details), and the Geolocation API. Volume discounts kick in at higher tiers.[^1][^2][^3][^4][^5]

To provide concrete guidance, Table 3 outlines selected SKUs and pricing tiers.

Table 3. Selected Google Maps Platform SKUs (pricing per 1,000 events)

| SKU | Free monthly calls | Tier 1 price (cap–100k) | Tier 2 (100k–500k) | Tier 3 (500k–1M) | Tier 4 (1M–5M) | Tier 5 (5M+) |
|---|---|---|---|---|---|---|
| Dynamic Maps | 10,000 | $7.00 | $5.60 | $4.20 | $2.10 | $0.53 |
| Static Maps | 10,000 | $2.00 | $1.60 | $1.20 | $0.60 | $0.15 |
| Map Tiles API: 2D Tiles | 100,000 | $0.60 | $0.48 | $0.36 | $0.18 | $0.045 |
| Geocoding | 10,000 | $5.00 | $4.00 | $3.00 | $1.50 | $0.38 |
| Places: Autocomplete (Requests) | 10,000 | $2.83 | $2.27 | $1.70 | $0.85 | $0.21 |
| Places: Place Details Essentials | 10,000 | $5.00 | $4.00 | $3.00 | $1.50 | $0.38 |
| Geolocation | 10,000 | $5.00 | $4.00 | $3.00 | $1.50 | $0.38 |

These figures reflect publicly documented SKU pricing as of March 1, 2025, and underscore two guardrails. First, Map Tiles API 2D Tiles provides substantial free monthly calls (100,000), materially lowering costs for map tile-heavy workloads. Second, Places and Geocoding tiers are predictable at lower volumes, but dynamic map loads accumulate costs faster at scale. Billing is aggregated monthly across projects linked to a billing account to determine applicable volume tiers.[^2][^3][^4]

In practice:
- Use Map Tiles API where possible to optimize tile costs for web maps.
- Cache geocoding and place detail results where policies permit, to reduce repeated calls.
- Monitor SKU usage weekly and implement guardrails (rate limiting, circuit breakers).
- Consider alternative base maps (Leaflet + MapTiler) for non-critical layers to minimize dynamic map loads.

Note that some services (e.g., Places API, Directions API, Distance Matrix API) are designated legacy as of March 1, 2025, and the pricing calculator includes newer versions with expanded volume discounts.[^1][^5]

## Geolocation APIs and GPS Tracking

The W3C Geolocation API allows web applications to obtain a user’s location with explicit consent and in secure contexts (HTTPS). Two primary methods are used:

- getCurrentPosition: returns a one-off fix with coordinates, accuracy, heading, and speed.
- watchPosition: subscribes to updates as the device moves, suitable for continuous tracking during events.[^24]

The API is widely supported across modern browsers, but availability can vary in certain regions (e.g., China). Where the vanilla Geolocation API is unavailable or insufficient (e.g., indoor events, poor GPS signal), the Google Geolocation API provides network-based positioning using cell towers and Wi-Fi access points—valuable as a fallback when consented by the user.[^24][^6]

Table 4 compares the two approaches.

Table 4. Browser Geolocation vs Google Geolocation API

| Criterion | Browser Geolocation API | Google Geolocation API |
|---|---|---|
| Accuracy | High with GPS; variable with Wi-Fi/cellular | Network-based; good urban coverage |
| Permission | User consent; browser-managed | User consent via API call; Google account billing applies |
| Availability | Broad, but region-specific constraints (e.g., China) | Global service; subject to quotas and billing |
| Usage patterns | Ideal for foreground tracking and watchPosition | Ideal for fallback, indoor positioning, or coarse fixes |
| Security | Requires HTTPS; permissions policy可控 | Quota, billing, and usage monitoring required |

For SwaedUAE:
- Default to the browser API during events for continuous tracking (watchPosition).
- Implement a fallback to the Google Geolocation API for indoor venues or devices lacking GPS fixes.
- Display clear consent dialogs and explain the purpose (“to verify your attendance at the event site”).
- Collect accuracy metadata and use it in geofence validation heuristics.[^24][^6]

## Geofencing Services and Solutions

Accurate, real-time geofencing ensures volunteers are physically present within event boundaries. Three approaches are viable:

- Radar: A geolocation platform with precise polygon geofences, advanced triggers (dwell time, chained geofences), time-based activation, global coverage, and developer-friendly SDKs. Pricing is free up to 100,000 requests per month, then $0.50 per 1,000 calls, typically 50–90% less than Mapbox for geofencing-heavy workloads.[^10][^11][^12]
- Mapbox Geofencing API: Provides virtual perimeters and monitoring of device activity within defined boundaries, suitable when Mapbox maps are already in use and the feature set meets requirements.[^11]
- Custom server-side geofencing: Feasible for circular geofences with center+radius checks using the haversine formula. This approach is cost-efficient but requires building real-time monitoring and alert infrastructure and lacks advanced triggers.

Table 5 summarizes the trade-offs.

Table 5. Radar vs Mapbox Geofencing vs Custom (circular) geofencing

| Dimension | Radar | Mapbox Geofencing | Custom (Server-side) |
|---|---|---|---|
| Shape support | Polygons, chains, time windows | Polygons (per Mapbox docs; verify latest) | Circles (center + radius) |
| Advanced triggers | Dwell time, chained fences, time-based | Not explicitly documented; verify latest | DIY; build custom logic |
| Accuracy | Hyper-accurate tracking; SDKs for iOS/Android/Web | Depends on underlying map SDK integration | Dependent on device GPS accuracy |
| Pricing model | Free to 100k req/mo; $0.50/1k calls; volume discounts | Per Mapbox plan; pricing specifics not covered here | Infrastructure + ops cost only |
| Integration effort | Low; SDKs, remote config, dashboards | Moderate; Mapbox-aligned SDKs | Moderate to high; real-time infra, rules engine |
| Enterprise scale | Proven at high volumes | Works within Mapbox ecosystem | Scales with your infra |

For SwaedUAE’s PRD—configurable radius (50–500m) and strict validation—Radar’s polygon support and triggers provide the most robust solution. A custom circular geofencer is acceptable for MVP and pilot events, but advanced triggers (dwell time, chained geofences) and dashboard tooling favor Radar in production. Mapbox Geofencing API remains an option if the mapping stack is standardized on Mapbox; confirm latest pricing and features directly with Mapbox.[^10][^11][^12]

### Anti-Spoofing and Fraud Detection

Volunteer attendance systems are targets for GPS spoofing. Attackers use apps or emulator frameworks to fake location signals. A layered defense should combine signals from the device and the environment:

- Signal coherence: Compare speed and heading against plausible movement; reject impossible trajectories.
- Emulator and rooted/jailbroken detection: Block known emulator signatures and device integrity violations.
- Sensor fusion: Where available, use motion and gyroscope data to detect inconsistent movement patterns.
- Heuristics: Flag sudden location jumps, extended absence outside geofence, and persistently low accuracy.

Vendors such as Build38, Approov, and Incognia offer mobile anti-spoofing and geo-verification tools and patterns for mobile apps, including secure API integration and emulator detection. These measures raise the bar and should be integrated into the mobile client and backend analysis.[^31][^32][^33]

## Mapbox Alternatives and Pricing Comparison

Cost-effective mapping underpins operational dashboards and public-facing maps. Alternatives to Mapbox provide significant savings, especially at scale:

- Leaflet: A free, open-source JavaScript library for interactive maps, lightweight and extensible with plugins. Ideal for web maps where advanced 3D or vector styling are not essential.[^25]
- MapTiler: Compatible with MapLibre (open-source fork of Mapbox SDK) and offers competitive pricing across map loads, geocoding, static maps, and IP geolocation. Self-hosting and on-premise options reduce vendor lock-in.[^26]
- Radar: Provides maps APIs (geocoding, search, routing) and vector basemaps alongside advanced geofencing. Its pricing is often 50–90% less than Mapbox for geofencing-heavy scenarios.[^10]

Table 6 presents a snapshot of MapTiler’s pricing comparison versus Mapbox.

Table 6. MapTiler vs Mapbox pricing snapshot

| Service | MapTiler price | Mapbox price | Notes |
|---|---|---|---|
| 100k map loads | $175 | $250 | Lower bill with MapTiler |
| 500k geocoding | $25 | $300 | Substantial savings |
| 500k static maps | $25 | $450 | Static map workloads |
| IP geolocation | $25 | — | MapTiler offers IP geolocation |
| Weather overlays | $175 | — | MapTiler includes weather |

Table 7 compares alternative mapping providers.

Table 7. Alternative mapping providers for SwaedUAE

| Provider | Cost profile | Strengths | Considerations |
|---|---|---|---|
| Leaflet | Free (open-source) | Lightweight web maps; plugin ecosystem | Requires tile provider; no built-in geocoding |
| MapTiler | Competitive; self-hosting available | MapLibre-compatible; migration from Mapbox; global infra | Integration and tile hosting decisions |
| Radar | Freemium + low per-1k calls | Geofencing-first; maps + routing; developer-friendly | Not a full GIS stack; complements maps provider |

In practice, a blended approach works well: Leaflet for baseline web maps, MapTiler for competitive geocoding/static maps and vector styling, Radar for geofencing and tracking where advanced triggers and developer tooling matter.[^25][^26][^10]

## Real-Time Location Tracking Solutions

Real-time dashboards and event operations benefit from low-latency streaming infrastructure. Three options exist:

- PubNub: A managed real-time platform with MAU-based pricing, unlimited channels and core features, Functions for geo-triggering, and global edge network performance. No per-message fees, enabling frequent location updates without billing surprises. Suitable for dashboards and mobile apps.[^27][^28]
- SSE (Server-Sent Events): A simple, uni-directional server-to-client streaming mechanism. Efficient for live updates where client-to-server messaging is minimal or handled via HTTP. Underrated and well-suited for web dashboards.[^34][^35]
- WebSockets: Full-duplex communication suitable for bi-directional messaging. Powerful but requires connection management, scaling, and operational maturity.[^34][^35]

Table 8 compares the options.

Table 8. Real-time transport comparison

| Criterion | PubNub | SSE | WebSockets |
|---|---|---|---|
| Pricing metric | MAU (no per-message fees) | Infrastructure-only (self-host) | Infrastructure-only (self-host) |
| Scaling | Managed global network | Self-managed; straightforward for uni-directional | Self-managed; complex for bi-directional |
| Complexity | Low; SDKs and Functions | Low to moderate | Moderate to high |
| Geo-triggering | Functions support geo-use cases | Requires custom server logic | Requires custom server logic |
| Best fit | Dashboards and mobile apps with frequent updates | Web dashboards with uni-directional updates | Apps needing full duplex messaging |

For SwaedUAE, PubNub offers fast time-to-market, predictable billing, and Functions for geo-triggering. SSE is a credible fallback for web dashboards where complexity must be minimized. A custom WebSocket stack can be considered later if bi-directional streaming needs become central to the product.[^27][^28][^34][^35]

## Location-Based Verification and Anti-Spoofing

Verification combines geofence checks, device integrity, motion coherence, and network signals. Two categories of vendors add defense-in-depth:

- Device and app security: Build38, Approov, and Incognia provide mobile anti-spoofing tools, secure API integration patterns, and behavioral location analytics to detect tampering and policy abuse.[^31][^32][^33]
- Compliance-aligned geo-verification: Tools like iComply integrate geolocation checks into KYC/AML workflows; while SwaedUAE is not a financial KYC product, the patterns apply to fraud prevention and policy abuse detection.[^32]

The following table frames anti-spoofing controls across layers.

Table 9. Anti-spoofing controls matrix

| Layer | Control | Tools / Techniques | Benefit |
|---|---|---|---|
| Device | Emulator/root/jailbreak detection | Vendor SDK checks; device integrity APIs | Blocks known tampered environments |
| App | Secure API integration | Token binding; anti-tamper checks (Approov) | Prevents API abuse from spoofed clients |
| Network | IP/VPN/Proxy checks | Radar/IP geolocation; provider APIs | Detects improbable network origins |
| Signal coherence | Speed/heading/accumption | Motion sensors; plausibility heuristics | Rejects impossible movement |
| Geofence behavior | Dwell time; chained fences | Radar geofences | Detects superficial presence |

A layered approach aligns with PDPL’s security requirements and reduces the likelihood of successful spoofing attacks.[^29][^31][^32][^33]

## Security, Privacy, and UAE PDPL Compliance

The UAE PDPL governs processing of personal data, including geographic location. SwaedUAE must:

- Obtain explicit consent for geolocation, with clear notices in Arabic and English.
- Minimize data collection to what is necessary (e.g., accuracy thresholds, event-only tracking).
- Secure location data in transit and at rest, with role-based access controls and audit logs.
- Define retention schedules (the PRD suggests a 30-day auto-purge); ensure policies reflect PDPL’s “not kept after fulfilling processing purpose” principle unless data is anonymized.
- Support data subject rights: access, correction/erasure, restriction, portability, and objection to automated decision-making.
- Prepare breach notification procedures to the Data Office, especially for incidents prejudicing privacy and confidentiality; sector-specific obligations may impose tighter timelines (e.g., financial services).
- Consider cross-border transfer restrictions; choose hosting and vendors that meet PDPL expectations and document safeguards.[^29][^30]

Table 10 offers a practical compliance checklist.

Table 10. PDPL compliance checklist for location data

| Requirement | SwaedUAE implementation |
|---|---|
| Consent | Bilingual consent prompts; granular toggles for tracking |
| Minimization | Accuracy caps; event-only tracking; disable background tracking outside events |
| Security | TLS, encryption at rest; RBAC; audit logs; rate limiting |
| Retention | 30-day auto-purge; configurable per policy; anonymization for analytics |
| Rights | APIs to access/export data; correction/erasure workflows |
| Breach notification | Incident runbook; notify Data Office per PDPL timelines |
| Cross-border transfer | Vendor due diligence; region-aware hosting; documented safeguards |
| DPO | Appoint DPO for high-risk processing; publish contact |

This compliance posture should be embedded in both product design and operational runbooks.[^29][^30]

## Cost Scenarios and Guardrails

SwaedUAE’s cost envelope depends on map loads, geocoding requests, geofence evaluations, and real-time messaging. We outline three scenarios—small pilot, mid-scale growth, and national rollout—with guardrails and mitigations.

Assumptions:
- Web maps: Leaflet + MapTiler baseline for cost efficiency; Google Map Tiles 2D for heavy vector/3D overlays where necessary.
- Radar geofencing: Free up to 100k requests/month; $0.50 per 1k thereafter; high-volume discounts available.
- Google Maps SKUs: Dynamic Maps ($7/1k), Map Tiles 2D ($0.60/1k up to 1M), Geocoding ($5/1k), Places ($2.83–$32/1k depending on SKU).
- PubNub: MAU-based pricing (Starter: ~$98/month for 1,000 MAU), no per-message fees.

Table 11 summarizes indicative monthly costs (illustrative; confirm vendor calculators for exact figures).

Table 11. Scenario cost table (indicative)

| Scenario | Maps & Tiles | Geofencing | Geocoding & Places | Real-time (PubNub) | Notes |
|---|---|---|---|---|---|
| Pilot (small) | Map Tiles 2D: 50k calls → $0 (within 100k free) | Radar: 20k req → $0 (within free) | Geocoding: 5k calls → $0 (within 10k free); Places: 2k calls | Starter: $98 (1,000 MAU) | Keep loads low; optimize caching; minimal Dynamic Maps |
| Growth (mid) | Map Tiles 2D: 300k calls → $120 (first 100k free; 200k @ $0.60/1k) | Radar: 500k req → $200 (after free tier) | Geocoding: 50k calls → $200 (10k free; 40k @ $5/1k); Places Autocomplete: 30k → ~$57 (10k free) | Pro/Pro-custom (e.g., 10k MAU → ~$500) | Watch tile and geocoding usage; caching critical |
| National (large) | Map Tiles 2D: 2M calls → ~$840 (1.9M billable after 100k free) | Radar: 2M req → ~$950 (after free tier) | Geocoding: 200k calls → ~$950 (10k free; 190k @ $5/1k); Places Pro: 100k → ~$2,880 (5k free) | Pro-custom (e.g., 50k MAU → ~$1,900) | Quotas & alerts mandatory; consider Radar discounts |

Guardrails:
- Prefer Map Tiles 2D for tile-heavy workloads; Dynamic Maps only where interactivity requires it.
- Cache geocoding and place details; avoid redundant calls during event creation and attendance flows.
- Monitor Radar usage and thresholds; leverage volume discounts and remote configuration.
- Set budget alerts per SKU; implement circuit breakers to degrade gracefully (e.g., static maps fallback).
- Track PubNub MAU growth and right-size plans; Functions can replace custom infrastructure for geo-triggering.[^2][^10][^11][^26][^27]

## Integration Architecture and Reference Flows

An end-to-end flow that aligns to SwaedUAE’s PRD looks like this:

1. Event creation: Organization admins define event metadata and geofence parameters (center, radius, accuracy thresholds). The backend stores a signed token template for attendance payloads.
2. QR generation: Server-side, the backend generates QR images (PNG/SVG) using “qrcode” for check-in and check-out codes, encoding signed tokens (eventId, sessionId, volunteerId optional at pre-issue, timestamp, nonce).
3. Volunteer check-in: The volunteer arrives within the geofence, opens the PWA/mobile app, grants location consent, and scans the QR code. The client uses jsQR (web) or Vision Camera (mobile) to decode the payload.
4. Geofence validation: The backend evaluates the latest GPS fix against the event geofence (Radar or custom). It computes distance, checks accuracy, applies heuristics (speed/heading), and returns a decision (INSIDE_FENCE, OUTSIDE_FENCE, ACCURACY_LOW).
5. Attendance persistence: If valid, the backend records attendance with timestamp and metadata. The dashboard receives a real-time update via PubNub (or SSE).
6. Check-out and hour calculation: At end, the volunteer scans the check-out QR; the backend validates again, calculates hours, and finalizes the attendance record.
7. Certificate issuance: If minimum hours are met, a certificate PDF is generated with embedded QR for public verification.
8. Offline and retries: The app queues scans and GPS fixes when offline, synchronizes when connectivity returns, and resolves conflicts server-side (e.g., time windows, duplicate scans).

Security controls:
- Signed tokens: Prevent replay and forgery; bind tokens to event/session.
- Rate limiting: Per-user and per-endpoint rate limits (as per PRD).
- Device integrity checks: Detect emulators and rooted/jailbroken devices; combine with network heuristics.
- Audit logging: Record all attendance-related events, geofence decisions, and overrides for compliance.

This architecture balances usability, security, and cost, and maps cleanly to the PRD’s endpoints and functional requirements.[^16][^22][^21][^10][^27][^29]

## Risks and Mitigations

- GPS spoofing and emulator-based fraud:
  - Mitigation: Device integrity checks, secure API integration, motion coherence heuristics, and vendor anti-spoofing tools (Build38, Approov, Incognia).[^31][^32][^33]
- API cost shocks:
  - Mitigation: Quotas, budget alerts, per-SKU monitoring, and graceful degradation (fallback to Map Tiles 2D; static maps when dynamic layers not essential). Use caching for geocoding and place details.[^2][^26]
- Browser permission friction:
  - Mitigation: Clear onboarding explaining benefits and consent, fallback to Google Geolocation API when needed, and accessible UI for retries.[^24][^6]
- Regional constraints (e.g., China):
  - Mitigation: Localized alternatives and fallbacks (e.g., Baidu, Autonavi, Tencent) where permissible and compliant; document regional behavior in the product.[^24]
- Real-time infrastructure scaling:
  - Mitigation: Use PubNub for managed scaling and Functions-based triggers; SSE for simple uni-directional updates; instrument MAU growth and cost.[^27][^34][^35]

## Recommendations and Next Steps

Prioritized stack:
- QR generation: “qrcode” (server) + qrcode.react / @devmehq/react-qr-code (client).
- QR scanning: React Native Vision Camera (mobile), jsQR + getUserMedia (web).
- Mapping: Leaflet + MapTiler as baseline; selectively use Google Map Tiles API for vector/3D features; cache geocoding.
- Geofencing: Adopt Radar for advanced triggers and scale; implement custom circular geofencer for MVP/pilot events.
- Real-time: PubNub for dashboards and live attendance; SSE as fallback for web-only updates.
- Privacy/security: Embed PDPL-compliant consent, minimization, retention (30 days), encryption, audit logging; establish breach notification runbook and appoint DPO.

Proof-of-concept (2–3 weeks):
- A pilot event flow: QR generation (server), scanning (web + mobile), geofence validation (Radar + custom), and PubNub updates to a dashboard. Instrument quotas and costs end-to-end.

Productionization:
- Harden anti-spoofing: emulator detection, secure API integration, motion heuristics.
- Set PDPL policies: bilingual consent, retention schedules, DPO workflows.
- Cost guardrails: per-SKU alerts, caching strategies, and MapTiler integration for map/Geocoding savings.
- Monitoring: usage dashboards (Maps, Radar, PubNub), error tracking (Sentry), and audit logs.

Vendor management:
- Configure billing accounts, quotas, and alerts.
- Document volume discount thresholds.
- Maintain an architecture decision record (ADR) to revisit stack choices at scale.

These steps align the platform with SwaedUAE’s PRD requirements while controlling costs, improving reliability, and meeting PDPL obligations.[^16][^22][^21][^25][^10][^27][^29]

## Information Gaps

Two areas require direct vendor confirmation or deeper technical testing:
- Mapbox Geofencing API pricing and full feature details: public blog posts confirm capability, but pricing specifics are not captured here and should be validated with Mapbox directly.[^11]
- Radar’s detailed official pricing breakdown across all location/maps APIs: while the blog and docs describe a free tier and $0.50 per 1,000 calls, confirm current pricing and volume discounts with Radar sales.[^10][^12]

Additionally, Safari/iOS background location behavior and power optimization patterns for continuous tracking should be tested in a PWA/React Native proof-of-concept, as platform policies evolve.

## References

[^1]: Platform Pricing & API Costs | Google Maps Platform. https://mapsplatform.google.com/pricing/
[^2]: Google Maps Platform core services pricing list. https://developers.google.com/maps/billing-and-pricing/pricing
[^3]: Maps JavaScript API Usage and Billing. https://developers.google.com/maps/documentation/javascript/usage-and-billing
[^4]: Google Maps Platform SKU Details. https://developers.google.com/maps/billing-and-pricing/sku-details?hl=en
[^5]: Active services with legacy status | Google Maps Platform. https://developers.google.com/maps/legacy?hl=en#active_services_with_legacy_status
[^6]: Geolocation API overview. https://developers.google.com/maps/documentation/geolocation/overview
[^7]: The true cost of the Google Maps API and how Radar compares. https://radar.com/blog/google-maps-api-cost
[^8]: Mapbox vs. Google Maps API: 2025 comparison (and better options). https://radar.com/blog/mapbox-vs-google-maps-api
[^9]: 12 best Mapbox alternatives heading into 2026. https://radar.com/blog/mapbox-alternatives-competitors
[^10]: Radar Docs: Home. https://docs.radar.com/home
[^11]: Mapbox launches new Geofencing API. https://www.mapbox.com/blog/mapbox-geofencing-drives-operational-efficiency-and-revenue-growth
[^12]: Radar API Reference. https://docs.radar.com/api
[^13]: Radar Maps: Autocomplete. https://docs.radar.com/maps/autocomplete
[^14]: Radar Maps: Geocoding APIs. https://docs.radar.com/maps/geocoding
[^15]: Radar Maps: Routing APIs. https://docs.radar.com/maps/routing
[^16]: qrcode - NPM. https://www.npmjs.com/package/qrcode
[^17]: soldair/node-qrcode - GitHub. https://github.com/soldair/node-qrcode
[^18]: qrcode.react - GitHub. https://github.com/zpao/qrcode.react
[^19]: @devmehq/react-qr-code - NPM. https://www.npmjs.com/package/@devmehq/react-qr-code
[^20]: react-qr-code - Yarn Classic. https://classic.yarnpkg.com/en/package/react-qr-code
[^21]: React Native Vision Camera - Official Site. https://react-native-vision-camera.com
[^22]: cozmo/jsQR - GitHub. https://github.com/cozmo/jsQR
[^23]: react-native-qrcode-scanner - NPM. https://www.npmjs.com/package/react-native-qrcode-scanner
[^24]: MDN Web Docs: Geolocation API. https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
[^25]: Leaflet - a JavaScript library for interactive maps. https://leafletjs.com/
[^26]: MapTiler - Mapbox alternative for developers. https://www.maptiler.com/mapbox-alternative/
[^27]: PubNub Pricing. https://www.pubnub.com/pricing/
[^28]: Real-time Geolocation API JavaScript with Modern Maps - PubNub. https://www.pubnub.com/blog/realtime-geolocation-api-javascript-with-modern-maps/
[^29]: Data protection laws in UAE - DLA Piper. https://www.dlapiperdataprotection.com/countries/uae-general/law.html
[^30]: Data protection laws | The Official Portal of the UAE Government. https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws
[^31]: GPS Spoofing, how it works and how Build38 protects against it. https://build38.com/blog/threats-mobile-app-device/gps-spoofing/
[^32]: Stop Geo-Spoofing with Secure API Integration for Mobile Application - Approov. https://approov.io/blog/stop-geo-spoofing-with-secure-api-integration-for-mobile-application
[^33]: Incognia | The Next Generation of Identity. https://www.incognia.com/
[^34]: WebSockets vs Server-Sent Events: Key differences - Ably. https://ably.com/blog/websockets-vs-sse
[^35]: Server-Sent Events: A WebSockets alternative ready for another look - Ably Topic. https://ably.com/topic/server-sent-events