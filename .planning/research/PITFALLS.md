# Domain Pitfalls

**Domain:** Offline-first React PWA — GitHub Pages + Vite + IndexedDB + i18n
**Researched:** 2026-06-30
**Stack under review:** React 18 + Vite + TypeScript + vite-plugin-pwa + Dexie.js + react-i18next

---

## Critical Pitfalls

Mistakes that cause data loss, broken deployments, or rewrites.

---

### Pitfall 1: Wrong or Missing Vite `base` Causes Complete Deployment Failure

**What goes wrong:** The app deploys to `https://<user>.github.io/little-words/` but all asset paths resolve from `/` (root). Every JS chunk, CSS file, icon, and manifest reference 404s. The service worker registers with the wrong scope and cannot control any page.

**Why it happens:** Vite defaults to `base: '/'`. GitHub Pages project sites live at a subpath. `vite-plugin-pwa` inherits base from vite config to generate the correct SW scope and manifest `start_url` — but only if base is set first. Developers often set the manifest `start_url` manually to `/` which then conflicts with the actual served path.

**Consequences:** Completely broken production site. Service worker scope mismatch triggers "Failed to update a ServiceWorker for scope" errors in browser console. Lighthouse PWA audit fails entirely. Install prompt never fires on Android.

**Prevention:**
```ts
// vite.config.ts — single source of truth
export default defineConfig({
  base: '/little-words/',       // must match repo slug exactly
  plugins: [
    VitePWA({
      // Do NOT set scope or start_url manually here.
      // vite-plugin-pwa reads base and applies it correctly.
      manifest: {
        name: 'Little Words',
        start_url: '/little-words/',   // only needed if you want to be explicit — must match base
        scope: '/little-words/',
      },
    }),
  ],
})
```

**Detection:** After every `npm run build`, inspect `dist/manifest.webmanifest` — `start_url` and `scope` must begin with `/little-words/`. Check `dist/sw.js` first line for the correct precache manifest paths.

**Phase:** Deployment / PWA setup phase (before any other feature work).

---

### Pitfall 2: History API Routing Causes 404 on Refresh — Use Hash Router

**What goes wrong:** React Router is initialized with `createBrowserRouter`. Navigating to `/dashboard` works client-side, but refreshing the page or sharing the URL hits GitHub Pages which returns 404 because no file exists at that path.

**Why it happens:** GitHub Pages is a static file host with no server-side rewrite rules. A request for `/little-words/dashboard` looks for `dashboard/index.html` which does not exist. The `404.html` redirect hack (redirect via `sessionStorage`) is fragile and breaks on direct deep links in PWA standalone mode.

**Consequences:** Any shared link or bookmarked route is broken. Installed PWA may open to a blank screen if the SW serves a 200 for `/little-words/` but the router tries history navigation to a path the SW didn't cache.

**Prevention:** Use `createHashRouter` from the start. Hash routes (`/#/dashboard`) are never sent to the server. The PROJECT.md constraint explicitly requires this. Never switch to history routing without a server-side host that supports rewrites.

```tsx
// router.tsx
import { createHashRouter } from 'react-router-dom'
const router = createHashRouter([...routes])
```

**Detection:** After build + deploy, paste `https://<user>.github.io/little-words/#/dashboard` directly into a fresh browser tab. It should load the dashboard, not 404.

**Phase:** Project scaffold / routing setup (Phase 1).

---

### Pitfall 3: Dexie.js Schema Version Cannot Be Decremented in Production

**What goes wrong:** A bug is discovered in schema version 3. The fix requires rolling back code to version 2. Every user who already ran version 3 now has a browser database at version 3. When the version-2 code tries to open it, Dexie throws `VersionError: The requested version (2) is less than the existing version (3)`. The app will not open for any user who visited version 3.

**Why it happens:** IndexedDB is a versioned store. Opening a database with a lower version number than the installed version is an error by spec. Dexie faithfully surfaces this.

**Consequences:** App broken for all users who loaded the buggy version. The only recovery is to deploy version 4+ with a migration that handles the inconsistent state introduced by version 3.

**Prevention:**
- Version numbers are always strictly increasing. Never reuse or decrement.
- Roll forward: deploy a version 4 that contains defensive migration logic cleaning up whatever version 3 broke.
- If version 3 corrupted data beyond repair, version 4's upgrade can clear affected tables and show the user an explanatory message.
- Keep a `SCHEMA_HISTORY.md` note that documents what each version number changed.

**Detection:** Warning sign — a PR that decrements the version number in `db.ts`. Treat this as a blocking review comment.

**Phase:** Data layer phase; must be established before first production deploy.

---

### Pitfall 4: Dexie Transaction Scope Errors

**What goes wrong:** Code grabs a reference to a table or puts data into a variable inside a `db.transaction()` callback, then uses it after the callback has returned. Dexie throws `TransactionInactiveError: The transaction has finished`.

**Why it happens:** IndexedDB transactions auto-commit as soon as there are no pending requests. Dexie wraps this with promises, but a transaction is only active during the synchronous and awaited chain within the callback. Storing a cursor or query result in outer scope and using it later is not safe.

**Consequences:** Silent failures in development (async errors swallowed), data integrity bugs in production (partial writes).

**Prevention:**
```ts
// WRONG — transaction exits before the timeout fires
let record
await db.transaction('rw', db.wordForms, async () => {
  record = await db.wordForms.get(id)
})
await doSomething(record) // safe — record is a plain object now, not a live cursor

// The dangerous pattern — using db outside the transaction:
const form = await db.wordForms.get(id)  // auto-transaction, closes immediately
await someDelay()
await db.wordForms.put({ ...form, name: 'new' })  // new auto-transaction — fine in this case
// but if these two ops must be atomic, wrap them in a single db.transaction('rw', ...)
```

All writes that must be atomic (e.g., delete WordForm + delete junction rows) must happen inside a single `db.transaction('rw', [tables...], callback)` call.

**Detection:** `TransactionInactiveError` in console. Any write that is not wrapped in an explicit `db.transaction` when atomicity is required.

**Phase:** Data layer phase.

---

### Pitfall 5: Orphaned Junction Rows on WordForm Delete

**What goes wrong:** Deleting a WordForm correctly leaves Meanings alive (by design) but leaves `wordFormMeaning` junction rows pointing to the deleted WordForm ID. These orphaned rows cause: junction queries to return the deleted WordForm's ID in Meaning lookups, inflated result counts, and JSON exports that contain dangling references.

**Why it happens:** IndexedDB has no foreign keys. There is no automatic cascade. `db.wordForms.delete(id)` does nothing to the junction table.

**Consequences:** Data integrity bugs visible in UI (meanings appearing under ghost word forms), corrupted exports that fail on import to another device.

**Prevention:** Every WordForm delete must be wrapped in a transaction that also deletes all junction rows for that ID:

```ts
async function deleteWordForm(id: number) {
  await db.transaction('rw', [db.wordForms, db.wordFormMeanings], async () => {
    await db.wordForms.delete(id)
    await db.wordFormMeanings.where('wordFormId').equals(id).delete()
    // Meanings are intentionally NOT deleted — they remain as independent entities
  })
}
```

**Detection:** After deleting a WordForm, query `db.wordFormMeanings.where('wordFormId').equals(id).count()` — should return 0. Add this as an assertion in tests.

**Phase:** Data layer phase; enforce with a test harness before any UI work.

---

## Moderate Pitfalls

---

### Pitfall 6: iOS Storage Eviction — Installed PWA is Exempt, Browser Visit is Not

**What goes wrong:** A parent opens the app in Safari browser (not installed) and logs data over several days. WebKit's Intelligent Tracking Prevention (ITP) evicts all script-writable storage (IndexedDB, localStorage, Cache API, SW registrations) after 7 days of no interaction. All word entries are gone.

**Why it happens:** ITP targets cross-site tracking, but its eviction policy affects all origins in the same session boundary. The exemption only applies to apps added to the Home Screen (installed PWA), where the app runs in its own separate process with an independent counter.

**Consequences:** Silent data loss. The app opens to an empty state with no error, because `db.open()` succeeds on a fresh empty database.

**Prevention:**
1. Show the iOS install prompt (Add to Home Screen instructions) prominently during onboarding. Frame it as a data safety feature: "Install to protect your data."
2. Call `navigator.storage.persist()` on first run. Check the result; if denied, remind the user to install the app.
3. On every app start, check `(await navigator.storage.persisted())` — if false and data exists, show a non-blocking banner: "Install the app to protect your data from being cleared by the browser."
4. Encourage users to do JSON backup exports before storage might be evicted.

**Detection:** The app opens with an empty word list despite the user having entered data. No console errors. Check `navigator.storage.persisted()` — if false and the user is not in standalone mode, this is the likely cause.

**Phase:** PWA setup phase (storage persistence call); onboarding phase (install prompt copy).

---

### Pitfall 7: `navigator.storage.persist()` Grant Strategy

**What goes wrong:** `persist()` is called immediately on first page load. Browsers (especially Chrome) deny it silently on the first cold visit because the user has no engagement signal. The app has no fallback UI for when persistence is denied.

**Prevention:** Call `persist()` after a meaningful user action (e.g., after onboarding is completed and the first word is added). Check the result with `persisted()` and surface a one-time non-blocking nudge if denied. On Safari 17+ the grant requires notification permission to be active; do not require it, just acknowledge it cannot be fully guaranteed.

**Phase:** Onboarding phase.

---

### Pitfall 8: PWA Update Prompt Not Implemented — Users See Stale App

**What goes wrong:** A bug fix is deployed. The service worker caches the old app shell. Users who installed the PWA continue running the old version indefinitely because the SW intercepts all network requests and serves the cached version.

**Why it happens:** Workbox's `precacheAndRoute` strategy serves cached assets without revalidation. A new SW is downloaded in the background but waits for all tabs to close before activating (default `skipWaiting: false`).

**Prevention:** Implement the `onNeedRefresh` callback from `vite-plugin-pwa`'s `useRegisterSW` hook. Show a toast: "A new version is available — tap to update." Call `updateServiceWorker(true)` to skip waiting and reload.

```tsx
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onNeedRefresh() { setShowUpdateToast(true) },
})
```

**Detection:** Deploy a change. Open the installed PWA. Wait 60 seconds. If the change is not reflected and no update prompt appeared, the update flow is broken.

**Phase:** PWA setup phase.

---

### Pitfall 9: Missing `"vite-plugin-pwa/client"` in `tsconfig.json` Types

**What goes wrong:** TypeScript cannot find the virtual module `virtual:pwa-register/react` or `virtual:pwa-info`. Errors like "Cannot find module 'virtual:pwa-register/react'" appear at compile time, blocking the build.

**Prevention:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client", "vite-plugin-pwa/client"]
  }
}
```

**Detection:** First TypeScript error when importing `useRegisterSW`.

**Phase:** Project scaffold (Day 1 config).

---

### Pitfall 10: iOS Safari `100vh` Hides Bottom Content

**What goes wrong:** The FAB (floating action button) or bottom sheet close button is hidden behind Safari's bottom toolbar. Users cannot dismiss the bottom sheet or reach the FAB without scrolling.

**Why it happens:** iOS Safari defines `100vh` as the full height including the collapsible browser chrome (address bar + bottom toolbar). When the toolbar is visible, `height: 100vh` overflows the visible area.

**Consequences:** Primary UI interaction (adding a word via FAB → bottom sheet) is broken on iOS Safari — the target user's primary device.

**Prevention:**
```css
/* Use dvh (dynamic viewport height) — supported Safari 15.4+ */
.full-height {
  height: 100dvh;
}

/* Fallback for older Safari */
@supports not (height: 100dvh) {
  .full-height {
    height: calc(var(--vh, 1vh) * 100);
  }
}
```
```ts
// Set --vh on load and resize
const setVh = () =>
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
window.addEventListener('resize', setVh)
setVh()
```

Also add `padding-bottom: env(safe-area-inset-bottom)` to any fixed-bottom element to clear the home indicator on iPhone X+.

**Detection:** Open the app in iOS Safari (not standalone). Check if the FAB is fully visible when the address bar is showing.

**Phase:** UI/layout phase.

---

### Pitfall 11: Bottom Sheet `z-index` Stacking Issues

**What goes wrong:** The bottom sheet appears behind other elements (sticky headers, fixed navigation bars, toast notifications). On some iOS versions, `position: fixed` elements with `z-index` behave unexpectedly when inside a transformed parent.

**Prevention:**
- Render bottom sheets at the document root level via a React portal (`ReactDOM.createPortal`), not inside the component that triggers them.
- Establish a clear z-index scale as CSS custom properties: `--z-overlay: 100`, `--z-bottom-sheet: 200`, `--z-toast: 300`.
- Never apply `transform`, `filter`, or `will-change` to a parent of a `position:fixed` child — it creates a new stacking context that clips the fixed element to the parent bounds.

**Detection:** Open a bottom sheet and check that nothing renders on top of it. Also check that toasts render above the bottom sheet backdrop.

**Phase:** UI/layout phase.

---

### Pitfall 12: Over-Aggressive or Mistimed Install Prompts

**What goes wrong:** The custom install banner (showing "Add to Home Screen" instructions) is shown immediately on first visit, before the user has seen any app value. Users dismiss it permanently. On Android, if `beforeinstallprompt` is called `.preventDefault()` too late (after a user gesture), the browser's native prompt fires on its own schedule and the deferred event is lost.

**Prevention:**
- Defer the install prompt until after the user has completed onboarding and added at least one word.
- Store the deferred `BeforeInstallPromptEvent` early (in a `beforeinstallprompt` listener), but only show the custom UI after the engagement condition is met.
- On iOS, show a contextual nudge inside Settings or at the end of onboarding: "For the best experience and to protect your data, add this app to your Home Screen."
- Never re-show the prompt if the user dismissed it — store a flag in localStorage.

**Detection:** Check that the install prompt does not appear on first page load before any interaction.

**Phase:** Onboarding phase.

---

### Pitfall 13: react-i18next Re-Render Storms on Language Switch

**What goes wrong:** Every component in the tree re-renders when the user switches language, causing noticeable jank on lower-end devices.

**Why it happens:** The `i18n` instance is placed in a React context. Any context value change triggers re-renders for all consumers. With a large component tree and Polish/English switch, this cascades through every component calling `useTranslation`.

**Prevention:**
- Use `useTranslation` with a specific namespace per component — React-i18next's context is already optimized for this and only re-renders components whose namespace changed.
- Do not put `i18n` or `t` functions into additional custom contexts.
- For expensive list renders, use `React.memo` — the `t` function reference changes on language switch, so memo alone does not prevent re-renders; also pass the language string as a prop or use `useMemo` for translated lists.

**Detection:** Add `console.count('render')` inside a list component. Switch language. Count should be 1, not N (where N is the number of items).

**Phase:** i18n integration phase.

---

### Pitfall 14: Polish Pluralization Requires Explicit Testing in Release Mode

**What goes wrong:** Polish plural forms work correctly in development but return the wrong string (or trigger `parseMissingKeyHandler`) in production builds.

**Why it happens:** i18next's plural resolver for Polish requires the `pl` locale to be registered with the correct `Intl.PluralRules` rules (one / few / many / other). In some bundler configurations, the `Intl` polyfill or locale data is tree-shaken out, causing the resolver to fall back to English rules (one / other), which produces wrong plural forms for numbers like 2, 3, 22.

**Polish plural rules:**
- 1 → `_one` (1 słówko)
- 2–4, 22–24, etc. → `_few` (2 słówka)
- 5–21, 25–31, etc. → `_many` (5 słówek)
- fractional → `_other`

**Prevention:**
- Always test plural strings in production build (`npm run build && npm run preview`).
- Use the `count` interpolation and test with values 1, 2, 5, 11, 22 explicitly.
- Add a smoke test that asserts `t('meaning', { count: 2 })` returns the Polish `_few` form.

**Detection:** Build and run `npm run preview`. Switch to Polish. Check any count-based string (e.g., "N meanings") with count=2 — if it says "2 meaning" instead of "2 słówka", pluralization is broken.

**Phase:** i18n integration phase.

---

### Pitfall 15: Missing Translation Keys Reach Production Silently

**What goes wrong:** A developer adds a new UI string in English but forgets the Polish translation. The Polish UI shows the raw key string (e.g., `"settings.export.button"`) instead of translated text.

**Prevention:**
1. Enable TypeScript type safety for i18next keys (requires `strict: true` in tsconfig and the resources type augmentation pattern):
```ts
// src/i18n.d.ts
import 'i18next'
import en from './locales/en/common.json'
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: { common: typeof en }
  }
}
```
This makes `t('nonexistent.key')` a TypeScript compile error.

2. Add a CI step that diffs the key sets of `en/common.json` and `pl/common.json` — build fails if any key present in one is absent in the other.

3. Set `fallbackLng: 'en'` in i18next config so missing Polish keys fall back to English text rather than showing raw key strings.

**Detection:** TypeScript error on any `t()` call with an unknown key (requires type augmentation setup above).

**Phase:** i18n integration phase (type setup on day 1); enforced in CI from that point.

---

## Minor Pitfalls

---

### Pitfall 16: Service Worker Not Active During Development

**What goes wrong:** Developers test offline behavior in `npm run dev` and find the service worker is not active — cache strategies, background sync, and offline fallbacks are not running.

**Prevention:** This is by design. Set `devOptions.enabled: true` in `VitePWA()` config temporarily when testing SW behavior, or run `npm run build && npm run preview` to test against the production build.

**Detection:** Open DevTools → Application → Service Workers. In dev mode, no SW should be registered unless `devOptions.enabled: true`.

**Phase:** PWA setup phase (document in dev README).

---

### Pitfall 17: Touch Tap Highlight Flash on Interactive Elements

**What goes wrong:** Tapping buttons or list items shows a grey flash on iOS and some Android browsers. On a privacy-focused app for parents, this looks unpolished.

**Prevention:**
```css
* {
  -webkit-tap-highlight-color: transparent;
}
```
Apply to the root CSS reset. Override specifically for elements that need visible focus states for accessibility.

**Phase:** UI/layout phase (CSS reset).

---

### Pitfall 18: Virtual Keyboard Resizes Viewport — Breaks Fixed-Bottom Elements

**What goes wrong:** The bottom sheet contains a text input (word form input, meaning input). When the virtual keyboard opens on iOS, the viewport shrinks. Fixed-bottom elements jump or overlap the input field.

**Prevention:** Use the `visualViewport` API to detect the keyboard height and adjust positioned elements:
```ts
window.visualViewport?.addEventListener('resize', () => {
  const keyboardHeight = window.innerHeight - (window.visualViewport?.height ?? window.innerHeight)
  document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
})
```

Then use `padding-bottom: var(--keyboard-height, 0px)` on the bottom sheet content area.

**Detection:** Open a bottom sheet with an input. Focus the input. Check that the keyboard does not obscure the input or the submit button.

**Phase:** UI/layout phase.

---

### Pitfall 19: JSON Export/Import Data Loss on Schema Mismatch

**What goes wrong:** A parent exports JSON from version 1.0, the app updates its schema to version 2.0, and on a new device the import fails silently or partially imports data.

**Prevention:**
- Include a `schemaVersion` field in every export JSON.
- The import function reads `schemaVersion` and applies a transformation pipeline before writing to IndexedDB, similar to how Dexie handles version upgrades.
- If `schemaVersion` is unknown/future, reject the import with a clear error rather than attempting it.

**Detection:** Export from version N. Upgrade the schema. Import on version N+1. Verify all records are present and correct.

**Phase:** Data export/import phase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project scaffold | Missing `base: '/little-words/'` in vite.config | Set on Day 1 before first build |
| Project scaffold | Missing `vite-plugin-pwa/client` in tsconfig types | Add with initial tsconfig setup |
| Routing setup | Using `createBrowserRouter` | Use `createHashRouter` — required by GitHub Pages |
| Data layer | Schema version decrement in a rollback | Never decrement; enforce in code review |
| Data layer | Missing cascade delete for junction rows | Wrap WordForm deletes in explicit transaction |
| Data layer | No `navigator.storage.persist()` call | Call after first meaningful user action |
| i18n setup | No TypeScript key type augmentation | Add `i18n.d.ts` on the same day as i18n init |
| i18n setup | Polish pluralization untested in production | Add plural smoke tests, test production build |
| UI/layout | `height: 100vh` on full-page containers | Use `100dvh` with fallback |
| UI/layout | Bottom sheets rendered inside component tree | Render via React portal at document root |
| PWA setup | No update prompt implemented | Add `useRegisterSW` + `onNeedRefresh` toast |
| Onboarding | Install prompt shown too early | Defer until after first word is added |
| Data/export | No `schemaVersion` in export JSON | Include from first export implementation |

---

## Sources

- [vite-pwa/vite-plugin-pwa GitHub issues — base path and SW scope](https://github.com/vite-pwa/vite-plugin-pwa/issues/263)
- [vite-plugin-pwa Development Guide](https://vite-pwa-org.netlify.app/guide/development)
- [Dexie.js version() documentation](https://dexie.org/docs/Dexie/Dexie.version())
- [Dexie.js version rollback issue #1599](https://github.com/dexie/Dexie.js/issues/1599)
- [Dexie.js hook('deleting') documentation](https://dexie.org/docs/Table/Table.hook('deleting').html)
- [i18next TypeScript documentation](https://www.i18next.com/overview/typescript)
- [react-i18next useTranslation hook](https://react.i18next.com/latest/usetranslation-hook)
- [Missing translations i18next guide](https://www.locize.com/blog/missing-translations)
- [WebKit Storage Policy updates (ITP PWA exemption)](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [MDN StorageManager.persist()](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
- [MDN Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [PWA iOS Limitations 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [100vh problem with iOS Safari](https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9)
- [New Viewport Units (svh, dvh, lvh)](https://ishadeed.com/article/new-viewport-units/)
- [IndexedDB data loss after browser crashes (Playwright)](https://dev.to/_eb7f2a654e97a60ae9f96e/uncovering-8-indexeddb-data-loss-after-browser-crashes-with-playwright-3j2m)
- [RxDB — IndexedDB max storage limits](https://rxdb.info/articles/indexeddb-max-storage-limit.html)
- [Deploy React Vite PWA to GitHub Pages](https://dev.to/iamfranco/deploy-react-vite-pwa-to-github-pages-35i)
