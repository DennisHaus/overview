'use strict';

/* =====================================================================
   Live water line on the start page.
   A Swiss river or lake station (FOEN) over the last days, together with
   the nearest MeteoSwiss weather station. All measurements are drawn on
   the same time axis, each scaled to its own range; precipitation hangs
   from the top as bars, as in a hydrograph. Data: api.existenz.ch.
   ===================================================================== */
const GAUGE = {
  api: 'https://api.existenz.ch/apiv1',
  app: 'entwerfen-in-der-zeit',     // Existenz asks apps to name themselves
  days: 7,                          // length of the series shown (up to 31)
  weatherWithinKm: 30,              // farthest weather station that is still paired
  focusShare: 0.8,                  // share of random picks taken from the focus stations below
  refreshMinutes: 10,
  cacheHours: 24,                   // station lists are kept this long in the browser

  // Stations shown more often, matched by water body and place name.
  // The label appears under the station name.
  focus: [
    { label: 'Case study area: Linth plain', water: ['linth', 'escherkanal', 'linthkanal'] },
    { label: 'Case study area: Kandersteg', water: ['kander'] },
    { label: 'Case study area: Brienz/Brinzauls', water: ['albula'] },
    { label: 'Case study area: Blatten (Lötschental)', water: ['lonza'] },
    { label: 'Case study area: Grimsel and the upper Aare', water: ['aare'], place: ['guttannen', 'handeck', 'innertkirchen', 'meiringen', 'brienzwiler', 'grimsel'] },
    { label: 'Glacier-fed river', water: ['rhone'], place: ['gletsch', 'reckingen', 'oberwald', 'brig'] },
    { label: 'Glacier-fed river', water: ['massa', 'lutschine', 'vispa', 'rosegbach', 'roseg', 'gornera', 'drance', 'navisence', 'borgne', 'reuss'], place: ['blatten', 'gsteig', 'zweilutschinen', 'visp', 'zermatt', 'saas', 'pontresina', 'andermatt', 'vissoie', 'bramois', 'martigny', 'brig'] },
  ],
};

// Measurements that are drawn, in order. Others the stations may report are left out.
const SERIES = [
  { key: 'hydro:height', label: 'Water level', cls: 's-level', primary: true },
  { key: 'hydro:height_abs', label: 'Water level', cls: 's-level', primary: true },
  { key: 'hydro:flow', label: 'Discharge', cls: 's-flow', primary: true },
  { key: 'hydro:flow_ls', label: 'Discharge', cls: 's-flow', primary: true },
  { key: 'hydro:temperature', label: 'Water temperature', cls: 's-wtemp' },
  { key: 'smn:tt', label: 'Air temperature', cls: 's-air', weather: true },
  { key: 'smn:rr', label: 'Precipitation', cls: 's-rain', weather: true, bars: true },
];

const W = 1200;
const H = 200;
const LINE_TOP = 64;     // lines stay below the precipitation bars
const LINE_BOTTOM = 190;
const RAIN_DEPTH = 52;   // tallest precipitation bar

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const SVG = 'http://www.w3.org/2000/svg';
const still = matchMedia('(prefers-reduced-motion: reduce)');

const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const num = v => (v === null || v === undefined || v === '' ? NaN : Number(v));
const unitLabel = u => String(u || '').replace(/m3/g, 'm³');

const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', day: 'numeric', month: 'short' });

// Water levels move by centimetres, so metres always keep two decimals
function formatValue(v, unit = '') {
  const abs = Math.abs(v);
  const digits = unit === 'm' ? 2 : unit === 'mm' ? 1 : abs >= 1000 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 1 : 2;
  const text = v.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return unit ? `${text} ${unit}` : text;
}

function fetchWithTimeout(url, ms = 10000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function api(path, params = {}) {
  const url = new URL(GAUGE.api + path);
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

// The API wraps results in { payload }, either a list or an object keyed by id
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
    const lat = num(d.lat ?? d.latitude);
    const lon = num(d.lon ?? d.lng ?? d.longitude);
    const chx = num(d.chx ?? d.x);
    const chy = num(d.chy ?? d.y);

    const title = kind === 'hydro' ? (water && water !== place ? `${water}, ${place}` : place) : place;
    const what = kind === 'hydro' ? `${type === 'lake' ? 'Lake' : 'River'} station ${id}, FOEN` : `Weather station ${id}, MeteoSwiss`;
    const theme = kind === 'hydro' ? themeOf(water, place) : '';

    return {
      kind, id, title, place, what, theme, lat, lon, chx, chy,
      search: norm(`${title} ${place} ${water} ${canton} ${id} ${type} ${theme}`),
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
    cached('gauge2:hydro:stations', async () => parseStations(await api('/hydro/locations'), 'hydro')),
    cached('gauge2:smn:stations', async () => parseStations(await api('/smn/locations'), 'smn')).catch(() => []),
    cached('gauge2:hydro:params', async () => parseParams(await api('/hydro/parameters'))).catch(() => ({})),
    cached('gauge2:smn:params', async () => parseParams(await api('/smn/parameters'))).catch(() => ({})),
  ]);
  return { hydro, smn, units: { hydro: hydroParams, smn: smnParams } };
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
    const scale = v => (v > 1e6 ? v - (v > 1.5e6 ? 2e6 : 1e6) : v); // LV95 to LV03
    return Math.hypot(scale(a.chx) - scale(b.chx), scale(a.chy) - scale(b.chy)) / 1000;
  }
  return Infinity;
}

function nearestWeather(station) {
  let best = null;
  let bestKm = GAUGE.weatherWithinKm;
  for (const w of state.catalogue.smn) {
    const km = distanceKm(station, w);
    if (km < bestKm) { best = w; bestKm = km; }
  }
  return best ? { station: best, km: bestKm } : null;
}

// Readings of one station: { code: [[ms, value], …] } sorted by time
async function loadReadings(kind, id) {
  const json = await api(`/${kind}/daterange`, { locations: id, startdate: `-${GAUGE.days} days`, enddate: 'now' });
  const out = {};
  for (const row of Array.isArray(json?.payload) ? json.payload : []) {
    const value = num(row.val);
    const t = num(row.timestamp) * 1000;
    if (!row.par || !Number.isFinite(value) || !Number.isFinite(t)) continue;
    (out[row.par] ||= []).push([t, value]);
  }
  for (const list of Object.values(out)) list.sort((a, b) => a[0] - b[0]);
  return out;
}

/* ---------- state and elements ---------- */
const el = {
  gauge: $('gauge'),
  plot: $('gauge-plot'),
  rain: $('g-rain'),
  lines: $('g-lines'),
  fill: $('g-fill'),
  mean: $('g-mean'),
  dot: $('g-dot'),
  cursor: $('g-cursor'),
  readout: $('g-readout'),
  title: $('gauge-title'),
  theme: $('gauge-theme'),
  sub: $('gauge-sub'),
  series: $('gauge-series'),
  from: $('gauge-from'),
  to: $('gauge-to'),
  q: $('gauge-q'),
  results: $('gauge-results'),
  next: $('gauge-next'),
};

const state = {
  catalogue: null,
  station: null,
  weather: null,
  series: [],          // [{ def, unit, data, points, hourly }]
  selected: new Set(),
  t0: 0,
  t1: 0,
  token: 0,
};

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

function pathFrom(points) {
  let d = '';
  let last = null;
  for (const p of points) {
    d += `${!last || p.t - last.t > 3 * 3600000 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`; // gaps over 3 h break the line
    last = p;
  }
  return d;
}

// 10-minute precipitation summed per hour
function hourly(data) {
  const sums = new Map();
  for (const [t, v] of data) {
    const hour = Math.floor(t / 3600000) * 3600000;
    sums.set(hour, (sums.get(hour) || 0) + v);
  }
  return [...sums.entries()].sort((a, b) => a[0] - b[0]);
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
    path.style.strokeDasharray = '';
    path.style.strokeDashoffset = '';
  }, { once: true });
}

function draw(animate) {
  const shown = state.series.filter(s => state.selected.has(s.def.key));
  el.lines.replaceChildren();
  el.rain.replaceChildren();
  el.fill.setAttribute('d', '');
  el.mean.style.display = 'none';
  el.dot.hidden = true;

  const primary = shown.find(s => s.def.primary);
  const motion = animate && !still.matches;

  for (const s of shown) {
    if (s.def.bars) {
      const max = Math.max(2, ...s.hourly.map(([, v]) => v)); // 2 mm/h keeps drizzle small
      const width = Math.max((3600000 / (state.t1 - state.t0)) * W, 1);
      for (const [t, v] of s.hourly) {
        if (v <= 0 || t < state.t0) continue;
        const r = document.createElementNS(SVG, 'rect');
        r.setAttribute('x', xOf(t).toFixed(1));
        r.setAttribute('y', '0');
        r.setAttribute('width', width.toFixed(2));
        r.setAttribute('height', ((v / max) * RAIN_DEPTH).toFixed(1));
        r.setAttribute('class', `g-bar ${s.def.cls}`);
        el.rain.append(r);
      }
      continue;
    }

    const scale = scaleFor(s.data);
    s.points = s.data.filter(([t]) => t >= state.t0).map(([t, v]) => ({ t, v, x: xOf(t), y: scale.y(v) }));
    if (s.points.length < 2) continue;

    const path = document.createElementNS(SVG, 'path');
    path.setAttribute('d', pathFrom(s.points));
    path.setAttribute('class', `g-line ${s.def.cls}${s.def.weather ? ' is-weather' : ''}`);
    el.lines.append(path);

    if (s === primary) {
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
    }
    if (motion) revealLine(path);
  }

  el.gauge.classList.toggle('is-revealing', motion);
  if (motion) setTimeout(() => el.gauge.classList.remove('is-revealing'), 50);

  el.from.textContent = dayFmt.format(state.t0);
  el.to.textContent = Date.now() - state.t1 < 2 * 3600000 ? 'now' : dayFmt.format(state.t1);
}

function latestText(s) {
  if (s.def.bars) {
    const total = s.data.filter(([t]) => t >= state.t1 - 86400000).reduce((a, [, v]) => a + v, 0);
    return `${formatValue(total, s.unit)} in 24 h`;
  }
  return formatValue(s.data[s.data.length - 1][1], s.unit);
}

// The legend doubles as the switch: every measurement can be shown or hidden, all start shown
function renderLegend() {
  el.series.replaceChildren(...state.series.map(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `gauge-chip ${s.def.cls}${s.def.weather ? ' is-weather' : ''}`;
    b.setAttribute('aria-pressed', String(state.selected.has(s.def.key)));
    const swatch = document.createElement('span');
    swatch.className = 'chip-swatch';
    swatch.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = s.def.label;
    const value = document.createElement('span');
    value.className = 'chip-value';
    value.textContent = latestText(s);
    b.append(swatch, label, value);
    b.addEventListener('click', () => {
      if (state.selected.has(s.def.key)) state.selected.delete(s.def.key);
      else state.selected.add(s.def.key);
      b.setAttribute('aria-pressed', String(state.selected.has(s.def.key)));
      draw(false);
    });
    return b;
  }));
}

/* ---------- loading a station ---------- */
async function showStation(station, { quiet = false } = {}) {
  const token = ++state.token;
  const weather = nearestWeather(station);

  if (!quiet) {
    el.title.textContent = station.title;
    el.theme.hidden = !station.theme;
    el.theme.textContent = station.theme;
    el.sub.textContent = 'Loading readings…';
  }

  const [hydro, smn] = await Promise.all([
    loadReadings('hydro', station.id),
    weather ? loadReadings('smn', weather.station.id).catch(() => ({})) : Promise.resolve({}),
  ]);
  if (token !== state.token) return false;

  const readings = { hydro, smn };
  const series = [];
  const seen = new Set();
  for (const def of SERIES) {
    const [kind, code] = def.key.split(':');
    const data = readings[kind][code];
    if (!data || data.length < 2 || seen.has(def.label)) continue; // one water level, one discharge
    seen.add(def.label);
    series.push({ def, unit: unitLabel(state.catalogue.units[kind][code]?.unit), data, points: [], hourly: def.bars ? hourly(data) : [] });
  }

  if (!series.some(s => !s.def.weather)) {
    if (!quiet) el.sub.textContent = 'No recent readings from this station.';
    return false;
  }

  stopSynthetic();
  const sameStation = quiet && state.station?.id === station.id;
  state.station = station;
  state.weather = weather;
  state.series = series;
  if (!sameStation) state.selected = new Set(series.map(s => s.def.key));

  state.t1 = Math.max(...series.map(s => s.data[s.data.length - 1][0]));
  state.t0 = state.t1 - GAUGE.days * 86400000;

  el.gauge.dataset.state = 'live';
  el.title.textContent = station.title;
  el.theme.hidden = !station.theme;
  el.theme.textContent = station.theme;
  const hasWeather = series.some(s => s.def.weather);
  el.sub.textContent = hasWeather
    ? `${station.what}, with weather from ${weather.station.place}, ${Math.round(weather.km)} km away (MeteoSwiss)`
    : `${station.what}${weather ? '' : `, no weather station within ${GAUGE.weatherWithinKm} km`}`;

  renderLegend();
  draw(!quiet);
  return true;
}

async function showRandom() {
  const all = state.catalogue.hydro;
  const focus = all.filter(s => s.theme);
  for (let attempt = 0; attempt < 6; attempt++) {
    const pool = focus.length && Math.random() < GAUGE.focusShare ? focus : all;
    let station = pool[Math.floor(Math.random() * pool.length)];
    if (station?.id === state.station?.id && pool.length > 1) station = pool[(pool.indexOf(station) + 1) % pool.length];
    try {
      if (station && await showStation(station)) return;
    } catch { /* try another station */ }
  }
  showUnavailable();
}

/* ---------- simulated line, while loading or when the data cannot be reached ---------- */
let synthFrame = null;
let synthPath = null;

function synthetic(t) {
  let d = '';
  for (let x = 0; x <= W; x += 8) {
    const u = x / W;
    const y = 130 + 8 * Math.sin(t * 0.05) + 26 * Math.sin(u * Math.PI * 4 - t * 0.35)
      + 6 * Math.sin(u * Math.PI * 23 - t * 1.1) + 2.5 * Math.sin(u * Math.PI * 57 + t * 0.7);
    d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
  }
  synthPath.setAttribute('d', d);
  el.fill.setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
}

function startSynthetic() {
  el.lines.replaceChildren();
  synthPath = document.createElementNS(SVG, 'path');
  synthPath.setAttribute('class', 'g-line s-level');
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
  el.gauge.dataset.state = 'offline';
  el.title.textContent = 'Simulated water level';
  el.theme.hidden = true;
  el.sub.textContent = 'Live readings from Swiss stations could not be loaded. Reload the page to try again.';
  el.series.replaceChildren();
  el.rain.replaceChildren();
  el.dot.hidden = true;
  el.from.textContent = el.to.textContent = '';
  if (!synthFrame) startSynthetic();
}

/* ---------- reading the graph: hover or touch shows all values at that time ---------- */
function nearest(list, t, maxGap) {
  let lo = 0;
  let hi = list.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (list[mid][0] < t) lo = mid; else hi = mid; }
  const best = Math.abs(list[lo][0] - t) < Math.abs(list[hi][0] - t) ? list[lo] : list[hi];
  return Math.abs(best[0] - t) <= maxGap ? best : null;
}

function initReadout() {
  const hide = () => { el.cursor.hidden = true; el.readout.hidden = true; };
  el.plot.addEventListener('pointermove', e => {
    const shown = state.series.filter(s => state.selected.has(s.def.key));
    if (el.gauge.dataset.state !== 'live' || !shown.length) { hide(); return; }
    const box = el.plot.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1);
    const t = state.t0 + ratio * (state.t1 - state.t0);

    const rows = [];
    for (const s of shown) {
      const hit = s.def.bars ? nearest(s.hourly, Math.floor(t / 3600000) * 3600000, 0) : nearest(s.data, t, 40 * 60000);
      if (!hit) continue;
      const row = document.createElement('div');
      row.className = `readout-row ${s.def.cls}${s.def.weather ? ' is-weather' : ''}`;
      const sw = document.createElement('span');
      sw.className = 'chip-swatch';
      const text = document.createElement('span');
      text.textContent = `${s.def.label} ${formatValue(hit[1], s.unit)}${s.def.bars ? '/h' : ''}`;
      row.append(sw, text);
      rows.push(row);
    }
    const head = document.createElement('div');
    head.className = 'readout-time';
    head.textContent = timeFmt.format(t);
    el.readout.replaceChildren(head, ...rows);

    el.cursor.hidden = false;
    el.cursor.style.left = `${ratio * 100}%`;
    el.readout.hidden = false;
    const x = ratio * box.width;
    const width = el.readout.offsetWidth;
    el.readout.style.left = `${x + 14 + width > box.width ? x - 14 - width : x + 14}px`;
  });
  el.plot.addEventListener('pointerleave', hide);
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
    el.q.blur();
    showStation(station).catch(showUnavailable);
  };

  el.q.addEventListener('input', () => {
    const tokens = norm(el.q.value).split(' ').filter(Boolean);
    if (!tokens.length) { close(); return; }
    matches = state.catalogue.hydro.filter(s => tokens.every(t => s.search.includes(t))).slice(0, 8);

    if (!matches.length) {
      const li = document.createElement('li');
      li.className = 'gauge-empty';
      li.textContent = 'No station matches. Try a river, lake, town or station number.';
      el.results.replaceChildren(li);
    } else {
      el.results.replaceChildren(...matches.map((s, i) => {
        const li = document.createElement('li');
        li.id = `gauge-opt-${i}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        const name = document.createElement('span');
        name.textContent = s.title;
        const what = document.createElement('small');
        what.textContent = s.theme ? `${s.what}. ${s.theme}` : s.what;
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
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(matches[active]); }
    else if (e.key === 'Escape') { close(); }
  });
  el.q.addEventListener('blur', () => setTimeout(close, 100));
  el.next.addEventListener('click', () => showRandom());
}

/* ---------- start ---------- */
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
  await showRandom();

  // keep the shown station up to date
  setInterval(() => {
    if (state.station && !document.hidden) showStation(state.station, { quiet: true }).catch(() => {});
  }, GAUGE.refreshMinutes * 60000);

  // redraw when the window changes size, so the line reveal and dot stay in place
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (el.gauge.dataset.state === 'live') draw(false); }, 150);
  });
}

init();
