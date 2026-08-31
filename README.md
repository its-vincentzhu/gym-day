# Gym Day

Phone-first offline PWA for a 6-day lifting + cardio program. No backend, no
login — everything persists to `localStorage` (`gymday:v1`) using
America/Los_Angeles dates.

**Live:** https://its-vincentzhu.github.io/gym-day/

Install on iPhone: open the URL in Safari → Share → **Add to Home Screen**.

## Program

The entire program lives in [`src/program.ts`](src/program.ts). Work sets at
RIR 1–2 with double progression: hit the top of the rep range on every set,
add a small plate next time. Week 5 deload (per-week toggle): −1 set on every
lift, no Saturday intervals. Running late cuts the last isolation move only —
never squat / bench / row / pull-up. Saturday allows at most one catch-up lift
(squat → bench → row), then cardio.

## Development

```bash
npm install
npm run dev      # local, base /
BASE_PATH=/gym-day/ npm run build   # production Pages build
npm run icons    # regenerate public/icons/*.png
```

Pushes to `main` deploy to GitHub Pages via
[`.github/workflows/pages.yml`](.github/workflows/pages.yml).
