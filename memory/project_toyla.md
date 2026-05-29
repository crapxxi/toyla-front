---
name: project-toyla-frontend
description: Complete Toyla.app frontend codebase — route structure, API URL conventions, key design decisions, and things to watch when extending
metadata:
  type: project
---

Full Next.js 15 (App Router) frontend built from FRONT.md spec. Build passes cleanly with all 15 routes.

**Why:** Toyla.app is a zero-touch SaaS for banquet/event management in Kazakhstan. Organizer dashboard + public guest invitation page.

## Route structure
- `(auth)` route group: `/login` only
- `(dashboard)` route group (shared sidebar layout): `/dashboard`, `/events/[toyId]/**`, `/settings`
  - Note: `(dashboard)` doesn't add URL prefix; events are at `/events/...` not `/dashboard/events/...`
- Public: `/[username]/[toyId]` — SSR server component, fetches PublicToyResponse

## API URLs (all prefixed `/api/v1/`)
- Auth: `POST /api/v1/auth/request-otp`, `POST /api/v1/auth/verify-otp`
- Toys: `GET /api/v1/toys?organizerId=`, `POST /api/v1/toys?organizerId=`, `GET/PUT/DELETE /api/v1/toys/{id}`
- Template: `PATCH /api/v1/toys/{id}/template`
- Guests: `GET/POST /api/v1/toys/{id}/guests`, `PUT/DELETE /api/v1/guests/{id}`
- Tables: `GET/POST /api/v1/toys/{id}/tables`, `DELETE /api/v1/tables/{id}`, `POST /api/v1/tables/{tableId}/guests/{guestId}`, `DELETE /api/v1/tables/{tableId}/guests/{guestId}`
- RSVP: `POST /api/v1/rsvp/{token}?status=ACCEPTED|DECLINED`
- Public: `GET /api/v1/public/events/{username}/{toyId}`
- Notifications: `GET /api/v1/toys/{id}/notifications`, `POST /api/v1/toys/{id}/notifications/send-invites`

## Middleware
`middleware.ts` (not proxy.ts) protects `/dashboard/**`, `/events/**`, `/settings` — redirects to `/login` if no `toyla_token` cookie.

## Auth pattern
- Zustand auth store uses `persist` middleware (localStorage-backed)
- After OTP verify: POST to `/api/auth/set-token` Next.js route to set httpOnly cookie
- Middleware reads cookie for SSR protection

## Key components
- `components/templates/` — 5 templates (ELEGANT, FESTIVE, MINIMALIST, ROMANTIC, MODERN), all accept same `TemplateProps`
- `components/shared/BackgroundMusicPlayer` — floating play/pause, handles autoplay browser block
- `components/shared/EventCountdown` — 3 styles (minimal/elegant/festive), 3 positions (top/bottom/floating)
- `PublicEventClient.tsx` co-located with `/[username]/[toyId]/page.tsx`

**How to apply:** When adding new routes or API calls, follow the `/api/v1/` prefix convention and ensure new protected routes are added to middleware matcher.
