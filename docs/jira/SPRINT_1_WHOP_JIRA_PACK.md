# MarkMosaiq: Plan-Selection Funnel v3 & Sprint 1 Jira Pack (Whop Edition)
**Date:** 17 October 2026  
**Payment Engine:** Whop Commerce (Merchant of Record & Subscription Engine)  
**Target:** Production-grade funnel from Landing/Pricing to Paid Workspace  

---

## Part A: Executive Review & Whop Architectural Decisions

### 1. Architectural Pivot: Whop Commerce as Single Source of Payment Truth
- **Merchant of Record (MoR)**: Whop handles global card acceptance (Visa, MC, Amex), Apple Pay, Google Pay, local sales taxes/VAT, chargebacks, and PCI-DSS Level 1 compliance.
- **Native Subscription & Recurring Billing**: Unlike local gateways, Whop natively supports recurring monthly/annual billing, card-on-file, proration, and customer portal (`membership.went_valid`, `membership.went_invalid`).
- **Cryptographic Webhook Verification**: Whop webhooks are cryptographically signed with HMAC-SHA256 (`WHOP_WEBHOOK_SECRET`). No raw unsigned notifications.
- **Pre-Payment Friction Cut (2-Step Signup)**: Landing/Pricing CTA preserves `pack`, `cycle`, and `currency` in a signed `mm_intent` cookie. Unauthenticated visitors complete a 2-step signup (Email + Password -> OTP), landing directly on Whop Checkout. Onboarding (Brand Kit, Store profile, Channels) happens post-payment.
- **Credit Ledger & Cumulative Balance**: 3 trial credits granted upon verified email. Whop plan purchase adds full pack credits ($3 + 30 = 33$ for Pro). Balance is dynamically computed from an append-only ledger (`credit_ledger`).

---

## Part B: Execution Contract for Coding Agents

1. **Branch & PR Hygiene**: 1 ticket = 1 branch (`mm-1xx-slug`) = 1 PR. Never start a ticket whose dependencies are not merged.
2. **Single Source of Truth**: Amounts, credits, and Whop plan IDs are resolved server-side from `src/config/packs.ts` and `src/lib/whop.ts`. Never trust client-sent amounts or credit values.
3. **Invariants**:
   - Zero open-redirects: all redirect parameters must pass `getSafeInternalRedirect()`.
   - Idempotent credit grants: unique DB constraints on `(order_id, reason)` and `(workspace_id, 'trial_grant')`.
   - Whop webhooks must verify HMAC signature before execution.
   - Money is stored in integer minor units (USD cents: `$49` = `4900`, USD millimes: `149 DT` = `149000`).
4. **Strict TypeScript & Zod**: No `any`, no unvalidated `req.json()`. Strict Zod schemas on all API inputs.

---

## Part C: Sprint 1 Jira Tickets Index (55 Story Points)

| Key | Title | Pts | Priority | Depends On | Labels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MM-101** | Discovery audit of the repository | 2 | P0 | None | `discovery`, `audit` |
| **MM-102** | Pack catalog, Whop mapping & parameter normalization | 3 | P0 | MM-101 | `catalog`, `whop` |
| **MM-103** | Safe internal redirect helper & open-redirect guard | 3 | P0 | MM-101 | `security`, `redirect` |
| **MM-104** | Data model, Whop subscriptions & credit ledger | 5 | P0 | MM-101 | `database`, `ledger` |
| **MM-105** | Landing & Pricing CTAs with signed intent cookie | 3 | P0 | MM-102 | `frontend`, `funnel` |
| **MM-106** | Slim 2-step signup with neutral responses & trial credits | 5 | P0 | MM-102, 103, 104 | `auth`, `security` |
| **MM-107** | Login redirect preservation & logged-out checkout state | 3 | P0 | MM-102, 103, 105 | `auth`, `checkout` |
| **MM-108** | Whop checkout session API & checkout page | 5 | P0 | MM-104, 107 | `checkout`, `whop` |
| **MM-109** | Whop SDK client wrapper & checkout redirect flow | 3 | P0 | MM-104, 108 | `whop`, `integration` |
| **MM-110** | Signed Whop webhook handler (`finalizeOrder`) & reconciler | 5 | P0 | MM-104, 109 | `webhook`, `billing` |
| **MM-111** | Payment result page, failure handling & abandonment recovery | 3 | P0 | MM-110 | `frontend`, `billing` |
| **MM-112** | Post-payment onboarding wizard (Brand Kit, Store, Channels) | 5 | P1 | MM-104, 106 | `onboarding`, `ux` |
| **MM-113** | Rate limiting & abuse protection (OTP, check-email, checkout) | 3 | P2 | MM-106 | `security`, `rate-limit` |
| **MM-114** | Whop funnel analytics instrumentation | 2 | P2 | MM-105, 111 | `analytics`, `funnel` |
| **MM-115** | End-to-end integration tests with Whop sandbox mock | 5 | P1 | MM-111, 112 | `testing`, `e2e` |

---

## Detailed Jira Ticket Specifications

### MM-101: Discovery Audit of the Repository
- **Type**: Spike | **Points**: 2 | **Priority**: P0 | **Depends On**: None
- **User Story**: As a lead engineer, I need an automated and documented audit of existing routes, Prisma/Supabase models, auth tokens, and Whop configurations to ensure zero architectural collisions.
- **Technical Tasks**:
  1. Inspect Next.js 16 App Router structure (`src/app/page.tsx`, `/pricing`, `/signup`, `/login`, `/checkout`, `/payment/success`, `/studio`).
  2. Audit current Auth system in `src/lib/auth.ts`, `src/lib/WorkspaceContext.tsx`, and session cookies.
  3. Map existing Whop implementation in `src/lib/whop.ts`, `WHOP_SETUP_GUIDE.md`, and `supabase/migrations/20261017_whop_migration.sql`.
  4. Generate `docs/discovery/MM-101.md`.
- **Acceptance Criteria**:
  - [ ] AC1: `docs/discovery/MM-101.md` created with 7 exhaustive sections.
  - [ ] AC2: Verifies all existing Whop environment variables and plan IDs (`WHOP_PLAN_FLASH`, `WHOP_PLAN_PRO`, `WHOP_PLAN_AGENCY`).
  - [ ] AC3: Zero modifications to production source code.

---

### MM-102: Pack Catalog, Whop Mapping & Parameter Normalization
- **Type**: Story | **Points**: 3 | **Priority**: P0 | **Depends On**: MM-101
- **User Story**: As a growth engineer, I want a single centralized catalog defining packs, pricing in minor units (USD cents & USD millimes), credits, and Whop plan mappings, so UI and server never disagree.
- **Technical Specs**:
  - File: `src/config/packs.ts` & `src/lib/checkout/params.ts`.
  - Type definitions:
    ```typescript
    export const PACK_IDS = ['flash', 'pro', 'agency_299'] as const;
    export type PackId = (typeof PACK_IDS)[number];
    export type Cycle = 'monthly' | 'annual';
    export type Currency = 'USD' | 'USD';

    export interface PackDef {
      id: PackId;
      name: string;
      whopPlanEnvVar: string;
      defaultWhopPlanId: string;
      creditsPerMonth: number;
      priceUSDMinor: Record<Cycle, number>; // in cents ($49 = 4900)
      priceTNDMinor: Record<Cycle, number>; // in millimes (149 DT = 149000)
      features: string[];
    }
    ```
  - `normalizeCheckoutParams(searchParams, ctx)`: Accepts `pack`, `cycle`, `currency`. Normalizes legacy `plan=` to `pack=`. Rejects invalid packs by returning `ok: false, reason: 'INVALID_PACK'`.
- **Acceptance Criteria**:
  - [ ] AC1: `normalizeCheckoutParams({ plan: 'pro' })` returns `{ ok: true, value: { pack: 'pro', cycle: 'monthly', currency: 'USD' } }`.
  - [ ] AC2: Tampered query params (e.g. `price=0`, `credits=999`) are completely ignored.
  - [ ] AC3: 100% unit test coverage in `src/lib/checkout/__tests__/params.test.ts`.

---

### MM-103: Safe Internal Redirect Helper & Open-Redirect Guard
- **Type**: Story | **Points**: 3 | **Priority**: P0 | **Depends On**: MM-101
- **User Story**: As a security engineer, I want all return URLs and login redirects to be validated against an internal allowlist to prevent open-redirect phishing attacks.
- **Technical Specs**:
  - File: `src/lib/security/redirect.ts`.
  - Implementation:
    ```typescript
    const ALLOWED_INTERNAL_PATHS = ['/checkout', '/payment', '/onboarding', '/studio', '/studio', '/billing'];

    export function getSafeInternalRedirect(raw: string | null | undefined, fallback = '/studio'): string {
      if (!raw || raw.length > 2048) return fallback;
      if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
      try {
        const parsed = new URL(raw, 'http://internal.invalid');
        if (parsed.origin !== 'http://internal.invalid') return fallback;
        const isAllowed = ALLOWED_INTERNAL_PATHS.some(p => parsed.pathname === p || parsed.pathname.startsWith(p + '/'));
        return isAllowed ? parsed.pathname + parsed.search : fallback;
      } catch {
        return fallback;
      }
    }
    export const buildLoginUrl = (returnTo: string) => `/login?redirect=${encodeURIComponent(returnTo)}`;
    ```
- **Acceptance Criteria**:
  - [ ] AC1: `https://evil.com`, `//evil.com`, `javascript:`, and `/%2F%2Fevil.com` fall back to `/studio`.
  - [ ] AC2: `/checkout?pack=pro&cycle=monthly` passes safely without double-decoding.
  - [ ] AC3: Grep audit replaces all raw `redirectUrl` assignments across `src/app/login` and `src/app/signup`.

---

### MM-104: Data Model, Whop Subscriptions & Credit Ledger
- **Type**: Story | **Points**: 5 | **Priority**: P0 | **Depends On**: MM-101
- **User Story**: As a platform architect, I want an append-only credit ledger and Whop subscription tracking tables to prevent duplicate credit grants and ensure auditable billing.
- **Technical Specs**:
  - Schema additions (PostgreSQL / Supabase):
    ```sql
    CREATE TABLE IF NOT EXISTS public.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
      user_id UUID NOT NULL REFERENCES public.users(id),
      pack VARCHAR(50) NOT NULL,
      cycle VARCHAR(20) NOT NULL,
      currency VARCHAR(10) NOT NULL,
      amount_minor INT NOT NULL,
      status VARCHAR(30) NOT NULL, -- 'CREATED', 'PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELED'
      gateway VARCHAR(30) DEFAULT 'whop',
      whop_payment_id VARCHAR(100),
      whop_checkout_id VARCHAR(100),
      whop_membership_id VARCHAR(100),
      idempotency_key VARCHAR(120) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.credit_ledger (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
      delta INT NOT NULL,
      reason VARCHAR(50) NOT NULL, -- 'trial_grant', 'whop_plan_grant', 'generation_spend', 'manual_adjustment'
      order_id UUID REFERENCES public.orders(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT uq_order_grant UNIQUE (order_id, reason),
      CONSTRAINT uq_workspace_trial UNIQUE (workspace_id, reason)
    );
    ```
  - Domain service in `src/lib/services/billing.ts`: `grantCredits()`, `getBalance()`, `createOrder()`.
- **Acceptance Criteria**:
  - [ ] AC1: Replaying `grantCredits` with the same `orderId` throws or returns `{ granted: false }` without increasing balance.
  - [ ] AC2: Dual-write maintains backward compatibility with `workspace.creditsRemaining`.
  - [ ] AC3: Rollback migrations clean up all created tables and constraints cleanly.

---

### MM-105: Landing & Pricing CTAs with Signed Intent Cookie
- **Type**: Story | **Points**: 3 | **Priority**: P0 | **Depends On**: MM-102
- **User Story**: As a visitor, when I click "Choisir ce forfait" on the Landing Page, my selection must be preserved in a cryptographically signed cookie so it is never lost during authentication.
- **Technical Specs**:
  - Files: `src/app/page.tsx`, `src/components/PricingTable.tsx`, `src/lib/checkout/intent.ts`.
  - Cookie: `mm_intent` (httpOnly, sameSite lax, secure in production, maxAge 7 days).
  - Implementation:
    ```typescript
    export function signIntent(params: CheckoutParams, secret: string): string;
    export function verifyIntent(cookieValue: string | undefined, secret: string): CheckoutParams | null;
    ```
  - Landing CTA buttons point to `/checkout?pack=pro&cycle=monthly`.
- **Acceptance Criteria**:
  - [ ] AC1: Clicking any plan sets the signed `mm_intent` cookie.
  - [ ] AC2: Tampered cookie payloads are rejected with fallback to `/pricing`.
  - [ ] AC3: No hardcoded price literals remain in `page.tsx` or `PricingTable.tsx`.

---

### MM-106: Slim 2-Step Signup with Neutral Responses & Trial Credits
- **Type**: Story | **Points**: 5 | **Priority**: P0 | **Depends On**: MM-102, 103, 104
- **User Story**: As a prospective customer, I want to sign up with just email, password, and OTP verification so I can proceed directly to checkout without pre-payment survey friction.
- **Technical Specs**:
  - File: `src/app/signup/page.tsx` (wrapped with feature flag `FF_SLIM_SIGNUP`).
  - **Step 1**: Work Email + Secure Password (with client-side strength meter).
  - **Step 2**: 6-digit OTP verification.
  - **Security**: `/api/auth/signup` returns identical neutral responses `{ status: 'OTP_SENT' }` regardless of whether the email is new or already registered.
  - Post-verification: Creates workspace, grants 3 trial credits (`reason: 'trial_grant'`), and redirects to `/checkout?pack=...` if intent exists.
- **Acceptance Criteria**:
  - [ ] AC1: Pre-payment signup reduced to exactly 2 screens.
  - [ ] AC2: Email enumeration blocked (identical response code and timing for existing vs new accounts).
  - [ ] AC3: Development bypass `123456` strictly disabled when `NODE_ENV === 'production'`.
  - [ ] AC4: 3 trial credits granted exactly once per workspace.

---

### MM-107: Login Redirect Preservation & Logged-Out Checkout State
- **Type**: Story | **Points**: 3 | **Priority**: P0 | **Depends On**: MM-102, 103, 105
- **User Story**: As a registered user who is currently logged out, when I click a plan, I want to see a clear sign-in banner on checkout and return immediately to checkout after logging in.
- **Technical Specs**:
  - File: `src/app/checkout/page.tsx` & `src/app/login/page.tsx`.
  - When no active session is detected on `/checkout`:
    - Shows order summary card with selected pack & price.
    - Banner: *"Vous avez déjà un compte ? [Connectez-vous pour finaliser avec votre espace ➔](/login?redirect=%2Fcheckout%3Fpack%3Dpro%26cycle%3Dmonthly)"*.
    - Button: *"Créer un compte en 1 minute"*.
  - Login route preserves `redirect` parameter through `getSafeInternalRedirect()`.
- **Acceptance Criteria**:
  - [ ] AC1: Successfully logging in redirects back to `/checkout?pack=...` with user session and workspace attached.
  - [ ] AC2: Query strings containing `&` are properly URL-encoded and decoded without corruption.
  - [ ] AC3: Checkout page renders responsive state for guest visitors.

---

### MM-108: Whop Checkout Session API & Checkout Page
- **Type**: Story | **Points**: 5 | **Priority**: P0 | **Depends On**: MM-104, 107
- **User Story**: As an authenticated user on `/checkout`, I want to confirm my plan, review credits, and click "Procéder au paiement sécurisé Whop" to initiate the transaction.
- **Technical Specs**:
  - Route: `POST /api/checkout/orders`.
  - Body: `{ packId: 'flash' | 'pro' | 'agency_299', cycle: 'monthly' | 'annual' }`.
  - Logic:
    1. Verifies user session and active workspace.
    2. Resolves price and Whop Plan ID server-side from `src/config/packs.ts`.
    3. Creates order with status `CREATED` and unique `idempotency_key`.
    4. Generates Whop checkout URL via Whop API / SDK with metadata (`workspace_id`, `order_id`, `user_id`).
    5. Returns `{ success: true, checkoutUrl: 'https://whop.com/checkout/plan_...' }`.
- **Acceptance Criteria**:
  - [ ] AC1: Prevents duplicate subscriptions if user already holds active plan (returns `409 ALREADY_SUBSCRIBED`).
  - [ ] AC2: Amount and plan are never read from client body; strictly loaded from server catalog.
  - [ ] AC3: Clicking payment button redirects to valid Whop Checkout URL.

---

### MM-109: Whop SDK Client Wrapper & Checkout Redirect Flow
- **Type**: Story | **Points**: 3 | **Priority**: P0 | **Depends On**: MM-104, 108
- **User Story**: As a backend developer, I want a robust Whop SDK client wrapper supporting both Sandbox and Production modes with error logging and retry handling.
- **Technical Specs**:
  - File: `src/lib/whop.ts`.
  - Updates:
    - Wraps `@whop/sdk` with timeout (8 seconds) and structured error handling.
    - Support environment switches: `WHOP_SANDBOX === 'true'` maps to `https://sandbox-api.whop.com/api/v1`.
    - Function: `createWhopCheckoutSession({ orderId, workspaceId, userEmail, planId })`.
- **Acceptance Criteria**:
  - [ ] AC1: Handles network failures gracefully with typed error `{ success: false, error: string }`.
  - [ ] AC2: Injects required custom metadata (`orderId`, `workspaceId`) into the Whop session.
  - [ ] AC3: Unit tests verify correct base URL selection based on environment.

---

### MM-110: Signed Whop Webhook Handler (`finalizeOrder`) & Reconciler
- **Type**: Story | **Points**: 5 | **Priority**: P0 | **Depends On**: MM-104, 109
- **User Story**: As a platform architect, I want Whop webhook events (`payment.succeeded`, `membership.went_valid`, `membership.went_invalid`) to cryptographically verify signatures and atomically activate plans and credits.
- **Technical Specs**:
  - Route: `POST /api/payment/whop-webhook`.
  - Signature verification:
    ```typescript
    const signature = headers().get('whop-signature') || headers().get('x-whop-signature');
    const isValid = verifyWhopHmac(rawBody, signature, process.env.WHOP_WEBHOOK_SECRET);
    if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    ```
  - Atomic `finalizeOrder(orderId, source)`:
    1. Read order from DB. If already `PAID`, return immediately (idempotent).
    2. Check payment status with Whop API.
    3. Open DB transaction: set `orders.status = 'PAID'`, insert `credit_ledger` row (`delta: packCredits`, `reason: 'whop_plan_grant'`), update `workspace.plan` and `workspace.creditsRemaining`.
    4. Write audit log to `payment_events`.
- **Acceptance Criteria**:
  - [ ] AC1: Unsigned or invalid webhook calls return 401.
  - [ ] AC2: Webhook replay performs no duplicate credit grant (enforced by `uq_order_grant` constraint).
  - [ ] AC3: Failed or cancelled memberships update workspace status accordingly.

---

### MM-111: Payment Result Page, Failure Handling & Abandonment Recovery
- **Type**: Story | **Points**: 3 | **Priority**: P0 | **Depends On**: MM-110
- **User Story**: As a customer returning from Whop, I want to see a confirmation of my purchase, my updated credit balance, and a button to enter the Studio.
- **Technical Specs**:
  - Route: `/payment/result` and `/payment/success`.
  - Reads `order_id` from query parameter and queries order state directly from DB (never trusts client params).
  - **Success State**: Displays pack name, credits added, and CTA: *"Lancer le Studio & Créer mon 1er Visuel"*.
  - **Failure / Cancel State**: Explains payment was not completed, keeps order state, and offers a 1-click *"Réessayer le paiement"* button.
  - **Abandonment banner in Studio**: If `workspace.pending_checkout` is set, displays top banner: *"Finalisez votre commande du Pack Pro pour débloquer la 4K. [Reprendre le paiement ➔](/checkout)"*.
- **Acceptance Criteria**:
  - [ ] AC1: Result page displays live DB state, not query param values.
  - [ ] AC2: Canceled payments allow seamless retry without re-registering.
  - [ ] AC3: Studio displays abandonment recovery banner when pending checkout exists.

---

### MM-112: Post-Payment Onboarding Wizard (Brand Kit, Store, Channels)
- **Type**: Story | **Points**: 5 | **Priority**: P1 | **Depends On**: MM-104, 106
- **User Story**: As a newly subscribed merchant, I want to configure my brand kit, logo, and store details after paying so my studio is personalized without delaying checkout.
- **Technical Specs**:
  - Route: `/onboarding` (accessible immediately after payment or skippable).
  - Steps:
    1. **Boutique Profile**: Store URL, brand name, niche.
    2. **Brand Kit Studio**: Upload transparent PNG logo, primary color picker, brand slogan.
    3. **Objectifs & Canaux**: Social channels selection (Instagram, TikTok 9:16, Facebook).
  - Action buttons: *"Enregistrer et aller au Studio"* and *"Passer cette étape (configurer plus tard)"*.
  - Updates `workspace.brandKit` and `workspace.onboarding_state`.
- **Acceptance Criteria**:
  - [ ] AC1: All 3 onboarding steps can be completed or skipped without blocking studio access.
  - [ ] AC2: Saved logo and brand colors automatically populate the Studio staging canvas.
  - [ ] AC3: Mobile-friendly UI (390px responsive).

---

### MM-113: Rate Limiting & Abuse Protection
- **Type**: Story | **Points**: 3 | **Priority**: P2 | **Depends On**: MM-106
- **User Story**: As a security engineer, I want rate limits on OTP generation, email verification, and checkout creation to protect against botting and abuse.
- **Technical Specs**:
  - File: `src/lib/security/rateLimit.ts`.
  - Limits:
    - `/api/auth/signup`: Max 5 attempts per IP per 10 minutes.
    - `/api/auth/verify-otp`: Max 5 failed attempts before OTP invalidation.
    - `/api/checkout/orders`: Max 10 order creations per user per hour.
  - Returns standard HTTP 429 Too Many Requests with `Retry-After` header.
- **Acceptance Criteria**:
  - [ ] AC1: Exceeding OTP attempts locks the code and returns user-friendly error.
  - [ ] AC2: Rate limit state tracked in memory (development) or Upstash Redis / DB table.
  - [ ] AC3: Legitimate users within limits experience zero disruption.

---

### MM-114: Whop Funnel Analytics Instrumentation
- **Type**: Story | **Points**: 2 | **Priority**: P2 | **Depends On**: MM-105, 111
- **User Story**: As a growth marketer, I want privacy-compliant funnel telemetry events to monitor conversion from pricing click to paid workspace.
- **Technical Specs**:
  - File: `src/lib/analytics/funnel.ts`.
  - Events tracked:
    1. `funnel_plan_clicked` (`pack`, `cycle`, `currency`)
    2. `funnel_signup_started`
    3. `funnel_signup_completed`
    4. `funnel_checkout_viewed` (`pack`)
    5. `funnel_whop_redirect` (`order_id`, `pack`)
    6. `funnel_payment_success` (`order_id`, `pack`, `credits_granted`)
    7. `funnel_payment_failed` (`order_id`, `reason`)
    8. `funnel_onboarding_completed`
  - Invariant: Zero PII (no passwords, emails, or names in analytics payloads).
- **Acceptance Criteria**:
  - [ ] AC1: All 8 funnel events fire reliably at their respective journey stages.
  - [ ] AC2: Analytics payloads contain only anonymized tokens and pack IDs.

---

### MM-115: End-to-End Integration Tests with Whop Sandbox Mock
- **Type**: Story | **Points**: 5 | **Priority**: P1 | **Depends On**: MM-111, 112
- **User Story**: As a QA engineer, I want automated Playwright / Vitest E2E tests simulating the entire Whop funnel so regressions are caught before production deployment.
- **Technical Specs**:
  - Test suite: `tests/e2e/whop-funnel.spec.ts`.
  - Scenarios tested:
    1. **Guest visitor**: Landing -> selects Pro -> 2-step signup -> Whop checkout mocked -> webhook receives `payment.succeeded` -> returns to result page -> verifies 33 credits in studio.
    2. **Existing user**: Logs in -> selects Advanced -> instant Whop checkout -> plan upgraded.
    3. **Payment decline**: Webhook failure / cancel return -> retry button displayed.
    4. **Tampering attack**: URL with `price=1` or `credits=999` overridden by catalog server-side.
- **Acceptance Criteria**:
  - [ ] AC1: All 4 E2E test scenarios pass green in CI.
  - [ ] AC2: Database fixtures are cleaned up after test completion.
  - [ ] AC3: Test run time under 60 seconds.

---

## Part D: Definition of Done (All Tickets)
1. **Functional**: All Acceptance Criteria verified and passing.
2. **Quality Gates**: `npm run build` (Next.js 16 compiler) passes with zero type or lint errors.
3. **Security Invariants**: Cryptographic Whop HMAC verified; zero open-redirects; zero PII in logs.
4. **UX / Aesthetics**: Follows MarkMosaiq dark luxury athletic tokens (`#07090E`, `#0B0E14`, Neon Cyan `#00E5FF`, Purple `#A855F7`, Outfit typography). Fully responsive at desktop (1280px) and mobile (390px).
