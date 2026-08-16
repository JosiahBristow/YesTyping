# YesTyping

Free bilingual (中文 / English) touch-typing learning website, inspired by
[typingfun.cn](https://typingfun.cn). Built with React + Vite + TypeScript.

## Features

- **Finger basics** — progressive touch-typing drills (home row → top/bottom row → pangrams) with an on-screen keyboard that color-codes each key by finger and hints which finger to use.
- **English courses** — common words, everyday sentences, and short paragraphs.
- **Speed test** — 15 / 30 / 60-second timed rounds with WPM, accuracy, consistency, and a per-second WPM chart.
- **Local stats** — every finished session is stored in `localStorage` and shown on the My Stats page (best WPM, best accuracy, total time, trend chart, history).
- **Bilingual UI** — instant 中文 / EN switcher.

No backend, no accounts. All data lives on the device.

## Development

```bash
npm install
npm run dev       # dev server
npm run build     # typecheck (tsc -b) + production build
npm run lint      # oxlint
npm run preview   # serve the production build
```

## Project layout

```
src/
  i18n/            locale files + i18next init
  styles/          design tokens + global css
  lib/             cn(), language store + bilingual helpers
  features/
    typing/        useTypingEngine hook, metrics, finger map, TypeArea, TypingSession, word pool
    courses/       typed course data (finger basics, English)
    stats/         localStorage session persistence
  components/      Layout, Keyboard, ResultSummary, TrendChart, CourseCard
  pages/           Home, Courses, Practice, SpeedTest, Stats
```