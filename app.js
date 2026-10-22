'use strict';

/* =====================================================================
   SETTINGS — the only part you normally need to edit
   ===================================================================== */
const CONFIG = {
  user: 'dennishaus',          // GitHub user whose Pages sites are listed

  // Repos hidden completely (upper/lower case doesn't matter)
  exclude: ['debris', 'riverpulse', 'Situationsplan'],

  // Repos that are tools: shown as panels, never on the map.
  // Anything without a recognised location is a tool automatically;
  // list a repo here if its name happens to contain a place name.
  tools: [],

  includeForks: false,

  // Language for place, region and country names found from coordinates ('en', 'de', 'it', …)
  placeLanguage: 'en',

  // Optional fixes per repo (key = repo name). Everything is optional.
  overrides: {
    // venezia_garden: { title: 'Venezia Garden', place: 'venice' },
    // some_repo: { kind: 'tool' },   // or kind: 'place' together with a place
    // some_repo: { place: { name: 'Sils Maria', country: 'Switzerland', lat: 46.43, lng: 9.76 } },
    // some_repo: { preview: 'https://dennishaus.github.io/some_repo/cover.jpg', description: 'Text' },
  },

  // Writings: PDFs kept in a folder of this repository and listed in writings.json
  writings: {
    manifest: 'writings.json',   // titles, authors, year … for each PDF (see README.md)
    repo: 'overview',            // repository that holds the PDFs
    folder: 'writings',          // folder inside that repository
    autoDiscover: true,          // PDFs in the folder appear even before they are listed in writings.json
  },

  // PDF.js draws the pages in the reader and the covers on the panels
  pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfjsWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',

  livePreviewWidth: 1280,      // the size the site is rendered at before being scaled into the panel
  livePreviewHeight: 800,
  maxLivePreviews: 8,          // browsers only allow ~16 WebGL contexts, so keep this modest
  cacheMinutes: 10,            // GitHub allows 60 unauthenticated API calls per hour
};

/* =====================================================================
   PLACES — repo names, descriptions, topics and page titles are matched
   against these words. Add your own: P(name, country, lat, lng, ...words)
   ===================================================================== */
const P = (name, country, lat, lng, ...aliases) => ({ name, country, lat, lng, aliases });

const PLACES = [
  // Italy
  P('Venice', 'Italy', 45.4408, 12.3155, 'venice', 'venezia', 'venedig', 'venise'),
  P('Murano', 'Italy', 45.4590, 12.3527, 'murano'),
  P('Burano', 'Italy', 45.4853, 12.4167, 'burano'),
  P('Milan', 'Italy', 45.4642, 9.1900, 'milan', 'milano', 'mailand'),
  P('Como', 'Italy', 45.8081, 9.0852, 'como', 'lake como', 'lago di como', 'comer see'),
  P('Bellagio', 'Italy', 45.9870, 9.2610, 'bellagio'),
  P('Lake Garda', 'Italy', 45.5760, 10.7070, 'garda', 'lake garda', 'lago di garda', 'gardasee'),
  P('Verona', 'Italy', 45.4384, 10.9916, 'verona'),
  P('Padua', 'Italy', 45.4064, 11.8768, 'padua', 'padova'),
  P('Trieste', 'Italy', 45.6495, 13.7768, 'trieste', 'triest'),
  P('Bergamo', 'Italy', 45.6983, 9.6773, 'bergamo'),
  P('Turin', 'Italy', 45.0703, 7.6869, 'turin', 'torino'),
  P('Bolzano', 'Italy', 46.4983, 11.3548, 'bolzano', 'bozen'),
  P('Merano', 'Italy', 46.6713, 11.1594, 'merano', 'meran'),
  P('Cortina d’Ampezzo', 'Italy', 46.5405, 12.1357, 'cortina', 'cortina d ampezzo'),
  P('Florence', 'Italy', 43.7696, 11.2558, 'florence', 'firenze', 'florenz'),
  P('Rome', 'Italy', 41.9028, 12.4964, 'rome', 'roma'),
  P('Naples', 'Italy', 40.8518, 14.2681, 'naples', 'napoli', 'neapel'),
  P('Amalfi', 'Italy', 40.6340, 14.6027, 'amalfi'),

  // Switzerland
  P('Zurich', 'Switzerland', 47.3769, 8.5417, 'zurich', 'zuerich', 'zurigo', 'zueri', 'zuri'),
  P('Brienz/Brinzauls', 'Switzerland', 46.6650, 9.5960, 'brinzauls', 'brienz brinzauls'),
  P('Brienz', 'Switzerland', 46.7540, 8.0380, 'brienz'),
  P('Blatten (Lötschental)', 'Switzerland', 46.4206, 7.8197, 'blatten', 'loetschental', 'lotschental'),
  P('Bern', 'Switzerland', 46.9480, 7.4474, 'bern', 'berne'),
  P('Basel', 'Switzerland', 47.5596, 7.5886, 'basel', 'bale', 'basilea'),
  P('Geneva', 'Switzerland', 46.2044, 6.1432, 'geneva', 'geneve', 'genf', 'ginevra'),
  P('Lausanne', 'Switzerland', 46.5197, 6.6323, 'lausanne'),
  P('Lucerne', 'Switzerland', 47.0502, 8.3093, 'lucerne', 'luzern', 'lucerna'),
  P('Lugano', 'Switzerland', 46.0037, 8.9511, 'lugano'),
  P('Locarno', 'Switzerland', 46.1709, 8.7995, 'locarno'),
  P('Zug', 'Switzerland', 47.1662, 8.5155, 'zug'),
  P('Winterthur', 'Switzerland', 47.4988, 8.7237, 'winterthur'),
  P('St. Gallen', 'Switzerland', 47.4245, 9.3767, 'st gallen', 'sankt gallen', 'stgallen'),
  P('Thun', 'Switzerland', 46.7580, 7.6280, 'thun'),
  P('Chur', 'Switzerland', 46.8508, 9.5320, 'chur', 'cuira', 'coira'),
  P('Davos', 'Switzerland', 46.8027, 9.8360, 'davos'),
  P('Arosa', 'Switzerland', 46.7783, 9.6790, 'arosa'),
  P('Lenzerheide', 'Switzerland', 46.7270, 9.5590, 'lenzerheide'),
  P('Laax', 'Switzerland', 46.8070, 9.2580, 'laax'),
  P('Flims', 'Switzerland', 46.8350, 9.2830, 'flims'),
  P('Tiefencastel', 'Switzerland', 46.6600, 9.5780, 'tiefencastel'),
  P('Filisur', 'Switzerland', 46.6730, 9.6860, 'filisur'),
  P('Bergün', 'Switzerland', 46.6300, 9.7470, 'bergun', 'bergun filisur', 'bravuogn'),
  P('Savognin', 'Switzerland', 46.5960, 9.5960, 'savognin'),
  P('St. Moritz', 'Switzerland', 46.4908, 9.8355, 'st moritz', 'sankt moritz', 'stmoritz', 'san murezzan'),
  P('Pontresina', 'Switzerland', 46.4920, 9.9010, 'pontresina'),
  P('Sils', 'Switzerland', 46.4290, 9.7600, 'sils', 'sils maria'),
  P('Scuol', 'Switzerland', 46.7966, 10.2980, 'scuol'),
  P('Andermatt', 'Switzerland', 46.6356, 8.5939, 'andermatt'),
  P('Engelberg', 'Switzerland', 46.8199, 8.4072, 'engelberg'),
  P('Interlaken', 'Switzerland', 46.6863, 7.8632, 'interlaken'),
  P('Grindelwald', 'Switzerland', 46.6242, 8.0414, 'grindelwald'),
  P('Lauterbrunnen', 'Switzerland', 46.5935, 7.9091, 'lauterbrunnen'),
  P('Wengen', 'Switzerland', 46.6080, 7.9220, 'wengen'),
  P('Mürren', 'Switzerland', 46.5590, 7.8920, 'murren', 'muerren'),
  P('Zermatt', 'Switzerland', 46.0207, 7.7491, 'zermatt', 'matterhorn'),
  P('Saas-Fee', 'Switzerland', 46.1083, 7.9283, 'saas fee', 'saasfee'),

  // Germany, Austria, France and more
  P('Munich', 'Germany', 48.1351, 11.5820, 'munich', 'munchen', 'muenchen'),
  P('Garmisch-Partenkirchen', 'Germany', 47.4917, 11.0955, 'garmisch', 'partenkirchen'),
  P('Berlin', 'Germany', 52.5200, 13.4050, 'berlin'),
  P('Hamburg', 'Germany', 53.5511, 9.9937, 'hamburg'),
  P('Innsbruck', 'Austria', 47.2692, 11.4041, 'innsbruck'),
  P('Salzburg', 'Austria', 47.8095, 13.0550, 'salzburg'),
  P('Vienna', 'Austria', 48.2082, 16.3738, 'vienna', 'wien'),
  P('Chamonix', 'France', 45.9237, 6.8694, 'chamonix'),
  P('Paris', 'France', 48.8566, 2.3522, 'paris'),
  P('London', 'United Kingdom', 51.5072, -0.1276, 'london'),
  P('Amsterdam', 'Netherlands', 52.3676, 4.9041, 'amsterdam'),
  P('Barcelona', 'Spain', 41.3874, 2.1686, 'barcelona'),
  P('Lisbon', 'Portugal', 38.7223, -9.1393, 'lisbon', 'lisboa'),
  P('Prague', 'Czechia', 50.0755, 14.4378, 'prague', 'praha', 'prag'),
];

// Extra words so a search for "schweiz" or "italia" also finds those places
const COUNTRY_WORDS = {
  Italy: 'italia italien italie',
  Switzerland: 'schweiz suisse svizzera svizra swiss',
  Germany: 'deutschland allemagne germania',
  Austria: 'osterreich oesterreich autriche',
  France: 'frankreich francia',
  'United Kingdom': 'uk england',
  Netherlands: 'holland niederlande',
  Spain: 'spanien espana',
  Portugal: 'portugal',
  Czechia: 'czech republic tschechien',
};

// Country from the first letters of <meta name="geo.region" content="CH-GR">
const REGION_COUNTRIES = {
  CH: 'Switzerland', IT: 'Italy', DE: 'Germany', AT: 'Austria', FR: 'France', LI: 'Liechtenstein',
  GB: 'United Kingdom', NL: 'Netherlands', ES: 'Spain', PT: 'Portugal', CZ: 'Czechia', SI: 'Slovenia',
};

/* =====================================================================
   Helpers
   ===================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);

function norm(value) {
  return String(value ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const SMALL_WORDS = new Set(['and', 'of', 'the', 'di', 'da', 'del', 'della', 'am', 'im', 'an', 'de', 'la', 'le']);

function titleFromSlug(slug) {
  return slug
    .replace(/\.github\.io$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase()))
      ? w.toLowerCase()
      : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const ALIAS_INDEX = PLACES
  .flatMap(p => p.aliases.map(a => [norm(a), p]))
  .sort((a, b) => b[0].length - a[0].length); // longest match wins ("brienz brinzauls" before "brienz")

function findPlace(...texts) {
  for (const text of texts) {
    const hay = ` ${norm(text)} `;
    if (!hay.trim()) continue;
    for (const [alias, place] of ALIAS_INDEX) {
      if (hay.includes(` ${alias} `)) return place;
    }
  }
  return null;
}

function placeLabel(place) {
  if (!place) return '';
  const parts = [];
  for (const part of [place.name, place.region, place.country]) {
    if (part && !parts.some(p => norm(p) === norm(part))) parts.push(part);
  }
  return parts.join(', ');
}

function coordLabel(place) {
  const lat = `${Math.abs(place.lat).toFixed(2)}° ${place.lat >= 0 ? 'N' : 'S'}`;
  const lng = `${Math.abs(place.lng).toFixed(2)}° ${place.lng >= 0 ? 'E' : 'W'}`;
  return `${lat}, ${lng}`;
}

function initials(title) {
  const words = title.split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] || '') + (words[1]?.[0] || '')).toUpperCase() || '•';
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
};

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

function canLoadImage(src, timeout = 5000) {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(false); }, timeout);
    img.onload = () => { clearTimeout(timer); resolve(img.naturalWidth > 0); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = src;
  });
}

/* =====================================================================
   GitHub discovery
   ===================================================================== */
const ROOT_URL = `https://${CONFIG.user.toLowerCase()}.github.io/`;
const ROOT_REPO = `${CONFIG.user.toLowerCase()}.github.io`;

function currentRepoName() {
  if (!location.hostname.endsWith('.github.io')) return null;
  const first = location.pathname.split('/').filter(Boolean)[0];
  return first && !first.includes('.') ? first : location.hostname; // root site repo is named like the host
}

function pageUrlFor(repo) {
  if (repo.name.toLowerCase() === ROOT_REPO) return ROOT_URL;
  if (repo.homepage && /^https?:\/\//i.test(repo.homepage)) {
    return repo.homepage.endsWith('/') ? repo.homepage : `${repo.homepage}/`;
  }
  return `${ROOT_URL}${repo.name}/`;
}

async function fetchRepos() {
  const key = `hub:repos:${CONFIG.user}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.t < CONFIG.cacheMinutes * 60000) return cached.data;
  } catch { /* ignore */ }

  const all = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(CONFIG.user)}/repos?per_page=100&page=${page}&sort=pushed`,
      { headers: { Accept: 'application/vnd.github+json' } },
    );
    if (!res.ok) {
      const err = new Error(`GitHub answered ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) break;
  }

  const data = all.map(r => ({
    name: r.name,
    description: r.description || '',
    topics: r.topics || [],
    has_pages: r.has_pages,
    fork: r.fork,
    homepage: r.homepage || '',
    updated: r.pushed_at || r.updated_at,
    html_url: r.html_url,
  }));

  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch { /* ignore */ }
  return data;
}

// Reads title, description, og:image and optional geo tags from each site
async function fetchPageMeta(url) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return {};

    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const meta = name => doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute('content')?.trim() || '';

    let geo = null;
    const pos = meta('geo.position') || meta('ICBM');
    if (pos) {
      const [lat, lng] = pos.split(/[;,\s]+/).map(Number);
      if (Number.isFinite(lat) && Number.isFinite(lng)) geo = { lat, lng };
    }

    let image = meta('og:image') || meta('twitter:image');
    if (image) { try { image = new URL(image, url).href; } catch { image = ''; } }

    return {
      pageTitle: meta('og:title') || doc.title?.trim() || '',
      description: meta('description') || meta('og:description'),
      image,
      geo,
      placeName: meta('geo.placename'),
      region: meta('geo.region'),
    };
  } catch {
    return {};
  }
}

/* ---------- location-config.js in each repo ---------- */

function fetchWithTimeout(url, ms = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseCoords(value) {
  if (!value) return null;
  const [lat, lng] = String(value).split(/[;,\s]+/).filter(Boolean).map(Number);
  const ok = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  return ok ? { lat, lng } : null;
}

// Reads pageTitle and coordinates from <site>/location-config.js without running it.
// Accepts  coordinates: "45.445947, 12.334221"  or  coordinates: [45.445947, 12.334221]
async function fetchLocationConfig(url) {
  try {
    const res = await fetchWithTimeout(`${url}location-config.js`);
    if (!res.ok) return {};
    const text = await res.text();

    const stringValue = key => {
      const m = text.match(new RegExp(String.raw`["']?\b${key}["']?\s*[:=]\s*(["'\x60])([\s\S]*?)\1`));
      return m ? m[2].trim() : '';
    };

    let coords = parseCoords(stringValue('coordinates'));
    if (!coords) {
      const m = text.match(/["']?\bcoordinates["']?\s*[:=]\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (m) coords = parseCoords(`${m[1]},${m[2]}`);
    }

    return { pageTitle: stringValue('pageTitle'), coords };
  } catch {
    return {};
  }
}

/* ---------- place, region and country from coordinates ---------- */

// Results are remembered in the browser, so each spot is only looked up once
const GEO_CACHE_KEY = `hub:geocode:${CONFIG.placeLanguage}`;
const geoCache = store.get(GEO_CACHE_KEY, {});
let geoQueue = Promise.resolve();

// OpenStreetMap's Nominatim allows one request per second, so lookups wait in line
function reverseGeocode(lat, lng) {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (geoCache[key]) return Promise.resolve(geoCache[key]);

  const job = geoQueue.then(async () => {
    try {
      const res = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=${CONFIG.placeLanguage}`,
        8000,
      );
      if (!res.ok) return null;
      const a = (await res.json()).address || {};
      const result = {
        name: a.city || a.town || a.village || a.municipality || a.hamlet || a.suburb || '',
        region: a.state || a.region || a.province || a.county || '',
        country: a.country || '',
      };
      if (!result.name && !result.country) return null;
      geoCache[key] = result;
      store.set(GEO_CACHE_KEY, geoCache);
      return result;
    } catch {
      return null;
    }
  });
  geoQueue = job.then(() => sleep(1100));
  return job;
}

function distanceKm(a, b) {
  const rad = d => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

function nearestPlace(coords, maxKm = 25) {
  let best = null;
  let bestKm = maxKm;
  for (const p of PLACES) {
    const km = distanceKm(coords, p);
    if (km < bestKm) { best = p; bestKm = km; }
  }
  return best;
}

// Turns exact coordinates into a full place: name, region and country
async function describeCoords(coords, meta = {}) {
  const found = await reverseGeocode(coords.lat, coords.lng);
  const near = nearestPlace(coords);
  return {
    lat: coords.lat,
    lng: coords.lng,
    name: found?.name || meta.placeName || near?.name || 'Pinned location',
    region: found?.region || '',
    country: found?.country || REGION_COUNTRIES[(meta.region || '').slice(0, 2).toUpperCase()] || near?.country || '',
    aliases: near?.aliases || [], // so "venezia" still finds Venice
  };
}

// Everything the hub reads from one website
async function readSite(repo) {
  const url = CONFIG.overrides[repo.name]?.url || pageUrlFor(repo);
  const [meta, config] = await Promise.all([fetchPageMeta(url), fetchLocationConfig(url)]);
  meta.config = config;
  const coords = config.coords || meta.geo;
  if (coords && !CONFIG.overrides[repo.name]?.place) meta.located = await describeCoords(coords, meta);
  return meta;
}

function buildSite(repo, meta) {
  const o = CONFIG.overrides[repo.name] || {};
  const url = o.url || pageUrlFor(repo);
  // Name: override > pageTitle in location-config.js > the website's <title> > the repo name
  const title = o.title || meta.config?.pageTitle || meta.pageTitle ||
    titleFromSlug(repo.name.toLowerCase() === ROOT_REPO ? CONFIG.user : repo.name);
  const description = o.description || repo.description || meta.description || '';
  const topics = repo.topics.join(' ');

  // Location: override > coordinates in location-config.js (or geo tags) > place names in the repo
  let place = null;
  if (o.place) place = typeof o.place === 'string' ? findPlace(o.place) : o.place;
  if (!place && meta.located) place = meta.located;
  if (!place) place = findPlace(repo.name, topics, repo.description, meta.pageTitle, meta.description, meta.placeName);

  const listedAsTool = CONFIG.tools.some(n => n.toLowerCase() === repo.name.toLowerCase());
  const kind = o.kind || (listedAsTool || !place ? 'tool' : 'place');
  if (kind === 'tool') place = null; // tools never get a pin

  const searchText = norm([
    title, repo.name, description, meta.pageTitle, topics, kind === 'tool' ? 'tool tools' : 'place places',
    place?.name, place?.region, place?.country, place && COUNTRY_WORDS[place.country], place?.aliases?.join(' '),
  ].filter(Boolean).join(' '));

  return {
    id: repo.name,
    title,
    url,
    source: repo.html_url,
    description,
    place,
    kind,
    previews: [o.preview, meta.image, `${url}preview.png`, `${url}preview.jpg`].filter(Boolean),
    updated: repo.updated || '',
    searchText,
  };
}

/* =====================================================================
   Writings — PDFs listed in writings.json, plus any others in the folder
   ===================================================================== */
const fileKey = path => decodeURIComponent(String(path)).replace(/^\.?\//, '').toLowerCase();
const slugify = value => norm(value).replace(/ /g, '-') || 'writing';

// One GitHub call lists the PDFs in the folder, so new uploads show up on their own
async function fetchWritingFiles() {
  const { repo, folder } = CONFIG.writings;
  const key = `hub:writings:${CONFIG.user}/${repo}/${folder}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.t < CONFIG.cacheMinutes * 60000) return cached.data;
  } catch { /* ignore */ }

  const path = folder.split('/').map(encodeURIComponent).join('/');
  const res = await fetchWithTimeout(
    `https://api.github.com/repos/${encodeURIComponent(CONFIG.user)}/${encodeURIComponent(repo)}/contents/${path}`, 8000);
  if (!res.ok) return [];
  const list = await res.json();
  const data = Array.isArray(list)
    ? list.filter(f => f.type === 'file' && /\.pdf$/i.test(f.name)).map(f => ({ path: f.path }))
    : [];
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch { /* ignore */ }
  return data;
}

/* ---------- CSL JSON, as exported from Zotero ---------- */
const isUrl = value => /^[a-z][a-z0-9+.-]*:\/\//i.test(String(value || ''));

function cslNames(list) {
  return (Array.isArray(list) ? list : [])
    .map(a => a.literal || [a.given, a['non-dropping-particle'], a.family].filter(Boolean).join(' '))
    .filter(Boolean);
}

// "issued": { "date-parts": [[2026, 5, 28]] }  ->  { year: "2026", date: "2026-05-28" }
function cslDate(value) {
  const parts = value?.['date-parts']?.[0];
  if (parts?.length && parts[0]) {
    const [y, m, d] = parts.map(Number);
    const pad = n => String(n).padStart(2, '0');
    return { year: String(y), date: [y, m && pad(m), m && d && pad(d)].filter(Boolean).join('-') };
  }
  const year = String(value?.raw || value?.literal || '').match(/(?:19|20)\d{2}/)?.[0];
  return year ? { year, date: '' } : null;
}

function buildWriting(entry, used) {
  const file = typeof entry.file === 'string' ? entry.file.trim() : '';
  const fileName = file ? decodeURIComponent(file.split('/').pop()) : '';
  const stem = fileName.replace(/\.pdf$/i, '');
  const issued = cslDate(entry.issued);
  const year = String(entry.year || issued?.year || (stem.match(/(?:^|\D)((?:19|20)\d{2})(?:\D|$)/) || [])[1] || '');
  const title = entry.title ||
    (stem && titleFromSlug(stem.replace(/(?:^|[-_\s])(?:19|20)\d{2}(?=[-_\s]|$)/, ' ').trim())) || stem || 'Untitled';

  // Zotero ids are long URLs, so the short title makes the reader link instead
  const slugSource = (entry.id && !isUrl(entry.id) && !String(entry.id).includes('/') ? entry.id : '') ||
    entry['citation-key'] || entry['title-short'] || entry.title || stem;
  let slug = slugify(slugSource);
  while (used.has(slug)) slug += '-2';
  used.add(slug);

  // authors, or editors marked as such when a book only lists editors
  const editors = cslNames(entry.editor);
  const authors = Array.isArray(entry.authors) ? entry.authors.join(', ')
    : (entry.authors || cslNames(entry.author).join(', ') ||
      (editors.length ? `${editors.join(', ')} (${editors.length === 1 ? 'ed.' : 'eds.'})` : ''));
  const venue = entry.venue || entry['container-title'] || '';
  const publisher = entry.publisher || '';
  const description = entry.description || '';
  const doi = String(entry.DOI || '').replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim();
  const link = doi ? `https://doi.org/${doi}` : (isUrl(entry.URL) ? entry.URL : '');

  return {
    id: `writing:${slug}`,
    slug,
    kind: 'writing',
    title,
    authors,
    venue,
    publisher,
    year,
    description,
    pages: 0,
    place: null,
    url: file ? `?read=${encodeURIComponent(slug)}` : link,   // no PDF yet: the panel opens the DOI
    file: file ? new URL(file, location.href).href : '',
    fileName,
    doi,
    link,
    cover: entry.cover ? new URL(entry.cover, location.href).href : '',
    previews: [],
    updated: entry.date || issued?.date || (year ? `${year}-01-01` : ''),
    searchText: norm([title, entry['title-short'], authors, venue, publisher, year, description, stem, doi,
      'writing writings publication paper pdf'].join(' ')),
  };
}

async function loadWritings() {
  let entries = [];
  let note = '';
  try {
    const res = await fetch(CONFIG.writings.manifest, { cache: 'no-cache' });
    if (res.ok) {
      try { entries = JSON.parse(await res.text()); } catch (err) {
        note = `${CONFIG.writings.manifest} could not be read (${err.message}). Check commas and quotes in the file.`;
      }
    }
  } catch { /* no manifest yet */ }
  if (!Array.isArray(entries)) entries = [];
  const hasFile = e => typeof e.file === 'string' && e.file.trim();
  entries = entries.filter(e => e && (hasFile(e) || e.DOI || isUrl(e.URL) || e.title));

  if (CONFIG.writings.autoDiscover) {
    try {
      const listed = new Set(entries.filter(hasFile).map(e => fileKey(e.file)));
      for (const f of await fetchWritingFiles()) {
        if (!listed.has(fileKey(f.path))) entries.push({ file: f.path });
      }
    } catch { /* GitHub unreachable: the manifest alone is used */ }
  }

  const used = new Set();
  return { writings: entries.map(e => buildWriting(e, used)), note };
}

function writingDetails(site) {
  return [site.venue || site.publisher, site.year].filter(Boolean).join(', ');
}

// Reader header: journal or book, publisher and year
function publicationLine(site) {
  return [site.venue, site.publisher, site.year].filter(Boolean).join(', ');
}

/* ---------- PDF.js, loaded only when a writing is shown ---------- */
let pdfjsPromise = null;
const pdfCache = new Map();

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  pdfjsPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CONFIG.pdfjs;
    script.onload = () => {
      const lib = window.pdfjsLib;
      if (!lib) { reject(new Error('PDF.js did not start')); return; }
      lib.GlobalWorkerOptions.workerSrc = CONFIG.pdfjsWorker;
      resolve(lib);
    };
    script.onerror = () => { pdfjsPromise = null; reject(new Error('the PDF viewer could not be loaded')); };
    document.head.append(script);
  });
  return pdfjsPromise;
}

// Each PDF is opened once and shared by its panel cover and the reader.
// Only the parts that are drawn are downloaded (byte ranges).
function openPdf(url) {
  if (!pdfCache.has(url)) {
    const job = loadPdfJs().then(lib => lib.getDocument({
      url,
      disableAutoFetch: true,
      disableStream: true,
      isEvalSupported: false,
    }).promise);
    job.catch(() => pdfCache.delete(url));
    pdfCache.set(url, job);
  }
  return pdfCache.get(url);
}

/* =====================================================================
   State & elements
   ===================================================================== */
const state = {
  sites: [],
  byId: new Map(),
  cards: new Map(),
  markers: new Map(),
  visible: new Set(),       // cards currently near the viewport
  live: true,               // live previews are always on
  view: store.get('hub:view', 'both'),
  kind: store.get('hub:kind', 'all'),
};

const el = {
  layout: $('#layout'),
  panels: $('#panels'),
  grid: $('#grid'),
  status: $('#status'),
  mapnote: $('#mapnote'),
  search: $('#search'),
  sort: $('#sort'),
  viewButtons: [...document.querySelectorAll('button[data-view]')],
  viewGroup: document.querySelector('.views[aria-label="View"]'),
  kindButtons: [...document.querySelectorAll('button[data-kind]')],
};

function setStatus(text, isError = false) {
  el.status.textContent = text;
  el.status.classList.toggle('is-error', isError);
}

/* =====================================================================
   Map — vector tiles (OpenFreeMap, no API key) drawn with MapLibre.
   Only forests, lakes, rivers and place names are drawn:
   no roads, railways, paths or ferry routes.
   ===================================================================== */
const MAP_COLORS = {
  land: '#2b2b2b',
  forest: '#34413a',
  water: '#46586a',
  label: '#dcdcdc',
  halo: '#1e1e1e',
};

const MAP_STYLE = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
  },
  layers: [
    { id: 'land', type: 'background', paint: { 'background-color': MAP_COLORS.land } },
    {
      id: 'forest', type: 'fill', source: 'omt', 'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'wood'],
      paint: { 'fill-color': MAP_COLORS.forest },
    },
    {
      id: 'rivers', type: 'line', source: 'omt', 'source-layer': 'waterway',
      filter: ['in', ['get', 'class'], ['literal', ['river', 'canal']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': MAP_COLORS.water,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.6, 10, 1.6, 14, 4],
      },
    },
    {
      id: 'streams', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 11,
      filter: ['==', ['get', 'class'], 'stream'],
      paint: { 'line-color': MAP_COLORS.water, 'line-width': 0.8 },
    },
    {
      id: 'lakes', type: 'fill', source: 'omt', 'source-layer': 'water',
      paint: { 'fill-color': MAP_COLORS.water },
    },
    placeLabels('cities', ['city'], 4, 12),
    placeLabels('towns', ['town'], 8, 11),
    placeLabels('villages', ['village'], 11, 10),
  ],
};

function placeLabels(id, classes, minzoom, size) {
  return {
    id, type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom,
    filter: ['in', ['get', 'class'], ['literal', classes]],
    layout: {
      'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
      'text-font': ['Noto Sans Regular'],
      'text-size': size,
      'text-letter-spacing': 0.04,
    },
    paint: {
      'text-color': MAP_COLORS.label,
      'text-halo-color': MAP_COLORS.halo,
      'text-halo-width': 1.2,
    },
  };
}

let map;

function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: MAP_STYLE,
    center: [10.2, 46.6],
    zoom: 5.3,
    attributionControl: false,   // credit is shown as plain text in index.html
    dragRotate: false,
    pitchWithRotate: false,
    renderWorldCopies: false,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
}

function popupFor(site) {
  const box = document.createElement('div');
  box.className = 'pop';

  const title = document.createElement('strong');
  title.textContent = site.title;

  const where = document.createElement('span');
  where.textContent = placeLabel(site.place);

  const links = document.createElement('div');
  links.className = 'links';
  const open = Object.assign(document.createElement('a'), { href: site.url, target: '_blank', rel: 'noopener', textContent: 'Open website' });
  links.append(open);

  box.append(title, where, links);
  return box;
}

function makeMarker(site, lngLat) {
  const wrap = document.createElement('button');
  wrap.type = 'button';
  wrap.className = 'pin-wrap';
  wrap.setAttribute('aria-label', `${site.title}, ${placeLabel(site.place)}`);
  wrap.innerHTML = '<span class="pin"></span>';

  const popup = new maplibregl.Popup({ offset: 14, closeButton: false, maxWidth: '260px' })
    .setDOMContent(popupFor(site));
  const marker = new maplibregl.Marker({ element: wrap }).setLngLat(lngLat).setPopup(popup);

  wrap.addEventListener('mouseenter', () => setActive(site.id, true));
  wrap.addEventListener('mouseleave', () => setActive(site.id, false));
  wrap.addEventListener('click', () => {
    const card = state.cards.get(site.id);
    if (card && state.view !== 'map') card.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  });

  return { marker, el: wrap, lngLat, on: false };
}

function showMarker(entry, show) {
  if (show && !entry.on) entry.marker.addTo(map);
  if (!show && entry.on) entry.marker.remove();
  entry.on = show;
}

function visiblePins() {
  return [...state.markers.values()].filter(m => m.on).map(m => m.lngLat);
}

function fitMap(lngLats) {
  if (!map || !lngLats.length || state.view === 'panels') return;
  const duration = reducedMotion() ? 0 : 700;
  if (lngLats.length === 1) {
    map.easeTo({ center: lngLats[0], zoom: 10, duration });
    return;
  }
  const bounds = new maplibregl.LngLatBounds(lngLats[0], lngLats[0]);
  lngLats.forEach(p => bounds.extend(p));
  map.fitBounds(bounds, { padding: 70, maxZoom: 10, duration });
}

function setActive(id, on) {
  state.cards.get(id)?.classList.toggle('is-active', on);
  const entry = state.markers.get(id);
  if (entry) {
    entry.el.querySelector('.pin').classList.toggle('is-active', on);
    entry.el.style.zIndex = on ? '2' : '';
  }
}

/* =====================================================================
   Panels & previews
   ===================================================================== */
const sizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    entry.target.style.setProperty('--s', entry.contentRect.width / CONFIG.livePreviewWidth);
  }
});

let viewObserver;

function makeCard(site) {
  const isWriting = site.kind === 'writing';
  const readable = isWriting && Boolean(site.file);
  const card = document.createElement('a');
  card.className = 'card';
  card.href = site.url;
  if (!readable) {
    card.target = '_blank';
    card.rel = 'noopener';
  }
  card.dataset.id = site.id;
  if (!site.url) card.removeAttribute('href'); // listed, but nothing to open yet
  card.title = readable ? `Read ${site.title}`
    : isWriting ? (site.url ? `Open ${site.title} at the publisher (no PDF uploaded yet)` : `${site.title} (no PDF or link yet)`)
    : `Open ${site.title} in a new tab`;

  const preview = document.createElement('div');
  preview.className = 'preview';
  preview.innerHTML = '<div class="fallback"><span class="initials"></span></div>';
  preview.querySelector('.initials').textContent = initials(site.title);

  const meta = document.createElement('div');
  meta.className = 'meta';

  const h = document.createElement('h2');
  h.className = 'title';
  h.textContent = site.title;

  const place = document.createElement('p');
  place.className = 'place';
  if (isWriting) {
    place.textContent = readable ? 'Writing' : site.url ? 'Writing, publisher page only' : 'Writing, no PDF yet';
    const details = document.createElement('span');
    details.className = 'coords';
    details.textContent = writingDetails(site);
    place.append(details);
  } else if (site.place) {
    place.textContent = placeLabel(site.place);
    const coords = document.createElement('span');
    coords.className = 'coords';
    coords.textContent = coordLabel(site.place);
    place.append(coords);
  } else {
    place.classList.add('is-tool');
    place.textContent = 'Tool';
  }

  meta.append(h, place);

  const text = isWriting ? (site.authors || site.description) : site.description;
  if (text) {
    const d = document.createElement('p');
    d.className = 'desc';
    d.textContent = text;
    meta.append(d);
  }

  card.append(preview, meta);

  if (isWriting) preview.classList.add('is-doc');
  if (readable) {
    card.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // new tab still works
      e.preventDefault();
      openReader(site);
    });
  }

  card.addEventListener('mouseenter', () => setActive(site.id, true));
  card.addEventListener('mouseleave', () => setActive(site.id, false));
  card.addEventListener('focus', () => setActive(site.id, true));
  card.addEventListener('blur', () => setActive(site.id, false));

  sizeObserver.observe(preview);
  viewObserver.observe(card);
  return card;
}

// Decide once per site: a real image (override, og:image, preview.png/jpg) or a live scaled iframe
async function resolvePreview(site, card) {
  if (site.previewKind) return;
  site.previewKind = 'pending';
  const box = card.querySelector('.preview');

  if (site.kind === 'writing') {
    site.previewKind = 'doc';
    if (site.file || site.cover) renderCover(site, card, box);
    return;
  }

  for (const src of site.previews) {
    if (await canLoadImage(src)) {
      const img = document.createElement('img');
      img.className = 'shot';
      img.alt = '';
      img.src = src;
      box.append(img);
      site.previewKind = 'image';
      return;
    }
  }
  site.previewKind = 'live';
  refreshLive();
}

// First page of the PDF as a sheet on the panel (or the cover image from writings.json)
async function renderCover(site, card, box) {
  if (site.cover && await canLoadImage(site.cover)) {
    const img = document.createElement('img');
    img.className = 'sheet';
    img.alt = '';
    img.src = site.cover;
    box.append(img);
    return;
  }
  if (!site.file) return;
  try {
    const pdf = await openPdf(site.file);
    site.pages = pdf.numPages;
    const details = card.querySelector('.place .coords');
    if (details) details.textContent = writingDetails(site);

    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const cssWidth = Math.max(box.clientWidth * 0.62, 120);
    const scale = (cssWidth * Math.min(window.devicePixelRatio || 1, 2)) / base.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.className = 'sheet';
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    box.append(canvas);
  } catch {
    box.querySelector('.initials').textContent = 'PDF';
    card.querySelector('.place .coords').textContent = `${site.fileName} could not be opened`;
  }
}

function liveCount() {
  return el.grid.querySelectorAll('.preview iframe').length;
}

function mountLive(site, card) {
  const box = card.querySelector('.preview');
  if (box.querySelector('iframe')) return;
  const frame = document.createElement('iframe');
  frame.src = site.url;
  frame.title = `${site.title} preview`;
  frame.loading = 'lazy';
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('scrolling', 'no');
  frame.width = CONFIG.livePreviewWidth;
  frame.height = CONFIG.livePreviewHeight;
  frame.addEventListener('load', () => frame.classList.add('is-loaded'), { once: true });
  box.append(frame);
}

function unmountLive(card) {
  card.querySelector('.preview iframe')?.remove();
}

// Keep live iframes only for visible cards, up to the configured maximum
function refreshLive() {
  for (const card of el.grid.querySelectorAll('.preview iframe')) {
    const c = card.closest('.card');
    if (!state.live || !state.visible.has(c.dataset.id) || c.hidden) unmountLive(c);
  }
  if (!state.live) return;
  for (const id of state.visible) {
    if (liveCount() >= CONFIG.maxLivePreviews) break;
    const site = state.byId.get(id);
    const card = state.cards.get(id);
    if (site?.previewKind === 'live' && !card.hidden) mountLive(site, card);
  }
}

function initViewObserver() {
  viewObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const id = entry.target.dataset.id;
      if (entry.isIntersecting) {
        state.visible.add(id);
        resolvePreview(state.byId.get(id), entry.target);
      } else {
        state.visible.delete(id);
      }
    }
    refreshLive();
  }, { root: el.panels, rootMargin: '150px 0px' });
}

/* =====================================================================
   Render, sort, filter
   ===================================================================== */
function render() {
  el.grid.replaceChildren();
  state.markers.forEach(m => m.marker.remove());
  state.cards.clear();
  state.markers.clear();
  state.byId = new Map(state.sites.map(s => [s.id, s]));

  const taken = new Map(); // spread sites that share the exact same spot
  for (const site of state.sites) {
    state.cards.set(site.id, makeCard(site));

    if (site.place) {
      const key = `${site.place.lat.toFixed(3)},${site.place.lng.toFixed(3)}`;
      const n = taken.get(key) || 0;
      taken.set(key, n + 1);
      const r = n ? 0.006 * Math.sqrt(n) : 0;
      const a = n * 2.4;
      const lngLat = [site.place.lng + r * Math.sin(a) * 1.4, site.place.lat + r * Math.cos(a)];
      state.markers.set(site.id, makeMarker(site, lngLat));
    }
  }

  sortGrid();
  applyFilter(true);
}

function sortGrid() {
  const by = el.sort.value;
  const sorted = [...state.sites].sort((a, b) => {
    if (by === 'name') return a.title.localeCompare(b.title);
    if (by === 'place') {
      const rank = s => s.place ? `${s.place.country} ${s.place.name}` : (s.kind === 'writing' ? '\uffff\uffff' : '\uffff');
      const pa = rank(a);
      const pb = rank(b);
      return pa.localeCompare(pb) || a.title.localeCompare(b.title);
    }
    return (b.updated || '').localeCompare(a.updated || '');
  });
  // Moving a card reloads its iframe, so this only runs on load and when the sort changes
  for (const site of sorted) el.grid.append(state.cards.get(site.id));
}

function applyFilter(fit = false) {
  const raw = el.search.value.trim();
  const tokens = norm(raw).split(' ').filter(Boolean);
  const shownPins = [];
  let shown = 0;
  let tools = 0;
  let writings = 0;

  for (const site of state.sites) {
    const match = (state.kind === 'all' || site.kind === state.kind) &&
      tokens.every(t => site.searchText.includes(t));
    state.cards.get(site.id).hidden = !match;
    const entry = state.markers.get(site.id);
    if (entry) {
      showMarker(entry, match);
      if (match) shownPins.push(entry.lngLat);
    }
    if (match) {
      shown++;
      if (site.kind === 'tool') tools++;
      if (site.kind === 'writing') writings++;
    }
  }

  const places = shown - tools - writings;
  const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const counts = { place: count(places, 'place'), tool: count(tools, 'tool'), writing: count(writings, 'writing') };
  const summary = state.kind === 'all' ? Object.values(counts).join(', ') : counts[state.kind];
  const empty = {
    tool: 'No tools yet.',
    writing: `No writings yet. Upload PDFs to the ${CONFIG.writings.folder} folder and list them in ${CONFIG.writings.manifest}.`,
  };
  if (tokens.length && !shown) setStatus(`Nothing matches “${raw}”. Try a place, a country, an author or part of a title.`);
  else if (!shown) setStatus(empty[state.kind] || 'No places yet.');
  else if (tokens.length) setStatus(`${summary} match “${raw}”`);
  else setStatus(summary);

  const offMap = [tools && count(tools, 'tool'), writings && count(writings, 'writing')].filter(Boolean);
  el.mapnote.hidden = offMap.length === 0;
  el.mapnote.textContent = `${offMap.join(' and ')} ${tools + writings === 1 ? 'is' : 'are'} listed in the panels only.`;

  if (fit) fitMap(shownPins);
  refreshLive();
}

/* =====================================================================
   Controls
   ===================================================================== */
function setView(view) {
  state.view = view;
  el.layout.dataset.view = view;
  el.viewButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  store.set('hub:view', view);
  requestAnimationFrame(() => {
    map.resize();
    if (view !== 'panels') fitMap(visiblePins());
  });
}

function initControls() {
  let timer;
  el.search.addEventListener('input', () => {
    applyFilter(false);
    clearTimeout(timer);
    timer = setTimeout(() => applyFilter(true), 350);
  });
  el.search.addEventListener('keydown', e => {
    if (e.key === 'Escape') { el.search.value = ''; applyFilter(true); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
      e.preventDefault();
      el.search.focus();
    }
  });

  el.sort.addEventListener('change', () => { sortGrid(); refreshLive(); });

  const about = $('#about');
  $('#about-open').addEventListener('click', () => about.showModal());
  $('#about-close').addEventListener('click', () => about.close());
  about.addEventListener('click', e => { if (e.target === about) about.close(); }); // click outside closes

  el.viewButtons.forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

  // Tools and writings have no place on the map, so the map and the view switch step aside while they are shown
  const setKind = kind => {
    state.kind = ['all', 'place', 'tool', 'writing'].includes(kind) ? kind : 'all';
    el.kindButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === state.kind)));
    el.layout.dataset.kind = state.kind;
    el.viewGroup.hidden = state.kind === 'writing' || state.kind === 'tool';
    store.set('hub:kind', state.kind);
    requestAnimationFrame(() => map?.resize());
  };
  const params = new URLSearchParams(location.search);
  setKind(params.get('kind') || state.kind);
  el.kindButtons.forEach(b => b.addEventListener('click', () => { setKind(b.dataset.kind); applyFilter(true); }));

  const q = params.get('q');
  if (q) el.search.value = q;

  initReaderControls();
}

/* =====================================================================
   Reader — PDF pages drawn with PDF.js, only near the visible part
   ===================================================================== */
const reader = {
  dialog: $('#reader'),
  pages: $('#reader-pages'),
  title: $('#reader-title'),
  authors: $('#reader-authors'),
  pub: $('#reader-pub'),
  page: $('#reader-page'),
  download: $('#reader-download'),
  source: $('#reader-source'),
  zoomButtons: [...document.querySelectorAll('#reader button[data-zoom]')],
  layoutButtons: [...document.querySelectorAll('#reader button[data-layout]')],
  spread: store.get('hub:spread', false),   // two pages side by side, like an open book
  site: null,
  pdf: null,
  slots: [],
  observer: null,
  fit: true,
  width: 0,
  ratio: Math.SQRT2,
  token: 0,
};

const MIN_WIDTH = 240;
const MAX_WIDTH = 2400;
const MAX_FIT_WIDTH = 980;
const MAX_SPREAD_WIDTH = 760;   // per page, when two pages sit side by side
const SPREAD_GAP = 6;

function setReadParam(slug) {
  const url = new URL(location.href);
  if (slug) url.searchParams.set('read', slug);
  else url.searchParams.delete('read');
  history.replaceState(null, '', url);
}

function fitWidth() {
  const cs = getComputedStyle(reader.pages);
  const inner = reader.pages.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  if (reader.spread) {
    // the whole spread fits the screen, so both pages can be read side by side
    const byHeight = (reader.pages.clientHeight - parseFloat(cs.paddingTop) - 24) / reader.ratio;
    return Math.max(MIN_WIDTH / 2, Math.min((inner - SPREAD_GAP) / 2, byHeight, MAX_SPREAD_WIDTH));
  }
  return Math.max(MIN_WIDTH, Math.min(inner, MAX_FIT_WIDTH));
}

function setLayoutPressed() {
  reader.layoutButtons.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.layout === 'spread') === reader.spread)));
  reader.pages.classList.toggle('is-spread', reader.spread);
}

function setZoomPressed() {
  reader.zoomButtons.forEach(b => {
    if (b.dataset.zoom === 'fit') b.setAttribute('aria-pressed', String(reader.fit));
  });
}

function releaseSlot(slot) {
  slot.task?.cancel();
  slot.task = null;
  slot.pending = 0;
  slot.rendered = 0;
  if (slot.canvas) {
    slot.canvas.width = 0;   // frees the memory of large scans right away
    slot.canvas.height = 0;
    slot.canvas.remove();
    slot.canvas = null;
  }
}

async function renderSlot(slot) {
  const target = Math.round(reader.width);
  if (!reader.pdf || slot.rendered === target || slot.pending === target) return;
  slot.task?.cancel();
  slot.pending = target;
  const token = reader.token;

  try {
    const page = await reader.pdf.getPage(slot.n);
    if (token !== reader.token || !slot.near || slot.pending !== target) return;

    const base = page.getViewport({ scale: 1 });
    slot.el.style.aspectRatio = `${base.width} / ${base.height}`;
    const pixels = Math.min(target * Math.min(window.devicePixelRatio || 1, 2), 4096);
    const viewport = page.getViewport({ scale: pixels / base.width });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    slot.task = page.render({ canvasContext: canvas.getContext('2d'), viewport });
    await slot.task.promise;
    slot.task = null;

    if (token !== reader.token || !slot.near || slot.pending !== target) {
      canvas.width = canvas.height = 0;
      return;
    }
    if (slot.canvas) { slot.canvas.width = slot.canvas.height = 0; }
    slot.el.replaceChildren(canvas);
    slot.canvas = canvas;
    slot.rendered = target;
    slot.pending = 0;
    delete slot.el.dataset.error;
  } catch (err) {
    if (err?.name === 'RenderingCancelledException') return;
    slot.pending = 0;
    slot.el.dataset.error = 'true';
  }
}

function clearPages() {
  reader.observer?.disconnect();
  reader.slots.forEach(releaseSlot);
  reader.slots = [];
  reader.pages.replaceChildren();
  reader.pages.scrollTop = 0;
  reader.pages.scrollLeft = 0;
}

function buildSlots(count) {
  reader.observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const slot = reader.slots[Number(entry.target.dataset.page) - 1];
      if (!slot) continue;
      slot.near = entry.isIntersecting;
      if (slot.near) renderSlot(slot);
      else releaseSlot(slot);
    }
  }, { root: reader.pages, rootMargin: '150% 0px' });

  reader.slots = Array.from({ length: count }, (_, i) => {
    const node = document.createElement('div');
    node.className = 'sheet-slot';
    node.dataset.page = String(i + 1);
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', `Page ${i + 1} of ${count}`);
    node.style.aspectRatio = `1 / ${reader.ratio}`;
    reader.pages.append(node);
    reader.observer.observe(node);
    return { el: node, n: i + 1, near: false, rendered: 0, pending: 0, task: null, canvas: null };
  });
}

function layoutSlots() {
  reader.pages.style.setProperty('--sheet-width', `${Math.round(reader.width)}px`);
  reader.slots.forEach(slot => { if (slot.near) renderSlot(slot); });
}

function currentSlotIndex() {
  const mark = reader.pages.scrollTop + reader.pages.clientHeight / 3;
  let index = 0;
  for (let i = 0; i < reader.slots.length; i++) {
    if (reader.slots[i].el.offsetTop <= mark) index = i;
    else break;
  }
  return index;
}

function updatePageLabel() {
  if (!reader.slots.length) return;
  const n = reader.slots.length;
  const i = currentSlotIndex();
  if (!reader.spread || i === 0) {
    reader.page.textContent = `Page ${i + 1} of ${n}`;
    return;
  }
  // the cover stands alone, then pages 2–3, 4–5 …
  const left = i % 2 === 1 ? i : i - 1;
  reader.page.textContent = left + 1 < n ? `Pages ${left + 1}–${left + 2} of ${n}` : `Page ${left + 1} of ${n}`;
}

function setLayout(mode) {
  const spread = mode === 'spread';
  if (spread === reader.spread) return;
  const i = reader.slots.length ? currentSlotIndex() : 0;
  reader.spread = spread;
  store.set('hub:spread', spread);
  setLayoutPressed();
  if (!reader.pdf || !reader.slots.length) return;
  reader.width = reader.fit ? fitWidth() : (spread ? reader.width / 2 : reader.width * 2);
  reader.width = Math.max(MIN_WIDTH / 2, Math.min(MAX_WIDTH, reader.width));
  layoutSlots();
  reader.pages.scrollTop = reader.slots[i].el.offsetTop - 24;
  updatePageLabel();
}

function setZoom(mode) {
  if (!reader.pdf || !reader.slots.length) return;
  const i = currentSlotIndex();
  const slot = reader.slots[i].el;
  const within = (reader.pages.scrollTop - slot.offsetTop) / Math.max(slot.offsetHeight, 1);

  if (mode === 'fit') {
    reader.fit = true;
    reader.width = fitWidth();
  } else {
    reader.fit = false;
    const factor = mode === 'in' ? 1.25 : 0.8;
    reader.width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, reader.width * factor));
  }
  setZoomPressed();
  layoutSlots();

  // keep the same spot of the same page in view
  reader.pages.scrollTop = slot.offsetTop + within * slot.offsetHeight;
  reader.pages.scrollLeft = (reader.pages.scrollWidth - reader.pages.clientWidth) / 2;
  updatePageLabel();
}

async function openReader(site) {
  const token = ++reader.token;
  clearPages();
  reader.site = site;
  reader.pdf = null;
  reader.fit = true;
  setZoomPressed();
  setLayoutPressed();

  reader.title.textContent = site.title;
  reader.authors.textContent = site.authors;
  reader.pub.textContent = publicationLine(site);
  reader.download.href = site.file;
  reader.download.setAttribute('download', site.fileName);
  reader.source.hidden = !site.link;
  reader.source.href = site.link || '#';
  reader.source.textContent = site.doi ? 'DOI' : 'Publisher page';
  reader.source.title = site.doi ? `doi.org/${site.doi}` : '';
  reader.page.textContent = 'Loading pages…';

  if (!reader.dialog.open) reader.dialog.showModal();
  setReadParam(site.slug);
  reader.pages.focus({ preventScroll: true });

  try {
    const pdf = await openPdf(site.file);
    if (token !== reader.token) return;
    const first = await pdf.getPage(1);
    if (token !== reader.token) return;

    const vp = first.getViewport({ scale: 1 });
    site.pages = pdf.numPages;
    reader.pub.textContent = publicationLine(site);
    reader.pdf = pdf;
    reader.ratio = vp.height / vp.width;
    reader.width = fitWidth();
    reader.pages.style.setProperty('--sheet-width', `${Math.round(reader.width)}px`);
    buildSlots(pdf.numPages);
    updatePageLabel();
  } catch (err) {
    if (token !== reader.token) return;
    reader.page.textContent = '';
    const msg = document.createElement('p');
    msg.className = 'reader-error';
    msg.textContent = err?.name === 'MissingPDFException'
      ? `${site.fileName} was not found. Check that the file is uploaded and that its path in ${CONFIG.writings.manifest} matches.`
      : `This PDF could not be shown here (${err?.message || 'unknown error'}). Download it to open it on your device.`;
    reader.pages.replaceChildren(msg);
  }
}

function initReaderControls() {
  $('#reader-close').addEventListener('click', () => reader.dialog.close());

  reader.dialog.addEventListener('close', () => {
    reader.token++;
    clearPages();
    reader.pdf = null;
    reader.site = null;
    reader.page.textContent = '';
    setReadParam(null);
  });

  reader.zoomButtons.forEach(b => b.addEventListener('click', () => setZoom(b.dataset.zoom)));
  reader.layoutButtons.forEach(b => b.addEventListener('click', () => setLayout(b.dataset.layout)));

  reader.dialog.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('a, button') && (e.key === 'Enter' || e.key === ' ')) return;
    if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom('in'); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); setZoom('out'); }
    else if (e.key === '0') { e.preventDefault(); setZoom('fit'); }
  });

  let ticking = false;
  reader.pages.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; updatePageLabel(); });
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    if (!reader.dialog.open || !reader.fit) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => setZoom('fit'), 200);
  });
}

// hub.html?read=<name> opens that writing straight away
function openFromUrl() {
  const slug = new URLSearchParams(location.search).get('read');
  if (!slug) return;
  const site = state.sites.find(s => s.kind === 'writing' && s.slug === slug && s.file);
  if (site) openReader(site);
  else {
    setStatus(`No writing called “${slug}” is listed. It may have been renamed or removed.`, true);
    setReadParam(null);
  }
}

/* =====================================================================
   Start
   ===================================================================== */
async function init() {
  initMap();
  initViewObserver();
  initControls();
  setView(['both', 'panels', 'map'].includes(state.view) ? state.view : 'both');

  setStatus(`Looking up ${CONFIG.user}’s websites and writings…`);

  const [repoResult, { writings, note }] = await Promise.all([
    fetchRepos().then(repos => ({ repos }), error => ({ error })),
    loadWritings(),
  ]);

  // A failed repository list still leaves the writings readable
  let problem = note;
  let sites = [];
  if (repoResult.error) {
    const err = repoResult.error;
    problem = err.status === 403 || err.status === 429
      ? 'GitHub only lets one network read the repository list 60 times an hour, and that limit is used up. Reload in a few minutes.'
      : err.status === 404
        ? `GitHub has no user called “${CONFIG.user}”. Check the user name at the top of app.js.`
        : `The repository list could not be loaded (${err.message}). Check your connection and reload.`;
  } else {
    const self = currentRepoName()?.toLowerCase();
    const exclude = new Set(CONFIG.exclude.map(n => n.toLowerCase()));
    const pages = repoResult.repos.filter(r =>
      r.has_pages &&
      (CONFIG.includeForks || !r.fork) &&
      !exclude.has(r.name.toLowerCase()) &&
      r.name.toLowerCase() !== self);

    if (pages.length) {
      setStatus(`Reading ${pages.length} websites…`);
      const metas = await mapLimit(pages, 6, readSite);
      sites = pages.map((r, i) => buildSite(r, metas[i]));
    }
  }

  state.sites = [...sites, ...writings];
  render();
  if (problem) setStatus(problem, true);
  openFromUrl();
}

init();
