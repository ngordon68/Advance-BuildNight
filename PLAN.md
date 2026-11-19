# PLAN.md — Nearby Gems

## Summary
Nearby Gems is a web app for locals who want to explore interesting places close to home. A short two-step questionnaire asks which kinds of places they enjoy (History & monuments, Art & culture, Nature & parks) and what vibe they're after (Quiet, Lively, or No preference). The app finds the user's location with the browser's geolocation (falling back to Chicago with an explanatory message if location is unavailable), queries OpenStreetMap's free Overpass API for matching landmarks within 2 km, and shows them as markers on a map. Clicking a marker opens a detail panel with name, category, distance, and links. Anyone can use the app as a guest; signing in with email + password (Supabase) saves questionnaire answers and lets the user favorite landmarks across devices. The final phase deploys it to Netlify.

## Decisions (from interview)
| Topic | Decision |
|---|---|
| Users | Locals exploring their own area |
| Platform | Web app, mobile-first responsive |
| Stack | Vite + React + TypeScript, Tailwind CSS, MapLibre GL via react-map-gl, React Router |
| Map tiles / data | OpenFreeMap vector styles (`liberty` light, `fiord` blue-gray dark; no key); Overpass API for landmarks (no key) |
| Search radius | Fixed 2 km |
| No location | Banner explaining how to enable location; map centers on Chicago (41.8781, -87.6298) |
| Questionnaire | Step 1: categories (multi-select, ≥1 required). Step 2: vibe (Quiet / Lively / No preference) |
| Vibe mapping | Quiet: memorials, museums, gardens, nature reserves, viewpoints. Lively: monuments, public artwork, galleries, theatres, parks. No preference: all tags in chosen categories |
| v1 features | Map + location, questionnaire, landmark markers, detail panel, favorites |
| Later (not v1) | Results list, manual location search, adjustable radius, Google sign-in |
| Backend | Supabase (existing project), email + password auth, RLS-protected tables |
| Guests | Can use everything except favorites; answers kept in localStorage; synced on sign-in |
| UI | Apple Maps–inspired: full-bleed vector map, frosted-glass floating header/panels, system (SF) font, rounded floating controls; light/dark map + UI via `prefers-color-scheme` |
| Testing | Manual browser steps each phase; I run `npm run build` + `npm run lint` |
| Deploy | Netlify, final phase |

## Category → OSM tag mapping (`src/lib/categories.ts`)
| Category | Quiet | Lively |
|---|---|---|
| History & monuments | `historic=memorial` | `historic=monument` |
| Art & culture | `tourism=museum` | `tourism=artwork`, `tourism=gallery`, `amenity=theatre` |
| Nature & parks | `leisure=garden`, `leisure=nature_reserve`, `tourism=viewpoint` | `leisure=park` |

"No preference" = union of both columns. Only named features (`["name"]`) are returned; `nwr` query with `out center` so ways/areas get a point.

## Folder structure
```
Advance BuildNight/
├── PLAN.md
├── .gitignore
├── .env.example            # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .env.local              # real keys (git-ignored)
├── index.html
├── netlify.toml            # Phase 9
├── package.json, tsconfig*.json, vite.config.ts, .oxlintrc.json
├── supabase/
│   └── schema.sql          # tables + RLS, pasted into Supabase SQL editor
└── src/
    ├── main.tsx, App.tsx, index.css
    ├── pages/              # MapPage, QuestionnairePage, AuthPage, FavoritesPage
    ├── components/         # Header, LandmarkMarker, DetailPanel, LocationBanner, StepIndicator
    ├── hooks/              # useGeolocation, useLandmarks, usePreferences, useAuth, useFavorites
    ├── lib/                # categories.ts, overpass.ts, distance.ts, supabase.ts, storage.ts
    └── types.ts            # Landmark, Preferences, Category, Vibe
```

## Phases

### [x] Phase 1 — Scaffold + base map
**Goal:** Runnable app showing a full-screen map centered on Chicago.
**Files:** `git init`, `.gitignore` (node_modules, dist, .env.local, .DS_Store, .netlify), `PLAN.md`, Vite React-TS scaffold, Tailwind setup, `src/App.tsx`, `src/pages/MapPage.tsx`, `src/components/Header.tsx`, `src/hooks/useColorScheme.ts`, `src/lib/constants.ts`, `src/lib/maplibre.ts` (explicit worker URL so tiles load under Vite), `src/index.css` (glass utility + restyled MapLibre controls).
**Test:**
1. `npm install` then `npm run dev`
2. Open http://localhost:5173
3. Expect: frosted floating header "Nearby Gems" over a full-screen pastel vector map centered on downtown Chicago; smooth zoom (scroll/pinch), pan, rotate (right-drag or ctrl-drag), tilt shows 3D buildings; rounded glass zoom/compass buttons bottom-right; no console errors.
   - Switch macOS to Dark appearance (System Settings → Appearance) → map and header turn dark without reloading.
4. Resize to phone width (DevTools device toolbar) → no horizontal scroll.
**Commit:** `chore: scaffold Vite React TS app with Tailwind and MapLibre vector map`

### [ ] Phase 2 — User location + fallback
**Goal:** Show "you are here" marker and accuracy circle; fallback banner + Chicago when unavailable.
**Files:** `src/hooks/useGeolocation.ts`, `src/components/LocationBanner.tsx`, `MapPage.tsx`.
**Test:**
1. `npm run dev`, open the app, click **Allow** on the location prompt → map recenters on you with a blue dot + circle.
2. Chrome DevTools → ⋮ → More tools → Sensors → Location "Tokyo" → reload → map centers on Tokyo.
3. Site settings → Location → Block → reload → banner "Location unavailable — showing Chicago. Enable location in your browser settings to see your area." and map on Chicago.
**Commit:** `feat: show user location on map with Chicago fallback`

### [ ] Phase 3 — Questionnaire (guest, localStorage)
**Goal:** Two-step form; answers saved locally; first visit routes to form, later visits go to map; "Edit interests" in header.
**Files:** `react-router-dom`, `src/pages/QuestionnairePage.tsx`, `src/components/StepIndicator.tsx`, `src/lib/categories.ts`, `src/lib/storage.ts`, `src/hooks/usePreferences.ts`, `src/types.ts`, `App.tsx` routes (`/`, `/questionnaire`).
**Test:**
1. DevTools → Application → Local Storage → clear. Reload → redirected to `/questionnaire`, step 1 of 2.
2. Click **Next** with nothing selected → button disabled / "Pick at least one".
3. Pick History + Nature → Next → pick Quiet → **Show my map** → lands on map.
4. Reload → stays on map. Local Storage shows `nearbygems.prefs` = `{"categories":["history","nature"],"vibe":"quiet"}`.
5. Header **Edit interests** → form pre-filled with previous answers.
**Commit:** `feat: add multi-step interest questionnaire saved to localStorage`

### [ ] Phase 4 — Landmarks from Overpass
**Goal:** Fetch matching landmarks within 2 km of the current/fallback location and show color-coded markers.
**Files:** `src/lib/overpass.ts` (query builder + fetch + parse), `src/lib/distance.ts` (haversine), `src/hooks/useLandmarks.ts`, `src/components/LandmarkMarker.tsx` (react-map-gl `Marker` with Apple-style round category pin), `MapPage.tsx` (loading spinner, error toast with Retry, "No places found" message, 2 km radius outline as a GeoJSON circle layer).
**Test:**
1. With location set to Chicago (Sensors or fallback), prefs History+Art, No preference → within ~5 s markers appear (e.g. Art Institute, Cloud Gate artwork); legend shows category colors.
2. DevTools → Network → filter `interpreter` → one POST to overpass-api.de, 200 OK.
3. Edit interests → only Nature, Quiet → map refreshes with only gardens/reserves/viewpoints.
4. Network → Offline → reload → error message with **Retry**; go Online → Retry → markers load.
5. Sensors → custom location in the ocean (0, 0) → "No places found within 2 km".
**Commit:** `feat: fetch nearby landmarks from Overpass based on interests`

### [ ] Phase 5 — Detail panel
**Goal:** Clicking a marker opens a panel (bottom sheet on mobile, side panel on desktop).
**Content:** name, category + specific type (e.g. "Museum"), distance ("850 m away"), address if tagged, links: Wikipedia (if `wikipedia` tag), Website (if `website` tag), "View on OpenStreetMap", "Directions" (Google Maps walking URL). Close via ✕ or Esc.
**Files:** `src/components/DetailPanel.tsx`, `MapPage.tsx`, `LandmarkMarker.tsx`.
**Test:**
1. Click a marker → panel slides in with name, type, distance; selected marker highlighted.
2. Click "View on OpenStreetMap" → new tab opens the correct OSM feature.
3. Click "Directions" → Google Maps opens with walking route.
4. Press Esc → panel closes. At phone width the panel is a bottom sheet and the map stays usable.
**Commit:** `feat: add landmark detail panel with links and distance`

### [ ] Phase 6 — Supabase auth (email + password)
**Goal:** Sign up, sign in, sign out; header shows signed-in email. App still works for guests.
**Setup (you):** put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. In Supabase → Authentication → Providers, Email enabled; for easy local testing, optionally turn off "Confirm email".
**Files:** `@supabase/supabase-js`, `.env.example`, `src/lib/supabase.ts`, `src/hooks/useAuth.ts` (context provider), `src/pages/AuthPage.tsx` (`/auth`, tabs Sign in / Sign up), `Header.tsx`.
**Test:**
1. Restart `npm run dev`. Header shows **Sign in**.
2. `/auth` → Sign up with a test email + 8+ char password → redirected to map, header shows email + **Sign out**. (If confirm-email is on: confirm via inbox first.)
3. Supabase dashboard → Authentication → Users → new user listed.
4. Sign out → header shows Sign in. Sign in again with wrong password → "Invalid login credentials" message.
5. Reload while signed in → still signed in.
**Commit:** `feat: add Supabase email/password authentication`

### [ ] Phase 7 — Save preferences to Supabase
**Goal:** Signed-in users' questionnaire answers stored in Supabase; guest answers in localStorage upload on first sign-in.
**Files:** `supabase/schema.sql` (`preferences` table: `user_id uuid pk references auth.users`, `categories text[]`, `vibe text`, `updated_at`; RLS: users select/insert/update own row), `usePreferences.ts` (Supabase when signed in, localStorage otherwise; merge on sign-in).
**Setup (you):** paste `supabase/schema.sql` into Supabase SQL Editor → Run.
**Test:**
1. As guest, answer Art + Lively. Sign in → Table Editor → `preferences` has your row with `{art}`, `lively`.
2. Edit interests to Nature + Quiet → row updates.
3. Open a private window, sign in as same user → map uses Nature + Quiet without the questionnaire.
4. Sign up a second user → cannot see first user's row (SQL: `select * from preferences` as that user via app returns only own).
**Commit:** `feat: persist questionnaire answers to Supabase for signed-in users`

### [ ] Phase 8 — Favorites
**Goal:** Star landmarks from the detail panel; view them on a Favorites page; favorited markers show a star.
**Files:** `supabase/schema.sql` (`favorites`: `id`, `user_id`, `osm_type`, `osm_id`, `name`, `category`, `lat`, `lon`, `created_at`, unique `(user_id, osm_type, osm_id)`; RLS own rows), `src/hooks/useFavorites.ts`, `DetailPanel.tsx` (☆/★ toggle; guests see "Sign in to save favorites"), `src/pages/FavoritesPage.tsx` (`/favorites`: list with name, category, remove button, "Show on map"), `Header.tsx` link.
**Setup (you):** re-run updated `schema.sql` (idempotent) in SQL Editor.
**Test:**
1. As guest, open a landmark → star replaced by "Sign in to save favorites" link.
2. Sign in, open a landmark, click ☆ → becomes ★; marker shows star. Supabase `favorites` has the row.
3. Header → Favorites → item listed; **Show on map** → map pans to it and opens its panel.
4. Click ★ again (or Remove on Favorites page) → removed from list and table.
5. Reload / other browser signed in as same user → favorites persist.
**Commit:** `feat: add favorites stored in Supabase`

### [ ] Phase 9 — Deploy to Netlify
**Goal:** Public HTTPS URL with working auth, geolocation, and favorites.
**Files:** `netlify.toml` (build `npm run build`, publish `dist`, SPA redirect `/* → /index.html 200`), README section on deploy.
**Setup (you):** push repo to GitHub (or use `npx netlify-cli deploy`); in Netlify site settings → Environment variables, add the two `VITE_SUPABASE_*` vars; in Supabase → Authentication → URL Configuration add the Netlify URL to Site URL / redirect URLs.
**Test:**
1. Open the Netlify URL on desktop and on your phone → location prompt (HTTPS required — works).
2. Reload directly on `/favorites` → no 404.
3. Sign in, favorite a place, confirm it appears on the other device.
**Commit:** `chore: add Netlify config and deploy app`

## Every phase, I will run
- `npm run build` (TypeScript + Vite build must pass)
- `npm run lint` (ESLint must pass)
- Then hand you the manual steps above and stop. Commit only after you confirm; tick the box; show the hash.

## Risks / notes
- Overpass public servers can be slow or rate-limited; client sends one query per location/preference change, with a 25 s timeout and Retry button. Fallback endpoint `overpass.kumi.systems` used if the main one fails.
- Geolocation requires HTTPS or localhost — fine for dev and Netlify.
- Supabase anon key is safe in the browser only because RLS is enabled on every table.
