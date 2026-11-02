# How a Perch release is laid out

This page is for the owner. It says what goes into each GitHub release of `omanishay-cyber/perch`, so the
installer, the website, the updater and the usage counter all keep working.

## 1. One release per version

| Field | Value | Example |
|---|---|---|
| Tag | `v` + the version | `v1.1.0` |
| Title | `Perch` + the short version | `Perch 1.1` |
| Notes | What changed, in plain words: New, Better, Fixed | see section 5 |
| Pre-release | off | |
| Latest | on | |

GitHub's "latest release" is the newest one that is neither a draft nor a pre-release. The website's Download
button and the updater both read from it.

## 2. The files attached to each version

| File | What it is | Who reads it |
|---|---|---|
| `Perch_1.1.0_x64-setup.exe` | The installer, with the version in its name | People browsing the release |
| `Perch_1.1.0_x64-setup.exe.sig` | The updater signature of that installer | Perch's updater |
| `Perch-Setup.exe` | The same installer, copied under a name with no version | The website and README Download links |
| `latest.json` | The update file | Perch's updater |

The versioned installer, its `.sig` and `latest.json` come from the Tauri build (NSIS bundle with
`includeUpdaterJson`). `Perch-Setup.exe` is a plain copy of the versioned installer: upload it to every release.
With it, this link always gives the newest installer:

```
https://github.com/omanishay-cyber/perch/releases/latest/download/Perch-Setup.exe
```

Check before publishing: the versioned installer and `Perch-Setup.exe` have the same SHA-256.

```powershell
Get-FileHash .\Perch_1.1.0_x64-setup.exe, .\Perch-Setup.exe -Algorithm SHA256
```

## 3. The update file, `latest.json`

The Tauri updater (version 2) reads this shape. The `signature` is the full text of the `.sig` file, and the `url`
points at the versioned installer of the same release.

```json
{
  "version": "1.1.0",
  "notes": "New: ... Better: ... Fixed: ...",
  "pub_date": "2026-11-02T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "<contents of Perch_1.1.0_x64-setup.exe.sig>",
      "url": "https://github.com/omanishay-cyber/perch/releases/download/v1.1.0/Perch_1.1.0_x64-setup.exe"
    }
  }
}
```

Perch reads it from `https://github.com/omanishay-cyber/perch/releases/latest/download/latest.json`. A wrong
signature makes Perch refuse the update, so never edit the installer after the `.sig` was made.

## 4. The usage counter (ping files)

Perch counts installs and daily use with no personal data: it downloads a tiny file, and GitHub adds one to that
file's download count. Nothing else is sent.

Perch fetches them from the latest release, so every release carries its own two ping files:

| File | Content | Fetched |
|---|---|---|
| `ping-install.txt` | `ok` | once, on the first start after an install |
| `ping-active.txt` | `ok` | at most once per day per PC |

Upload both to every release. The names must match exactly: the app asks for
`https://github.com/omanishay-cyber/perch/releases/latest/download/ping-install.txt` and `ping-active.txt`.

To read the counts (every release added together):

```powershell
gh api repos/omanishay-cyber/perch/releases --jq '[.[].assets[] | select(.name|startswith("ping-"))] | group_by(.name) | map({(.[0].name): (map(.download_count)|add)}) | add'
```

`download_count` only goes up. Daily use is the difference between two readings taken a day apart, so note the
number at the same time each day. Deleting or re-uploading a ping file resets its count to zero.

## 5. Release notes

Plain words, newest first, three headings at most:

```markdown
## New
- The notch can show a second time zone.

## Better
- Start menu search finds Settings pages faster.

## Fixed
- The dock no longer shows over a full-screen video until you press Start.
```

## 6. Checklist for each release

1. Version set to the new number in the app (`package.json`, `tauri.conf.json`, `Cargo.toml`).
2. Build made, installer signed, `.sig` and `latest.json` produced.
3. Installer tested on Windows 11 and on Windows 10 22H2.
4. Release created with the tag, title and notes above.
5. Six files attached: versioned installer, `.sig`, `latest.json`, `Perch-Setup.exe`, `ping-install.txt`,
   `ping-active.txt`.
6. SHA-256 of `Perch-Setup.exe` equals that of the versioned installer.
7. The website's Download button downloads the new file (open the link once).
8. `softwareVersion` in `docs/index.html` (JSON-LD) and the version shown on the site updated.

## 7. The website

The site is in `docs/`. GitHub Pages serves it from the `main` branch, folder `/docs`
(Settings > Pages > Build and deployment > Deploy from a branch). Its address is
`https://omanishay-cyber.github.io/perch/`.
