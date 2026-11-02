# Pictures

Every picture here is a composite: a wallpaper painted on the local GPU, with Perch's real interface on top, rendered
from the app's own code, headless, with made-up demo data (user "Alex", common Windows apps, the song "Midnight
Window" by Lumen Fields, weather for Oakland). No picture holds anyone's real files, names, devices or apps.

| Folder or name | What it is | Used by |
|---|---|---|
| `img/plate-*.webp` | The six paintings: night, dawn, dusk, forest, dunes, perch | Site: hero, chapter openers, closing |
| `img/h-*.webp` | Real UI with no background: the notch panel, calendar, Start menu | Site: hero, chapter openers |
| `img/i-*.webp` | Real app icons for the magnifying dock | Site: dock |
| `img/c-n-*`, `c-popups` | The notch: each panel, view and alert | Site: mosaic, README tables (smaller copies in `readme/`) |
| `img/c-k-*` | The dock: magnify, previews, extras, buttons, the three styles | Site, README |
| `img/c-f-*` | The Start menu's features: calculator, converter, Settings, Run, files, jump lists, folders, suggestions, widgets, power, keyboard, letters | Site, README |
| `img/c-s-*` | The 12 Start menu designs (6 of them also light) | Site: card stack |
| `img/c-d-*` | The 12 notch designs, closed above open | Site: card stack |
| `img/c-p-*`, `c-v-*` | The palettes and the five visualizers | Site: card stacks |
| `readme/b-*` | README banners with headlines, light and dark pairs, the Download button | README |
| `readme/z-*` | The fanned stacks, composed | README |
| `og-card.png` | The social card, 1200 x 630 | Page head |

To remake them: the render, compose and export scripts are kept outside this repository's published files, in the
ignored `.design/mk/` folder. `build_site.py` and `build_readme.py` beside it write `docs/index.html` and `README.md`.
