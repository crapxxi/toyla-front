# Toyla.app — Complete Frontend Architecture Prompt

---

## 1. Project Philosophy

**Toyla.app** is a zero-touch SaaS platform for banquet and event management in Kazakhstan.

The platform owner **only ships frontend UI templates**. Everything else is autonomous:
- Organizers self-register via WhatsApp OTP — zero onboarding friction
- They build their event landing page by picking a template and filling a form
- The backend sends invites, 24h reminders, and morning seating info automatically via WhatsApp
- Events auto-delete 7 days after the event date — no manual cleanup

There are **two user types**:
- **Organizer** — creates events, manages guests and seating
- **Guest** — receives a WhatsApp link, opens the event page, RSVPs

The frontend has **two completely separate UX worlds**:
1. **Dashboard** — organizer's private workspace (`/dashboard/...`)
2. **Public invitation page** — the guest-facing event landing page (`/{username}/{toyId}`)

---

## 2. Tech Stack

```
Next.js 15 (App Router, TypeScript strict mode)
Tailwind CSS v4
shadcn/ui (Radix UI primitives)
Zustand (global auth + UI state)
TanStack Query v5 (server state, caching, mutations)
React Hook Form v7 + Zod
Framer Motion (page transitions + micro-animations)
Lucide React (icons)
Axios (HTTP client with interceptors)
next-intl (i18n: Russian + Kazakh)
@dnd-kit/core (drag-and-drop seating)
react-hot-toast (toasts)
date-fns (date formatting, locale: ru + kk)
```

---

## 3. TypeScript Data Models

These interfaces mirror the actual Java entities exactly. Use them everywhere.

```typescript
// ─── Enums ───────────────────────────────────────────────────────────────────

export type RsvpStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'
export type NotificationType = 'INITIAL_INVITE' | 'REMINDER_24H' | 'MORNING_SEATING'
export type DeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED' | 'ERROR'
export type EventTemplate = 'ELEGANT' | 'FESTIVE' | 'MINIMALIST' | 'ROMANTIC' | 'MODERN'
export type MessageLanguage = 'RUSSIAN' | 'KAZAKH'
export type UserRole = 'ORGANIZER' | 'ADMIN'

// ─── Entities ────────────────────────────────────────────────────────────────

export interface User {
  id: number
  username: string
  phoneNumber: string
  name: string | null
  lastName: string | null
  role: UserRole
}

export interface TemplateSettings {
  primaryColor?: string
  backgroundColor?: string
  backgroundImageUrl?: string        // Full-page background
  coverImageUrl?: string             // Hero/cover image shown at top of invitation
  galleryImages?: string[]           // Up to 5 photo URLs shown in a gallery strip
  fontFamily?: 'serif' | 'sans-serif' | 'cursive'
  greetingText?: string
  accentColor?: string
  // Music player
  musicUrl?: string
  musicAutoplay?: boolean
  musicLoop?: boolean
  musicVolume?: number               // 0.0–1.0, default 0.5
  // Countdown timer
  countdownEnabled?: boolean
  countdownTargetDate?: string       // ISO-8601; defaults to toy.eventDate if absent
  countdownStyle?: 'minimal' | 'elegant' | 'festive'
  countdownPosition?: 'top' | 'bottom' | 'floating'
}

export interface Toy {
  id: string                           // UUID
  title: string
  description: string
  eventDate: string                    // ISO-8601: "2025-06-14T18:00:00"
  locationName: string | null
  gisLink: string | null
  templateId: EventTemplate
  language: MessageLanguage
  templateSettings: TemplateSettings | null
  // ⚠️ backend returns the full entity — these fields ARE present in responses:
  user: User                           // organizer; pick user.id for organizerId
  tables: SeatingTable[]               // may be empty array
  guests: Guest[]                      // may be empty array
}

export interface Guest {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  status: RsvpStatus
  partySize: number
  rsvpToken: string                    // UUID — never expose in UI, only in WhatsApp links
  // ⚠️ backend returns full entity — these fields ARE present in responses:
  toy: { id: string }                  // back-reference, ignore in UI
  seatingTable: SeatingTable | null
  notificationLogs: NotificationLog[]  // may be empty array
}

export interface SeatingTable {
  id: number
  name: string
  capacity: number
  // ⚠️ backend returns full entity — toy field IS present (use toy.id, not toyId):
  toy: { id: string }                  // back-reference; extract toyId as toy.id
  guests: Guest[]
}

export interface NotificationLog {
  id: number
  guestId: number
  type: NotificationType
  sentAt: string                       // ISO-8601
  deliveryStatus: DeliveryStatus
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface PublicToyResponse {
  id: string
  title: string
  description: string
  eventDate: string
  locationName: string | null
  gisLink: string | null
  templateId: EventTemplate
  templateSettings: TemplateSettings
  organizerDisplayName: string
}

export interface AuthResponse {
  phoneNumber: string   // ← backend returns phoneNumber, NOT username
  token: string
}
```

---

## 4. Authentication Flow

**There are NO passwords and NO registration form.**

```
1. User enters phone number (10-13 digits, no spaces, no +)
2. POST /api/v1/auth/request-otp → { phoneNumber }
   → Backend sends 6-digit OTP via WhatsApp
   → Returns 200 { "message": "OTP sent to your WhatsApp" }
   → Rate limit: 3 attempts/hour per number → 429 TooManyRequests

3. User enters the 6-digit code they received
4. POST /api/v1/auth/verify-otp → { phoneNumber, code }
   → Returns 200 { phoneNumber, token }   // ← phoneNumber, NOT username
   → If first time: backend auto-creates the user account
   → On failure: 400 { "error": "..." }

5. Store JWT:
   - In memory via Zustand (for API calls)
   - In httpOnly cookie via Next.js route handler (for SSR + middleware protection)
```

**Token storage pattern:**
```typescript
// Never localStorage. Never sessionStorage.
// Memory (Zustand) + httpOnly cookie via proxy route handler.

// /app/api/auth/set-token/route.ts
// Sets httpOnly cookie server-side after successful OTP verify
```

**Login page UX:**
- Single page, two steps:
  - Step 1: Phone input → "Получить код" button → spinner while waiting
  - Step 2: 6-box OTP input (auto-focus next box) → "Войти" button
  - Resend countdown timer: "Отправить снова через 00:59"
  - Show 429 error as: "Слишком много попыток. Подождите 1 час."

---

## 5. Route Structure

```
app/
│
├── (auth)/
│   └── login/
│       └── page.tsx              # Phone OTP login (two-step, no registration)
│
├── (dashboard)/
│   ├── layout.tsx                # Sidebar nav, auth guard, user context
│   ├── dashboard/
│   │   └── page.tsx              # Event cards grid, stats overview
│   ├── events/
│   │   ├── new/
│   │   │   └── page.tsx          # Create event — 4-step wizard
│   │   └── [toyId]/
│   │       ├── page.tsx          # Event overview: RSVP stats, quick actions
│   │       ├── guests/
│   │       │   └── page.tsx      # Guest list table, add/edit/delete
│   │       ├── seating/
│   │       │   └── page.tsx      # Drag-and-drop seating canvas
│   │       ├── template/
│   │       │   └── page.tsx      # Template picker + live customizer
│   │       └── notifications/
│   │           └── page.tsx      # Notification logs, send triggers
│   └── settings/
│       └── page.tsx              # Edit name, surname, username
│
├── [username]/
│   └── [toyId]/
│       └── page.tsx              # PUBLIC: guest invitation landing page
│
├── api/
│   ├── auth/
│   │   ├── set-token/route.ts    # Sets httpOnly JWT cookie
│   │   └── logout/route.ts       # Clears cookie
│   └── proxy/[...path]/route.ts  # Optional: proxy to backend (avoids CORS)
│
├── middleware.ts                  # Protect /dashboard/** routes
└── layout.tsx                     # Root: fonts, providers, toaster
```

---

## 6. State Management

```typescript
// store/auth.store.ts
interface AuthStore {
  token: string | null
  user: { username: string; role: UserRole } | null
  setAuth: (token: string, username: string, role: UserRole) => void
  clearAuth: () => void
}

// store/ui.store.ts
interface UIStore {
  sidebarOpen: boolean
  activeEventId: string | null
  setSidebarOpen: (open: boolean) => void
  setActiveEvent: (id: string) => void
}
```

**TanStack Query keys convention:**
```typescript
export const queryKeys = {
  toys: (organizerId: number) => ['toys', organizerId],
  toy: (id: string) => ['toy', id],
  guests: (toyId: string) => ['guests', toyId],
  guestsByStatus: (toyId: string, status: RsvpStatus) => ['guests', toyId, status],
  tables: (toyId: string) => ['tables', toyId],
  logs: (toyId: string) => ['logs', toyId],
  publicEvent: (username: string, toyId: string) => ['public', username, toyId],
}
```

---

## 7. Axios API Layer

```typescript
// lib/api.ts
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
```

### Complete API Reference

> **Note:** All authenticated endpoints require `Authorization: Bearer <token>` header.
> `organizerId` и `guestId` — это `Long` (число), `toyId` и `rsvpToken` — UUID-строки.

#### Auth (no JWT required)

| Method | URL | Body | Response |
|--------|-----|------|----------|
| `POST` | `/api/v1/auth/request-otp` | `{ phoneNumber: string }` | `{ message: "OTP sent to your WhatsApp" }` |
| `POST` | `/api/v1/auth/verify-otp` | `{ phoneNumber: string, code: string }` | `{ phoneNumber: string, token: string }` |

> ⚠️ `verify-otp` возвращает **`phoneNumber`**, не `username`. После логина нужно отдельно получить профиль пользователя через `GET /api/v1/toys?organizerId=...` (id юзера приходит из JWT, декодируй его на клиенте).

> ❌ Эндпоинтов `/auth/register` и `/auth/login` (с паролем) **не существует** — есть DTO-заготовки в коде, но контроллеров нет.

---

#### Events (Toys) — требует JWT

| Method | URL | Params / Body | Response |
|--------|-----|---------------|----------|
| `GET` | `/api/v1/toys` | `?organizerId={Long}` | `Toy[]` |
| `POST` | `/api/v1/toys` | `?organizerId={Long}` + `ToyRequest` body | `Toy` (201) |
| `GET` | `/api/v1/toys/{toyId}` | — | `Toy` |
| `PUT` | `/api/v1/toys/{toyId}` | `ToyRequest` body | `Toy` |
| `DELETE` | `/api/v1/toys/{toyId}` | — | `204` |
| `PATCH` | `/api/v1/toys/{toyId}/template` | `Record<string, unknown>` body | `Toy` |

---

#### Guests — требует JWT

| Method | URL | Params / Body | Response |
|--------|-----|---------------|----------|
| `POST` | `/api/v1/toys/{toyId}/guests` | `GuestRequest` body | `Guest` (201) |
| `GET` | `/api/v1/toys/{toyId}/guests` | `?status=PENDING\|ACCEPTED\|DECLINED` (опц.) | `Guest[]` |
| `GET` | `/api/v1/guests/{id}` | — | `Guest` |
| `PUT` | `/api/v1/guests/{id}` | `GuestRequest` body | `Guest` |
| `DELETE` | `/api/v1/guests/{id}` | — | `204` |

> ⚠️ Лимит 500 гостей на event → 409 `{ error: "Event has reached the maximum guest capacity of 500" }`

---

#### Seating Tables — требует JWT

| Method | URL | Params / Body | Response |
|--------|-----|---------------|----------|
| `POST` | `/api/v1/toys/{toyId}/tables` | `{ name: string, capacity: number }` body | `SeatingTable` (201) |
| `GET` | `/api/v1/toys/{toyId}/tables` | — | `SeatingTable[]` |
| `GET` | `/api/v1/tables/{id}` | — | `SeatingTable` |
| `PATCH` | `/api/v1/tables/{id}/capacity` | `?capacity={int}` | `SeatingTable` |
| `POST` | `/api/v1/tables/{tableId}/guests/{guestId}` | — | `SeatingTable` |
| `DELETE` | `/api/v1/tables/{tableId}/guests/{guestId}` | — | `204` |
| `DELETE` | `/api/v1/tables/{id}` | — | `204` |

---

#### RSVP — без JWT

| Method | URL | Params | Response |
|--------|-----|--------|----------|
| `POST` | `/api/v1/rsvp/{rsvpToken}` | `?status=ACCEPTED\|DECLINED\|PENDING` | `Guest` |

> `rsvpToken` — UUID гостя, приходит в WhatsApp-ссылке. Никогда не логировать.

---

#### Public — без JWT

| Method | URL | Response |
|--------|-----|----------|
| `GET` | `/api/v1/public/events/{username}/{toyId}` | `PublicToyResponse` |

---

#### ❌ НЕ РЕАЛИЗОВАНО (нет контроллеров)

| Что | Статус |
|-----|--------|
| `POST /api/v1/toys/{toyId}/notifications/send-invites` | Нет контроллера. Уведомления отправляются автоматически по расписанию. |
| `GET /api/v1/toys/{toyId}/notifications` | Нет контроллера. `NotificationLog` в БД есть, эндпоинта нет. |
| `PUT /api/v1/users/{userId}` | Нет UserController. Настройки профиля пока недоступны через API. |

**Request bodies:**
```typescript
interface ToyRequest {
  title: string               // @NotBlank
  description: string         // @NotBlank
  eventDate: string           // "2025-06-14T18:00:00" — LocalDateTime, без timezone
  locationName?: string
  gisLink?: string
  templateId?: EventTemplate  // default: ELEGANT
  language?: MessageLanguage  // default: RUSSIAN
  templateSettings?: Record<string, unknown>
}

interface GuestRequest {
  firstName: string           // @NotBlank
  lastName: string            // @NotBlank
  phoneNumber: string         // @NotBlank — digits only, validation на клиенте
  partySize?: number          // default: 1
}

interface SeatingTableRequest {
  name: string                // @NotBlank
  capacity: number            // @Min(1)
}
```

**Error response shape:**
```typescript
// Validation errors (400) — @Valid провалился
{ errors: { fieldName: "message" } }

// Все остальные ошибки (404, 409, 429, 403, 500)
{ error: "Human-readable message" }

// 401 — нет/невалидный токен
{ error: "Authentication required" }

// 403 — нет прав
{ error: "Access denied" }
```

---

## 8. Page Breakdown

### 8.1 Login Page `/login`

- No back button, full-screen centered card, Toyla logo at top
- **Step 1 — Phone:**
  - Input: `+7 (___) ___-__-__` mask, auto-strip non-digits before sending
  - Submit → `POST /api/v1/auth/request-otp`
  - Show skeleton/spinner on button during request
  - On 429: show banner "Слишком много попыток. Повторите через 1 час."
- **Step 2 — OTP:**
  - 6 individual boxes, auto-focus next box on keypress, paste support
  - 60-second resend countdown: "Отправить снова через 0:42"
  - Submit → `POST /api/v1/auth/verify-otp` → on success: set cookie + navigate to `/dashboard`
  - On 400: shake animation on boxes + error text
- Language toggle RU/KZ top-right corner

---

### 8.2 Dashboard `/dashboard`

**Layout (Sidebar):**
- Logo: `toyla.app` wordmark top-left
- Nav: Dashboard, Events, Settings, Logout
- User avatar + `@username` at bottom
- Collapsible on mobile (hamburger)

**Main area:**
- Header: "Мои мероприятия" + "Создать мероприятие" button
- Grid of `EventCard` components (2 cols desktop, 1 col mobile)

**EventCard:**
```
┌─────────────────────────────────┐
│ [Template badge: ELEGANT]       │
│ Свадьба Айгерим и Данияра      │
│ 14 июня 2025, 18:00             │
│ Ресторан «Астана»               │
│                                 │
│ ████████████░░  210/500 гостей  │
│                                 │
│ 🟢 124 приняли                 │
│ 🔴 18 отказались               │
│ 🟡 68 не ответили              │
│                          [→]   │
└─────────────────────────────────┘
```
- Click → navigate to `/dashboard/events/{toyId}`
- Progress bar turns amber at 400+, red at 475+
- Auto-cleanup notice: "🗑 Будет удалено через 3 дня" if event is 4+ days past

---

### 8.3 Create Event Wizard `/events/new`

Progress bar at top: `Детали → Шаблон → Язык → Готово`

**Step 1 — Детали:**
- Title (required)
- Description (required, textarea)
- Date + Time picker (required, calendar popover + time input)
- Location name (optional)
- GIS link (optional, shows map preview iframe if valid URL)
- "Далее →" disabled until required fields filled

**Step 2 — Шаблон:**
- 5 template cards in a grid (2×2 + 1):
  - `ELEGANT` — preview: cream/gold ornamental border
  - `FESTIVE` — preview: vibrant colors, balloon motifs
  - `MINIMALIST` — preview: clean white, thin typography
  - `ROMANTIC` — preview: blush pink, floral watercolor
  - `MODERN` — preview: dark, geometric shapes
- Click to select (highlighted border), click again to preview full-screen
- "Далее →"

**Step 3 — Язык рассылки:**
- Two large radio cards side by side:
  - `🇷🇺 Русский` — "WhatsApp-сообщения будут отправляться на русском"
  - `🇰🇿 Қазақша` — "WhatsApp-хабарлар қазақ тілінде жіберіледі"
- Note: "Это язык автоматических сообщений, а не интерфейса"
- "Далее →"

**Step 4 — Проверка и создание:**
- Summary card: all filled fields
- "Создать мероприятие" button → `POST /api/v1/toys?organizerId={userId}` → navigate to new event's guest page

---

### 8.4 Event Overview `/events/{toyId}`

**Header:**
- Event title (editable inline on click)
- Date, location, template badge, language badge
- "Поделиться ссылкой" button → copies `https://toyla.app/{username}/{toyId}` to clipboard
- "Редактировать" → slide-over panel with edit form

**Stats row (4 cards):**
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 210      │ │ 124 🟢   │ │ 18 🔴    │ │ 68 🟡    │
│ Гостей   │ │ Приняли  │ │ Отказали │ │ Ожидают  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Quick actions:**
- "Управление гостями" → `/events/{toyId}/guests`
- "Расстановка мест" → `/events/{toyId}/seating`
- "Отправить приглашения" → inline confirm → `POST /api/v1/toys/{toyId}/notifications/send-invites`

**Auto-delete notice (if event is past):**
> ⏳ Это мероприятие будет автоматически удалено через **3 дня** вместе с данными гостей.

---

### 8.5 Guest Management `/events/{toyId}/guests`

**Toolbar:**
- Search input (client-side filter by name/phone)
- Filter tabs: `Все | Приняли | Отказали | Ожидают`
- "Добавить гостя" button (opens slide-over)
- Guest count chip: `210 / 500` (amber at 90%, red at 98%)

**Guest table columns:**
| # | Имя | Телефон | Мест | Статус | Стол | Действия |
|---|-----|---------|------|--------|------|---------|

- **Статус** badge: `ACCEPTED`=green, `DECLINED`=red, `PENDING`=amber
- **Стол**: table name or "—" if unassigned
- **Действия**: edit icon + delete icon (confirm dialog before delete)
- Row click → expand inline with full details + RSVP link copy button

**Add Guest slide-over:**
```
Имя *          [              ]
Фамилия *      [              ]
Телефон *      [+7            ]  (10-13 digits)
Количество мест [1            ]
                [Добавить гостя]
```
- Submit → `POST /api/v1/toys/{toyId}/guests`
- On 429: show sticky warning "Лимит добавления. Подождите 1 минуту." with countdown
- On 409 (500 guests reached): show permanent banner "Достигнут лимит 500 гостей"

---

### 8.6 Seating Builder `/events/{toyId}/seating`

**Layout (two-panel):**

**Left panel — Unassigned guests:**
- List of `DraggableGuestCard` components (only ACCEPTED guests)
- Each card: `[Name] [Party size chip]`
- Filter toggle: "Показать всех / Только без места"

**Right panel — Table canvas:**
- Visual grid of `DroppableTable` components
- Each table card:
  ```
  ┌──────────────────┐
  │  Стол «Алтын»    │
  │  ████████░░  8/10│
  │  [Guest list]    │
  └──────────────────┘
  ```
- Drag guest card onto table → `POST /api/v1/tables/{tableId}/guests/{guestId}`
- Drag guest out → `DELETE /api/v1/tables/{tableId}/guests/{guestId}`
- Capacity bar: green → amber at 80% → red at 100%
- Full table: dashed border, accepts no more drops

**Toolbar:**
- "Добавить стол" → dialog: name + capacity → `POST /api/v1/toys/{toyId}/tables`
- "Авторасстановка" → client-side algorithm: distribute ACCEPTED guests evenly

**Mobile fallback** (< 768px): replace drag-and-drop with dropdown selectors per guest row.

---

### 8.7 Template Customizer `/events/{toyId}/template`

**Left panel — template picker:**
- 5 thumbnail cards (same as create wizard)
- Selected template highlighted

**Right panel — live preview + settings:**
- Full iframe-like preview of what the invitation page looks like
- Below preview: tabbed customization form with three tabs: **Дизайн**, **Музыка**, **Таймер**

**Tab 1 — Дизайн:**
- Color pickers (hex input) for `primaryColor`, `backgroundColor`, `accentColor`
- Font selector (`serif` / `sans-serif` / `cursive`) — preview text updates live
- Greeting text textarea (overrides default per-template greeting)
- **Обложка (Cover Image):** URL input + thumbnail preview — renders as hero image at top of invitation page (`coverImageUrl`)
- **Фон страницы (Background Image):** URL input — renders as full-page CSS `background-image` (`backgroundImageUrl`); show opacity slider so text remains readable (stored as separate CSS override)
- **Галерея фото (Photo Gallery):** up to 5 URL inputs rendered as a horizontal scrollable strip near the bottom of the invitation page (`galleryImages`); drag to reorder; "Добавить фото +" button appends a new input row; trash icon removes row

> **Image hosting note (for the AI building this):** The backend does not have a file upload endpoint in V1. Organizers paste direct image URLs (e.g. from Google Drive "anyone with link" share → direct link, or any CDN). Add a helper tooltip: "Нужна прямая ссылка на изображение (заканчивающаяся на .jpg, .png, .webp и т.д.)"

**Tab 2 — Музыка:**
```
┌─────────────────────────────────────────┐
│  🎵 Фоновая музыка                      │
│                                         │
│  Ссылка на аудио                        │
│  [https://...                        ]  │
│  Поддерживаются: MP3, AAC, OGG, WAV    │
│                                         │
│  [✓] Автовоспроизведение при открытии  │
│  [✓] Повтор (loop)                     │
│  Громкость: ────●────────────  50%     │
│                                         │
│  [▶ Прослушать]  [✗ Удалить музыку]   │
└─────────────────────────────────────────┘
```
- `musicUrl` input — paste any direct audio URL
- Autoplay checkbox (`musicAutoplay`) — **off by default** (browsers block autoplay without interaction)
- When autoplay is off: show a floating "▶" play button on the public page, bottom-right corner
- Loop toggle (`musicLoop`)
- Volume slider 0–100% (`musicVolume`, stored as 0.0–1.0)
- "Прослушать" plays audio inline in the dashboard preview
- Validation: must be a URL ending in `.mp3 | .ogg | .aac | .wav | .m4a` or a known streaming embed URL

**Tab 3 — Таймер:**
```
┌─────────────────────────────────────────┐
│  ⏱ Обратный отсчёт                     │
│                                         │
│  [✓] Показывать таймер на странице      │
│                                         │
│  Целевая дата/время                     │
│  [14.06.2025 18:00      ] (из события) │
│  ☑ Использовать дату мероприятия        │
│                                         │
│  Стиль отображения                      │
│  ● Minimal   ○ Elegant   ○ Festive     │
│                                         │
│  Положение                              │
│  ● Вверху   ○ Внизу   ○ Плавающий     │
└─────────────────────────────────────────┘
```
- Enable/disable toggle (`countdownEnabled`)
- Target date/time picker — pre-filled from `toy.eventDate`, overridable (`countdownTargetDate`)
- "Использовать дату мероприятия" checkbox — when checked, `countdownTargetDate` is omitted from JSON (backend date is canonical)
- Style selector: `minimal` / `elegant` / `festive`
- Position selector: `top` / `bottom` / `floating` (floating = fixed corner overlay)
- Live preview updates immediately in the right panel

**Save:**
- "Сохранить" → `PATCH /api/v1/toys/{toyId}/template` with full `TemplateSettings` JSON
- All three tabs merge into a single object — partial saves not supported
- Changes apply to the public page immediately after save

---

### 8.8 Notification Logs `/events/{toyId}/notifications`

**Action buttons row:**
- "📨 Отправить приглашения" → confirm dialog → `POST` trigger (stub endpoint)
- Status: shows last sent time if available

**Timeline list:**

Each row:
```
[INITIAL_INVITE] Айгерим Сейткали · +77771234567 · 14 июн 14:32 · [DELIVERED 🟢]
[REMINDER_24H]   Данияр Аленов   · +77019876543 · 14 июн 14:34 · [FAILED 🔴]
[MORNING_SEATING] ...                                             · [PENDING 🟡]
[ERROR]          ...                                              · [ERROR 🟠]
```

- Filterable by type and delivery status
- Delivery status chips: `DELIVERED`=green, `FAILED`=red, `PENDING`=amber, `ERROR`=orange
- Notification type labels:
  - `INITIAL_INVITE` → "Приглашение"
  - `REMINDER_24H` → "Напоминание (24ч)"
  - `MORNING_SEATING` → "Место за столом"

---

### 8.9 Settings `/settings`

- Update `name`, `lastName`, `username`
- Read-only: phone number (identity)
- Username validation: `/^[a-z0-9_]{3,30}$/` + check uniqueness
- Profile URL preview: `toyla.app/@{username}`
- "Сохранить" → `PUT /api/v1/users/{userId}` (implement when endpoint exists)

---

## 9. Public Invitation Landing Page `/{username}/{toyId}`

This is the **most important page** — it's what guests see.

### Data fetch
```typescript
// Server component (SSR for SEO + OG meta)
const event = await fetch(`/api/v1/public/events/${username}/${toyId}`)
// Returns PublicToyResponse or 404
```

### OG meta tags
```html
<title>{event.title} — Toyla.app</title>
<meta property="og:title" content="{event.title}" />
<meta property="og:description" content="{event.description}" />
<meta property="og:image" content="https://toyla.app/og/{toyId}" />
```

### URL params
```
/{username}/{toyId}?token={rsvpToken}
```
- If `?token` present: show RSVP buttons
- If absent: show read-only view ("Вы уже ответили или ссылка недействительна")

### RSVP action
```typescript
POST /api/v1/rsvp/{rsvpToken}?status=ACCEPTED
POST /api/v1/rsvp/{rsvpToken}?status=DECLINED
```
- On success: hide buttons, show confirmation screen with animation
- On 404: "Ссылка недействительна или истекла"
- `rsvpToken` must **never** be logged, stored in state, or included in analytics events

---

## 10. Template Components

Each template is a standalone React component receiving `PublicToyResponse` + `TemplateSettings`.

```typescript
interface TemplateProps {
  event: PublicToyResponse
  rsvpToken: string | null
  onRsvp: (status: 'ACCEPTED' | 'DECLINED') => Promise<void>
  isSubmitting: boolean
  submitted: boolean
}
```

Every template renders two optional overlay widgets driven by `event.templateSettings`:

**`<BackgroundMusicPlayer />`** — mounts when `templateSettings.musicUrl` is set:
- If `musicAutoplay: true` — starts playback immediately on mount (hidden, no UI). Because browsers block autoplay until user interaction, wrap in a `useEffect` that catches the `NotAllowedError` and falls back to the floating button.
- If `musicAutoplay: false` (default) — renders a fixed `bottom-4 right-4` floating button: `▶` icon in a semi-transparent pill. First click starts audio, icon flips to `⏸`. Second click pauses. Respects `musicLoop` and `musicVolume`.
- Volume is set once on `<audio>` element creation — no UI slider on the guest page.
- Cleans up `<audio>` element on unmount.

```typescript
// components/shared/BackgroundMusicPlayer.tsx
interface BackgroundMusicPlayerProps {
  url: string
  autoplay?: boolean
  loop?: boolean
  volume?: number        // 0.0–1.0
}
```

**`<EventCountdown />`** — mounts when `templateSettings.countdownEnabled === true`:
- Target: `templateSettings.countdownTargetDate ?? event.eventDate`
- Ticks every second, format: `DD дней HH:MM:SS` or locale-aware equivalent
- When target has passed: renders "Мероприятие уже состоялось 🎉" — no negative countdown
- Position controlled by `countdownPosition`:
  - `top` — sticky strip at top of page, above all template content
  - `bottom` — sticky strip at bottom of page
  - `floating` — fixed `bottom-20 left-4` card (above music button if both present)
- Style variants:
  - `minimal` — plain monospace digits, no background
  - `elegant` — gold/cream card with label text: "До торжества осталось"
  - `festive` — vibrant card, each time unit in its own colored box with label

```typescript
// components/shared/EventCountdown.tsx
interface EventCountdownProps {
  targetDate: string      // ISO-8601
  style?: 'minimal' | 'elegant' | 'festive'
  position?: 'top' | 'bottom' | 'floating'
  locale: 'ru' | 'kk'
}
```

Both widgets are rendered inside each template component, just before the closing wrapper div:

```tsx
// Inside every template component (example):
return (
  <div className="template-wrapper"
       style={{ backgroundImage: settings.backgroundImageUrl
                  ? `url(${settings.backgroundImageUrl})` : undefined }}>

    {settings.countdownEnabled && settings.countdownPosition === 'top' && (
      <EventCountdown targetDate={settings.countdownTargetDate ?? event.eventDate}
                      style={settings.countdownStyle} position="top" locale={locale} />
    )}

    {/* Cover hero image */}
    {settings.coverImageUrl && (
      <img src={settings.coverImageUrl} alt={event.title}
           className="w-full max-h-64 object-cover rounded-xl mb-6" />
    )}

    {/* ... template-specific content ... */}

    {/* Photo gallery strip */}
    {settings.galleryImages && settings.galleryImages.length > 0 && (
      <div className="flex gap-3 overflow-x-auto py-2 mt-8">
        {settings.galleryImages.map((url, i) => (
          <img key={i} src={url} alt="" className="h-32 w-40 object-cover rounded-lg flex-shrink-0" />
        ))}
      </div>
    )}

    {settings.countdownEnabled && settings.countdownPosition !== 'top' && (
      <EventCountdown targetDate={settings.countdownTargetDate ?? event.eventDate}
                      style={settings.countdownStyle} position={settings.countdownPosition}
                      locale={locale} />
    )}
    {settings.musicUrl && (
      <BackgroundMusicPlayer url={settings.musicUrl} autoplay={settings.musicAutoplay}
                             loop={settings.musicLoop} volume={settings.musicVolume} />
    )}
  </div>
)
```

---

### ELEGANT
- Background: `#FDF8F0` (warm cream)
- Accent: `#C9A84C` (gold)
- Font: Playfair Display (headings) + Lora (body)
- Gold ornamental dividers (SVG)
- Envelope open animation on page load
- Date displayed in full: `суббота, 14 июня 2025 в 18:00`

### FESTIVE
- Background: `#1a1a2e` dark gradient
- Accent: `#FF6B6B` + `#FFE66D`
- Font: Montserrat Bold
- Confetti particle animation (canvas-based, 3s on load)
- Bouncy entrance animations on each section

### MINIMALIST
- Background: `#FFFFFF`
- Text: `#111111`
- Font: Inter Light
- No decorations — pure typography
- Single horizontal rule divider
- Monospace date format: `14.06.2025 / 18:00`

### ROMANTIC
- Background: linear-gradient blush pink to rose `#FFF0F3 → #FFDDE1`
- Accent: `#C9184A`
- Font: Cormorant Garamond Italic (headings) + Nunito (body)
- Watercolor flower SVG corner decorations (static)
- Soft parallax on scroll (background moves slower than content)

### MODERN
- Background: `#0F0F0F`
- Text: `#FFFFFF`
- Accent: `#8B5CF6` (violet — the Toyla brand)
- Font: Space Grotesk
- Geometric SVG accent shapes (circles, rectangles)
- Slide-up entrance animations (staggered, Framer Motion)

### RSVP Buttons (all templates)

```
┌──────────────────────┐  ┌──────────────────────┐
│  ✓  Приду / Келемін  │  │  ✗  Не смогу / Бармаймын │
└──────────────────────┘  └──────────────────────┘
```

**Accepted confirmation:**
- Full-screen overlay with confetti burst + checkmark animation
- Text (RU): "Отлично! Ждём вас на празднике! 🎉"
- Text (KZ): "Тамаша! Тойда сізді күтеміз! 🎉"

**Declined confirmation:**
- Soft fade overlay
- Text (RU): "Жаль, что не получится. Спасибо за ответ 💙"
- Text (KZ): "Өкінішті. Жауап бергеніңізге рахмет 💙"

---

## 11. i18n Setup

```
messages/
├── ru.json     # Russian (default)
└── kk.json     # Kazakh
```

**Dashboard UI language** = user preference (toggle in header).
**WhatsApp message language** = `toy.language` field (set per event, not related to UI language).

```json
// messages/ru.json (key examples)
{
  "auth.title": "Войдите в Toyla.app",
  "auth.phone.label": "Номер телефона",
  "auth.otp.label": "Код из WhatsApp",
  "auth.otp.submit": "Войти",
  "auth.otp.resend": "Отправить снова через {seconds}с",
  "auth.error.too_many": "Слишком много попыток. Повторите через 1 час.",
  "dashboard.title": "Мои мероприятия",
  "event.guests.limit": "Достигнут лимит {max} гостей",
  "event.guests.rate_limit": "Лимит добавления. Подождите {seconds}с.",
  "event.delete.warning": "Будет удалено через {days} дн.",
  "rsvp.accepted": "Отлично! Ждём вас на празднике! 🎉",
  "rsvp.declined": "Жаль, что не получится. Спасибо за ответ 💙",
  "template.ELEGANT": "Элегантный",
  "template.FESTIVE": "Праздничный",
  "template.MINIMALIST": "Минималист",
  "template.ROMANTIC": "Романтический",
  "template.MODERN": "Современный",
  "language.RUSSIAN": "🇷🇺 Русский",
  "language.KAZAKH": "🇰🇿 Қазақша",
  "template.tab.design": "Дизайн",
  "template.tab.music": "Музыка",
  "template.tab.timer": "Таймер",
  "music.label": "Фоновая музыка",
  "music.url.placeholder": "https://... (MP3, AAC, OGG, WAV)",
  "music.autoplay": "Автовоспроизведение при открытии",
  "music.loop": "Повтор (loop)",
  "music.volume": "Громкость",
  "music.preview": "Прослушать",
  "music.remove": "Удалить музыку",
  "countdown.label": "Обратный отсчёт",
  "countdown.enable": "Показывать таймер на странице",
  "countdown.target": "Целевая дата/время",
  "countdown.useEventDate": "Использовать дату мероприятия",
  "countdown.style.minimal": "Minimal",
  "countdown.style.elegant": "Elegant",
  "countdown.style.festive": "Festive",
  "countdown.position.top": "Вверху",
  "countdown.position.bottom": "Внизу",
  "countdown.position.floating": "Плавающий",
  "countdown.expired": "Мероприятие уже состоялось 🎉",
  "image.cover": "Обложка",
  "image.background": "Фон страницы",
  "image.gallery": "Галерея фото",
  "image.gallery.add": "Добавить фото +",
  "image.url.hint": "Нужна прямая ссылка на изображение (.jpg, .png, .webp и т.д.)"
}
```

```json
// messages/kk.json (key examples)
{
  "auth.title": "Toyla.app-қа кіріңіз",
  "auth.phone.label": "Телефон нөмірі",
  "auth.otp.label": "WhatsApp коды",
  "auth.otp.submit": "Кіру",
  "dashboard.title": "Менің іс-шараларым",
  "rsvp.accepted": "Тамаша! Тойда сізді күтеміз! 🎉",
  "rsvp.declined": "Өкінішті. Жауап бергеніңізге рахмет 💙",
  "countdown.expired": "Іс-шара өтіп кетті 🎉"
}
```

---

## 12. Error Handling

```typescript
// lib/handleApiError.ts
export function handleApiError(err: unknown, fallback = 'Что-то пошло не так') {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const data = err.response?.data

    if (status === 401) {
      useAuthStore.getState().clearAuth()
      router.push('/login')
      return
    }
    if (status === 403) { toast.error('Доступ запрещён'); return }
    if (status === 404) { toast.error('Не найдено'); return }
    if (status === 409) { toast.error(data?.error ?? 'Конфликт'); return }
    if (status === 429) {
      const retryAfter = err.response?.headers['retry-after'] ?? 60
      toast.error(`Лимит запросов. Повторите через ${retryAfter}с`)
      return
    }
    if (data?.errors) {
      // Validation errors
      Object.values(data.errors).forEach(msg => toast.error(msg as string))
      return
    }
    toast.error(data?.error ?? fallback)
  }
}
```

---

## 13. Design System

```css
/* Colors */
--color-brand:       #8B5CF6;   /* Violet — primary brand */
--color-brand-light: #EDE9FE;
--color-accent:      #F59E0B;   /* Amber */
--color-success:     #10B981;
--color-warning:     #F59E0B;
--color-danger:      #EF4444;
--color-bg:          #FAFAFA;
--color-surface:     #FFFFFF;
--color-border:      #E5E7EB;
--color-text:        #111827;
--color-muted:       #6B7280;

/* Typography */
--font-ui:      'Inter', sans-serif;
--font-display: 'Playfair Display', serif;  /* Event titles */

/* Spacing — 4px grid */
/* Radius */
--radius-sm: 6px;
--radius-md: 12px;    /* Cards */
--radius-lg: 16px;    /* Modals */
--radius-full: 9999px; /* Badges, pills */

/* Shadows */
--shadow-card:  0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04);
--shadow-modal: 0 16px 48px rgba(0,0,0,0.12);

/* Animation */
--duration-fast:   150ms;
--duration-normal: 250ms;
--duration-slow:   400ms;
--ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);
```

**Delivery status chip colors:**
```typescript
const statusColors: Record<DeliveryStatus, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED:    'bg-red-100 text-red-700',
  PENDING:   'bg-amber-100 text-amber-700',
  ERROR:     'bg-orange-100 text-orange-700',
}
```

**RSVP status badge colors:**
```typescript
const rsvpColors: Record<RsvpStatus, string> = {
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  PENDING:  'bg-amber-100 text-amber-700',
}
```

---

## 14. Middleware (Route Protection)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('toyla_token')?.value
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isLogin = request.nextUrl.pathname === '/login'

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isLogin && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
```

---

## 15. Key UX Constraints

- **No passwords anywhere** — never render a password field
- **Loading skeletons** not spinners for all list/table fetches
- **Optimistic updates** for RSVP status changes and seating assignments
- **Mobile-first** — organizers work from phone; all pages must be fully usable at 375px
- **Max guests badge** turns red at 475+ (`>= 95%`) not 450+
- **Event auto-delete countdown** shown on dashboard cards if `eventDate < now`
- **RSVP token** must never be stored in Zustand, logged to console, or sent to analytics
- **WhatsApp link format**: `https://wa.me/{phone}` opens chat; use for support links only
- **Confirm dialogs** before: delete guest, delete table, delete event, send invites (irreversible)
- **Empty states** with SVG illustration + primary CTA for: no events, no guests, no tables, no logs

---

## 16. Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=https://toyla.app

# Server-only (Next.js route handlers)
JWT_COOKIE_NAME=toyla_token
JWT_COOKIE_MAX_AGE=86400
```

---

## 17. Folder Structure

```
src/
├── app/                      # Next.js App Router
├── components/
│   ├── ui/                   # shadcn/ui primitives (auto-generated)
│   ├── auth/                 # PhoneInput, OtpInput, LoginCard
│   ├── dashboard/            # EventCard, Sidebar, DashboardHeader
│   ├── event/                # EventStats, EventForm, EventBadge
│   ├── guests/               # GuestTable, GuestRow, AddGuestForm, RateLimitBanner
│   ├── seating/              # TableCard, DraggableGuest, SeatingCanvas
│   ├── notifications/        # LogRow, DeliveryBadge, SendTriggerButton
│   ├── templates/            # ElegantTemplate, FestiveTemplate, MinimalistTemplate, RomanticTemplate, ModernTemplate
│   └── shared/               # ConfirmDialog, EmptyState, LoadingSkeleton, LanguageToggle,
│                             # BackgroundMusicPlayer, EventCountdown, PhotoGallery, CoverImage
├── hooks/
│   ├── useAuth.ts
│   ├── useToys.ts
│   ├── useGuests.ts
│   ├── useSeating.ts
│   ├── useNotifications.ts
│   └── useTemplateSettings.ts    # Local state + PATCH mutation for template customizer
├── lib/
│   ├── api.ts                # Axios instance + interceptors
│   ├── handleApiError.ts
│   └── formatters.ts         # Date, phone, status → display string
├── store/
│   ├── auth.store.ts
│   └── ui.store.ts
├── types/
│   └── index.ts              # All TypeScript interfaces from Section 3
└── messages/
    ├── ru.json
    └── kk.json
```
