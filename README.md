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
| `writings.json` | Titles, authors and years of the PDFs |
| `writings/` | The PDF files |

Links into the hub:

- `hub.html?kind=place`, `?kind=tool`, `?kind=writing` open with that filter
- `hub.html?read=<id>` opens a writing in the reader straight away (the address bar shows this link while you read, so you can copy and share it)

## Live station graph on the start page

The graph runs along the bottom of the start page, behind the text. At first it shows two neighbouring stations: a river or lake station of the Federal Office for the Environment (FOEN) in one of the case study areas or on a glacier-fed river, and the closest other station within 30 km, either a MeteoSwiss weather station or another river or lake (for example the Linth at Weesen with the Walensee). Another pair picks a new combination.

The panel on the right lists the shown stations, each in its own colour. Visitors can add up to four stations with the search (rivers, lakes and weather stations; nearby ones come first) and remove them again. Every measurement has a button that switches it off and on and shows its latest value; all start switched on. The line style tells the measurements apart: water level thick, discharge thin, water temperature dotted, air temperature dashed, and precipitation as hourly bars hanging from the top, as in a hydrograph. Each line is scaled to its own range. Hovering shows every value at that moment. The data refresh every ten minutes.

The data come from [api.existenz.ch](https://api.existenz.ch), a free service that republishes the official FOEN and MeteoSwiss readings. Station lists are kept in the visitor's browser for a day. If the service cannot be reached, the line falls back to a simulated water level and says so.

Settings at the top of `landing.js`:

| Setting | Meaning |
| --- | --- |
| `days` | How many days of readings are drawn (up to 31) |
| `pairWithinKm` | Farthest neighbour that is paired with the first station |
| `maxStations` | Most stations shown at once |
| `focus` | The stations the first one is picked from, matched by water body and place, with their labels |
| `colors` | The station colours, in the order stations are added |
| `refreshMinutes` | How often the readings are updated |

## Adding a writing

1. Upload the PDF to the `writings/` folder. Lowercase names without spaces work best, for example `haeusler-2026-hybrid-terrain-modeling.pdf`.
2. In Zotero, select the publication, choose *Export Item…* and pick the format **CSL JSON**.
3. Paste the entry into `writings.json` and add one line, `"file"`, with the path to the PDF:

```json
[
  {
    "file": "writings/haeusler-2026-hybrid-terrain-modeling.pdf",
    "id": "http://zotero.org/users/18632873/items/TA7YG9TJ",
    "type": "chapter",
    "title": "Hybrid Terrain Modeling: A Multidimensional Landscape Design Method",
    "title-short": "Hybrid Terrain Modeling",
    "container-title": "Journal of Digital Landscape Architecture 11-2026",
    "DOI": "10.14627/537770039",
    "author": [{ "family": "Häusler", "given": "Dennis" }],
    "issued": { "date-parts": [["2026", 5, 28]] }
  }
]
```

Zotero exports each file as a list in square brackets. When you add a second publication, copy only the part between `{` and `}` into the existing list and put a comma between the entries.

What the hub takes from each entry:

| From | Shown as |
| --- | --- |
| `title` | Panel and reader title |
| `author` | Author line, e.g. "Dennis Häusler, Matthias Vollmer" |
| `container-title` | Journal, proceedings or book |
| `issued` | Year on the panel, and the date for sorting |
| `DOI` (or `URL`) | DOI button in the reader |
| `title-short` | The short name in the reader link, e.g. `hub.html?read=hybrid-terrain-modeling` |
| `file` | The PDF (the one line you add yourself) |

Other Zotero fields such as `ISBN` or `accessed` can stay; they are ignored.

An entry without `"file"` still appears, as a panel that opens the DOI at the publisher. Add the file later and the panel opens the reader instead.

Optional fields you can add to any entry:

| Field | Used for |
| --- | --- |
| `cover` | An image to show on the panel instead of the first page, e.g. `"writings/hybrid-terrain-modeling.jpg"` |
| `description` | Short text on the panel when there are no authors |

If `writings.json` has a typing error, the hub says so at the top. The simple format from before (`title`, `authors`, `year`, `venue`) still works too.

PDFs that are in the folder but not yet in `writings.json` still appear, with a title made from the file name. This uses one GitHub request; turn it off with `autoDiscover: false` in `CONFIG.writings`.

## Notes on large scans

The reader only draws the pages near the part you are looking at and only downloads those parts of the file, so long scans open quickly. Two things help further:

- Keep scans at 200 to 300 dpi and save them with JPEG compression. A 20-page scan should stay well under 20 MB.
- GitHub refuses files over 100 MB and warns above 50 MB.
