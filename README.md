# Entwerfen in der Zeit

Methoden und Konzepte für dynamische Wasserlandschaften der Schweiz.
Doctoral research by Dennis Häusler, Professur Voser, Institute for Landscape and Urban Studies, ETH Zürich.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Start page with the project statement and links to places, tools and writings |
| `hub.html` | Panels and map of all websites, plus the writings and the PDF reader |
| `app.js` | Everything the hub does. Settings are at the top in `CONFIG` |
| `style.css` | Styles for both pages |
| `landing.js` | The moving water line on the start page |
| `writings.json` | Titles, authors and years of the PDFs |
| `writings/` | The PDF files |

Links into the hub:

- `hub.html?kind=place`, `?kind=tool`, `?kind=writing` open with that filter
- `hub.html?read=<id>` opens a writing in the reader straight away (the address bar shows this link while you read, so you can copy and share it)

## Adding a writing

1. Upload the PDF to the `writings/` folder. Lowercase names without spaces work best, for example `haeusler-2025-hybrid-modelling.pdf`.
2. Add an entry to `writings.json`:

```json
[
  {
    "id": "hybrid-modelling",
    "file": "writings/haeusler-2025-hybrid-modelling.pdf",
    "title": "Hybrid Modelling",
    "authors": ["Dennis Häusler", "Martina Voser"],
    "year": 2025,
    "venue": "Journal of Digital Landscape Architecture"
  }
]
```

Only `file` is required. Everything else is optional:

| Field | Used for |
| --- | --- |
| `id` | The short name in the reader link (`hub.html?read=hybrid-modelling`). Taken from the file name if left out. Keep it stable once you share links |
| `title` | Panel and reader title. Taken from the file name if left out |
| `authors` | A list or a single text |
| `year` | Shown on the panel and used for sorting by date. Taken from the file name if it contains a year |
| `date` | Exact date for sorting, e.g. `"2025-06-12"` |
| `venue` | Journal, conference or book |
| `description` | Short text on the panel when there are no authors |
| `cover` | An image to show on the panel instead of the first page, e.g. `"writings/hybrid-modelling.jpg"` |

Separate entries with commas and keep the square brackets around the whole list. If the file has a typing error, the hub says so at the top.

PDFs that are in the folder but not yet in `writings.json` still appear, with a title made from the file name. This uses one GitHub request; turn it off with `autoDiscover: false` in `CONFIG.writings`.

## Notes on large scans

The reader only draws the pages near the part you are looking at and only downloads those parts of the file, so long scans open quickly. Two things help further:

- Keep scans at 200 to 300 dpi and save them with JPEG compression. A 20-page scan should stay well under 20 MB.
- GitHub refuses files over 100 MB and warns above 50 MB.
