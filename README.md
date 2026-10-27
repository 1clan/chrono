# Chrono

**Live:** [1clan.github.io/chrono](https://1clan.github.io/chrono/)

A calm, keyboard-first calendar workspace for focused work. Chrono is a single-page app with no build step and no server — open it and start shaping your week.

![Chrono](https://img.shields.io/badge/local--first-yes-c9f56d) ![No build](https://img.shields.io/badge/build-none-8b9cff)

## Open it

```bash
# From this folder
xdg-open index.html        # Linux
open index.html            # macOS
start index.html           # Windows
```

Or drag `index.html` into any modern browser. Everything is saved to `localStorage` under `chrono.workspace.v1`, so your data stays on your machine.

> The first launch seeds a demo week so the app never opens empty. Delete the demo events or clear site data to start clean.
>
> Fonts load from Google Fonts when online. Offline, the app falls back to system fonts and still works normally.

## What's inside

- **Week** — Monday–Friday grid, 7 AM–9 PM, with live "now" line. Drag on empty space to create a block, drag events to move them, and drag the bottom edge to resize.
- **Day plan** — one spacious day with free-space cards you can turn into blocks, plus a meeting/focus/free summary.
- **Month** — six-week overview with event pills; click a day or "+N more" to zoom into it.
- **Insights** — deep-work score, meeting load, a weekly hour breakdown, balance bars, and gentle suggestions.
- **Now panel** — what's happening now, what's next, today's booked/free time, tasks, and a focus timer. The panel becomes a slide-over on narrow screens.
- **Focus sessions** — 25/50/90-minute timer with chime, confetti, a running chip in the top bar, and completed sessions counted in Insights.
- **Command palette** — jump to a view, event, or task; schedule the next task into the first honest free slot.
- **Event editor** — title, type, date, start/end, location, notes, and two-step delete with Undo.
- **Local-first** — events, tasks, focus history, settings, and UI state persist automatically.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `T` | Go to today |
| `D` | Day plan |
| `W` | Week |
| `M` | Month |
| `I` | Insights |
| `N` | New event |
| `F` | Focus timer |
| `/` or `⌘K` / `Ctrl+K` | Command palette |
| `←` / `→` | Previous / next period |
| `↑` / `↓` | Move through palette results |
| `Enter` | Open selected event or palette result |
| `Esc` | Close overlay / panel |

Keyboard focus lands on events and day-plan cards too — press `Enter` or `Space` to edit one.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell and overlay markup |
| `styles.css` | Design tokens, layout, views, responsive rules |
| `app.js` | State, persistence, rendering, interactions |
| `README.md` | This file |

## Tweaking it

A few useful starting points in `app.js`:

- `state.settings` — working hours (`workStart`, `workEnd`) and the weekly focus goal (`focusGoal`, in minutes).
- `seedDemo()` — the demo week and task list created on first launch.
- `STORAGE_KEY` — change the `localStorage` namespace.
- `styles.css` → `:root` — colors, accent, radii, and the `--hour-h` grid scale.

## Deploying

The live site is hosted on GitHub Pages at **https://1clan.github.io/chrono/**.

Pushes to `main` deploy automatically through `.github/workflows/pages.yml` (GitHub Actions → Pages). To deploy your own copy:

1. Fork or clone the repo.
2. Push to `main`.
3. In **Settings → Pages**, set the source to **GitHub Actions** if it is not already enabled.

No build step is required — the repository root is the published site.

## Reset

Open the browser console and run:

```js
localStorage.removeItem('chrono.workspace.v1');
location.reload();
```

That restores the seeded demo week.
