# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (HMR)
npm run build     # Production build → dist/
npm run lint      # ESLint checks
npm run preview   # Preview production build
```

## Architecture

**Stack:** React 19 + Vite 8 (with Oxc), JavaScript/JSX (no TypeScript). ESLint 9 flat config.

**Key dependencies:** `axios`, `react-router-dom` v7, `react-leaflet` + `leaflet` (map picker), `lucide-react` (icons).

**Backend:** Spring Boot at `http://localhost:8080/sportlink`. All responses are wrapped:
```json
{ "code": "...", "message": "...", "result": { ... } }
```

### Directory layout

```
src/
├── api/                    # Axios API modules (one file per domain)
│   ├── axiosConfig.js      # Base axios instance + interceptors
│   ├── authApi.js
│   ├── userApi.js          # Also contains admin endpoints (adminGetAllUsers, etc.)
│   ├── postApi.js
│   └── sportApi.js
├── components/
│   ├── common/
│   │   ├── Header.jsx      # Shared header used by all pages
│   │   ├── AuthModal.jsx   # Login/register modal
│   │   └── LocationPicker.jsx  # Leaflet map + Nominatim search for selecting a venue
│   ├── constants/
│   │   └── filterConfig.js # SPORT_CONFIG, SKILL_LEVELS, PLAY_FORMATS, POST_TYPES
│   └── post/
│       ├── PostCard.jsx    # Single post card UI
│       ├── PostList.jsx    # List of PostCards (no fake data — uses real API)
│       ├── FilterSidebar.jsx
│       └── CreatePostModal.jsx  # Modal to create a new post; opens LocationPicker
├── pages/
│   ├── HomePage.jsx
│   ├── SportPage.jsx       # Used by all sport/feed routes
│   ├── ProfilePage.jsx     # /profile/me and /profile/:userId
│   └── auth/
└── styles/                 # CSS per page/component (home.css, sport-page.css, auth.css,
                            # profile.css, auth-modal.css, create-post-modal.css,
                            # location-picker.css)
```

### Routes (App.jsx)

| Path | Component | Initial API called |
|---|---|---|
| `/` | HomePage | — |
| `/login`, `/register` | LoginPage, RegisterPage | — |
| `/auth/google/callback` | GoogleCallbackPage | OAuth redirect |
| `/home` | inline stub `<div>` | — |
| `/feed`, `/bong-da`, `/cau-long`, `/pickleball` | SportPage | `GET /api/posts/home` |
| `/tim-doi-thu` | SportPage | `GET /api/posts/find-rival` |
| `/tim-dong-doi` | SportPage | `GET /api/posts/find-team` |
| `/profile/me` | ProfilePage | `GET /api/users/me` |
| `/profile/:userId` | ProfilePage | `GET /api/users/{userId}` |

### Auth & Token handling

After login, stored in `localStorage`:
- `token` — JWT, auto-attached via axios request interceptor
- `user` — `{ userId, fullName, email, avatarUrl, role }`
- `userLat`, `userLng`, `userLocation` — from GPS detection on first login
- `geoAsked` — flag so GPS is only asked once

On 401, `axiosConfig.js` shows a session-expired popup with 3s countdown then clears all localStorage keys above and redirects to `/`.

### Header component

`Header` is shared across all pages. Key behaviours:
- Reads `user` and `isLoggedIn` from localStorage on every render — no prop drilling needed.
- Fetches `userApi.getMyInfo()` on mount for `age` and `trustScore` (displayed in dropdown).
- Fetches `sportApi.getMyFavoriteSports()` — displayed as read-only chips in dropdown.
- `onLoginClick` prop — only used by HomePage to open its `AuthModal`. Other pages omit it.
- Avatar priority: `userDetail?.avatarUrl || user.avatarUrl` (API result overrides stale localStorage).
- Avatar URL: relative paths (`/uploads/avatars/...`) get `http://localhost:8080/sportlink` prepended via `getAvatarSrc()` helper.

### SportPage & post components

**Initial load** — `useEffect([pathname])` checks `pathname` to call the right API:
- `/tim-doi-thu` → `postApi.getRivalPosts`
- `/tim-dong-doi` → `postApi.getTeamPosts`
- everything else → `postApi.getHomeFeed`

**`postType` filter** is pre-initialized from `pathname` (`find_rival` for `/tim-doi-thu`, `find_team` for `/tim-dong-doi`, empty otherwise) and can be changed by the user in the sidebar before searching.

**Search** — user clicks "Tìm kiếm" → calls `postApi.searchPosts(params)` with sidebar filter values.

**Reset** — calls `resetFilters()` which clears all filter state then re-calls the same initial API based on `pathname`.

**Client-side filtering** — `slotsFilter` (slot count range) and `searchText` (free-text on note/location/teamName/userFullName) are applied to `displayPosts` after the API response, not sent as API params. Everything else (`sportType`, `postType`, `skillLevel`, `playDate`, `timeFrom`, `playFormat`, `radiusKm`) goes to the API on search.

`PostList` accepts `posts`, `loading`, `onJoin` props. No fake data fallback — shows "Không có bài đăng" when empty.

`PostCard` label mappings use **lowercase** enum values from backend: `beginner`, `intermediate`, `advanced`, `don_nam`, `doi_nam`, `doi_nam_nu`, etc. `isOwner` prop shows Edit/Delete buttons; expired posts skip Edit. `isExpired` is checked against both `"expired"` and `"EXPIRED"` for safety.

### CreatePostModal

Opened from `SportPage` (+ button in header area). Manages its own form state via a `DEFAULT_FORM` object. Key details:
- Combines `playDate` + `playTime` into `LocalDateTime` string (`YYYY-MM-DDTHH:mm:00`) before sending to backend.
- Conditionally shows `playFormat` field only when `sportType` is `cau_long` or `pickleball` (mirrors `hasPlayFormat` from `SPORT_CONFIG`).
- On success, calls `onCreated(newPost)` so `SportPage` can prepend the new post to the list.
- Opens `LocationPicker` in an overlay when the venue button is clicked.

### LocationPicker

`src/components/common/LocationPicker.jsx` — Leaflet map with Nominatim geocoding.
- Default center: Hanoi `[21.028, 105.834]`.
- Search uses `https://nominatim.openstreetmap.org/search` with `countrycodes=vn`, debounced 400 ms.
- User can also click directly on the map to drop a pin (coordinates used as location name).
- Leaflet default icon fix applied at module level (Vite strips asset URLs from the default icon).
- Returns `{ locationName, locationLat, locationLng }` via `onSelect` callback.

### ProfilePage

- `isMe = !userId || userId === "me"` — determines own vs other profile.
- Other-user profiles (`!isMe`) fetch only profile info + sports; **posts are not fetched or shown** for other users.
- Own profile fetches profile, sports, and posts sequentially (sports/profile in `Promise.all`, then posts separately since posts are `isMe`-only).
- Edit profile modal: avatar upload, name, age, favorite sports with skill level.
- Edit post modal allows changing only `teamName`, `locationName`, `slotsTotal`, `skillLevel`, `note`. Fields `sportType`, `postType`, `playDate`, `playTime` are **immutable** after creation (not included in edit modal or `updatePost` call).
- `sportApi.replaceAllSports(editSports)` — replaces entire sports list on save. `editSports` items use `{ sportType, skillLevel }` both lowercase.
- Default skill level when toggling a new sport on is `"intermediate"` (set in `toggleSport`).

### Sports domain constants

Defined in `src/components/constants/filterConfig.js`:
- `SPORT_CONFIG` — maps URL slug (`bong-da`) → `{ sportType, label, title, desc, hasPlayFormat }`
- `hasPlayFormat: true` only for `cau-long` and `pickleball` — controls whether playFormat filter/tag renders
- `default` key used as fallback when slug doesn't match any sport (e.g. `/feed`)

### Avatar URL pattern

Backend stores local uploads as `/uploads/avatars/<filename>`. Google avatars are full `https://` URLs. Always use `getAvatarSrc(url)` helper before rendering `<img src>`:
```js
if (url.startsWith("http")) return url;          // Google
return `http://localhost:8080/sportlink${url}`;  // Local upload
```

### Backend enum values

All enums sent frontend → backend must be **lowercase**: `bong_da`, `cau_long`, `pickleball`, `beginner`, `intermediate`, `advanced`, `find_team`, `find_rival`, `don_nam`, `doi_nam`, `doi_nu`, `doi_nam_nu`. Spring will fail deserialization with uppercase values.

### ESLint

Uppercase variables allowed unused (component names/constants). Flat config in `eslint.config.js`.

### Testing

No test suite exists. There is no test runner configured — `package.json` has no `test` script.

## Memory files — đọc khi relevant

@.claude/memory/decisions.md
@.claude/memory/patterns.md
@.claude/memory/bugs-solved.md

## Session context

Đọc `.claude/memory/session-log.md` khi hỏi "đang làm gì" hoặc "hôm qua làm đến đâu".

## Compact Instructions

Khi compaction xảy ra, ưu tiên giữ lại:
1. Business logic decisions và lý do thay đổi
2. Các pattern/convention đã chốt (nhất là enum lowercase, avatar URL)
3. Những gì đang làm dở trong session này
4. Bugs đã gặp và cách fix
