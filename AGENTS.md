<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Studio Bot — Architecture

## What this app is

Studio Bot helps users automatically book their favorite workout classes. Currently it fetches and displays class schedules from Fuze House (a fitness studio in Tribeca, NYC) and lets users save favorites. Auto-booking is a future goal.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack default) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` syntax — not v3) |
| CSS processing | `@tailwindcss/postcss` via `postcss.config.mjs` |
| Runtime | React 19 |
| Data persistence | `localStorage` only — no database yet |
| External API | Mariana Tek (fitness studio SaaS) |

**Tailwind v4 note for agents:** There is no `tailwind.config.js`. Configuration is done in CSS via `@theme`, `@source`, etc. The `content` array does not exist. Read `node_modules/next/dist/docs/` before touching CSS setup.

---

## File structure

```
app/
  layout.tsx                        # Root layout — Geist font, globals.css import
  globals.css                       # Tailwind import + @source directive + CSS vars
  page.tsx                          # Homepage — server component, renders FuzeSchedule
  favorites/
    page.tsx                        # Favorites page — server component, renders FavoritesList
  components/
    FuzeSchedule.tsx                # Client component — full schedule UI with day picker
    FavoritesList.tsx               # Client component — filtered list of favorited classes
  api/
    schedules/
      fuze-house/
        route.ts                    # Route handler — proxies Mariana Tek API
```

---

## Data flow

### Schedule page (`/`)

```
app/page.tsx (server)
  └── fetch("http://localhost:3000/api/schedules/fuze-house", cache: no-store)
        └── app/api/schedules/fuze-house/route.ts
              └── fetch(marianatek.com/api/customer/v1/classes?...)
  └── <FuzeSchedule classes={classes} /> (client)
        └── localStorage("fuze-favorites") — read/write favoriteIds
```

### Favorites page (`/favorites`)

```
app/favorites/page.tsx (server)
  └── fetch("http://localhost:3000/api/schedules/fuze-house", cache: no-store)
  └── <FavoritesList classes={classes} /> (client)
        └── localStorage("fuze-favorites") — read favoriteIds, filter classes
```

---

## Shared data shape

`StudioClass` is the internal type used by all components and pages. Defined locally in each file that uses it (no shared types file yet).

```ts
type StudioClass = {
  id: string;
  title: string;
  startsAt: string | null;        // ISO datetime string
  bookingStartsAt: string | null;
  duration: string | null;        // human-readable e.g. "45 min"
  instructor: string | null;
  room: string | null;
  availableSpots: number | null;
  capacity: number | null;
};
```

---

## Favorites — how they work

- Stored in `localStorage` under the key `"fuze-favorites"` as a JSON array of class `id` strings.
- `FuzeSchedule` owns read + write (toggle on/off).
- `FavoritesList` reads and can remove (unfavorite) but does not add.
- Both components guard against SSR hydration mismatch by gating localStorage access behind a `mounted` state (set in `useEffect`).
- There is no cross-tab sync or server persistence — localStorage only.

---

## API route — Mariana Tek proxy

`GET /api/schedules/fuze-house`

- Fetches 21 days of classes from `fuzehouse.marianatek.com` (location `48817`, region `48608`).
- Maps raw Mariana Tek shape → `StudioClass`.
- `cache: "no-store"` on both the internal fetch (in page/component) and the upstream fetch (in route handler).
- No authentication required for read access to Mariana Tek's public schedule API.

---

## Known quirks / active workarounds

- **Turbopack + Tailwind v4 directory-read bug:** When `@tailwindcss/postcss` scans for content, Turbopack tries to read `app/favorites` (a directory) as a file and panics. Workaround in `globals.css`:
  ```css
  @source "../**/*.{ts,tsx,js,jsx}";
  ```
  This replaces automatic source detection with an explicit glob that scans from the project root (one level up from `app/`). Do not remove this line. Using `./**` instead of `../` breaks scanning of files directly in `app/` (e.g. `layout.tsx`, `page.tsx`) because `**` may not match zero path segments.

- **`localhost` fetch in server components:** The favorites page and homepage fetch from `http://localhost:3000/api/...`. This works in local dev but will need to be replaced with an absolute production URL (or a direct function call) before deploying.

---

## What does NOT exist yet

- Authentication / user accounts
- Database — no persistence beyond localStorage
- Auto-booking
- Multiple studios (only Fuze House today)
- Shared `types.ts` file (types are duplicated across files)
- Navigation / header between pages
- Error boundaries or loading UI on the favorites page
