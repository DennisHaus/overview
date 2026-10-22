'use strict';

/* =====================================================================
   Live graph on the start page.
   Two neighbouring stations are shown at first: a river or lake station
   (FOEN) in one of the case study areas, and the closest other station,
   a weather station (MeteoSwiss) or another river or lake. Visitors can
   add up to four stations, switch every measurement on and off, and
   widen the time span from a week to ten years. The right edge is always
   the present.

   Week and month: live 10-minute readings from api.existenz.ch.
   Year and 10 years: official daily means, rivers and lakes from the
   FOEN data platform (data.bafu.admin.ch), weather from MeteoSwiss open
   data (data.geo.admin.ch).
   ===================================================================== */
const GAUGE = {
  live: 'https://api.existenz.ch/apiv1',
  app: 'entwerfen-in-der-zeit',     // Existenz asks apps to name themselves
  hydroArchive: 'https://data.bafu.admin.ch/api',
  meteoArchive: 'https://data.geo.admin.ch/api/stac/v1/collections/ch.meteoschweiz.ogd-smn/items/',

  ranges: {
    week: { days: 7, source: 'live', bar: 3600000, per: 'per hour' },
    month: { days: 31, source: 'live', bar: 3600000, per: 'per hour' },
    year: { days: 365, source: 'archive', bar: 86400000, per: 'per day' },
    decade: { days: 3653, source: 'archive', bar: 7 * 86400000, per: 'per week' },
  },
  defaultRange: 'week',

  pairWithinKm: 30,                 // farthest neighbour that is paired with the first station
  maxStations: 4,
  refreshMinutes: 10,
  cacheHours: 24,                   // station lists are kept this long in the browser

  // The first station is picked from these, matched by water body and place name.
  // The label appears with the station.
  focus: [
    { label: 'Case study area: Linth plain', water: ['linth', 'escherkanal', 'linthkanal', 'walensee'] },
    { label: 'Case study area: Kandersteg', water: ['kander'] },
    { label: 'Case study area: Brienz/Brinzauls', water: ['albula'] },
    { label: 'Case study area: Blatten (Lötschental)', water: ['lonza'] },
    { label: 'Case study area: Grimsel and the upper Aare', water: ['aare'], place: ['guttannen', 'handeck', 'innertkirchen', 'meiringen', 'brienzwiler', 'grimsel'] },
    { label: 'Glacier-fed river', water: ['rhone'], place: ['gletsch', 'reckingen', 'oberwald', 'brig'] },
    { label: 'Glacier-fed river', water: ['massa', 'lutschine', 'vispa', 'rosegbach', 'roseg', 'gornera', 'drance', 'navisence', 'borgne', 'reuss'], place: ['blatten', 'gsteig', 'zweilutschinen', 'visp', 'zermatt', 'saas', 'pontresina', 'andermatt', 'vissoie', 'bramois', 'martigny', 'brig'] },
  ],

  // One colour per station, in the order stations are added
  colors: ['#ededed', '#8fc1ea', '#e3b36f', '#a9d49b'],
};

// What is drawn for each kind of station. `live` are the codes of api.existenz.ch,
// `archive` the codes of the daily means. The line style tells the measurements apart.
const MEASURES = {
  hydro: [
    { live: ['height', 'height_abs'], archive: 'W', archiveUnit: 'm', label: 'Water level', style: 'm-level', primary: true },
    { live: ['flow', 'flow_ls'], archive: 'Q', archiveUnit: 'm³/s', label: 'Discharge', style: 'm-flow', primary: true },
    { live: ['temperature'], archive: 'WT', archiveUnit: '°C', label: 'Water temperature', style: 'm-wtemp' },
  ],
  smn: [
    { live: ['tt'], archive: 'tre200d0', archiveUnit: '°C', label: 'Air temperature', style: 'm-air' },
    { live: ['rr'], archive: 'rre150d0', archiveUnit: 'mm', label: 'Precipitation', style: 'm-rain', bars: true },
  ],
};

const W = 1200;
const H = 200;
const LINE_TOP = 62;     // lines stay below the precipitation bars
const LINE_BOTTOM = 190;
const RAIN_DEPTH = 50;   // tallest precipitation bar
const DAY = 86400000;

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const SVG = 'http://www.w3.org/2000/svg';
const still = matchMedia('(prefers-reduced-motion: reduce)');

const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const num = v => (v === null || v === undefined || v === '' || v === '-' ? NaN : Number(v));
const unitLabel = u => String(u || '').replace(/m3/g, 'm³');

const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', day: 'numeric', month: 'short' });
const monthFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', month: 'short', year: 'numeric' });

// Water levels move by centimetres, so metres always keep two decimals
function formatValue(v, unit = '') {
  const abs = Math.abs(v);
  const digits = unit === 'm' ? 2 : unit === 'mm' ? 1 : abs >= 1000 ? 0 : abs >= 1 ? 1 : 2;
  const text = v.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return unit ? `${text} ${unit}` : text;
}

function fetchWithTimeout(url, ms = 10000, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function liveApi(path, params = {}) {
  const url = new URL(GAUGE.live + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('app', GAUGE.app);
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const cache = {
  get(key) {
    try {
      const hit = JSON.parse(localStorage.getItem(key) || 'null');
      return hit && Date.now() - hit.t < GAUGE.cacheHours * 3600000 ? hit.data : null;
    } catch { return null; }
  },
  set(key, data) { try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch { /* full or blocked */ } },
};

async function cached(key, load) {
  const hit = cache.get(key);
  if (hit) return hit;
  const data = await load();
  if (data && (Array.isArray(data) ? data.length : Object.keys(data).length)) cache.set(key, data);
  return data;
}

// The live API wraps results in { payload }, either a list or an object keyed by id
const entriesOf = json => {
  const p = json?.payload ?? json;
  if (Array.isArray(p)) return p.map(v => [v?.name ?? v?.id, v]);
  return Object.entries(p || {});
};

/* ---------- stations ---------- */
function themeOf(water, place) {
  const w = norm(water);
  const p = norm(place);
  for (const f of GAUGE.focus) {
    const waterHit = f.water.some(x => w === x || w.startsWith(`${x} `) || w.endsWith(` ${x}`));
    const placeHit = !f.place || f.place.some(x => p.includes(x));
    if (waterHit && placeHit) return f.label;
  }
  return '';
}

function parseStations(json, kind) {
  return entriesOf(json).map(([key, v]) => {
    const d = v?.details || v || {};
    const id = String(d.id ?? v?.name ?? key ?? '').trim();
    const place = String(d.name ?? '').trim() || id;
    const water = String(d['water-body-name'] ?? '').trim();
    const type = String(d['water-body-type'] ?? '').trim();
    const canton = String(d.canton ?? '').trim();

    const title = kind === 'hydro' ? (water && water !== place ? `${water}, ${place}` : place) : place;
    const what = kind === 'hydro' ? `${type === 'lake' ? 'Lake' : 'River'} station ${id}, FOEN` : `Weather station ${id}, MeteoSwiss`;
    const theme = kind === 'hydro' ? themeOf(water, place) : '';

    return {
      key: `${kind}:${id}`, kind, id, title, what, theme,
      lat: num(d.lat ?? d.latitude), lon: num(d.lon ?? d.lng ?? d.longitude),
      chx: num(d.chx ?? d.x), chy: num(d.chy ?? d.y),
      search: norm(`${title} ${place} ${water} ${canton} ${id} ${type} ${theme} ${kind === 'smn' ? 'weather meteo' : ''}`),
    };
  }).filter(s => s.id);
}

function parseParams(json) {
  const out = {};
  for (const [key, v] of entriesOf(json)) if (key) out[key] = { unit: v?.unit || '' };
  return out;
}

async function loadCatalogue() {
  const [hydro, smn, hydroParams, smnParams] = await Promise.all([
    cached('gauge3:hydro:stations', async () => parseStations(await liveApi('/hydro/locations'), 'hydro')),
    cached('gauge3:smn:stations', async () => parseStations(await liveApi('/smn/locations'), 'smn')).catch(() => []),
    cached('gauge3:hydro:params', async () => parseParams(await liveApi('/hydro/parameters'))).catch(() => ({})),
    cached('gauge3:smn:params', async () => parseParams(await liveApi('/smn/parameters'))).catch(() => ({})),
  ]);
  return { hydro, smn, all: [...hydro, ...smn], units: { hydro: hydroParams, smn: smnParams } };
}

// Distance in km from coordinates, or from Swiss grid coordinates when those are all there is
function distanceKm(a, b) {
  if ([a.lat, a.lon, b.lat, b.lon].every(Number.isFinite)) {
    const rad = d => d * Math.PI / 180;
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  }
  if ([a.chx, a.chy, b.chx, b.chy].every(Number.isFinite)) {
    const lv03 = v => (v > 1e6 ? v - (v > 1.5e6 ? 2e6 : 1e6) : v);
    return Math.hypot(lv03(a.chx) - lv03(b.chx), lv03(a.chy) - lv03(b.chy)) / 1000;
  }
  return Infinity;
}

function neighbours(station, withinKm) {
  return state.catalogue.all
    .filter(s => s.key !== station.key)
    .map(s => ({ s, km: distanceKm(station, s) }))
    .filter(n => n.km <= withinKm)
    .sort((a, b) => a.km - b.km);
}

/* ---------- readings ---------- */
const sortByTime = list => list.sort((a, b) => a[0] - b[0]);

// Live 10-minute readings: { code: [[ms, value], …] }
async function loadLive(station, days) {
  const json = await liveApi(`/${station.kind}/daterange`, { locations: station.id, startdate: `-${days} days`, enddate: 'now' });
  const out = {};
  for (const row of Array.isArray(json?.payload) ? json.payload : []) {
    const value = num(row.val);
    const t = num(row.timestamp) * 1000;
    if (!row.par || !Number.isFinite(value) || !Number.isFinite(t)) continue;
    (out[row.par] ||= []).push([t, value]);
  }
  for (const list of Object.values(out)) sortByTime(list);
  return out;
}

// Daily means of a river or lake station for one parameter (W, Q or WT)
const HYDRO_DAILY = `query Daily($from: AWSDateTime!, $to: AWSDateTime!, $stationNos: [String!]!, $parameter: String!) {
  water { observations {
    data_1day_mean(where: {
      station: { no: { _in: $stationNos } }
      parameterName: { _eq: $parameter }
      timestamp: { _gte: $from, _lt: $to }
    } limit: 10000) { timestamp value tsName }
  } }
}`;

async function hydroDaily(no, parameter, from, to) {
  const res = await fetchWithTimeout(GAUGE.hydroArchive, 30000, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: HYDRO_DAILY, variables: { from, to, stationNos: [no], parameter } }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);

  // some stations publish two series side by side; the longest one without a suffix is used
  const groups = new Map();
  for (const row of json?.data?.water?.observations?.data_1day_mean || []) {
    const t = Date.parse(row.timestamp);
    const v = num(row.value);
    if (!Number.isFinite(t) || !Number.isFinite(v)) continue;
    const name = row.tsName || '';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push([t, v]);
  }
  const best = [...groups.entries()].sort((a, b) => (b[1].length - a[1].length) || (a[0].includes('_') - b[0].includes('_')))[0];
  return best ? sortByTime(best[1]) : [];
}

async function loadHydroArchive(station) {
  const to = new Date(Date.now() + DAY).toISOString();
  const from = new Date(Date.now() - (GAUGE.ranges.decade.days + 2) * DAY).toISOString();
  const params = MEASURES.hydro.map(m => m.archive);
  const lists = await Promise.all(params.map(p => hydroDaily(station.id, p, from, to).catch(() => [])));
  return Object.fromEntries(params.map((p, i) => [p, lists[i]]));
}

// Daily values of a weather station from the MeteoSwiss open data files
async function loadMeteoArchive(station) {
  const res = await fetchWithTimeout(GAUGE.meteoArchive + station.id.toLowerCase(), 15000);
  if (!res.ok) throw new Error(`${res.status}`);
  const item = await res.json();
  const fromYear = new Date(Date.now() - GAUGE.ranges.decade.days * DAY).getUTCFullYear();
  const hrefs = Object.values(item.assets || {})
    .map(a => a.href)
    .filter(h => /_d_(historical|recent)[^/]*\.csv$/i.test(h || ''))
    .filter(h => { const m = h.match(/_(\d{4})-(\d{4})\.csv$/); return !m || Number(m[2]) >= fromYear; });

  const codes = MEASURES.smn.map(m => m.archive);
  const byCode = Object.fromEntries(codes.map(c => [c, new Map()]));
  const texts = await Promise.all(hrefs.map(h => fetchWithTimeout(h, 30000).then(r => (r.ok ? r.text() : '')).catch(() => '')));

  for (const text of texts) {
    const lines = text.split(/\r?\n/);
    const head = (lines[0] || '').split(';').map(h => h.trim().replace(/^"|"$/g, ''));
    const ti = head.indexOf('reference_timestamp');
    const idx = codes.map(c => head.indexOf(c));
    if (ti < 0) continue;
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(';');
      const m = (cells[ti] || '').match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
      if (!m) continue;
      const t = Date.UTC(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0));
      codes.forEach((c, k) => {
        const v = num(cells[idx[k]]);
        if (idx[k] >= 0 && Number.isFinite(v)) byCode[c].set(t, v);
      });
    }
  }
  return Object.fromEntries(codes.map(c => [c, sortByTime([...byCode[c].entries()])]));
}

// Sums per bucket (hour, day or week), for precipitation bars
function buckets(data, size) {
  const sums = new Map();
  for (const [t, v] of data) {
    const b = Math.floor(t / size) * size;
    sums.set(b, (sums.get(b) || 0) + v);
  }
  return sortByTime([...sums.entries()]);
}

// Means per bucket, so ten years of daily values become a calm weekly line
function means(data, size) {
  const acc = new Map();
  for (const [t, v] of data) {
    const b = Math.floor(t / size) * size;
    const a = acc.get(b) || [0, 0];
    a[0] += v;
    a[1] += 1;
    acc.set(b, a);
  }
  return sortByTime([...acc.entries()].map(([t, [sum, n]]) => [t + size / 2, sum / n]));
}

const archiveCache = new Map();

// The measurements of one station for a time span: [] when it has none
async function loadSeries(station, rangeKey) {
  const range = GAUGE.ranges[rangeKey];
  const t0 = Date.now() - range.days * DAY;
  const series = [];

  if (range.source === 'live') {
    const readings = await loadLive(station, range.days);
    for (const m of MEASURES[station.kind]) {
      const code = m.live.find(c => readings[c]?.length > 1);
      if (!code) continue;
      const data = readings[code];
      series.push({ key: `${station.key}:${m.label}`, m, data, unit: unitLabel(state.catalogue.units[station.kind][code]?.unit), gap: 3 * 3600000 });
    }
  } else {
    if (!archiveCache.has(station.key)) {
      const job = station.kind === 'hydro' ? loadHydroArchive(station) : loadMeteoArchive(station);
      job.catch(() => archiveCache.delete(station.key));
      archiveCache.set(station.key, job);
    }
    const readings = await archiveCache.get(station.key);
    const weekly = range.days > 400;
    for (const m of MEASURES[station.kind]) {
      const daily = (readings[m.archive] || []).filter(([t]) => t >= t0);
      if (daily.length < 2) continue;
      series.push({
        key: `${station.key}:${m.label}`, m, unit: m.archiveUnit,
        data: m.bars || !weekly ? daily : means(daily, 7 * DAY),
        raw: daily,
        gap: weekly ? 22 * DAY : 3 * DAY,
        reach: weekly ? 4 * DAY : 1.5 * DAY,
        kind: weekly ? 'weekly mean' : 'daily mean',
      });
    }
  }

  for (const s of series) {
    s.bars = s.m.bars ? buckets(s.raw || s.data, range.bar) : [];
    s.points = [];
  }
  return series;
}

/* ---------- state and elements ---------- */
const el = {
  stage: $('stage'),
  plot: $('gauge-plot'),
  rain: $('g-rain'),
  lines: $('g-lines'),
  fill: $('g-fill'),
  mean: $('g-mean'),
  dot: $('g-dot'),
  cursor: $('g-cursor'),
  readout: $('g-readout'),
  from: $('gauge-from'),
  to: $('gauge-to'),
  q: $('gauge-q'),
  results: $('gauge-results'),
  next: $('gauge-next'),
  note: $('gauge-note'),
  list: $('gauge-stations'),
  rangeButtons: [...document.querySelectorAll('#gauge-range button')],
};

const state = {
  catalogue: null,
  range: GAUGE.defaultRange,
  shown: [],            // [{ station, series, color }]
  hidden: new Set(),    // series switched off
  t0: 0,
  t1: 0,
  token: 0,
};

const isLive = () => GAUGE.ranges[state.range].source === 'live';

function nextColor() {
  const used = new Set(state.shown.map(e => e.color));
  return GAUGE.colors.find(c => !used.has(c)) || GAUGE.colors[state.shown.length % GAUGE.colors.length];
}

/* ---------- drawing ---------- */
const xOf = t => ((t - state.t0) / (state.t1 - state.t0 || 1)) * W;

function scaleFor(data) {
  let lo = Infinity;
  let hi = -Infinity;
  let sum = 0;
  for (const [, v] of data) { lo = Math.min(lo, v); hi = Math.max(hi, v); sum += v; }
  const span = hi - lo || Math.max(Math.abs(hi) * 0.01, 1);
  const pad = span * 0.08;
  return { mean: sum / data.length, y: v => LINE_BOTTOM - ((v - (lo - pad)) / (span + 2 * pad)) * (LINE_BOTTOM - LINE_TOP) };
}

function pathFrom(points, gap) {
  let d = '';
  let last = null;
  for (const p of points) {
    d += `${!last || p.t - last.t > gap ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`; // missing readings break the line
    last = p;
  }
  return d;
}

function revealLine(path) {
  const box = path.ownerSVGElement.getBoundingClientRect();
  const length = path.getTotalLength() * Math.max(box.width / W, box.height / H) * 1.05;
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;
  path.getBoundingClientRect();
  path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.4, 0, .2, 1)';
  path.style.strokeDashoffset = '0';
  path.addEventListener('transitionend', () => {
    path.style.transition = '';
    path.style.strokeDasharray = '';
    path.style.strokeDashoffset = '';
  }, { once: true });
}

// The right edge is always now
function updateTimeRange() {
  state.t1 = Date.now();
  state.t0 = state.t1 - GAUGE.ranges[state.range].days * DAY;
}

function draw(animate) {
  el.lines.replaceChildren();
  el.rain.replaceChildren();
  el.fill.setAttribute('d', '');
  el.mean.style.display = 'none';
  el.dot.hidden = true;
  const motion = animate && !still.matches;
  const range = GAUGE.ranges[state.range];
  let filled = false;

  for (const entry of state.shown) {
    for (const s of entry.series) {
      if (state.hidden.has(s.key)) continue;

      if (s.m.bars) {
        const visible = s.bars.filter(([t]) => t >= state.t0);
        const max = Math.max(range.bar <= 3600000 ? 2 : 10, ...visible.map(([, v]) => v)); // keeps drizzle small
        const width = Math.max((range.bar / (state.t1 - state.t0)) * W, 0.6);
        for (const [t, v] of visible) {
          if (v <= 0) continue;
          const r = document.createElementNS(SVG, 'rect');
          r.setAttribute('x', xOf(t).toFixed(2));
          r.setAttribute('y', '0');
          r.setAttribute('width', width.toFixed(2));
          r.setAttribute('height', ((v / max) * RAIN_DEPTH).toFixed(1));
          r.setAttribute('class', 'g-bar');
          r.style.setProperty('--c', entry.color);
          el.rain.append(r);
        }
        continue;
      }

      const scale = scaleFor(s.data);
      s.points = s.data.filter(([t]) => t >= state.t0).map(([t, v]) => ({ t, v, x: xOf(t), y: scale.y(v) }));
      if (s.points.length < 2) continue;

      const path = document.createElementNS(SVG, 'path');
      path.setAttribute('d', pathFrom(s.points, s.gap));
      path.setAttribute('class', `g-line ${s.m.style}`);
      path.style.setProperty('--c', entry.color);
      el.lines.append(path);
      if (motion && s.m.style === 'm-level') revealLine(path); // the other line styles fade in

      // the first water line carries the water body and the pulsing latest reading
      if (s.m.primary && !filled) {
        filled = true;
        const pts = s.points;
        el.fill.setAttribute('d', `M${pts[0].x} ${H}L${pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L')}L${pts[pts.length - 1].x} ${H}Z`);
        const my = scale.y(scale.mean).toFixed(1);
        el.mean.setAttribute('y1', my);
        el.mean.setAttribute('y2', my);
        el.mean.style.display = '';
        const last = pts[pts.length - 1];
        el.dot.hidden = false;
        el.dot.style.left = `min(${(last.x / W) * 100}%, calc(100% - 12px))`;
        el.dot.style.top = `${(last.y / H) * 100}%`;
        el.dot.style.setProperty('--c', entry.color);
      }
    }
  }

  if (motion) {
    el.plot.classList.add('is-revealing');
    requestAnimationFrame(() => requestAnimationFrame(() => el.plot.classList.remove('is-revealing')));
  }
  const label = range.days > 40 ? monthFmt : dayFmt;
  el.from.textContent = state.shown.length ? label.format(state.t0) : '';
  el.to.textContent = state.shown.length ? 'now' : '';
}

/* ---------- the station list on the right ---------- */
function latestText(s) {
  if (s.m.bars) {
    const range = GAUGE.ranges[state.range];
    if (range.source === 'live') {
      const total = s.data.filter(([t]) => t >= state.t1 - DAY).reduce((a, [, v]) => a + v, 0);
      return `${formatValue(total, s.unit)} in 24 h`;
    }
    const total = s.data.filter(([t]) => t >= state.t0).reduce((a, [, v]) => a + v, 0);
    return range.days > 400 ? `${formatValue(total / (range.days / 365.25), s.unit)} a year` : `${formatValue(total, s.unit)} in 12 months`;
  }
  return formatValue(s.data[s.data.length - 1][1], s.unit);
}

function renderList() {
  const first = state.shown[0]?.station;
  el.list.replaceChildren(...state.shown.map((entry, i) => {
    const { station } = entry;
    const li = document.createElement('li');
    li.className = 'station';
    li.style.setProperty('--c', entry.color);

    const head = document.createElement('div');
    head.className = 'station-head';

    if (state.shown.length > 1) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'station-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Remove ${station.title}`);
      remove.title = 'Remove this station';
      remove.addEventListener('click', () => removeStation(station.key));
      head.append(remove);
    }

    const text = document.createElement('div');
    text.className = 'station-text';
    const name = document.createElement('h2');
    name.className = 'station-name';
    name.textContent = station.title;
    const meta = document.createElement('p');
    meta.className = 'station-meta';
    const parts = [station.what];
    if (i > 0 && first) parts.push(`${Math.max(1, Math.round(distanceKm(first, station)))} km from ${first.title}`);
    meta.textContent = parts.join(', ');
    text.append(name, meta);
    if (station.theme) {
      const theme = document.createElement('p');
      theme.className = 'station-theme';
      theme.textContent = station.theme;
      text.append(theme);
    }

    const swatch = document.createElement('span');
    swatch.className = 'station-swatch';
    swatch.setAttribute('aria-hidden', 'true');
    head.append(text, swatch);
    li.append(head);

    if (!entry.series.length) {
      const none = document.createElement('p');
      none.className = 'station-meta';
      none.textContent = isLive() ? 'No readings in this time span.' : 'No long-term records for this time span.';
      li.append(none);
      return li;
    }

    // every measurement can be switched off and on; all start switched on
    const chips = document.createElement('div');
    chips.className = 'station-series';
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', `Measurements at ${station.title}`);
    for (const s of entry.series) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `gauge-chip ${s.m.style}`;
      b.setAttribute('aria-pressed', String(!state.hidden.has(s.key)));
      const sw = document.createElement('span');
      sw.className = 'chip-swatch';
      sw.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = s.m.label;
      const value = document.createElement('span');
      value.className = 'chip-value';
      value.textContent = latestText(s);
      b.append(sw, label, value);
      b.addEventListener('click', () => {
        if (state.hidden.has(s.key)) state.hidden.delete(s.key);
        else state.hidden.add(s.key);
        b.setAttribute('aria-pressed', String(!state.hidden.has(s.key)));
        draw(false);
      });
      chips.append(b);
    }
    li.append(chips);
    return li;
  }));
}

function setNote(text) {
  el.note.textContent = text;
  el.note.hidden = !text;
}

/* ---------- choosing stations and time spans ---------- */
function applyShown(entries, animate = true) {
  stopSynthetic();
  state.shown = entries;
  updateTimeRange();
  el.plot.dataset.state = 'live';
  renderList();
  draw(animate);
}

// A station from a case study area, with its closest neighbour that has readings
async function showPair() {
  const token = ++state.token;
  setNote('Loading readings…');
  const { hydro } = state.catalogue;
  const focus = hydro.filter(s => s.theme);
  const pool = (focus.length ? focus : hydro).slice().sort(() => Math.random() - 0.5);
  const current = state.shown[0]?.station.key;

  for (const station of pool.filter(s => s.key !== current).slice(0, 6)) {
    let series = [];
    try { series = await loadSeries(station, state.range); } catch { /* try the next one */ }
    if (token !== state.token) return;
    if (!series.length) continue;

    let second = null;
    for (const n of neighbours(station, GAUGE.pairWithinKm).slice(0, 4)) {
      try {
        const s2 = await loadSeries(n.s, state.range);
        if (s2.length) second = { station: n.s, series: s2 };
      } catch { /* try the next neighbour */ }
      if (token !== state.token) return;
      if (second) break;
    }

    state.hidden.clear();
    const entries = [{ station, series, color: GAUGE.colors[0] }];
    if (second) entries.push({ ...second, color: GAUGE.colors[1] });
    applyShown(entries);
    setNote(second ? '' : `No other station within ${GAUGE.pairWithinKm} km. Add one with the search.`);
    return;
  }
  if (isLive()) showUnavailable();
  else setNote('Long-term records could not be loaded. Choose Week or Month for live readings.');
}

async function addStation(station) {
  if (state.shown.some(e => e.station.key === station.key)) {
    setNote(`${station.title} is already shown.`);
    return;
  }
  const token = ++state.token;
  setNote(`Loading ${station.title}…`);
  let series = [];
  try { series = await loadSeries(station, state.range); } catch { /* reported below */ }
  if (token !== state.token) return;
  if (!series.length) {
    setNote(isLive()
      ? `${station.title} has sent no readings in this time span.`
      : `No long-term records of ${station.title} could be loaded.`);
    return;
  }
  const kept = state.shown.length >= GAUGE.maxStations ? state.shown.slice(0, GAUGE.maxStations - 1) : state.shown;
  state.shown = kept;
  applyShown([...kept, { station, series, color: nextColor() }]);
  setNote(state.shown.length >= GAUGE.maxStations ? `Up to ${GAUGE.maxStations} stations at once. The next one replaces the last.` : '');
}

function removeStation(key) {
  const entries = state.shown.filter(e => e.station.key !== key);
  for (const k of [...state.hidden]) if (k.startsWith(`${key}:`)) state.hidden.delete(k);
  applyShown(entries, false);
  setNote('');
}

async function setRange(rangeKey) {
  if (rangeKey === state.range || !GAUGE.ranges[rangeKey]) return;
  state.range = rangeKey;
  el.rangeButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.range === rangeKey)));
  if (!state.shown.length) return;

  const token = ++state.token;
  setNote(GAUGE.ranges[rangeKey].source === 'archive' ? 'Loading long-term records…' : 'Loading readings…');
  const results = await Promise.all(state.shown.map(e => loadSeries(e.station, rangeKey).catch(() => [])));
  if (token !== state.token) return;

  applyShown(state.shown.map((e, i) => ({ ...e, series: results[i] })));
  const missing = state.shown.filter(e => !e.series.length).map(e => e.station.title);
  if (missing.length === state.shown.length && GAUGE.ranges[rangeKey].source === 'archive') {
    setNote('Long-term records could not be loaded right now. Week and Month still show live readings.');
  } else {
    setNote(missing.length ? `No records for ${missing.join(' and ')} in this time span.` : '');
  }
}

/* ---------- simulated line, while loading or when the data cannot be reached ---------- */
let synthFrame = null;
let synthPath = null;

function synthetic(t) {
  let d = '';
  for (let x = 0; x <= W; x += 8) {
    const u = x / W;
    const y = 135 + 8 * Math.sin(t * 0.05) + 24 * Math.sin(u * Math.PI * 4 - t * 0.35)
      + 6 * Math.sin(u * Math.PI * 23 - t * 1.1) + 2.5 * Math.sin(u * Math.PI * 57 + t * 0.7);
    d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
  }
  synthPath.setAttribute('d', d);
  el.fill.setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
}

function startSynthetic() {
  el.lines.replaceChildren();
  synthPath = document.createElementNS(SVG, 'path');
  synthPath.setAttribute('class', 'g-line m-level');
  synthPath.style.setProperty('--c', GAUGE.colors[0]);
  el.lines.append(synthPath);
  let start = null;
  const frame = now => {
    if (start === null) start = now;
    synthetic((now - start) / 1000);
    synthFrame = still.matches ? null : requestAnimationFrame(frame);
  };
  synthetic(0);
  if (!still.matches) synthFrame = requestAnimationFrame(frame);
}

function stopSynthetic() {
  if (synthFrame) cancelAnimationFrame(synthFrame);
  synthFrame = null;
}

function showUnavailable() {
  el.plot.dataset.state = 'offline';
  state.shown = [];
  el.list.replaceChildren();
  el.rain.replaceChildren();
  el.dot.hidden = true;
  el.from.textContent = el.to.textContent = '';
  setNote('Live readings from Swiss stations could not be loaded, so the line shows a simulated water level. Reload the page to try again.');
  if (!synthFrame) startSynthetic();
}

/* ---------- reading the graph: hover or touch shows every value at that moment ---------- */
function nearest(list, t, maxGap) {
  if (!list.length) return null;
  let lo = 0;
  let hi = list.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (list[mid][0] < t) lo = mid; else hi = mid; }
  const best = Math.abs(list[lo][0] - t) < Math.abs(list[hi][0] - t) ? list[lo] : list[hi];
  return Math.abs(best[0] - t) <= maxGap ? best : null;
}

function initReadout() {
  const hide = () => { el.cursor.hidden = true; el.readout.hidden = true; };

  // listen on the whole stage, because the graph lies behind the text
  el.stage.addEventListener('pointermove', e => {
    const box = el.plot.getBoundingClientRect();
    const inside = e.clientY >= box.top && e.clientY <= box.bottom && e.clientX >= box.left && e.clientX <= box.right;
    if (!inside || el.plot.dataset.state !== 'live' || e.target.closest('a, button, input, .gauge-panel')) { hide(); return; }

    const range = GAUGE.ranges[state.range];
    const ratio = (e.clientX - box.left) / box.width;
    const t = state.t0 + ratio * (state.t1 - state.t0);
    const blocks = [];
    for (const entry of state.shown) {
      const rows = [];
      for (const s of entry.series) {
        if (state.hidden.has(s.key)) continue;
        const hit = s.m.bars
          ? nearest(s.bars, Math.floor(t / range.bar) * range.bar, 0)
          : nearest(s.data, t, s.reach || 40 * 60000);
        if (!hit) continue;
        const row = document.createElement('div');
        row.className = `readout-row ${s.m.style}`;
        const sw = document.createElement('span');
        sw.className = 'chip-swatch';
        const text = document.createElement('span');
        const note = s.kind && !s.m.bars ? ` (${s.kind})` : '';
        text.textContent = `${s.m.label} ${formatValue(hit[1], s.unit)}${s.m.bars ? ` ${range.per}` : note}`;
        row.append(sw, text);
        rows.push(row);
      }
      if (!rows.length) continue;
      const block = document.createElement('div');
      block.className = 'readout-station';
      block.style.setProperty('--c', entry.color);
      const name = document.createElement('div');
      name.className = 'readout-name';
      name.textContent = entry.station.title;
      block.append(name, ...rows);
      blocks.push(block);
    }
    if (!blocks.length) { hide(); return; }

    const head = document.createElement('div');
    head.className = 'readout-time';
    head.textContent = range.source === 'live' ? timeFmt.format(t) : dateFmt.format(t);
    el.readout.replaceChildren(head, ...blocks);

    el.cursor.hidden = false;
    el.cursor.style.left = `${ratio * 100}%`;
    el.readout.hidden = false;
    const x = ratio * box.width;
    const width = el.readout.offsetWidth;
    el.readout.style.left = `${x + 14 + width > box.width ? x - 14 - width : x + 14}px`;
  });
  el.stage.addEventListener('pointerleave', hide);
}

/* ---------- station search ---------- */
function initSearch() {
  let matches = [];
  let active = -1;

  const close = () => {
    el.results.hidden = true;
    el.q.setAttribute('aria-expanded', 'false');
    el.q.removeAttribute('aria-activedescendant');
    active = -1;
  };

  const highlight = i => {
    active = i;
    [...el.results.children].forEach((li, n) => li.setAttribute('aria-selected', String(n === i)));
    if (i >= 0) el.q.setAttribute('aria-activedescendant', `gauge-opt-${i}`);
  };

  const choose = station => {
    close();
    el.q.value = '';
    addStation(station);
  };

  el.q.addEventListener('input', () => {
    const tokens = norm(el.q.value).split(' ').filter(Boolean);
    if (!tokens.length) { close(); return; }

    // stations near the ones shown come first
    const ref = state.shown[0]?.station;
    matches = state.catalogue.all
      .filter(s => tokens.every(t => s.search.includes(t)))
      .map(s => ({ s, km: ref ? distanceKm(ref, s) : 0 }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 8);

    if (!matches.length) {
      const li = document.createElement('li');
      li.className = 'gauge-empty';
      li.textContent = 'No station matches. Try a river, lake, town or station code.';
      el.results.replaceChildren(li);
    } else {
      el.results.replaceChildren(...matches.map(({ s, km }, i) => {
        const li = document.createElement('li');
        li.id = `gauge-opt-${i}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        const name = document.createElement('span');
        name.textContent = s.title;
        const what = document.createElement('small');
        what.textContent = [s.what, ref && Number.isFinite(km) && `${Math.round(km)} km away`].filter(Boolean).join(', ');
        li.append(name, what);
        li.addEventListener('pointerdown', e => { e.preventDefault(); choose(s); });
        return li;
      }));
    }
    el.results.hidden = false;
    el.q.setAttribute('aria-expanded', 'true');
    highlight(matches.length ? 0 : -1);
  });

  el.q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && matches.length) { e.preventDefault(); highlight((active + 1) % matches.length); }
    else if (e.key === 'ArrowUp' && matches.length) { e.preventDefault(); highlight((active - 1 + matches.length) % matches.length); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(matches[active].s); }
    else if (e.key === 'Escape') { close(); }
  });
  el.q.addEventListener('blur', () => setTimeout(close, 100));
  el.next.addEventListener('click', () => showPair());
  el.rangeButtons.forEach(b => b.addEventListener('click', () => setRange(b.dataset.range)));
}

/* ---------- start ---------- */
async function refresh() {
  if (!state.shown.length || document.hidden || !isLive()) return;
  const fresh = await Promise.all(state.shown.map(e => loadSeries(e.station, state.range).catch(() => null)));
  applyShown(state.shown.map((e, i) => (fresh[i]?.length ? { ...e, series: fresh[i] } : e)), false);
}

async function init() {
  startSynthetic();
  try {
    state.catalogue = await loadCatalogue();
  } catch {
    showUnavailable();
    return;
  }
  if (!state.catalogue.hydro.length) { showUnavailable(); return; }

  el.q.disabled = false;
  el.next.disabled = false;
  initSearch();
  initReadout();
  await showPair();

  setInterval(refresh, GAUGE.refreshMinutes * 60000);

  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (el.plot.dataset.state === 'live') draw(false); }, 150);
  });
}

init();
