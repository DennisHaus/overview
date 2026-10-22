'use strict';

/* =====================================================================
   Live water line on the start page.
   Readings from a random Swiss river, lake or weather station for the
   last few days, drawn as a water level. Data: FOEN (hydrology) and
   MeteoSwiss (SwissMetNet), served by api.existenz.ch.
   ===================================================================== */
const GAUGE = {
  api: 'https://api.existenz.ch/apiv1',
  app: 'entwerfen-in-der-zeit',     // Existenz asks apps to name themselves
  days: 7,                          // length of the series shown
  hydroShare: 0.7,                  // share of random picks that are river and lake stations
  refreshMinutes: 10,
  cacheHours: 24,                   // station lists are kept this long in the browser
};

// Readable names for the parameter codes. Unknown codes use the API's own description.
const PARAM_LABELS = {
  hydro: {
    height: 'Water level', height_abs: 'Water level', flow: 'Discharge', flow_ls: 'Discharge',
    temperature: 'Water temperature',
  },
  smn: {
    tt: 'Air temperature', rr: 'Precipitation', rh: 'Humidity', ff: 'Wind speed', fx: 'Gusts',
    ss: 'Sunshine', rad: 'Radiation', td: 'Dew point', qfe: 'Air pressure', dd: 'Wind direction',
  },
};

// Which measurement to show first
const PREFERRED = {
  hydro: ['height', 'height_abs', 'flow', 'flow_ls', 'temperature'],
  smn: ['tt', 'rr', 'rh', 'ff'],
};

const W = 1200;
const H = 200;
const TOP = 78;      // highest point of the line (room for the station name above)
const BOTTOM = 186;  // lowest point of the line

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const still = matchMedia('(prefers-reduced-motion: reduce)');

const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const unitLabel = u => String(u || '').replace(/m3/g, 'm³');

const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', day: 'numeric', month: 'short' });

// Water levels move by centimetres, so metres always keep two decimals
function formatValue(v, unit = '') {
  const abs = Math.abs(v);
  const digits = unit === 'm' ? 2 : abs >= 1000 ? 0 : abs >= 10 ? 1 : 2;
  return v.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
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

/* ---------- stations and parameters ---------- */
function parseStations(json, kind) {
  return entriesOf(json).map(([key, v]) => {
    const d = v?.details || v || {};
    const id = String(d.id ?? v?.name ?? key ?? '').trim();
    const place = String(d.name ?? '').trim() || id;
    const water = String(d['water-body-name'] ?? '').trim();
    const type = String(d['water-body-type'] ?? '').trim();
    const canton = String(d.canton ?? '').trim();

    const title = kind === 'hydro' ? (water && water !== place ? `${water}, ${place}` : place) : place;
    const what = kind === 'hydro'
      ? `${type === 'lake' ? 'Lake' : 'River'} station ${id}, FOEN`
      : `Weather station ${id}${canton ? `, ${canton}` : ''}, MeteoSwiss`;

    return { kind, id, title, what, search: norm(`${title} ${place} ${water} ${canton} ${id} ${kind === 'hydro' ? type : 'weather'}`) };
  }).filter(s => s.id);
}

function parseParams(json) {
  const out = {};
  for (const [key, v] of entriesOf(json)) {
    if (!key) continue;
    out[key] = { unit: v?.unit || '', description: v?.description || v?.name || key };
  }
  return out;
}

async function loadCatalogue() {
  const [hydro, smn, hydroParams, smnParams] = await Promise.all([
    cached('gauge:hydro:stations', async () => parseStations(await api('/hydro/locations'), 'hydro')),
    cached('gauge:smn:stations', async () => parseStations(await api('/smn/locations'), 'smn')).catch(() => []),
    cached('gauge:hydro:params', async () => parseParams(await api('/hydro/parameters'))).catch(() => ({})),
    cached('gauge:smn:params', async () => parseParams(await api('/smn/parameters'))).catch(() => ({})),
  ]);
  return { stations: { hydro, smn }, params: { hydro: hydroParams, smn: smnParams } };
}

// Readings of one station: { code: [[ms, value], …] } sorted by time
async function loadSeries(station) {
  const json = await api(`/${station.kind}/daterange`, {
    locations: station.id,
    startdate: `-${GAUGE.days} days`,
    enddate: 'now',
  });
  const series = {};
  for (const row of Array.isArray(json?.payload) ? json.payload : []) {
    const value = Number(row.val);
    const t = Number(row.timestamp) * 1000;
    if (!row.par || row.val === null || !Number.isFinite(value) || !Number.isFinite(t)) continue;
    (series[row.par] ||= []).push([t, value]);
  }
  for (const list of Object.values(series)) list.sort((a, b) => a[0] - b[0]);
  return series;
}

/* ---------- drawing ---------- */
const el = {
  gauge: $('gauge'),
  line: $('g-line'),
  fill: $('g-fill'),
  mean: $('g-mean'),
  dot: $('g-dot'),
  cursor: $('g-cursor'),
  readout: $('g-readout'),
  title: $('gauge-title'),
  sub: $('gauge-sub'),
  value: $('gauge-value'),
  time: $('gauge-time'),
  params: $('gauge-params'),
  from: $('gauge-from'),
  to: $('gauge-to'),
  meanLabel: $('gauge-mean-label'),
  q: $('gauge-q'),
  results: $('gauge-results'),
  next: $('gauge-next'),
};

const state = {
  catalogue: null,
  station: null,
  series: null,
  param: null,
  points: [],        // [{ t, v, x, y }]
  token: 0,
};

function pathFrom(points) {
  let d = '';
  let last = null;
  const gap = 3 * 3600000; // a gap of more than 3 hours breaks the line
  for (const p of points) {
    d += `${!last || p.t - last.t > gap ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    last = p;
  }
  return d;
}

function draw(animate) {
  const list = state.series?.[state.param] || [];
  if (list.length < 2) return;

  const t0 = list[0][0];
  const t1 = list[list.length - 1][0];
  let lo = Infinity;
  let hi = -Infinity;
  let sum = 0;
  for (const [, v] of list) { lo = Math.min(lo, v); hi = Math.max(hi, v); sum += v; }
  const mean = sum / list.length;
  const span = hi - lo || Math.max(Math.abs(hi) * 0.01, 1);
  const pad = span * 0.08;
  const yOf = v => BOTTOM - ((v - (lo - pad)) / (span + 2 * pad)) * (BOTTOM - TOP);

  state.points = list.map(([t, v]) => ({ t, v, x: ((t - t0) / (t1 - t0 || 1)) * W, y: yOf(v) }));
  const first = state.points[0];
  const last = state.points[state.points.length - 1];

  el.line.setAttribute('d', pathFrom(state.points));
  el.fill.setAttribute('d', `M${first.x} ${H}L${state.points.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L')}L${last.x} ${H}Z`);
  const my = yOf(mean).toFixed(1);
  el.mean.setAttribute('y1', my);
  el.mean.setAttribute('y2', my);

  // the latest reading, pulsing at the right end
  el.dot.hidden = false;
  el.dot.style.left = `min(${(last.x / W) * 100}%, calc(100% - 12px))`;
  el.dot.style.top = `${(last.y / H) * 100}%`;

  const unit = unitLabel(state.catalogue.params[state.station.kind][state.param]?.unit);
  const withUnit = v => `${formatValue(v, unit)}${unit ? ` ${unit}` : ''}`;
  el.value.textContent = withUnit(last.v);
  el.time.textContent = timeFmt.format(last.t);
  el.from.textContent = dayFmt.format(t0);
  el.to.textContent = Date.now() - t1 < 2 * 3600000 ? 'now' : dayFmt.format(t1);
  el.meanLabel.textContent = `Mean ${withUnit(mean)}`;

  if (animate && !still.matches) {
    // the stroke is drawn in screen pixels, so the dash has to be measured in pixels too
    const box = el.line.ownerSVGElement.getBoundingClientRect();
    const length = el.line.getTotalLength() * Math.max(box.width / W, box.height / H) * 1.05;
    el.line.style.transition = 'none';
    el.line.style.strokeDasharray = `${length}`;
    el.line.style.strokeDashoffset = `${length}`;
    el.fill.style.transition = 'none';
    el.fill.style.opacity = '0';
    el.line.getBoundingClientRect(); // apply the start state before animating
    el.line.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.4, 0, .2, 1)';
    el.line.style.strokeDashoffset = '0';
    el.fill.style.transition = 'opacity 1.2s ease .4s';
    el.fill.style.opacity = '';
    el.line.addEventListener('transitionend', () => {
      el.line.style.strokeDasharray = '';
      el.line.style.strokeDashoffset = '';
    }, { once: true });
  } else {
    el.line.style.transition = el.fill.style.transition = 'none';
    el.line.style.strokeDasharray = '';
    el.line.style.strokeDashoffset = '';
    el.fill.style.opacity = '';
  }
}

function labelFor(kind, code) {
  return PARAM_LABELS[kind][code] || state.catalogue.params[kind][code]?.description || code;
}

function renderParams() {
  const kind = state.station.kind;
  const codes = Object.keys(state.series).filter(c => state.series[c].length > 1);
  const pref = PREFERRED[kind];
  codes.sort((a, b) => (pref.indexOf(a) + 1 || 99) - (pref.indexOf(b) + 1 || 99));
  el.params.replaceChildren(...codes.slice(0, 5).map(code => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = labelFor(kind, code);
    b.setAttribute('aria-pressed', String(code === state.param));
    b.addEventListener('click', () => {
      state.param = code;
      renderParams();
      draw(true);
    });
    return b;
  }));
}

async function showStation(station, { quiet = false } = {}) {
  const token = ++state.token;
  if (!quiet) {
    el.title.textContent = station.title;
    el.sub.textContent = station.what;
    el.value.textContent = '';
    el.time.textContent = 'Loading readings…';
  }
  const series = await loadSeries(station);
  if (token !== state.token) return false;

  const codes = Object.keys(series).filter(c => series[c].length > 1);
  if (!codes.length) {
    if (!quiet) el.time.textContent = 'No recent readings from this station.';
    return false;
  }

  stopSynthetic();
  const keep = quiet && state.station?.id === station.id && codes.includes(state.param);
  state.station = station;
  state.series = series;
  if (!keep) state.param = PREFERRED[station.kind].find(c => codes.includes(c)) || codes[0];

  el.gauge.dataset.state = 'live';
  el.title.textContent = station.title;
  el.sub.textContent = station.what;
  renderParams();
  draw(!quiet);
  return true;
}

async function showRandom() {
  const { hydro, smn } = state.catalogue.stations;
  for (let attempt = 0; attempt < 5; attempt++) {
    const pool = smn.length && Math.random() > GAUGE.hydroShare ? smn : hydro;
    const station = pool[Math.floor(Math.random() * pool.length)];
    try {
      if (station && await showStation(station)) return;
    } catch { /* try another station */ }
  }
  showUnavailable();
}

/* ---------- simulated line, while loading or when the data cannot be reached ---------- */
let synthFrame = null;

function synthetic(t) {
  const STEP = 8;
  let d = '';
  for (let x = 0; x <= W; x += STEP) {
    const u = x / W;
    const y = 130 + 8 * Math.sin(t * 0.05) + 26 * Math.sin(u * Math.PI * 4 - t * 0.35)
      + 6 * Math.sin(u * Math.PI * 23 - t * 1.1) + 2.5 * Math.sin(u * Math.PI * 57 + t * 0.7);
    d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
  }
  el.line.setAttribute('d', d);
  el.fill.setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
}

function startSynthetic() {
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
  el.sub.textContent = 'Live readings from Swiss stations could not be loaded. Reload the page to try again.';
  el.value.textContent = '';
  el.time.textContent = '';
  el.params.replaceChildren();
  el.dot.hidden = true;
  el.from.textContent = el.to.textContent = el.meanLabel.textContent = '';
  if (!synthFrame) startSynthetic();
}

/* ---------- reading the line: hover or touch shows the value at that time ---------- */
function initReadout() {
  const hide = () => { el.cursor.hidden = true; el.readout.hidden = true; };
  el.gauge.addEventListener('pointermove', e => {
    if (el.gauge.dataset.state !== 'live' || !state.points.length || e.target.closest('.gauge-tools, .gauge-params')) { hide(); return; }
    const box = el.gauge.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    const pts = state.points;
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (pts[mid].x < x) lo = mid; else hi = mid; }
    const p = Math.abs(pts[lo].x - x) < Math.abs(pts[hi].x - x) ? pts[lo] : pts[hi];
    const unit = unitLabel(state.catalogue.params[state.station.kind][state.param]?.unit);

    el.cursor.hidden = false;
    el.cursor.style.left = `${(p.x / W) * 100}%`;
    el.readout.hidden = false;
    el.readout.textContent = `${formatValue(p.v, unit)}${unit ? ` ${unit}` : ''}, ${timeFmt.format(p.t)}`;
    const left = (p.x / W) * box.width;
    const half = el.readout.offsetWidth / 2 + 8;
    el.readout.style.left = `${Math.min(Math.max(left, half), box.width - half)}px`;
    el.readout.style.top = `${(p.y / H) * 100}%`;
  });
  el.gauge.addEventListener('pointerleave', hide);
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
    const all = [...state.catalogue.stations.hydro, ...state.catalogue.stations.smn];
    matches = all.filter(s => tokens.every(t => s.search.includes(t))).slice(0, 8);

    if (!matches.length) {
      const li = document.createElement('li');
      li.className = 'gauge-empty';
      li.textContent = 'No station matches. Try a river, lake, town or canton.';
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
        what.textContent = s.what;
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
  if (!state.catalogue.stations.hydro.length) { showUnavailable(); return; }

  el.q.disabled = false;
  el.next.disabled = false;
  initSearch();
  initReadout();
  await showRandom();

  // keep the shown station up to date
  setInterval(() => {
    if (state.station && !document.hidden) showStation(state.station, { quiet: true }).catch(() => {});
  }, GAUGE.refreshMinutes * 60000);
}

init();
