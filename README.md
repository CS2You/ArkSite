# ARK Survival Ascended Breeding & Stat Calculator MVP

A static, client-side-only GitHub Pages MVP for ARK breeding and stat planning. It uses plain HTML, CSS, and JavaScript with no build step, no backend, no database, no Node server, and no VPS.

## Features

- Creature selector loaded from `data/creatures.json`
- Official/default multiplier inputs for wild stats, tamed stats, and breeding/maturation speed
- Wild stat calculator using `wildStat = baseValue * (1 + wildPoints * wildIncrement * wildMultiplier)`
- Parent comparison that takes the highest inherited stat points from Male or Female
- Estimated best baby level using `1 + sum(inheritedStatPoints)`
- Mutation helper that flags baby stats exactly `bestParentStat + 2`
- Incubation, gestation, and maturation timers adjusted by the maturation multiplier
- Responsive dark gaming-style UI

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

> Note: The app fetches `data/creatures.json`. Most GitHub Pages and local static-server workflows support this directly. If a browser blocks JSON loading from a `file://` URL, run the one-line Python static server above.

## Deploy to GitHub Pages

1. Commit these files to your repository.
2. Push the branch to GitHub.
3. In GitHub, open **Settings → Pages**.
4. Select the branch and root folder (`/`) as the Pages source.
5. Save and open the published Pages URL after deployment completes.

## Data source and transformation

Creature data lives in [`data/creatures.json`](data/creatures.json).

The MVP subset was adapted from the ARK Smart Breeding / ARKStatsExtractor project:

- Source project: <https://github.com/cadon/ARKStatsExtractor>
- Source file used: `ARKBreedingStats/json/values/values.json`

Transformation notes:

- The simplified MVP includes Rex, Argentavis, Therizinosaur, Giganotosaurus, and Ankylosaurus.
- Source `fullStatsRaw` indexes were mapped as follows:
  - `0` → health
  - `1` → stamina
  - `3` → oxygen
  - `4` → food
  - `7` → weight
  - `8` → melee
- For each stat:
  - `baseValue` = `fullStatsRaw[index][0]`
  - `wildIncrement` = `fullStatsRaw[index][1]`
- Breeding values were mapped as:
  - `incubationSeconds` = `incubationTime`
  - `gestationSeconds` = `gestationTime`
  - `maturationSeconds` = `maturationTime`
- Standard/base species entries were selected where available; mission/gauntlet variants were avoided when a normal entry existed.

To update the data later, re-import the desired species from the upstream values file and apply the same field mapping into `data/creatures.json`.

## Planned next features

- Import more creatures and ASA-specific variants as verified values become available
- Export/share breeding plans
- Add mutation stack tracking per parent side
- Add imprinting and post-tame stat calculations
- Add search/filtering for large creature lists
- Add automated data import scripts while keeping the published app build-free
