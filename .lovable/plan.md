
# Maango — Home Services Marketplace (Frontend v1)

A polished, mango-themed marketplace connecting homeowners with vetted service providers. Subscription-gated provider responses. All data mocked in-memory now; swappable for Firebase Cloud Functions later.

## Stack Note (important)

Your prompt asks for **React + Vite + a plain React Router**. This project is already scaffolded on **TanStack Start** (React + Vite + TanStack Router, file-based routing). Rather than tear that out, I'll:

- Keep TanStack Start + TanStack Router (file-based routes under `src/routes/`) — it's still React + Vite and gives us SSR, typed routes, and preloading for free.
- Add **Redux Toolkit** exactly as you specified for global state (auth, profiles, requests, deals, payments, notifications, admin, UI).
- Build a **mock API layer** (`src/api/*`) with async functions returning promises + fake latency, structured so each file maps 1:1 to a future Cloud Function endpoint.

If you'd rather I rip out TanStack and use plain `react-router-dom`, say the word and I'll redo the scaffolding.

## Brand & Design Direction

- **Primary** mango orange, **Secondary** leaf green, **Accent** golden yellow / lime
- **Bg** warm white / soft grey, **Text** charcoal
- Orange reserved for primary CTAs; green for verified/subscribed/success; neutrals dominate dashboards
- Typography: a warm humanist display (e.g. Fraunces or Bricolage Grotesque) + clean sans (Inter/Geist) for UI
- Semantic tokens defined in `src/styles.css` (oklch): `--brand-mango`, `--brand-leaf`, `--brand-gold`, `--surface-warm`, `--status-verified`, `--status-locked`, plus gradients + soft shadows
- Custom shadcn variants (`Button variant="mango" | "leaf" | "ghost-warm"`, `Badge variant="verified" | "subscribed" | "pending" | "locked"`)

## Information Architecture (file-based routes)

```
src/routes/
  __root.tsx                  # shell, nav, footer
  index.tsx                   # public landing + hero search
  search.tsx                  # provider search results
  pros/$proId.tsx             # public provider profile
  auth/login.tsx
  auth/register.tsx
  auth/choose-role.tsx
  _app/route.tsx              # authed layout (role-agnostic shell)
  _app/dashboard.tsx          # redirects by role
  _app/client/dashboard.tsx
  _app/client/requests.index.tsx
  _app/client/requests.new.tsx
  _app/client/requests.$id.tsx
  _app/client/requests.$id.responses.tsx
  _app/pro/onboarding.tsx
  _app/pro/verification.tsx
  _app/pro/dashboard.tsx
  _app/pro/matching.tsx
  _app/pro/matching.$id.tsx     # respond page (subscription-gated)
  _app/pro/responses.tsx
  _app/pro/subscription.tsx
  _app/pro/billing.tsx
  _app/admin/dashboard.tsx
  _app/admin/applications.tsx
  _app/admin/users.tsx
  _app/admin/requests.tsx
  _app/admin/payments.tsx
  _app/admin/categories.tsx
  _app/admin/support.tsx
  _app/notifications.tsx
  _app/support.tsx
  _app/profile.tsx
```

`_app` layout reads auth from Redux; unauthenticated users are redirected to `/auth/login`. Role gating handled in each subtree's `beforeLoad`.

## Redux Toolkit Slices

Matches your list exactly: `auth`, `user`, `client`, `pro`, `requests`, `deals`, `payments`, `notifications`, `admin`, `ui`. Store in `src/app/store.ts`, typed `useAppDispatch`/`useAppSelector` in `src/app/hooks.ts`. Async thunks call the mock API. `auth` slice is persisted to `localStorage`.

## Mock API Layer

`src/api/` — each file exports functions matching your endpoint list:

- `authApi` — session, register, logout, chooseRole
- `usersApi` — me, updateProfile
- `prosApi` — application, search, getById, updateProfile, services, areas
- `requestsApi` — create, listMine, listMatching, getById, uploadAttachment
- `dealsApi` — respond, listForRequest, listMine, accept, reject
- `paymentsApi` — plans, checkout, subscription, invoices, cancel
- `notificationsApi` — list, markRead, unreadCount
- `supportApi` — createTicket, listTickets
- `adminApi` — approvePro, denyPro, listAll, categories CRUD

`src/api/mockApi.ts` seeds a rich in-memory dataset (10+ providers across categories: plumbing, electrical, cleaning, painting, gardening, aircon, moving, tiling; sample requests; sample deals). Fake latency 200–600ms + occasional error simulation for realistic loading/error states.

`src/api/client.ts` is a thin fetch wrapper stub — flip a single env flag later to route to Firebase Cloud Functions instead of the mock module.

## Subscription-Gated UX (the important one)

Central helper `src/lib/permissions.ts`:
- `canRespondToDeals(pro)` → `pro.subscription.status === 'active'`
- `canViewFullRequest(pro)` → same
- `canViewClientContact(pro, deal)` → subscribed AND deal accepted

UI patterns:
- **Locked request preview card**: blurred contact/last details, "Subscribe to unlock this lead" CTA, plan pricing peek, mango-gradient upgrade panel — feels like a premium upsell, not a wall
- **Subscription status banner** across pro dashboard: active (leaf green), trialing, past_due (amber warning + "Update payment"), canceled (renew CTA)
- Respond button disabled with tooltip when unsubscribed; clicking navigates to `/pro/subscription`

## Key Components (`src/components/`)

- `layout/`: PublicShell, AppShell, Sidebar, Topbar with role switcher (dev-only)
- `navigation/`: RoleNav, Breadcrumbs, NotificationBell (unread badge)
- `cards/`: ProviderCard, RequestCard, LockedRequestCard, PlanCard, DashboardStatTile
- `forms/`: RequestForm (multi-step with attachments), ProOnboardingForm, RespondForm
- `feedback/`: EmptyState, LoadingSkeletons per surface, ErrorState, VerificationBadge, SubscriptionBanner
- `modals/`: ConfirmDialog, AcceptDealDialog, CancelSubscriptionDialog

## Landing Page

- Hero: warm gradient, big display headline "Find trusted pros for every corner of home", inline service+location search
- Category grid with playful icons (mango-tinted illustrations)
- "How Maango works" 3-step (Post → Compare → Hire)
- Trust strip (verified count, reviews)
- Featured providers carousel
- Provider CTA section ("Grow your business on Maango — subscribe & get local leads")
- Footer with support/legal/for-pros

## Milestones (build order)

1. Design system + tokens + shadcn variants + fonts + landing
2. Auth + role selection + Redux store + persisted session + role-gated `_app` layout
3. Mock API + seed data + client-side flows (post request, view responses, select pro)
4. Provider flows (onboarding, verification states, dashboard, matching, respond) with subscription gating
5. Subscription/billing (plans, mock checkout, status banner, past_due handling)
6. Admin flows (applications, users, requests, payments, categories, support)
7. Notifications (polled mock), support tickets, empty/loading/error passes
8. Responsive polish + a11y + microcopy

## Realtime / Infra Note

Your infra answer is solid and I'll build the frontend to fit it: the mock API is shaped so `notificationsApi`, `dealsApi.listForRequest`, and provider lead alerts can later be swapped for **Firestore onSnapshot** subscriptions, while `requestsApi`, `prosApi`, `paymentsApi`, `authApi` stay as HTTP calls to Cloud Functions backed by PostgreSQL. No CDC needed for v1.

## What I will NOT do in v1

- No real payments (Stripe/Paddle) — mock checkout only
- No real Firebase — mock API module, ready to swap
- No chat (structure leaves room for it)
- No file uploads to real storage — attachments held in-memory with preview URLs

## Ready to build?

Approve and I'll ship milestones 1–3 in the first pass (design system, landing, auth, client-side flows end-to-end with mocks), then continue with provider/admin/subscription in the follow-up.
