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

  // Optional fixes per repo (key = repo name). Everything is optional.
  overrides: {
    // venezia_garden: { title: 'Venezia Garden', place: 'venice' },
    // some_repo: { kind: 'tool' },   // or kind: 'place' together with a place
    // some_repo: { place: { name: 'Sils Maria', country: 'Switzerland', lat: 46.43, lng: 9.76 } },
    // some_repo: { preview: 'https://dennishaus.github.io/some_repo/cover.jpg', description: 'Text' },
  },

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
  return place ? [place.name, place.country].filter(Boolean).join(', ') : '';
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

function buildSite(repo, meta) {
  const o = CONFIG.overrides[repo.name] || {};
  const url = o.url || pageUrlFor(repo);
  // Name: override > the website's <title> > the repo name
  const title = o.title || meta.pageTitle || titleFromSlug(repo.name.toLowerCase() === ROOT_REPO ? CONFIG.user : repo.name);
  const description = o.description || repo.description || meta.description || '';
  const topics = repo.topics.join(' ');

  let place = null;
  if (o.place) place = typeof o.place === 'string' ? findPlace(o.place) : o.place;
  // Exact position from the website's own <meta name="geo.position"> tag
  if (!place && meta.geo) {
    const named = findPlace(meta.placeName, repo.name);
    const country = REGION_COUNTRIES[(meta.region || '').slice(0, 2).toUpperCase()] || named?.country || '';
    place = { name: meta.placeName || named?.name || 'Pinned location', country, ...meta.geo };
  }
  if (!place) place = findPlace(repo.name, topics, repo.description, meta.pageTitle, meta.description, meta.placeName);

  const listedAsTool = CONFIG.tools.some(n => n.toLowerCase() === repo.name.toLowerCase());
  const kind = o.kind || (listedAsTool || !place ? 'tool' : 'place');
  if (kind === 'tool') place = null; // tools never get a pin

  const searchText = norm([
    title, repo.name, description, meta.pageTitle, topics, kind === 'tool' ? 'tool tools' : 'place places',
    place?.name, place?.country, place && COUNTRY_WORDS[place.country], place?.aliases?.join(' '),
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
  const card = document.createElement('a');
  card.className = 'card';
  card.href = site.url;
  card.target = '_blank';
  card.rel = 'noopener';
  card.dataset.id = site.id;
  card.title = `Open ${site.title} in a new tab`;

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
  if (site.place) {
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

  if (site.description) {
    const d = document.createElement('p');
    d.className = 'desc';
    d.textContent = site.description;
    meta.append(d);
  }

  card.append(preview, meta);

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
      const pa = a.place ? `${a.place.country} ${a.place.name}` : '\uffff';
      const pb = b.place ? `${b.place.country} ${b.place.name}` : '\uffff';
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

  for (const site of state.sites) {
    const match = (state.kind === 'all' || site.kind === state.kind) &&
      tokens.every(t => site.searchText.includes(t));
    state.cards.get(site.id).hidden = !match;
    const entry = state.markers.get(site.id);
    if (entry) {
      showMarker(entry, match);
      if (match) shownPins.push(entry.lngLat);
    }
    if (match) { shown++; if (site.kind === 'tool') tools++; }
  }

  const places = shown - tools;
  const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const summary = `${count(places, 'place')}, ${count(tools, 'tool')}`;
  if (tokens.length && !shown) setStatus(`Nothing matches “${raw}”. Try a place, a country or part of a name.`);
  else if (!shown) setStatus(state.kind === 'tool' ? 'No tools yet.' : 'No places yet.');
  else if (tokens.length) setStatus(`${summary} match “${raw}”`);
  else setStatus(summary);

  el.mapnote.hidden = tools === 0;
  el.mapnote.textContent = tools === 1
    ? '1 tool is listed in the panels only.'
    : `${tools} tools are listed in the panels only.`;

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

  const setKind = kind => {
    state.kind = ['all', 'place', 'tool'].includes(kind) ? kind : 'all';
    el.kindButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === state.kind)));
    store.set('hub:kind', state.kind);
  };
  setKind(state.kind);
  el.kindButtons.forEach(b => b.addEventListener('click', () => { setKind(b.dataset.kind); applyFilter(true); }));

  const q = new URLSearchParams(location.search).get('q');
  if (q) el.search.value = q;
}

/* =====================================================================
   Start
   ===================================================================== */
async function init() {
  initMap();
  initViewObserver();
  initControls();
  setView(['both', 'panels', 'map'].includes(state.view) ? state.view : 'both');

  setStatus(`Looking up ${CONFIG.user}’s websites on GitHub…`);

  let repos;
  try {
    repos = await fetchRepos();
  } catch (err) {
    setStatus(err.status === 403 || err.status === 429
      ? 'GitHub only lets one network read the repository list 60 times an hour, and that limit is used up. Reload in a few minutes.'
      : err.status === 404
        ? `GitHub has no user called “${CONFIG.user}”. Check the user name at the top of app.js.`
        : `The repository list could not be loaded (${err.message}). Check your connection and reload.`, true);
    return;
  }

  const self = currentRepoName()?.toLowerCase();
  const exclude = new Set(CONFIG.exclude.map(n => n.toLowerCase()));
  const pages = repos.filter(r =>
    r.has_pages &&
    (CONFIG.includeForks || !r.fork) &&
    !exclude.has(r.name.toLowerCase()) &&
    r.name.toLowerCase() !== self);

  if (!pages.length) {
    setStatus(`No GitHub Pages websites found for ${CONFIG.user}. Turn on Pages in a repository’s settings and it will appear here.`);
    return;
  }

  setStatus(`Reading ${pages.length} websites…`);
  const metas = await mapLimit(pages, 6, r => fetchPageMeta(CONFIG.overrides[r.name]?.url || pageUrlFor(r)));
  state.sites = pages.map((r, i) => buildSite(r, metas[i]));
  render();
}

init();
