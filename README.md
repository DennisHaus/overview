# Entwerfen in der Zeit

Methoden und Konzepte für dynamische Wasserlandschaften der Schweiz.
Doctoral research by Dennis Häusler, [Professur Voser](https://voser.arch.ethz.ch), Institute for Landscape and Urban Studies, ETH Zürich.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Start page with the project statement and links to places, tools and writings |
| `hub.html` | Panels and map of all websites, plus the writings and the PDF reader |
| `app.js` | Everything the hub does. Settings are at the top in `CONFIG` |
| `style.css` | Styles for both pages |
| `landing.js` | The live station graph on the start page. Settings are at the top in `GAUGE` |
| `writings.json` | Titles, authors and years of the writings, written by the Zotero sync |
| `writings/zotero/` | The PDFs, copied from Zotero by the sync |
| `scripts/zotero_sync.py`, `.github/workflows/zotero-sync.yml` | The nightly Zotero sync |

Links into the hub:

- `hub.html?kind=place`, `?kind=tool`, `?kind=writing` open with that filter
- `hub.html?read=<id>` opens a writing in the reader straight away (the address bar shows this link while you read, so you can copy and share it)

## Live station graph on the start page

The graph runs along the bottom of the start page, behind the text. At first it shows two neighbouring stations: a river or lake station of the Federal Office for the Environment (FOEN) in one of the case study areas or on a glacier-fed river, and the closest other station within 30 km, either a MeteoSwiss weather station or another river or lake (for example the Linth at Weesen with the Walensee). Another pair picks a new combination.

The panel on the right lists the shown stations, each in its own colour. Visitors can add up to four stations with the search (rivers, lakes and weather stations; nearby ones come first) and remove them again. Every measurement has a button that switches it off and on and shows its latest value; all start switched on. The line style tells the measurements apart: water level thick, discharge thin, water temperature dotted, air temperature dashed, and precipitation as hourly bars hanging from the top, as in a hydrograph. Each line is scaled to its own range. Hovering shows every value at that moment. The data refresh every ten minutes.

The time span runs from a week to ten years, with the right edge always at the present:

| Span | Data | Source |
| --- | --- | --- |
| Week, Month | 10-minute readings, precipitation per hour | [api.existenz.ch](https://api.existenz.ch), which republishes the official FOEN and MeteoSwiss readings |
| Year | Daily means, precipitation per day | Rivers and lakes: FOEN data platform ([data.bafu.admin.ch](https://data.bafu.admin.ch)). Weather: MeteoSwiss open data ([data.geo.admin.ch](https://data.geo.admin.ch)) |
| 10 years | Weekly means of the daily values, precipitation per week | As for Year |

Station lists are kept in the visitor's browser for a day; long-term records are loaded once per station and visit. If the live service cannot be reached, the line falls back to a simulated water level and says so. If the long-term records cannot be reached, Week and Month keep working.

Settings at the top of `landing.js`:

| Setting | Meaning |
| --- | --- |
| `ranges` | The time spans: length in days, data source and precipitation bar width |
| `defaultRange` | The time span shown first |
| `pairWithinKm` | Farthest neighbour that is paired with the first station |
| `maxStations` | Most stations shown at once |
| `focus` | The stations the first one is picked from, matched by water body and place, with their labels |
| `colors` | The station colours, in the order stations are added |
| `refreshMinutes` | How often the readings are updated |

## Writings from Zotero

The writings come from the Zotero library (user 18632873). Every night a GitHub Action (`.github/workflows/zotero-sync.yml`, running `scripts/zotero_sync.py`) reads all items with Dennis Häusler as author or editor, writes their data to `writings.json` and copies their PDF attachments to `writings/zotero/`. GitHub Pages then publishes the update. The Zotero API key stays a hidden repository secret; the website itself never contacts Zotero.

### Setting it up (once)

1. In Zotero, create a private API key at [zotero.org/settings/keys/new](https://www.zotero.org/settings/keys/new). Name it "website sync", tick only "Allow library access" under Personal Library, and save. Copy the key.
2. In this repository on GitHub, open Settings, then Secrets and variables, then Actions, and choose New repository secret. Name: `ZOTERO_API_KEY`. Value: the key.
3. Open the Actions tab, choose "Sync writings from Zotero" and Run workflow. After a minute the writings appear on the site. From then on the sync runs every night; Run workflow updates the site at once.

### In Zotero

- PDFs must be stored in Zotero (attached files, not linked files) and synced to zotero.org.
- The sync publishes every PDF it finds. Check that you may share a PDF publicly (open access, or an author version) before attaching it.
- Tag an item `website: no pdf` to list it without its PDF, or `website: hide` to leave it out completely.
- A PDF that is not in Zotero can be added by hand as `writings/<item key>.pdf`, using the eight-character key of the Zotero item.

`writings.json` is rewritten on every sync, so changes belong in Zotero rather than in the file. The reader link of a writing is made from its short title, for example `hub.html?read=hybrid-terrain-modeling`.

### What the hub shows

| Zotero field | Shown as |
| --- | --- |
| Title | Panel and reader title |
| Authors | Author line; editors marked "(eds.)" when a book has no authors |
| Publication or book title | Journal, proceedings or book |
| Publisher | In the reader header after the journal or book |
| Date | Year on the panel, and the order |
| DOI or URL | DOI button in the reader; the panel opens it when there is no PDF |

Writings without a PDF still appear: with a DOI or URL their panel opens the publisher page, otherwise they are listed as "no PDF yet".

The reader shows one page at a time or two side by side, like an open book. In two-page view, Fit shows the whole spread on screen.

## Notes on large scans

The reader only draws the pages near the part you are looking at and only downloads those parts of the file, so long scans open quickly. Two things help further:

- Keep scans at 200 to 300 dpi and save them with JPEG compression. A 20-page scan should stay well under 20 MB.
- GitHub refuses files over 100 MB and warns above 50 MB.
