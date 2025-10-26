# Payment Processing Solutions for SwaedUAE (UAE): Pricing, Features, and Compliance Blueprint

## Executive Summary and Objectives

SwaedUAE is preparing to monetize two high‑priority features—paid certificates and donations—while maintaining a free, compliant core volunteering experience. This report provides an actionable blueprint for payment processing in the United Arab Emirates (UAE), tailored to the platform’s PRD: how to price and implement certificate payments, how to enable donations lawfully, which gateways to prioritize, and the compliance obligations that govern each choice. The scope is limited to the UAE and adjacent GCC needs; it is designed for cross‑functional use by product, engineering, finance, legal/compliance, and executive stakeholders.

The volunteer economy in the UAE is increasingly cashless, mobile‑first, and security‑sensitive. Acceptance must reflect local card and wallet habits, comply with regulations, and be easy for volunteers and organizations to use. In particular, SwaedUAE must:

- Monetize certificates through one‑time purchases and recurring upgrades, delivered via Stripe Billing and Invoicing with robust receipts, refunds, and reporting.
- Enable donations in compliance with Federal Law No. (3) of 2021, restricting public fundraising to licensed charitable organizations and government/public interest institutions; position SwaedUAE as a “marketplace facilitator” that routes funds to authorized entities rather than accepting public donations in its own merchant account.
- Implement secure, localized checkout—cards, Apple Pay/Google Pay, and UAE direct debit (UAEDDS) where supported—with fraud prevention (3D Secure, device signals, risk rules) and clear refund/chargeback handling.

Key recommendations at a glance:

- Adopt Stripe as the primary processor for certificate payments and platform billing (Billing, Invoicing, Tax, Sigma, Data Pipeline), with a fallback acquirer for resilience (Telr and/or PayTabs). Stripe supports broad payment methods and UAE‑relevant capabilities; Telr and PayTabs offer competitive local plans with regional support and BNPL options (Telr: Tabby; PayTabs: STCPay), useful as diversification and for wallet coverage.[^1][^2][^7][^8][^9]
- Do not accept public donations directly. Instead, integrate payment links/checkout that route to licensed charities’ merchant accounts, or use authorized platforms (e.g., Jood) where available. This aligns with Federal Law No. (3) of 2021, the official government guidance, and related restrictions on online and mosque fundraising.[^11][^12][^21][^13]
- Set a baseline pricing strategy of AED 25–35 for certificates with a free basic certificate, optional premium verification or faster issuance as paid add‑ons, and organization‑level subscriptions for advanced admin features and analytics. Use Stripe Billing for subscriptions, Invoicing for certificates sold à la carte, and Tax + Sigma for reporting.[^1][^3]
- Enforce regulatory compliance: PCI DSS scope reduction via hosted fields/links, UAE data protection and SVF rules for stored value/e‑money (as applicable), VAT at 5% on fees, DFSA AML/CTF expectations for platforms, and 3D Secure as a default for card transactions.[^2][^4][^5][^6][^18]

Information gaps remain around Network International’s public ecommerce pricing, PayPal’s UAE‑specific fee schedule and settlement details, BNPL acceptance specifics by gateway, and some wallet availability (Etisalat Wallet, Beam) and UAEDDS coverage. The implementation plan flags these for vendor confirmation prior to launch.

## UAE Payments Landscape: What Users Expect and What the Law Requires

UAE customers expect a mobile‑optimized checkout that favors contactless cards and wallets, alongside bank transfers and, in limited cases, cash on delivery (COD). Contactless payments have become the norm for in‑person transactions; wallets like Apple Pay and Google Pay are widely used, and local/regional wallets round out preference segments. Stripe’s UAE guidance underscores the importance of 3D Secure (3DS), device‑based fraud detection, identity verification, and multilingual (Arabic/English) experiences. It also notes the acceptance of bank transfers and the UAE Direct Debit System (UAEDDS) as locally relevant methods, while emphasizing regulatory nuance by emirate and free zone.[^2]

To ground the product decisions in market realities, the following data points summarize UAE consumer payment preferences and their implications for SwaedUAE.

To illustrate acceptance priorities, Table 1 consolidates representative UAE payment mix indicators from the Stripe resource.

Table 1: UAE payment mix indicators and implications for acceptance

| Indicator | Value (Year) | Implication for SwaedUAE |
|---|---:|---|
| Retail market value | > AED 306B (2022) | Payments must scale reliably with strong uptime and authorization optimization. |
| POS transactions: Cash | ~38% (2022) | Support in‑person alternatives (e.g., event fee collection via Terminal/links), though volunteering is mostly free. |
| POS transactions: Credit cards (value) | ~40% (2022) | Cards remain central; ensure 3DS and wallet coverage for conversion. |
| E‑commerce: Credit cards (value) | ~41% (2022) | Card‑first checkout with saved cards and auto‑updates. |
| In‑person contactless share | ~84% (2021) | If charging at events, prioritize contactless and tokenized wallets. |
| E‑commerce wallets (value) | ~24% (2022) | Apple Pay/Google Pay and local wallets are must‑haves. |
| POS wallets (value) | ~16% (2022) | Wallets for on‑site payments and PWA flows. |
| Crypto ownership | >30% residents (2023) | Emerging interest; not core to volunteering/donations now but monitor policy changes. |
| VAT rate | 5% | VAT applies to fees; tax handling needed. |

These indicators inform a mobile‑first, card‑plus‑wallet checkout with 3DS, complemented by bank transfer for larger certificate fees or organization subscriptions. While COD remains familiar in retail, it is not well suited to digital certificates or donations; bank transfer and wallets are more appropriate for remote contributions. Stripe’s 3DS and device‑fingerprinting features should be enabled by default to reduce fraud and liability shift.[^2]

The legal environment is equally central. Federal Law No. (3) of 2021 strictly regulates fundraising: only licensed charities and government/public interest institutions may collect donations. Natural persons are prohibited from organizing or hosting fundraising activities, including online. Restrictions also apply to mosque collections and to online calls for donations without proper licensing. The Ministry of Community Empowerment (MoCE) provides permit processes for eligible entities. For SwaedUAE, the compliance‑first path is to facilitate payments on behalf of authorized organizations (via their merchant accounts or payment links), not to accept public donations under SwaedUAE’s own merchant ID.[^11][^12][^21][^13]

In addition, UAE data protection and the Central Bank’s Stored Value Facilities (SVF) regime impose obligations around data residency, consent, and risk controls for e‑money and stored value. Where SwaedUAE uses hosted payment elements, PCI DSS scope is minimized; however, AML/CTF expectations (e.g., in DIFC) require transaction monitoring and sanctions screening for platforms facilitating value flows. A concise legal crosswalk appears in Table 2.[^4][^5][^6]

Table 2: Legal obligations crosswalk for payments and donations in the UAE

| Obligation | Scope | Relevance to SwaedUAE |
|---|---|---|
| Federal Law No. (3) of 2021 (Donations) | Public fundraising and donations | Public donations must be routed to licensed entities; SwaedUAE should not accept donations directly. |
| MoCE permits | Fundraising approvals | For organizations onboarded, confirm permit status; document approvals. |
| Data protection (UAE) | Personal data processing | Use hosted fields/links, minimize data storage, enable Arabic/English notices and consent. |
| SVF regulation | Stored value/e‑money | If wallet/stored value features are added, assess SVF licensing/data residency; leverage acquirers’ wallets where possible. |
| PCI DSS | Cardholder data security | Prefer hosted components; never store PAN; maintain vendor PCI attestations. |
| AML/CTF (DFSA guidance) | Financial crime controls | Implement platform‑level KYC/EDD where required, sanctions screening, and monitoring. |
| VAT | 5% on fees | Price inclusive/exclusive policies; automate tax calculations via Stripe Tax. |

Implication: The acceptance strategy must be compliant by design—default 3DS, clear consent and privacy notices, and a donations flow restricted to licensed entities. This approach aligns with consumer preferences while avoiding regulatory risk.

## Gateway Options for UAE: Evaluation and Shortlist

SwaedUAE’s needs span one‑time certificate fees, optional subscriptions, invoices, and donation facilitation. The gateway shortlist emphasizes developer productivity, wallet support, and compliance fit:

- Stripe: developer‑friendly APIs; global methods; Billing, Tax, Sigma; Connect for platforms/marketplaces; 3DS and risk controls; broad wallet support; terminal for in‑person.
- Telr: competitive UAE plans; payment links; invoices; Apple Pay; BNPL via Tabby; localized onboarding.[^7]
- PayTabs: AED/AED pricing; regional cards and wallets; subscription billing; fraud prevention; setup speed emphasized for SMEs.[^8]
- Amazon Payment Services (APS, formerly PayFort): enterprise‑grade reliability; localized methods; installment support; ML fraud tools.[^9]
- Network International: leading regional acquirer; strong bank integrations and compliance; public ecommerce merchant pricing requires engagement; offers digital payment solutions with zero foreign currency transaction fees in specific contexts (e.g., travel), which may inform negotiation.[^10]
- Checkout.com: enterprise‑level acquiring with global reach and sophisticated fraud management; useful as a secondary acquirer for global coverage.[^9]

Evaluation dimensions include pricing, free‑tier/plan structure, supported payment methods, 3DS/fraud tooling, settlement currencies and timelines, developer ergonomics, and compliance posture. To frame the trade‑offs, Table 3 offers a high‑level comparison focused on UAE readiness.

Table 3: Gateway comparison matrix (UAE)

| Gateway | UAE support | Pricing model | Payment methods (UAE‑relevant) | Fraud tooling | Invoicing/Billing | Notable strengths |
|---|---|---|---|---|---|---|
| Stripe | Yes | Pay‑as‑you‑go + products | Cards, Apple Pay/Google Pay, bank transfers, UAEDDS (where available) | 3DS, ML risk, rules | Billing, Invoicing, Tax, Sigma | Developer experience, global methods, platform tools[^1][^2] |
| Telr | UAE plans | Monthly plans + transaction fees | Cards, Apple Pay, Tabby (BNPL), payment links | Risk monitoring | Invoices, links | Localized onboarding, transparent tiering[^7] |
| PayTabs | UAE/GCC | Plan‑based | Cards, mada, STCPay | ML fraud | Subscriptions, invoices | Fast setup, regional method support[^8] |
| APS | MENA | Custom/plan | Cards, local methods, installments | ML fraud | Tokenization, installments | Enterprise reliability and localization[^9] |
| Network International | UAE/GCC | Custom | Cards; broad acquiring | 3DS | Enterprise acquiring | Strong compliance and bank relationships; zero FX in some solutions[^10] |
| Checkout.com | UAE/global | Custom | Global methods; wallets | Enterprise fraud | Custom flows | High‑volume scaling, global reach[^9] |

Stripe is recommended as primary for SwaedUAE certificates and platform billing, with Telr or PayTabs as secondary for diversification and regional wallet coverage. Network International or APS can be pursued as a third option for enterprise scale or POS integrations. Given missing public merchant pricing for Network International and APS, final selection should be contingent on commercial quotes and the legal structure of SwaedUAE’s entity and bank accounts.[^10][^9]

## Stripe in the UAE: Pricing, Features, and Constraints

Stripe offers transparent UAE pricing and a rich product suite relevant to SwaedUAE’s needs. The platform’s core products include Payments, Payment Links, Checkout, Elements, Terminal, Radar (fraud), Billing (subscriptions), Invoicing, Tax, Sigma (custom reporting), Data Pipeline, Revenue Recognition, Identity, and Connect for platforms/marketplaces.[^1][^3]

Table 4 breaks down the principal Stripe fees relevant to UAE deployments.

Table 4: Stripe UAE fee breakdown (selected items)

| Item | Fee (AED unless noted) | Notes |
|---|---:|---|
| Domestic card processing | 2.9% + 1.00 | Per successful transaction |
| International card surcharge | +1.0% | Added to domestic fee |
| Currency conversion | +1.0% | If conversion required |
| Instant Payouts | 1.5% | Min 2.00 AED |
| Dispute fee | 60.00 | Per dispute; evidence submission fee 60.00 (refunded if won) |
| Smart Disputes | 30% of disputed amount | Only if the dispute is won |
| Payment Links custom domain | $10/month | USD |
| Post‑payment invoices | 0.4% | Cap $2 per invoice (USD) |
| Radar for Fraud Teams | 0.20 | Per screened transaction (std) |
| Authorization Boost (custom) | 0.2% | Per successful online card transaction |
| 3D Secure (custom) | 0.03 | Per attempt (custom) |
| Billing subscription mgmt (pay‑as‑you‑go) | 0.7% | Of Billing volume |
| Billing (pay monthly plan) | From 2,200/month | 1‑year contract |
| Invoicing Starter | 0.4% | Per paid invoice |
| Tax (Basic no‑code) | 0.5% | Per transaction |
| Tax (Basic API) | 2.00 | Per transaction; 0.20 per calc API >10 |
| Tax (Complete) | From 330/month | 1‑year contract |
| Sigma | 55/month | Annual from 37/month |
| Data Pipeline | 239/month | Annual from 184/month |
| Revenue Recognition | 90/month | Annual from 700/month |
| Atlas (incorporation) | $500 one‑time | USD[^1] |

Stripe supports a broad range of payment methods and features in the UAE, including cards, digital wallets (Apple Pay/Google Pay), bank transfers, and local methods such as UAEDDS. Fraud prevention and compliance tooling—3D Secure, device fingerprinting, risk rules, and Identity—are readily available. Platform/marketplace flows can be supported via Connect, though platform pricing and compliance responsibilities differ from standard acceptance.[^2][^1][^3]

Constraints and considerations:

- Payment Links and hosted Checkouts reduce PCI DSS exposure but still require careful handling of webhooks, idempotency, and error management in the application.
- Settlement timelines and reconciliation: Stripe supports flexible payouts; operations should configure settlement currency, payout cadence, and reconciliation via Stripe’s dashboards and data exports (Sigma/Data Pipeline).
- Global taxation of Stripe fees:，某些情况下Stripe费用可能产生税费（如增值税），需在财务模型中反映。[^19]

Practical implication: Stripe’s transparent fees and breadth of tooling make it the right anchor for certificates and platform billing, provided that SwaedUAE designs webhooks and refunds in line with Stripe’s event model and sets up tax reporting from day one.

## PayPal and Regional Alternatives: What Fits SwaedUAE

PayPal is widely recognized but generally lacks support for local GCC methods (e.g., mada/KNET) and often carries higher effective fees than regional gateways. For SwaedUAE, PayPal can be offered as an optional alternative for international supporters who already use PayPal, but should not be the primary path for UAE‑resident volunteers or organizations due to wallet coverage gaps and fees.[^9]

Strong regional alternatives include:

- Telr: UAE tiered plans, payment links, Apple Pay, BNPL via Tabby, localized support; transparent tiered pricing supports SMEs.[^7]
- PayTabs: AED/AED pricing, supports mada and STCPay, emphasizes fast setup and fraud prevention for SMEs and subscription businesses.[^8]
- Amazon Payment Services (APS): enterprise‑grade reliability, local payment methods, installments, and machine‑learning fraud tools; suitable for larger volumes and marketplaces.[^9]
- Network International: as a leading acquirer, well‑suited to enterprise‑scale acceptance and POS integrations; public ecommerce pricing is typically custom and requires direct engagement.[^10]
- Checkout.com: global reach and sophisticated chargeback/fraud tooling; suitable as a secondary acquirer for high‑volume international coverage.[^9]

To illustrate fit, Table 5 compares these gateways against SwaedUAE’s needs.

Table 5: Alternatives comparison relevant to SwaedUAE

| Gateway | Core strengths | Payment methods (UAE‑relevant) | Fit for certificates | Fit for donations | Pricing notes |
|---|---|---|---|---|---|
| Telr | Local plans, links, Apple Pay, Tabby | Cards, Apple Pay, BNPL (Tabby), links | Strong for one‑time certificate fees | Good for links routed to licensed charities | Tiered monthly + txn fees[^7] |
| PayTabs | SME focus, fast setup, ML fraud | Cards, mada, STCPay | Good for subscriptions and one‑time fees | Useful for wallet coverage | Plan‑based; AED/AED[^8] |
| APS | Enterprise reliability, installments | Cards, local methods | Strong for org subscriptions and scale | Potential for enterprise donation flows | Custom/plan; localized[^9] |
| Network International | Enterprise acquiring, compliance | Cards; broad acquiring | Strong for large‑scale issuance | Suitable for bank‑集成 donation programs | Custom pricing; consult sales[^10] |
| Checkout.com | Global methods, enterprise fraud | Cards, wallets | Strong for international coverage | Potential cross‑border donations | Custom; consult sales[^9] |
| PayPal | Global recognition | PayPal wallet/cards | Optional alternative | Limited for GCC methods; higher fees | Higher merchant rates; optional[^9] |

Recommendation: Offer Stripe (primary), Telr (secondary), and PayTabs (tertiary) as acceptance options. Reserve APS/Network International/Checkout.com for enterprise integrations or large‑scale volume negotiations, especially if the platform expands into physical events requiring POS.

## UAE-Specific Gateways: Network International, Telr, PayTabs, Amazon Payment Services

UAE gateways combine local acquiring relationships, compliance familiarity, and Arabic/English support. Network International, as a leading regional acquirer, offers robust digital payment solutions and emphasizes cost control such as zero foreign currency transaction fees in specific solutions (e.g., travel), signaling room for negotiation on international fees. Their enterprise orientation can be valuable if SwaedUAE anticipates high‑volume issuance or physical event charging in the future.[^10]

Telr’s UAE pricing is public and straightforward, with payment links and invoices included across plans and BNPL via Tabby. This makes Telr well‑suited as a backup acquirer for certificates and a facilitator for donations via branded links routed to licensed charities. Table 6 outlines Telr’s UAE plans.[^7]

Table 6: Telr UAE pricing plans (AED)

| Plan | Monthly volume | Monthly fee | Transaction fee |
|---|---|---:|---|
| Entry | 0 – 20,000 | 349 | 0% + 0 AED |
| Small | 20,001 – 50,000 | 149 | 2.69% + 1.00 AED |
| Medium | 50,000+ | 99 | 2.49% + 0.50 AED |

PayTabs emphasizes regional coverage and fast setup, offering plans that support both AED and SAR. Features include subscription billing, fraud prevention, and support for STCPay alongside cards—useful for mobile‑first cohorts in the UAE. Their pricing is plan‑based and often includes setup fees for certain tiers; SMEs can start quickly and scale as needed.[^8]

Amazon Payment Services (APS) provides localized methods, installments, and ML‑based fraud detection. APS can be valuable for enterprise deployments and BNPL integrations. Pricing tends to be custom/plan‑based, especially for higher volumes; it fits organizations that prioritize reliability and established regional presence.[^9]

Recommendation: Start with Stripe for certificates and add Telr and/or PayTabs for regional diversification and BNPL coverage. Explore APS or Network International for enterprise contracts if volumes justify. Keep the integration architecture modular to support multi‑acquirer routing and fallback.

## Free Tiers, Plan Structures, and Transaction Fees: Comparative Analysis

Most UAE gateways do not offer true free tiers; instead, they use monthly plan fees plus transaction fees. Stripe’s base model is pay‑as‑you‑go with no setup or monthly fees for standard processing; charges accrue for specific products (e.g., Billing, Tax, Sigma) and certain features (e.g., Instant Payouts). Telr’s plans include monthly fees and transaction fees, with volume discounts available for large merchants. PayTabs uses plan tiers with setup fees for some plans and emphasizes quick onboarding. APS typically offers plan/custom pricing.[^1][^7][^8][^9]

Table 7 compares free‑tier and plan structures across selected gateways.

Table 7: Free‑tier/plan structure comparison

| Gateway | Setup fees | Monthly fees | Transaction fees | Volume discounts |
|---|---|---|---|---|
| Stripe | None (std processing) | None (std processing) | 2.9% + 1.00 AED; +1% intl; +1% FX | Custom pricing for large volumes[^1] |
| Telr (UAE) | None | Entry: 349; Small: 149; Medium: 99 | 0% (Entry); 2.69% + 1 (Small); 2.49% + 0.50 (Medium) | Yes, consult for > AED 500k/month[^7] |
| PayTabs | Setup for some plans | Varies by plan | Plan‑based; AED/AED | Yes, for high volumes[^8] |
| APS | Typically none | Varies | Plan/custom; localized | Yes, custom packages[^9] |

Hidden costs to anticipate: disputes (AED 60 per dispute on Stripe), Instant Payouts (1.5% on Stripe), refunds (no fee on Stripe but processing/connect/FX fees are not returned), and product subscriptions (Billing, Tax, Sigma). With Telr and PayTabs, assess settlement timelines, chargeback handling, and any bank setup or maintenance costs.[^1][^7][^8]

For SwaedUAE, Stripe’s pay‑as‑you‑go model suits MVP launch; adding Telr/PayTabs incurs monthly plan costs but brings diversification and regional wallets.

## Certificate Paid Features (付费): Pricing and Implementation

SwaedUAE’s PRD outlines free basic certificates with optional paid features—premium verification (e.g., tamper‑evident seals or blockchain verification), faster issuance, advanced branding, and organization subscriptions for administrative analytics and bulk issuance. Monetization should combine one‑time fees and recurring upgrades.

Pricing strategy: Position the free certificate as a baseline value‑add for volunteers (PDF with QR verification). Introduce paid features at AED 25–35 for premium verification or expedited processing, with bundles for organizations. Use tiered organization subscriptions for advanced analytics, API access, and bulk issuance—e.g., Basic (AED 200–300/month), Pro (AED 600–800/month), Enterprise (custom). Validate through A/B tests during onboarding and event completion flows.

Implementation: Use Stripe Payment Links for one‑time certificate purchases and Stripe Checkout for embedded flows where receipts and customer portal access are desired. For subscriptions (organization plans and volunteer premium verification tiers), use Stripe Billing with hosted customer portal for self‑serve upgrades/downgrades and invoices. For enterprise clients, Stripe Invoicing supports large, one‑time certificate batches with line‑item detail and tax. Enable Stripe Tax for automated VAT calculation and reporting, and Stripe Sigma for transaction‑level analysis and cohort metrics.[^1][^3][^18]

Certificates should be generated post‑payment, triggered by webhooks: payment_intent.succeeded → certificate issuance job (PDF generation, QR embedding, unique ID) → notification to volunteer/organization. Failed payments should trigger clear retry flows (Link by Stripe or wallet pay). Refunds policy: partial refunds for expedited services not delivered; full refunds if certificate issuance fails or is revoked due to verified non‑completion.

Table 8 maps PRD certificate features to Stripe components.

Table 8: PRD features → Stripe components mapping

| Feature | Stripe product/component | Notes |
|---|---|---|
| One‑time certificate purchase | Payment Links / Checkout | Hosted checkout, links via email/SMS; reduce PCI scope |
| Premium verification add‑on | Billing (subscription) | Tiered plan; hosted customer portal for self‑serve |
| Organization subscriptions | Billing + Invoicing | Recurring admin features; invoices for enterprise |
| Tax automation (VAT) | Stripe Tax | 5% VAT; per‑transaction tax handling[^18] |
| Reporting and analytics | Stripe Sigma + Data Pipeline | Cohort analysis; export to DWH |
| Fraud prevention | Radar + 3DS | ML‑driven risk; default 3D Secure[^2] |
| Certificates post‑payment | Webhooks +issuance job | payment_intent.succeeded triggers PDF generation |

This architecture minimizes PCI exposure and operational complexity while enabling robust reporting and tax compliance. It also keeps room for add‑ons such as identity verification (Stripe Identity) or platform‑level compliance tooling where needed.

## Donation and Fund Collection Capabilities

Compliance‑first donations are non‑negotiable in the UAE. Under Federal Law No. (3) of 2021, only licensed charitable organizations and government/public interest institutions may collect donations. Natural persons are prohibited from organizing or carrying out fundraising activities. Restrictions also cover online calls for donations and collections at mosques without permission. MoCE issues fundraising permits for eligible entities. For SwaedUAE, the recommended approach is to act as a “marketplace facilitator” that routes payments to licensed entities rather than accepting donations into SwaedUAE’s merchant accounts.[^11][^12][^21][^13]

Implementation options:

1. Payment links/checkout that hand off to the charity’s merchant account: SwaedUAE displays donation buttons and generates a checkout session or payment link tied to the charity’s account. Funds settle to the charity; SwaedUAE does not handle donation float.
2. Authorized platforms (e.g., Jood, Dubai’s community contributions platform): where available, redirect donors to the official platform to complete contributions. Jood supports electronic payment and bank transfer and targets beneficiaries such as low‑income citizens, people of determination, seniors, minors, and orphans.[^11]
3. Organization‑controlled merchant accounts: verified organizations with licenses can collect donations directly; SwaedUAE supports tracking, receipts, and reporting for transparency without controlling funds.

Prohibited flows: SwaedUAE should not process public donations under its own merchant account or promote unlicensed online fundraising. Avoid any collection at mosques or social media calls for donations without proper permits; adhere to the cybercrimes law regarding online appeals.[^11][^13]

Table 9 summarizes donation compliance requirements.

Table 9: Donation compliance requirements (UAE)

| Requirement | Source | Implication |
|---|---|---|
| Licensing for fundraising | Federal Law No. (3) of 2021 | Only licensed charities/institutions may collect donations; natural persons prohibited. |
| Online fundraising restrictions | Federal DecreeLaw No. 34 (2021) and official guidance | Unauthorized online appeals for donations are illegal; enforce via platform controls. |
| Mosque collections prohibition | Mosque regulation (Federal Law No. 4 of 2018) | No collections at mosques without permission; no feature should imply otherwise. |
| Permit processes | MoCE FAQ and portal | Organizations must secure permits; SwaedUAE should document permit IDs for each campaign. |
| Authorized channels | Government guidance (u.ae) | Prefer established platforms (e.g., Jood) for Dubai; maintain transparency and audit trails. |

This structure preserves SwaedUAE’s compliance posture while enabling donors to contribute to legitimate causes. The platform should embed controls that prevent public fundraising by non‑licensed entities and record permit references for each donation campaign.

## Compliance and Risk Controls for UAE

Payments in the UAE carry specific compliance and risk obligations that SwaedUAE must embed from MVP to scale.

- PCI DSS: Minimize scope through hosted Checkout/Elements/Payment Links; never store primary account numbers (PAN); ensure TLS and secure webhooks; maintain vendor attestations and segment card data from application logs.
- SVF/e‑money: If SwaedUAE introduces stored value features (e.g., volunteer credits or prepaid certificates), assess SVF licensing and data residency requirements. Prefer acquirer‑issued wallets or tokenized methods to avoid SVF complexity.[^6]
- Data protection: Implement consent flows, clear notices in Arabic/English, and data minimization. Where SVF or e‑money rules apply, store data in the UAE as required. Conduct DPIAs (data protection impact assessments) for sensitive flows.[^4][^5]
- AML/CTF: Adopt DFSA guidance for platforms facilitating value flows—KYC for organizations, enhanced due diligence for high‑risk donations, sanctions screening, transaction monitoring, and record keeping. Define thresholds and escalation playbooks.[^2]
- VAT: UAE VAT is 5% on most goods and services. Stripe Tax can automate tax calculation and reporting; finance must align pricing and invoicing policies with VAT rules.[^18]
- 3D Secure: Default to 3DS for card transactions to reduce fraud and shift liability; combine with device signals and ML risk tools for adaptive authentication.[^2]

Table 10 consolidates a compliance checklist.

Table 10: Compliance checklist

| Domain | Requirement | MVP control | Owner |
|---|---|---|---|
| PCI DSS | Hosted checkout; no PAN storage | Checkout/Payment Links; secure webhooks | Eng/InfoSec |
| SVF | Stored value licensing (if applicable) | Avoid SVF; use acquirer wallets | Legal/Compliance |
| Data protection | Consent; localization where applicable | Arabic/English notices; data minimization; DPIA | Legal/Privacy |
| AML/CTF | KYC/EDD; sanctions; monitoring | Org verification; campaign permit checks; screening | Compliance/Operations |
| VAT | 5% tax handling | Stripe Tax; invoice templates | Finance |
| 3DS | Liability shift | Enable 3DS by default | Eng/Payments |

Embedding these controls from the outset reduces technical debt and audit risk while improving conversion through trusted authentication and transparent experiences.

## Integration Architecture and Operational Playbook

Technical integration should use a layered approach to minimize PCI scope, handle failures gracefully, and provide clear financial reporting.

- Integration modes: Use Stripe Checkout/Payment Links for one‑time certificate purchases and Stripe Billing for subscriptions. Telr’s hosted gateway and PayTabs’ hosted payment forms provide alternative acquirer routes; implement fallback routing if the primary gateway is down.
- Webhooks: Handle events (payment_intent.succeeded, charge.refunded, customer.subscription.updated) with retries and idempotency keys. Certificate issuance jobs should be triggered by succeeded events, with failure queues and alerts.
- Reconciliation: Use Stripe Sigma for transaction‑level exports, and Data Pipeline to sync to the data warehouse. Maintain ledger entries per order/certificate. For donations, store charity ID, permit reference, and campaign metadata for audit.
- Fraud and risk: Enable 3DS by default. Configure Radar rules and device signals. Monitor dispute rates and false positives; maintain evidence packages for representment when necessary.
- Support and refunds: Define SLAs for certificate issuance (e.g., 2 business days for standard, 24 hours for expedited). Refund policy should address non‑delivery and revocations. Record partial vs full refunds and communicate reasons to users.

Table 11 enumerates core events and handlers.

Table 11: Webhook/event mapping

| Event | Handler | Side effects |
|---|---|---|
| payment_intent.succeeded | Certificate issuance job | Generate PDF with QR; unique ID; notify user/org |
| charge.refunded | Refund handler | Revoke certificate (if applicable); notify; update ledger |
| customer.subscription.updated | Subscription handler | Upgrade/downgrade org features; adjust entitlements |
| customer.subscription.deleted | Subscription handler | Freeze advanced features; retain read‑only access |
| invoice.paid | Invoice handler | Record org subscription period; update analytics |

These patterns align with Stripe’s event model and support reliable certificate and subscription workflows.[^1]

## Phased Implementation Roadmap

A phased rollout balances speed to market with compliance rigor.

Phase 0 (Weeks 0–2): Vendor due diligence and compliance confirmation
- Obtain quotes from Telr, PayTabs, APS/Network International; confirm wallet coverage and BNPL integration specifics. Validate donation licensing approach with counsel; confirm whether SwaedUAE can act as a marketplace facilitator only.
- Confirm UAE coverage for Apple Pay/Google Pay via selected gateways, and UAEDDS support if needed.

Phase 1 (Weeks 3–6): MVP launch for certificate payments
- Implement Stripe Payment Links and Checkout for one‑time certificate purchases. Enable 3DS and basic Radar rules. Build certificate issuance pipeline and notification flows.
- Stand up tax calculation via Stripe Tax, and baseline reporting via Sigma/Data Pipeline. Launch premium verification as an add‑on with a hosted customer portal for self‑service.

Phase 2 (Weeks 7–10): Subscriptions and BNPL options
- Add Stripe Billing for organization subscriptions and volunteer premium tiers. Launch hosted customer portal. Integrate Telr for BNPL via Tabby as a secondary acceptance option.
- Introduce Invoicing for enterprise clients; implement advanced analytics and cohort reporting.

Phase 3 (Weeks 11–14): Donation flows and charity onboarding
- Build donation links and checkout that hand off to licensed charities. Where applicable, integrate with Jood or similar authorized platforms.
- Implement organization verification and permit checks for each campaign; store permit IDs and charity license references.

Phase 4 (Weeks 15–18): Hardening and reporting
- Conduct compliance review (PCI, data protection, AML/CTF). Optimize fraud rules; tune 3DS challenge flows. Finalize dashboards for finance and operations.

Table 12 summarizes milestones and dependencies.

Table 12: Milestone plan

| Phase | Milestone | Dependencies | Owner |
|---|---|---|---|
| 0 | Quotes; compliance posture | Vendor engagement; legal review | Product/Legal |
| 1 | MVP certificates live | Stripe keys; webhook infra; tax setup | Eng/Finance |
| 2 | Subscriptions; BNPL | Billing portal; Telr integration | Eng/Product |
| 3 | Donations via licensed entities | Charity onboarding; permit validation | Compliance/Product |
| 4 | Hardening; reporting | Fraud rules; dashboards; audit trail | Eng/Finance/Compliance |

## Appendices

Appendix A: Detailed fee matrices

Table 13: Stripe selected fees (UAE)

| Fee type | Amount | Notes |
|---|---:|---|
| Domestic card processing | 2.9% + 1.00 AED | Per successful transaction |
| International card surcharge | +1.0% | Added to domestic fee |
| Currency conversion | +1.0% | If required |
| Instant Payouts | 1.5% | Min 2.00 AED |
| Dispute fee | 60.00 AED | Evidence submission fee 60.00 AED; refunded if won |
| Smart Disputes | 30% of disputed amount | Charged only if won |
| Payment Links custom domain | $10/month | USD |
| Post‑payment invoices | 0.4% | Cap $2/invoice (USD) |
| Radar for Fraud Teams | 0.20 AED | Per screened transaction (std) |
| 3D Secure (custom) | 0.03 AED | Per attempt (custom) |
| Billing (pay‑as‑you‑go) | 0.7% | Of Billing volume |
| Billing (pay monthly plan) | From 2,200/month | 1‑year contract |
| Invoicing Starter | 0.4% | Per paid invoice |
| Tax (Basic no‑code) | 0.5% | Per transaction |
| Tax (Basic API) | 2.00 AED | Per transaction; 0.20 per calc API >10 |
| Tax (Complete) | From 330/month | 1‑year contract |
| Sigma | 55/month | Annual from 37/month |
| Data Pipeline | 239/month | Annual from 184/month |
| Revenue Recognition | 90/month | Annual from 700/month |
| Atlas | $500 one‑time | USD[^1] |

Table 14: Telr UAE (AED) plan summary

| Plan | Monthly volume | Monthly fee | Transaction fee |
|---|---|---:|---|
| Entry | 0 – 20,000 | 349 | 0% + 0 AED |
| Small | 20,001 – 50,000 | 149 | 2.69% + 1.00 AED |
| Medium | 50,000+ | 99 | 2.49% + 0.50 AED[^7] |

Appendix B: Gateway capability checklist

Table 15: Capability checklist

| Gateway | Payment Links | Invoicing | Subscriptions | 3DS | Wallets | Arabic support |
|---|---|---|---|---|---|---|
| Stripe | Yes | Yes | Yes (Billing) | Yes | Apple/Google Pay; local methods | Via product UIs; multilingual docs[^2] |
| Telr | Yes | Yes | Not primary | Yes | Apple Pay; BNPL (Tabby) | Local support and Arabic/English[^7] |
| PayTabs | Plugins/APIs | Yes | Yes | Yes | STCPay, mada | Regional support[^8] |
| APS | Yes | Yes | Tokenization | Yes | Local methods | Arabic/English[^9] |
| Network International | Enterprise | Enterprise | Enterprise | Yes | Cards | Compliance support[^10] |

Appendix C: Information gaps and vendor confirmation checklist

- Network International ecommerce merchant pricing: requires direct quote and bank setup details.[^10]
- PayPal UAE fees and settlement specifics: confirm market‑specific rates and wallet coverage.[^9]
- BNPL acceptance by gateway: confirm Tabby (Telr) and any BNPL with APS/PayTabs in UAE.
- Etisalat Wallet and Beam wallet coverage: verify availability via Stripe/APS/PayTabs for UAE.
- UAEDDS coverage for platforms: confirm whether Stripe or APS support direct debit for SwaedUAE’s use cases.[^2]
- Jood integration/API specifics: clarify whether third‑party platforms can programmatically route donations or must redirect donors.[^11]
- Cross‑border fees and settlement currencies for each gateway: obtain merchant‑specific quotes.
- PCI scope and data residency specifics: obtain vendor attestations (PCI, SVF) and data residency statements.[^6]

These items should be resolved prior to Phase 1 and 3 launches respectively.

## References

[^1]: Pricing & Fees – Stripe (UAE).  
https://stripe.com/ae/pricing

[^2]: How to accept payments in the United Arab Emirates – Stripe.  
https://stripe.com/resources/more/payments-in-the-united-arab-emirates

[^3]: Stripe Payments | Global Payment Processing Platform.  
https://stripe.com/payments

[^4]: UAE Data Protection Laws – The Official Portal of the UAE Government.  
https://u.ae/about-the-uae/digital-uae/data/data-protection-laws

[^5]: General Data Protection Regulation (GDPR.EU).  
https://gdpr.eu/

[^6]: Stored Value Facilities (SVF) Regulation – Central Bank of the UAE (AR/EN).  
https://www.centralbank.ae/media/pxzjtgdm/stored-value-facilities-svf-regulation-ar-en.pdf

[^7]: Telr Pricing | Payment Gateway.  
https://telr.com/pricing

[^8]: Payment Gateways for UAE Startups – PayTabs.  
https://paytabs.com/en/payment-gateways-for-uae-startups/

[^9]: 15 Best Payment Gateways for Mobile & Web Apps in 2025 – InfinMobile.  
https://infinmobile.com/15-best-payment-gateways-middle-east/

[^10]: Digital Business Payment Solutions – Network International.  
https://www.network.ae/en/processing-solutions/business-payments/digital-payment-solutions

[^11]: Ways of doing charity in the UAE – The Official Portal of the UAE Government.  
https://u.ae/en/information-and-services/charity-and-humanitarian-work/ways-of-doing-charity-in-the-uae

[^12]: Federal Law No. (3) of 2021 Regulating Donations (PDF).  
https://uaelegislation.gov.ae/en/legislations/1500/download

[^13]: Ministry of Community Empowerment – FAQ.  
https://www.moce.gov.ae/en/faq

[^14]: 13 Best Payment Gateways in the UAE in 2025 – ScaleupAlly.  
https://scaleupally.io/blog/payment-gateway-uae/

[^15]: 11 Best Online Payment Gateways in UAE 2025 – XStak.  
https://www.xstak.com/blog/payment-gateways-in-uae

[^16]: 15+ Best Payment Gateways in the UAE in 2025 – Global Media Insight.  
https://www.globalmediainsight.com/blog/payment-gateways-uae/

[^17]: FIS Global Payments Report – Mere tail News (2023).  
https://www.meretailnews.com/2023/04/18/fis-global-payments-report/

[^18]: PwC Tax Summaries: United Arab Emirates – Other taxes.  
https://taxsummaries.pwc.com/united-arab-emirates/corporate/other-taxes

[^19]: Global taxation of Stripe fees – Stripe Support.  
https://support.stripe.com/questions/global-taxation-of-stripe-fees

[^20]: Cabinet Resolution Concerning the Executive Regulations of the Volunteer Register – UAE Legislation.  
https://uaelegislation.gov.ae/en/legislations/1472

[^21]: Volunteering Policy (May 2025) – Department of Community Development (Abu Dhabi).  
https://www.volunteers.ae/content/pages/abudhabi/documents/DCD_Volunteering_Policy_May2025_ENG.pdf

---

### What Users Will Pay For (Certificates)

- Baseline: Free certificate issuance upon event completion and attendance verification.
- Paid add‑ons: premium verification (e.g., tamper‑evident or blockchain‑backed), expedited issuance (24 hours), advanced branding (organization logo, signatures), and portfolio highlights (badges, shareable assets).
- Pricing recommendation: AED 25–35 per certificate for premium add‑ons; organization subscriptions at AED 200–300 (Basic), AED 600–800 (Pro), Enterprise (custom). Validate via A/B testing and user feedback.

### Donation Flows

- For licensed charities and government/public interest institutions, implement handoff flows: SwaedUAE presents “Donate” buttons; the checkout session or payment link routes to the charity’s merchant account or authorized platform (e.g., Jood). SwaedUAE does not accept public donations into its own account.
- Ensure permit checks, campaign metadata capture (beneficiary, objective), and full audit trails for transparency.