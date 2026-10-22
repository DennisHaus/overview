'use strict';

/* =====================================================================
   Live graph on the start page.
   Two neighbouring stations are shown at first: a river or lake station
   (FOEN) in one of the case study areas, and the closest other station,
   a weather station (MeteoSwiss) or another river or lake. Visitors can
   add up to four stations and switch every measurement on and off.
   Each line is scaled to its own range; precipitation hangs from the top
   as hourly bars, as in a hydrograph. Data: api.existenz.ch.
   ===================================================================== */
const GAUGE = {
  api: 'https://api.existenz.ch/apiv1',
  app: 'entwerfen-in-der-zeit',     // Existenz asks apps to name themselves
  days: 7,                          // length of the series shown (up to 31)
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

// What is drawn for each kind of station; the line style tells the measurements apart
const MEASURES = {
  hydro: [
    { codes: ['height', 'height_abs'], label: 'Water level', style: 'm-level', primary: true },
    { codes: ['flow', 'flow_ls'], label: 'Discharge', style: 'm-flow', primary: true },
    { codes: ['temperature'], label: 'Water temperature', style: 'm-wtemp' },
  ],
  smn: [
    { codes: ['tt'], label: 'Air temperature', style: 'm-air' },
    { codes: ['rr'], label: 'Precipitation', style: 'm-rain', bars: true },
  ],
};

const W = 1200;
const H = 200;
const LINE_TOP = 62;     // lines stay below the precipitation bars
const LINE_BOTTOM = 190;
const RAIN_DEPTH = 50;   // tallest precipitation bar

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
  const digits = unit === 'm' ? 2 : unit === 'mm' ? 1 : abs >= 1000 ? 0 : abs >= 1 ? 1 : 2;
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
    cached('gauge3:hydro:stations', async () => parseStations(await api('/hydro/locations'), 'hydro')),
    cached('gauge3:smn:stations', async () => parseStations(await api('/smn/locations'), 'smn')).catch(() => []),
    cached('gauge3:hydro:params', async () => parseParams(await api('/hydro/parameters'))).catch(() => ({})),
    cached('gauge3:smn:params', async () => parseParams(await api('/smn/parameters'))).catch(() => ({})),
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

// Readings of one station: { code: [[ms, value], …] } sorted by time
async function loadReadings(station) {
  const json = await api(`/${station.kind}/daterange`, { locations: station.id, startdate: `-${GAUGE.days} days`, enddate: 'now' });
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

// 10-minute precipitation summed per hour
function hourly(data) {
  const sums = new Map();
  for (const [t, v] of data) {
    const hour = Math.floor(t / 3600000) * 3600000;
    sums.set(hour, (sums.get(hour) || 0) + v);
  }
  return [...sums.entries()].sort((a, b) => a[0] - b[0]);
}

// A station with the measurements it actually reported, or null when it has none
async function loadStation(station) {
  const readings = await loadReadings(station);
  const series = [];
  for (const m of MEASURES[station.kind]) {
    const code = m.codes.find(c => readings[c]?.length > 1);
    if (!code) continue;
    const data = readings[code];
    series.push({
      key: `${station.key}:${m.label}`, m, data,
      unit: unitLabel(state.catalogue.units[station.kind][code]?.unit),
      hourly: m.bars ? hourly(data) : [],
      points: [],
    });
  }
  return series.length ? { station, series } : null;
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
};

const state = {
  catalogue: null,
  shown: [],            // [{ station, series, color }]
  hidden: new Set(),    // series switched off
  t0: 0,
  t1: 0,
  token: 0,
};

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

function pathFrom(points) {
  let d = '';
  let last = null;
  for (const p of points) {
    d += `${!last || p.t - last.t > 3 * 3600000 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`; // gaps over 3 h break the line
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

function updateTimeRange() {
  const ends = state.shown.flatMap(e => e.series.map(s => s.data[s.data.length - 1][0]));
  state.t1 = ends.length ? Math.max(...ends) : Date.now();
  state.t0 = state.t1 - GAUGE.days * 86400000;
}

function draw(animate) {
  el.lines.replaceChildren();
  el.rain.replaceChildren();
  el.fill.setAttribute('d', '');
  el.mean.style.display = 'none';
  el.dot.hidden = true;
  const motion = animate && !still.matches;
  let filled = false;

  for (const entry of state.shown) {
    for (const s of entry.series) {
      if (state.hidden.has(s.key)) continue;

      if (s.m.bars) {
        const max = Math.max(2, ...s.hourly.map(([, v]) => v)); // 2 mm/h keeps drizzle small
        const width = Math.max((3600000 / (state.t1 - state.t0)) * W, 1);
        for (const [t, v] of s.hourly) {
          if (v <= 0 || t < state.t0) continue;
          const r = document.createElementNS(SVG, 'rect');
          r.setAttribute('x', xOf(t).toFixed(1));
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
      path.setAttribute('d', pathFrom(s.points));
      path.setAttribute('class', `g-line ${s.m.style}`);
      path.style.setProperty('--c', entry.color);
      el.lines.append(path);
      if (motion && !s.m.style.match(/m-wtemp|m-air/)) revealLine(path); // dotted and dashed lines fade in instead

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
  el.from.textContent = state.shown.length ? dayFmt.format(state.t0) : '';
  el.to.textContent = !state.shown.length ? '' : Date.now() - state.t1 < 2 * 3600000 ? 'now' : dayFmt.format(state.t1);
}

/* ---------- the station list on the right ---------- */
function latestText(s) {
  if (s.m.bars) {
    const total = s.data.filter(([t]) => t >= state.t1 - 86400000).reduce((a, [, v]) => a + v, 0);
    return `${formatValue(total, s.unit)} in 24 h`;
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

    li.append(head, chips);
    return li;
  }));
}

function setNote(text) {
  el.note.textContent = text;
  el.note.hidden = !text;
}

/* ---------- choosing stations ---------- */
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
  setNote('Loading live readings…');
  const { hydro } = state.catalogue;
  const focus = hydro.filter(s => s.theme);
  const pool = (focus.length ? focus : hydro).slice().sort(() => Math.random() - 0.5);
  const current = state.shown[0]?.station.key;

  for (const station of pool.filter(s => s.key !== current).slice(0, 6)) {
    let first = null;
    try { first = await loadStation(station); } catch { /* try the next one */ }
    if (token !== state.token) return;
    if (!first) continue;

    let second = null;
    for (const n of neighbours(station, GAUGE.pairWithinKm).slice(0, 4)) {
      try { second = await loadStation(n.s); } catch { /* try the next neighbour */ }
      if (token !== state.token) return;
      if (second) break;
    }

    state.hidden.clear();
    first.color = GAUGE.colors[0];
    const entries = [first];
    if (second) { second.color = GAUGE.colors[1]; entries.push(second); }
    applyShown(entries);
    setNote(second ? '' : `No other station within ${GAUGE.pairWithinKm} km. Add one with the search.`);
    return;
  }
  showUnavailable();
}

async function addStation(station) {
  if (state.shown.some(e => e.station.key === station.key)) {
    setNote(`${station.title} is already shown.`);
    return;
  }
  const token = ++state.token;
  setNote(`Loading ${station.title}…`);
  let entry = null;
  try { entry = await loadStation(station); } catch { /* reported below */ }
  if (token !== state.token) return;
  if (!entry) {
    setNote(`${station.title} has sent no readings in the last ${GAUGE.days} days.`);
    return;
  }
  const kept = state.shown.length >= GAUGE.maxStations ? state.shown.slice(0, GAUGE.maxStations - 1) : state.shown;
  state.shown = kept;
  entry.color = nextColor();
  applyShown([...kept, entry]);
  setNote(state.shown.length >= GAUGE.maxStations ? `Up to ${GAUGE.maxStations} stations at once. The next one replaces the last.` : '');
}

function removeStation(key) {
  const entries = state.shown.filter(e => e.station.key !== key);
  for (const k of [...state.hidden]) if (k.startsWith(`${key}:`)) state.hidden.delete(k);
  applyShown(entries, false);
  setNote('');
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

    const ratio = (e.clientX - box.left) / box.width;
    const t = state.t0 + ratio * (state.t1 - state.t0);
    const blocks = [];
    for (const entry of state.shown) {
      const rows = [];
      for (const s of entry.series) {
        if (state.hidden.has(s.key)) continue;
        const hit = s.m.bars ? nearest(s.hourly, Math.floor(t / 3600000) * 3600000, 0) : nearest(s.data, t, 40 * 60000);
        if (!hit) continue;
        const row = document.createElement('div');
        row.className = `readout-row ${s.m.style}`;
        const sw = document.createElement('span');
        sw.className = 'chip-swatch';
        const text = document.createElement('span');
        text.textContent = `${s.m.label} ${formatValue(hit[1], s.unit)}${s.m.bars ? ' per hour' : ''}`;
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
    head.textContent = timeFmt.format(t);
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
}

/* ---------- start ---------- */
async function refresh() {
  if (!state.shown.length || document.hidden) return;
  const fresh = await Promise.all(state.shown.map(e => loadStation(e.station).catch(() => null)));
  const entries = state.shown.map((e, i) => (fresh[i] ? { ...fresh[i], color: e.color } : e));
  applyShown(entries, false);
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
