# Screenshot slots

Every picture here is a composite: a wallpaper made on the local GPU, with Perch's real interface rendered on top
from the app's own code, headless, with made-up demo data (user "Alex", common Windows apps, the song "Midnight
Window" by Lumen Fields, weather for Oakland). No picture holds anyone's real files, names, devices or apps.

To swap one: save a new file under the exact name and size below, as WebP (quality about 82), and list site files
in `shots.json` (for example `{ "ready": ["notch-open.webp"] }`). A listed file covers the HTML recreation in both
site themes.

| File | Size (px) | What it shows | Used in |
|---|---|---|---|
| `notch-open.webp` | 2400 x 2400 | The notch opened on the Time panel: the clock with a second time zone (London), the calendar and the timer, the row of live widgets (weather, CPU, RAM, network, GPU, disk, battery, volume). | Chapter 01 stage |
| `dock-preview.webp` | 2400 x 2400 | The dock with Microsoft Edge magnified under the cursor and a preview of its two windows; the notch at the top plays music. Drives, Downloads and the Recycle Bin at the right end. | Chapter 02 stage |
| `start-menu.webp` | 2400 x 2400 | The Modern Start menu with `12*7` typed in search and the answer, 84, as the best match. | Chapter 03 stage |
| `start-menu-win10.webp`, `start-menu-win7.webp` | 2400 x 2400 | The Windows 10 tiles and Windows 7 designs of the Start menu; the stage shows them when a visitor presses those buttons. | Chapter 03 stage |
| `weather-hourly.webp` | 2400 x 2400 | The notch's Controls panel in the evening: the weather now and the hour-by-hour forecast under a night sky, plus the quick controls. | Chapter 04 stage |
| `notch-designs-simple.webp`, `notch-designs.webp` | 2400 x 2400 | The 12 notch designs, each named, on one wallpaper: Simple look (shown first) and Graphics look (shown when a visitor presses Graphics). | Chapter 05 stage |

For the README (`docs/assets/shots/`, WebP; GitHub shows WebP):

| File | Size (px) | What it shows |
|---|---|---|
| `readme-hero.webp` | 2560 x 1280 | The whole desktop at night: the notch opened at the top, the dock at the bottom. |
| `readme-hero-light.webp` | 2560 x 1280 | The same desktop in the light theme at dawn; shown to readers whose GitHub is set to light. |
| `readme-dock.webp` | 2560 x 640 | The dock with one icon magnified and a window preview open. |
| `readme-notch.webp` | 2560 x 900 | The notch opened with weather, clocks, widgets and quick controls. |
| `readme-start.webp` | 1600 x 1200 | The Modern Start menu with search open. |

The social card is `../og-card.png` (1200 x 630, PNG).
