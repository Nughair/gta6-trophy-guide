# Leonida Platinum Companion

[![Live entry](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Nughair/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Nughair/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline trophy guide and tracker for **Grand Theft Auto VI (PS5)** — all 55 trophies, each with its official name and description, its grade, and a guide written for it in our own words.

## What the app does

- **Checklist** — every trophy in a dense list with medal swatches, grade and kind tags, MISSABLE flags where they apply, and a working tick box. Progress is stored in the browser (localStorage), so the checklist survives reloads with no account and no network.
- **Per-trophy guides** — click any trophy for its guide: what to do, where and how (worked out from the official description), a short numbered step list, a missable note where flagged, and a visible **Sources** list on every single trophy.
- **Counters** — trophies with a target (250 stunts, 100 vehicles, $250,000 laundered, and the rest) get +/− counters; hitting a target marks the trophy earned.
- **Filters** — text search, kind chips (Story, Side stories, Collectibles, Activities, World, Completion, Missable), a grade select and an earned / not-earned select.
- **Spoiler shield** — masks story trophies' names and descriptions until you earn them, so the checklist itself cannot spoil the plot.
- **Roadmap** — an 11-stage route to the platinum with the seven missables pinned at the top in warning styling.
- **Missables** — all seven flagged trophies with their windows. Each flag is an honest risk read from the official description ("the chance is tied to a story moment; if it passes, mission replay is the recovery"), never presented as a verified fact.
- **Save & sources** — export, import or reset your progress as JSON, plus the full data-sources note.

The app is fully offline: plain HTML, CSS and JavaScript under `app/`, with the trophy data in `app/data/trophies.json`. It loads nothing over the network — every reference is a file inside `app/`.

## How to run it

```sh
node serve.ts
```

then open http://localhost:8080 — `serve.ts` serves `app/` locally with no build step.

`main.ts` is the hand-in program: it copies `app/` and `screenshots/` to the output directory and writes the `dossier.json` summary the judges read:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Data sources

Trophy names, official descriptions and grades are the published PS5 list, cited per trophy in each guide's Sources list (Exophase — Grand Theft Auto VI (PS5) trophy list). Counted targets are cross-checked against PSNProfiles' Grand Theft Auto VI trophy list. Every strategy note is our own advice, worked out from the official description — the game is not out yet, so none of it has been checked in play, and each trophy says so in its Sources rather than dressing guesses up as facts.

## Screenshots

`shots.json` describes the four captures in `screenshots/`: the seeded checklist, a trophy guide open on the detail pane (guide and Sources visible), the roadmap, and the checklist with the spoiler shield on.

Built by an AI agent for make.fun's Build the best GTA 6 trophy guide bounty, $250 in USDC. MIT licensed.
