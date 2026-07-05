# AntiGravity brief — wire meals.html into the S4M8 dashboard

`meals.html` is already native: it loads `lock.js`, `/api/config`, the Supabase CDN,
`sync.js`, and `topbar.js`; uses the dashboard backdrop + tokens; syncs history via
`initCloudSync({appKey:"meals", syncedKeys:["meal_history"]})`; and reads weight from
`po_water_v1.profile.weightKg`. It needs NO further edits.

Two shared files must be touched. Do exactly this and nothing else.

## 1. `index.html` — add the ·08 Meals bento tile
Find the bento grid (`<div class="bento">` … tiles ·01–·07). Add ONE tile matching the
existing tile markup/classes exactly (same `.tile` structure, accent override pattern).
- Link target: `meals.html`
- Number: `·08`
- Label: `Meals` (or `Питание`)
- Icon: 🍽
- Accent: pick an unused one; suggest `--accent:#E07658` (the warm dashboard glow color)
Insert it in numeric order after the current last tile. Do not restyle other tiles.

## 2. `topbar.js` — add a Meals tab to the bottom nav
In `bottombarHtml`, the nav currently has Main / Health / Fitness. Add a fourth tab,
matching the existing `.bottombar-tab` markup:
```html
<a href="meals.html" class="bottombar-tab" data-page="meals">
  <span class="bottombar-tab-icon">🍽</span>
  <span>Meals</span>
</a>
```
Then in `currentPageKey()`, add before the final `return 'main'`:
```js
if (p.endsWith('meals.html')) return 'meals';
```
So the Meals tab highlights when active. (4 tabs fit the flexbox nav; no CSS change needed.)

## Supabase (no code change, one-time DB check)
`initCloudSync` upserts to table `public.app_state`, row `key='meals'`, column `data` (jsonb).
That's the same table every page uses — no schema change. If Row Level Security is on and
other rows already read/write, `meals` inherits the same policy automatically. Nothing to add.

## Verify after wiring
1. Dashboard shows ·08 Meals tile → opens meals.html with top bar + bottom nav, Meals tab active.
2. If `po_water_v1` has a weight, targets auto-fill + green "Профиль дашборда" tag shows.
3. Build a plan → refresh → history persists (local). Open on another device signed into the
   same dashboard → the built day appears within ~1s (Supabase sync).
4. Bottom-nav water/finance chrome still works on the meals page.

## Do NOT
- Do not add a build step or npm packages — meals.html is self-contained (LP solver inlined).
- Do not change sync.js, lock.js, or /api/* — meals.html already conforms to them.
- Do not rename the `meal_history` key or `meals` appKey.
