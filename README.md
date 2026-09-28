# Aiko Admin

The operations console for the Aiko delivery marketplace. Vite + React + React
Router, talking to the NestJS API in `../backend`.

## Running

```bash
npm install
npm run dev          # http://localhost:5174
```

Vite proxies `/api` to `http://localhost:3000`, so the backend must be running.
Point it somewhere else with `VITE_API_PROXY` in `.env.local`.

Sign in with a seeded `ADMIN` account, or any `ADMIN`/`SUPPORT` account created
from the Users screen afterwards. App accounts are created through Firebase and
carry no password, so they can never authenticate here — which is the point.

**Two staff roles.** `ADMIN` sees everything below. `SUPPORT` sees Orders,
Drivers (read-only), Users and its own ticket queue, and cannot approve KYC,
block anyone, or touch pricing, wallets or settings — those sections and
actions are hidden from it in the sidebar and on each page, and the server
enforces the same boundary independently (`@Roles('ADMIN', 'SUPPORT')` vs
`@Roles('ADMIN')` — see `roles.decorator.ts`). Create a staff account from the
Users screen; only an existing `ADMIN` can do that.

## What is in it

| Section | What it does | API |
|---|---|---|
| **Dashboard** | Live tiles, 14-day order and revenue trend, vehicle split, activity feed | `/admin/summary`, `/admin/trend`, `/admin/vehicle-split`, `/admin/activity` |
| **Orders** | Every delivery, filterable by status; detail view with cancel | `/orders` |
| **Drivers** | The fleet, with KYC status, shift state and debt | `/drivers` |
| **KYC Approvals** | The approval work queue — approve or reject with a reason | `/drivers/:id/kyc/*` |
| **Users** | Everyone with an account. Block/unblock any account (admin only — takes effect on that account's very next request, not its next sign-in) and create new `ADMIN`/`SUPPORT` staff accounts | `/users`, `/users/:id/block`, `/users/staff` |
| **Financials** | Revenue, platform earnings, outstanding debt, top drivers | `/analytics/*` |
| **Wallets & Payouts** | Two tabs: debt exposure against the limit, and available-balance payouts, each sorted by risk/size. A driver's own page has the full transaction ledger | `/drivers`, `/wallet/all`, `/wallet/driver/:id/transactions` |
| **Pricing & Rate Card** | Editable fare rules per vehicle, with a worked example | `/pricing` |
| **Support** | Ticket queue, threads, internal notes | `/support` |
| **Dispatch Activity** | The live driver pool and every unclaimed order | `/admin/socket-activity` |
| **Audit Logs** | Append-only trail of admin actions | `/audit` |
| **Settings** | Platform totals and dispatch config (read-only, env-set); fare rounding and the road-distance fallback factor are editable here too | `/admin/summary`, `/settings` |

## Notes worth knowing

**Two paging envelopes.** The older controllers return
`{ totalItems, totalPages, currentPage, result }`; the newer `audit` module
returns `{ data, meta }`. `src/services/api.ts` names the first `Paged<T>`.
Getting this wrong renders an empty table rather than failing to compile.

**`/drivers` and `/users` are not paginated.** They return the whole filtered
array, which is why search on those screens is client-side. Fine at pilot scale;
move it server-side when the fleet outgrows one response.

**Dispatch Activity is the diagnostic screen.** The `Reached` column answers the
question the orders table cannot: an unclaimed order that reached *nobody* means
no drivers are online in range, and widening the radius will not help. One that
reached everybody and is still sitting there is a pricing or parcel problem.

## Not included

juzogo's Plans, Subscriptions and Webhook Events have no equivalent here — Aiko
is pay-per-delivery, not subscription-based, so those screens would have had
nothing to show.
