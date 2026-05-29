# Toyla.app — Frontend Integration Guide

## Stack

```
Next.js (App Router, TypeScript)
Tailwind CSS v4, shadcn/ui
Zustand (auth state), TanStack Query v5
React Hook Form + Zod, Axios
next-intl (ru + kk), @dnd-kit/core, Framer Motion
```

---

## TypeScript Types

```typescript
// Enums
type RsvpStatus       = 'PENDING' | 'ACCEPTED' | 'DECLINED'
type NotificationType = 'INITIAL_INVITE' | 'REMINDER_24H' | 'MORNING_SEATING'
type DeliveryStatus   = 'PENDING' | 'DELIVERED' | 'FAILED' | 'ERROR'
type EventTemplate    = 'ELEGANT' | 'FESTIVE' | 'MINIMALIST' | 'ROMANTIC' | 'MODERN'
type MessageLanguage  = 'RUSSIAN' | 'KAZAKH'

// Auth
interface AuthResponse {
  id: number        // userId — используй как organizerId во всех запросах
  username: string
  token: string     // JWT, живёт 24 часа
}

// Toy (Response DTO — только нужные поля, без ORM-связей)
interface TemplateSettings {
  primaryColor?: string
  backgroundColor?: string
  backgroundImageUrl?: string
  coverImageUrl?: string
  galleryImages?: string[]
  fontFamily?: 'serif' | 'sans-serif' | 'cursive'
  greetingText?: string
  accentColor?: string
  musicUrl?: string
  musicAutoplay?: boolean
  musicLoop?: boolean
  musicVolume?: number        // 0.0–1.0
  countdownEnabled?: boolean
  countdownTargetDate?: string
  countdownStyle?: 'minimal' | 'elegant' | 'festive'
  countdownPosition?: 'top' | 'bottom' | 'floating'
}

interface ToyResponse {
  id: string                   // UUID
  title: string
  description: string
  eventDate: string            // "2025-06-14T18:00:00" — без timezone
  locationName: string | null
  gisLink: string | null
  templateId: EventTemplate
  language: MessageLanguage
  templateSettings: TemplateSettings | null
}

// Guest (Response DTO)
interface GuestResponse {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  status: RsvpStatus
  partySize: number
  rsvpToken: string            // UUID — НИКОГДА не показывай в UI, только в WhatsApp-ссылках
  seatingTableId: number | null
}

// SeatingTable (Response DTO)
interface SeatingTableResponse {
  id: number
  name: string
  capacity: number
  toyId: string                // UUID мероприятия
  guests: GuestResponse[]
}

// Public event page
interface PublicToyResponse {
  id: string
  title: string
  description: string
  eventDate: string
  locationName: string | null
  gisLink: string | null
  templateId: EventTemplate
  templateSettings: TemplateSettings | null
  organizerDisplayName: string
}
```

---

## Auth Flow

Единственный способ входа — **OTP через WhatsApp**. Пароля нет.

После успешного `verify-otp`:
1. Сохрани `token` — в Zustand + httpOnly cookie
2. Сохрани `id` как `userId` — он нужен как `organizerId` во всех запросах
3. Сохрани `username` — для публичных ссылок `/[username]/[toyId]`

При первом входе аккаунт создаётся автоматически с именем `u_XXXXXXXX` (последние 8 цифр номера).

---

## API Reference

Base URL: `NEXT_PUBLIC_API_URL` (например `http://localhost:8080`)

Все защищённые запросы: `Authorization: Bearer <token>`

---

### 🔐 Auth — без токена

#### Запросить OTP

```
POST /api/v1/auth/request-otp
Body: { phoneNumber: string }   // 10–13 цифр, без "+" и пробелов
```

```
→ 200: { message: "OTP sent to your WhatsApp" }
→ 400: { errors: { phoneNumber: "..." } }   // валидация номера
→ 429: { error: "..." }                     // 3 запроса/час с номера, 10/час с IP
```

#### Войти по OTP

```
POST /api/v1/auth/verify-otp
Body: { phoneNumber: string, code: string }   // code — 6 цифр
```

```
→ 200: AuthResponse   // { id, username, token }
→ 400: { error: "Неверный или устаревший код / Қате немесе ескірген код" }
       Причины: неверный код, просрочен (5 мин), превышено 5 попыток
```

---

### 🎊 Events (Toys) — требует JWT

#### Создать мероприятие

```
POST /api/v1/toys?organizerId={userId}
Body: ToyRequest
→ 201: ToyResponse
→ 400: { errors: { ... } }   // не заполнены title/description/eventDate/templateId
→ 404: { error: "User not found" }
```

**ToyRequest:**
```typescript
{
  title: string           // обязательно
  description: string     // обязательно
  eventDate: string       // "2025-06-14T18:00:00" — LocalDateTime, БЕЗ "Z" и timezone
  locationName?: string
  gisLink?: string
  templateId: EventTemplate    // обязательно: ELEGANT | FESTIVE | MINIMALIST | ROMANTIC | MODERN
  language?: MessageLanguage   // RUSSIAN (по умолч.) | KAZAKH
  templateSettings?: Record<string, unknown>
}
```

#### Список мероприятий организатора

```
GET /api/v1/toys?organizerId={userId}
→ 200: ToyResponse[]
```

#### Получить мероприятие

```
GET /api/v1/toys/{toyId}
→ 200: ToyResponse
→ 404: { error: "Toy not found: ..." }
```

#### Обновить мероприятие

```
PUT /api/v1/toys/{toyId}
Body: ToyRequest   // те же поля, те же обязательные
→ 200: ToyResponse
```

#### Обновить настройки шаблона

```
PATCH /api/v1/toys/{toyId}/template
Body: Record<string, unknown>   // произвольный JSON
→ 200: ToyResponse
```

#### Удалить мероприятие

```
DELETE /api/v1/toys/{toyId}
→ 204
```

---

### 👥 Guests — требует JWT

#### Добавить гостя

```
POST /api/v1/toys/{toyId}/guests
Body: GuestRequest
→ 201: GuestResponse
→ 400: { errors: { ... } }
→ 403: { error: "..." }   // вы не организатор
→ 409: { error: "Event has reached the maximum guest capacity of 500" }
→ 429: { error: "..." }   // 100 запросов/мин
```

**GuestRequest:**
```typescript
{
  firstName: string    // обязательно
  lastName: string     // обязательно
  phoneNumber: string  // обязательно, 10–13 цифр — на этот номер придёт WhatsApp
  partySize?: number   // по умолч. 1, должно быть > 0
}
```

> После добавления гостя сервер автоматически отправит WhatsApp-приглашение с RSVP-ссылкой (асинхронно).

#### Список гостей

```
GET /api/v1/toys/{toyId}/guests
GET /api/v1/toys/{toyId}/guests?status=ACCEPTED   // фильтр: PENDING | ACCEPTED | DECLINED
→ 200: GuestResponse[]
```

#### Получить гостя

```
GET /api/v1/guests/{id}
→ 200: GuestResponse
→ 404: { error: "Guest not found: ..." }
```

#### Обновить гостя

```
PUT /api/v1/guests/{id}
Body: GuestRequest
→ 200: GuestResponse
```

#### Удалить гостя

```
DELETE /api/v1/guests/{id}
→ 204
```

---

### 🪑 Seating — требует JWT

#### Создать стол

```
POST /api/v1/toys/{toyId}/tables
Body: { name: string, capacity: number }   // capacity >= 1
→ 201: SeatingTableResponse
→ 400: { errors: { ... } }
```

#### Список столов мероприятия

```
GET /api/v1/toys/{toyId}/tables
→ 200: SeatingTableResponse[]   // каждый стол включает guests[]
```

#### Получить стол

```
GET /api/v1/tables/{id}
→ 200: SeatingTableResponse
→ 404: { error: "Table not found: ..." }
```

#### Изменить вместимость

```
PATCH /api/v1/tables/{id}/capacity?capacity={number}
→ 200: SeatingTableResponse
```

#### Посадить гостя за стол

```
POST /api/v1/tables/{tableId}/guests/{guestId}
→ 200: SeatingTableResponse   // guests[] обновлён
```

#### Убрать гостя со стола

```
DELETE /api/v1/tables/{tableId}/guests/{guestId}
→ 204   // гость остаётся в БД, просто открепляется от стола
```

#### Удалить стол

```
DELETE /api/v1/tables/{id}
→ 204
```

---

### 🌐 Public — без токена

```
GET /api/v1/public/events/{username}/{toyId}
→ 200: PublicToyResponse
→ 404: { error: "Event not found" }
```

---

### 🤝 RSVP — без токена

Гость нажимает на ссылку из WhatsApp — ты формируешь URL:

```
https://toyla.app/{username}/{toyId}?token={rsvpToken}
```

Фронт показывает страницу мероприятия и кнопки «Приду» / «Не приду». При клике:

```
POST /api/v1/rsvp/{rsvpToken}?status=ACCEPTED
POST /api/v1/rsvp/{rsvpToken}?status=DECLINED
→ 200: GuestResponse   // status обновлён
→ 404: { error: "Invalid RSVP token" }
```

---

## ❌ Что НЕ реализовано (нет эндпоинтов)

| Действие                         | Статус                                          |
|----------------------------------|--------------------------------------------------|
| Ручная отправка уведомлений      | Уведомления уходят **автоматически по расписанию** |
| Просмотр логов уведомлений       | API недоступен                                   |
| Редактирование профиля / username| API недоступен                                   |
| Список участников по guestId     | Нет прямого эндпоинта (только через `/toys/{id}/guests`) |

---

## Error Handling

```typescript
// 400 — ошибки валидации (@Valid)
{ errors: { fieldName: "сообщение" } }

// 400, 401, 403, 404, 409, 429, 500 — всё остальное
{ error: "сообщение" }
```

```typescript
// lib/handleApiError.ts
export function handleApiError(err: unknown) {
  if (!axios.isAxiosError(err)) return
  const { status, data, headers } = err.response ?? {}

  if (status === 401) { clearAuth(); router.push('/login'); return }
  if (status === 403) { toast.error('Доступ запрещён'); return }
  if (status === 404) { toast.error('Не найдено'); return }
  if (status === 409) { toast.error(data?.error ?? 'Конфликт'); return }
  if (status === 429) {
    toast.error(`Лимит. Повторите через ${headers?.['retry-after'] ?? 60}с`)
    return
  }
  if (data?.errors) {
    Object.values(data.errors).forEach(m => toast.error(m as string))
    return
  }
  toast.error(data?.error ?? 'Что-то пошло не так')
}
```

---

## Axios Instance

```typescript
// lib/api.ts
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    useAuthStore.getState().clearAuth()
    window.location.href = '/login'
  }
  return Promise.reject(err)
})
```

---

## State

```typescript
// store/auth.store.ts
interface AuthStore {
  token: string | null
  userId: number | null    // из AuthResponse.id — используй как organizerId
  username: string | null  // для /[username]/[toyId] публичных ссылок
  setAuth: (res: AuthResponse) => void
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

TanStack Query keys:
```typescript
export const queryKeys = {
  toys:           (userId: number)                  => ['toys', userId],
  toy:            (id: string)                      => ['toy', id],
  guests:         (toyId: string)                   => ['guests', toyId],
  guestsByStatus: (toyId: string, s: RsvpStatus)    => ['guests', toyId, s],
  tables:         (toyId: string)                   => ['tables', toyId],
  publicEvent:    (username: string, toyId: string) => ['public', username, toyId],
}
```

---

## Routes

```
/login                          — ввод номера → OTP
/dashboard                      — список мероприятий
/events/new                     — визард создания
/events/[toyId]                 — overview
/events/[toyId]/guests          — управление гостями
/events/[toyId]/seating         — рассадка за столами
/events/[toyId]/template        — кастомизация шаблона
/settings                       — профиль (username readonly, API нет)
/[username]/[toyId]             — публичная страница (SSR + RSVP)
```

Middleware защищает `/dashboard/**` — редирект на `/login` если нет `toyla_token` cookie.

---

## Login Page

Только WhatsApp OTP — никаких паролей.

```
Шаг 1: Ввод номера телефона (без +)
        → POST /api/v1/auth/request-otp
        → Если 200: переходим на шаг 2
        → Если 429: показываем таймер (retry-after секунд)

Шаг 2: Ввод 6-значного кода
        → POST /api/v1/auth/verify-otp
        → Если 200: сохраняем токен, редирект /dashboard
        → Если 400: "Неверный код. Попробуйте ещё раз."
        → Кнопка "Отправить заново" через 60 сек
```

```typescript
// После успешного verify-otp:
await fetch('/api/auth/set-token', { method: 'POST', body: JSON.stringify({ token }) })
useAuthStore.getState().setAuth(authResponse)
router.push('/dashboard')
```

---

## Public Page `/{username}/{toyId}`

SSR fetch:
```typescript
const event = await fetch(`${API_URL}/api/v1/public/events/${username}/${toyId}`)
  .then(r => r.ok ? r.json() : null)
```

URL params: `?token={rsvpToken}` — если есть, показывать кнопки RSVP.

RSVP кнопки:
```typescript
POST /api/v1/rsvp/{rsvpToken}?status=ACCEPTED   // «Приду»
POST /api/v1/rsvp/{rsvpToken}?status=DECLINED   // «Не приду»
```

---

## Design Tokens

```css
--color-brand: #8B5CF6;
--color-accent: #F59E0B;
--color-success: #10B981;
--color-danger: #EF4444;
--color-bg: #FAFAFA;
--color-surface: #FFFFFF;
--color-border: #E5E7EB;
--color-text: #111827;
--color-muted: #6B7280;
--font-ui: 'Inter', sans-serif;
--radius-md: 12px;
--radius-lg: 16px;
```

Статус гостя: `ACCEPTED`=green, `DECLINED`=red, `PENDING`=amber.  
Доставка: `DELIVERED`=green, `FAILED`=red, `PENDING`=amber, `ERROR`=orange.

---

## Templates

Каждый шаблон — React-компонент, принимает `PublicToyResponse + TemplateSettings`.

Все шаблоны рендерят два опциональных виджета:
- `<BackgroundMusicPlayer url musicAutoplay musicLoop musicVolume />` — если `musicUrl` задан
- `<EventCountdown targetDate style position locale />` — если `countdownEnabled: true`

Шаблоны: `ELEGANT` (cream/gold), `FESTIVE` (dark/neon), `MINIMALIST` (white/typography), `ROMANTIC` (blush pink), `MODERN` (dark/violet).

---

## Env

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=https://toyla.app
JWT_COOKIE_NAME=toyla_token
JWT_COOKIE_MAX_AGE=86400
```
