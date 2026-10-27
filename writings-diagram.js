'use strict';

/*
  Diagram beside the list of writings.

  Overview: three fields, three case studies and the publications between
  them. Clicking a field (its circle or its name) opens that field's row
  of three drawings; the slider moves between them.

  Everything you may want to change is in DIAGRAM below.

  Links: any publication or item with a "match" text becomes a link by
  itself as soon as a writing in writings.json has a title containing
  that text. With a PDF it opens in the reader, with only a DOI or URL it
  opens the publisher page. In the overview, publications with a match
  are drawn as filled dots (published), the others as open dots (planned).
*/
window.DIAGRAM = {
  note: 'Wie ein Entwurf im richtigen Massstab verräumlicht wird, muss eine Methode im richtigen Zeitmassstab arbeiten. Diese Übereinstimmung wird hier als Zeitkongruenz bezeichnet. Im Diagramm wird dies durch die ähnliche Verschiebung sichtbar.',
  hint: 'Ein Feld anklicken, um es zu öffnen.',
  centerLabel: 'Zeitkongruenz*',

  /* ---------------- Overview (drawing from x -50 to 1830, y 0 to 1720) ---------------- */
  fields: [
    { id: 'theory', name: ['theoretisch', 'konzeptionell'], cx: 825, cy: 485, r: 260, lx: 825, ly: 18 },
    { id: 'method', name: ['methodisch'], cx: 360, cy: 1290, r: 260, lx: -28, ly: 1600 },
    { id: 'landscape', name: ['landschaftstypologisch'], cx: 1290, cy: 1290, r: 260, lx: 1230, ly: 1600 },
  ],

  // The case studies: one point per field in the overview (theory, method, landscape)
  cases: [
    { id: 'cs1', name: 'Case Study 1', sub: 'Landschaft als Litoral', color: '#86a98a',
      points: [[903, 537], [414, 1363], [1367, 1343]] },
    { id: 'cs2', name: 'Case Study 2', sub: 'Terrain in Bewegung', color: '#d9775c',
      points: [[965, 368], [453, 1235], [1430, 1175]] },
    { id: 'cs3', name: 'Case Study 3', sub: 'Wasser in der Zeit', color: '#8a9ad4',
      points: [[792, 544], [269, 1247], [1256, 1267]] },
  ],

  publications: [
    { label: 'JoLA? (Drifting Lines)', x: 790, y: 776, match: 'Drifting Lines' },
    { label: 'trans (Beyond Left and Right)', x: 1008, y: 816, match: 'Beyond Left and Right' },
    { label: 'LUP? (Forensic Topography)', x: 604, y: 1075, match: 'Forensic Topography' },
    { label: 'JoDLA (MPM Simulation)', x: 682, y: 1137, match: 'MPM' },
    { label: 'JoLA? (Photogrammetry Walking)', x: 1060, y: 1150, match: 'Photogrammetry Walking' },
    { label: 'JoDLA (Interactive Platforms)', x: 645, y: 1185, match: 'Interactive Platform' },
    { label: 'JoDLA (Hybride Modelle)', x: 655, y: 1278, match: 'Hybrid Terrain Modeling' },
  ],

  /* ---------------- Rows: three drawings per field ----------------
     Coordinates are relative to the centre of the circle (radius 177).
     Labels may have several lines, separated by \n.                    */
  panelNames: ['Case Studies', 'Referenzen', 'Synthese'],

  rows: {
    theory: {
      title: 'Theoretisch / konzeptionell',
      panels: [
        { axes: { top: 'Wissensform', left: 'Zeitskala' },
          cases: { cs2: [93, -79, 7, -112], cs3: [-23, -28, -113, -61], cs1: [34, 52, 8, 76] } },
        { axes: { top: 'Technologie', left: 'Bild', right: 'Prozess', bottom: 'low-tec' },
          refs: [
            { x: -79, y: -114, r: 18, lx: -60, ly: -150, label: 'Love your Monsters\n(Latour)' },
            { x: 147, y: -109, r: 29, lx: 181, ly: -131, label: 'Responsive Landscapes\n(Holzman, Cantrell)' },
            { x: 45, y: -73, r: 38, lx: 34, ly: -68, label: 'Cyborg Landscapes\n(Lokman, Meyer, Haraway)' },
            { x: -213, y: 56, r: 38, lx: -218, ly: 42, label: 'Alpenbild\n(Mathieu, Böhm)' },
            { x: 40, y: 34, r: 21, lx: 67, ly: 13, label: 'Alpen\n(Kissling)' },
            { x: -42, y: 39, r: 13, lx: -42, ly: 60, label: 'Hyperobjects\n(Morton)' },
            { x: 180, y: 43, r: 21, lx: 207, ly: 50, label: 'Timescapes\n(Adam)' },
            { x: 93, y: 73, r: 23, lx: 90, ly: 90, label: 'Terrains of Wetness\n(Mathur, da Cunha)' },
            { x: -32, y: 142, r: 23, lx: -70, ly: 95, label: 'Vernakuläres Wissen\n(Mukerji, Netting)' },
            { x: 214, y: 122, r: 21, lx: 218, ly: 133, label: 'Zeitschichten\n(Koselleck)' },
            { x: 125, y: 167, r: 21, lx: 129, ly: 179, label: 'What Time is this Place?\n(Lynch)' },
          ] },
        { axes: { top: 'Technologie', left: 'Bild', right: 'Prozess', bottom: 'low-tec' },
          blobs: {
            cs3: [[-60, -170], [0, -185], [60, -150], [55, -60], [40, 40], [-10, 130], [-70, 120], [-78, 0]],
            cs2: [[60, -195], [150, -185], [195, -110], [185, -10], [130, 55], [60, 60], [-10, 20], [-35, -60], [5, -150]],
            cs1: [[-40, 30], [40, 5], [150, 10], [205, 60], [190, 150], [100, 220], [0, 222], [-60, 160], [-58, 90]],
          },
          dots: { cs2: [94, -79], cs3: [-23, -28], cs1: [64, 81] },
          items: [
            { x: 68, y: -163, r: 21, lx: 72, ly: -193, label: 'Oligoptic Landscapes' },
            { x: 84, y: 0, r: 38, lx: 78, ly: -18, label: 'Zeitkongruenz' },
            { x: 12, y: 57, r: 16, lx: -113, ly: 86, label: 'Landschaft als Litoral' },
            { x: 110, y: 59, r: 21, lx: 99, ly: 93, label: 'Chronografie' },
            { x: -50, y: 128, r: 23, lx: -98, ly: 131, label: 'Ambiguität' },
          ] },
      ],
    },

    method: {
      title: 'Methodisch',
      panels: [
        { axes: { top: 'Wissensform', left: 'Zeitskala' },
          cases: { cs3: [-63, -30, -113, -61], cs2: [61, -38, 53, -19], cs1: [35, 48, 8, 76] } },
        { axes: { top: 'datenbasiert', left: 'langer\nZeithorizont', right: 'kurzer\nZeithorizont', bottom: 'situativ-\nintuitiv' },
          refs: [
            { x: -56, y: -123, r: 79, lx: -122, ly: -108, label: 'Point Cloud Modelling\n(Girot, Fricker, Vollmer, …)' },
            { x: 164, y: -149, r: 16, lx: 69, ly: -187, label: 'MPM Simulation\n(Gaume et al.)' },
            { x: 141, y: -109, r: 16, lx: 53, ly: -146, label: 'RAMMS\n(Hurkxkens …)' },
            { x: 103, y: -61, r: 16, lx: 120, ly: -77, label: 'Physical Modelling in\nhydrological Engineering' },
            { x: 90, y: 8, r: 31, lx: 82, ly: 25, label: 'Fluid Tables\n(Cantrell, Robinson)' },
            { x: 26, y: 46, r: 38, lx: -72, ly: 28, label: 'AR Sandboxes\n(Hermansdorfer …)' },
            { x: -101, y: 133, r: 44, lx: -196, ly: 67, label: 'Spaziergangswissenschaft\n(Burckhardt)' },
            { x: -1, y: 128, r: 18, lx: 13, ly: 97, label: 'Vernakuläres Wissen\n(Mukerji)' },
            { x: 59, y: 145, r: 13, lx: 71, ly: 121, label: 'Video\n(Girot etc.)' },
          ] },
        { axes: { top: 'datenbasiert', left: 'langer\nZeithorizont', right: 'kurzer\nZeithorizont', bottom: 'situativ-\nintuitiv' },
          blobs: {
            cs3: [[-195, -90], [-110, -150], [-20, -140], [55, -60], [62, 30], [0, 85], [-120, 95], [-200, 40]],
            cs2: [[-30, -110], [50, -175], [130, -160], [140, -60], [80, 40], [-20, 85], [-85, 60], [-80, -20]],
            cs1: [[-80, 10], [0, -10], [120, 10], [195, 60], [190, 140], [120, 170], [30, 160], [-50, 100]],
          },
          dots: { cs2: [62, -38], cs3: [-63, -30], cs1: [36, 48] },
          items: [
            { x: -4, y: -104, r: 13, lx: -88, ly: -128, label: 'Interactive Viewer', match: 'Interactive Platform' },
            { x: 92, y: -118, r: 13, lx: 68, ly: -140, label: 'MPM Simulation', match: 'MPM' },
            { x: -46, y: -59, r: 13, lx: -133, ly: -82, label: 'Forensic Topography', match: 'Forensic Topography' },
            { x: -146, y: 0, r: 13, lx: -160, ly: -33, label: 'Chronografie\n(Timelines)' },
            { x: -14, y: 24, r: 39, lx: 16, ly: -11, label: 'Animated Drawings' },
            { x: -26, y: 25, r: 24, lx: -119, ly: 21, label: 'Hybride Modelle', match: 'Hybrid Terrain Modeling' },
            { x: 58, y: 28, r: 13, lx: 74, ly: 27, label: 'Photogrammetric\nWalking', match: 'Photogrammetry Walking' },
            { x: 18, y: 86, r: 13, lx: 37, ly: 86, label: 'physische\nSimulationen' },
            { x: 66, y: 140, r: 13, lx: 79, ly: 123, label: 'Video' },
          ] },
      ],
    },

    landscape: {
      title: 'Landschaftstypologisch',
      panels: [
        { axes: { top: 'Landschaftsumgang', left: 'Zeitskala' },
          cases: { cs2: [93, -79, 15, -107], cs3: [-30, -19, -90, -50], cs1: [51, 35, 66, 31] } },
        { axes: { top: 'Kontrolle', left: 'Zustand', right: 'Prozess', bottom: 'laissez-faire' },
          refs: [
            { x: -148, y: -154, r: 21, lx: -169, ly: -124, label: 'Linthkorrektion\n1807–1823' },
            { x: 90, y: -143, r: 21, lx: 101, ly: -180, label: 'Überwachung Brienz/Brinzauls\n(2008–)' },
            { x: 166, y: -100, r: 21, lx: 168, ly: -143, label: 'Überwachung Blatten\n(2025)' },
            { x: 121, y: -86, r: 13, lx: 99, ly: -65, label: 'Überwachung Kandersteg\n(2020–)' },
            { x: -213, y: -65, r: 21, lx: -234, ly: -35, label: 'Seeufer Promenaden\n(z.B. ZH/LU)' },
            { x: -69, y: 121, r: 23, lx: -108, ly: 74, label: 'Canal du Midi\n(Mukerji)' },
            { x: 26, y: 88, r: 18, lx: 3, ly: 98, label: 'Suonen\n(vernakulär)' },
            { x: 133, y: 117, r: 29, lx: 166, ly: 95, label: 'Aire River\n(Descombes, Rampini)' },
          ] },
        { axes: { top: 'Kontrolle', left: 'Zustand', right: 'Prozess', bottom: 'laissez-faire' },
          blobs: {
            cs3: [[-60, -90], [20, -95], [60, 0], [80, 100], [30, 155], [-60, 157], [-115, 90], [-117, 0]],
            cs2: [[10, -130], [80, -165], [150, -140], [162, -60], [110, 20], [30, 25], [0, -30]],
            cs1: [[10, -5], [120, -15], [205, 10], [212, 90], [140, 175], [40, 177], [-5, 100]],
          },
          dots: { cs2: [94, -79], cs3: [-30, -19], cs1: [51, 35] },
          items: [
            { x: 100, y: -153, r: 21, lx: 111, ly: -177, label: 'Drohende Extremereignisse\nGefahrenlandschaft' },
            { x: -50, y: -89, r: 23, lx: -143, ly: -118, label: 'Speicherlandschaft' },
            { x: 147, y: -98, r: 21, lx: 159, ly: -97, label: 'Dauernde Bodenverschiebung' },
            { x: 134, y: -38, r: 15, lx: 136, ly: -62, label: 'Ablagerungsräume' },
            { x: 17, y: -19, r: 15, lx: 13, ly: -38, label: '«Neues» Terrain' },
            { x: 139, y: 11, r: 21, lx: 107, ly: 15, label: 'Litoral' },
            { x: 25, y: 88, r: 18, lx: -47, ly: 118, label: 'Schwammlandschaft' },
            { x: 73, y: 91, r: 13, lx: 71, ly: 112, label: 'Moor' },
          ] },
      ],
    },
  },
};

/* ---------------------------------------------------------------------
   Drawing. Nothing below needs changing for new content.
   --------------------------------------------------------------------- */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const OVERVIEW_VIEW = '-50 0 1880 1720';
  const PANEL_VIEW = '-400 -250 800 530';
  const R = 177;

  // what stays the same while the page is open
  const view = { row: null, panel: 0, pinned: null };

  function svgEl(name, attrs = {}, parent) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.append(node);
    return node;
  }

  function html(name, cls, text) {
    const node = document.createElement(name);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function multiline(parent, x, y, text, attrs = {}) {
    const t = svgEl('text', { x, y, ...attrs }, parent);
    String(text).split('\n').forEach((line, i) => {
      const s = svgEl('tspan', { x, dy: i ? '1.2em' : '0' }, t);
      s.textContent = line;
    });
    return t;
  }

  // Smooth closed curve through the points (Catmull-Rom)
  function blobPath(pts) {
    const n = pts.length;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n; i++) {
      const [p0, p1, p2, p3] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1} ${c2} ${p2}`;
    }
    return d + 'Z';
  }

  function findWriting(writings, match) {
    if (!match) return null;
    const needle = match.toLowerCase();
    return writings.find(w => w.title.toLowerCase().includes(needle)) || null;
  }

  // Link (or plain group) for something that may point at a writing
  function linkTarget(parent, w, open, fallbackText) {
    const href = w ? (w.file ? `?read=${encodeURIComponent(w.slug)}` : w.url) : '';
    const what = !w ? fallbackText
      : w.file ? `${w.title} lesen`
      : w.url ? `${w.title} beim Verlag öffnen`
      : `${w.title}: publiziert, noch ohne PDF oder Link`;
    const node = href ? svgEl('a', { href, class: 'dg-pub is-link', 'aria-label': what }, parent) : svgEl('g', { class: 'dg-pub' }, parent);
    if (w && !w.file && href) { node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener'); }
    if (w && w.file) wireOpen(node, w, open);
    svgEl('title', {}, node).textContent = what;
    return { node, href, what };
  }

  function wireOpen(node, w, open) {
    node.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      open(w);
    });
  }

  function arrowMarker(svg, id) {
    const defs = svgEl('defs', {}, svg);
    const marker = svgEl('marker', {
      id, viewBox: '0 0 20 20', refX: '14', refY: '10',
      markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse', markerUnits: 'strokeWidth',
    }, defs);
    svgEl('path', { d: 'M3 3 L15 10 L3 17', class: 'dg-arrowhead' }, marker);
  }

  /* ---------------- Overview ---------------- */
  function drawOverview(D, writings, open, openRow) {
    const svg = svgEl('svg', {
      viewBox: OVERVIEW_VIEW, class: 'dg-svg', role: 'group',
      'aria-label': 'Diagramm: Zeitkongruenz zwischen theoretisch-konzeptionellen, methodischen und landschaftstypologischen Beiträgen',
    });
    arrowMarker(svg, 'dg-arrow');

    for (const f of D.fields) {
      const row = D.rows[f.id];
      const g = svgEl('g', { class: 'dg-field is-open', tabindex: '0', role: 'button', 'aria-label': `${row ? row.title : f.name.join(' ')} öffnen` }, svg);
      svgEl('circle', { cx: f.cx, cy: f.cy, r: f.r, class: 'dg-hit' }, g);
      const ext = f.r + 75;
      svgEl('line', { x1: f.cx, y1: f.cy - ext, x2: f.cx, y2: f.cy + ext, class: 'dg-cross' }, g);
      svgEl('line', { x1: f.cx - ext, y1: f.cy, x2: f.cx + ext, y2: f.cy, class: 'dg-cross' }, g);
      svgEl('circle', { cx: f.cx, cy: f.cy, r: f.r, class: 'dg-ring' }, g);
      const name = svgEl('text', { x: f.lx, y: f.ly, class: 'dg-field-name', 'text-anchor': f.id === 'theory' ? 'middle' : 'start' }, g);
      f.name.forEach((line, i) => { svgEl('tspan', { x: f.lx, dy: i ? '1.15em' : '0.8em' }, name).textContent = line; });
      svgEl('title', {}, g).textContent = `${row ? row.title : ''} öffnen`;
      if (row) {
        g.addEventListener('click', () => openRow(f.id));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRow(f.id); } });
      }
    }

    for (const d of [
      'M197 1000 C180 760 300 520 515 412',
      'M1190 435 C1400 580 1500 800 1465 1045',
      'M508 1572 C750 1720 950 1720 1178 1560',
    ]) svgEl('path', { d, class: 'dg-arc', 'marker-start': 'url(#dg-arrow)', 'marker-end': 'url(#dg-arrow)' }, svg);

    svgEl('text', { x: 843, y: 985, class: 'dg-center', 'text-anchor': 'middle' }, svg).textContent = D.centerLabel;

    for (const c of D.cases) {
      const g = svgEl('g', { class: 'dg-case', 'data-case': c.id, style: `--c:${c.color}` }, svg);
      const [a, b, d] = c.points;
      svgEl('path', { d: `M${a} L${b} L${d} Z`, class: 'dg-tri' }, g);
      for (const [x, y] of c.points) svgEl('circle', { cx: x, cy: y, r: 15, class: 'dg-node' }, g);
      svgEl('title', {}, g).textContent = `${c.name}: ${c.sub}`;
    }

    const list = html('ul', 'dg-pubs');
    for (const p of D.publications) {
      const w = findWriting(writings, p.match);
      const { node, href } = linkTarget(svg, w, open, `${p.label}: geplant`);
      svgEl('circle', { cx: p.x, cy: p.y, r: 9, class: w ? 'dg-dot is-published' : 'dg-dot' }, node);
      svgEl('text', { x: p.x + 14, y: p.y + 24, class: 'dg-pub-label' }, node).textContent = p.label;

      const li = html('li');
      const label = href ? html('a', '', p.label) : html('span', '', p.label);
      if (href) {
        label.href = href;
        if (w && !w.file) { label.target = '_blank'; label.rel = 'noopener'; }
        if (w && w.file) wireOpen(label, w, open);
      }
      li.append(html('span', `dg-key ${w ? 'is-published' : 'is-planned'}`), label);
      list.append(li);
    }
    return { svg, list };
  }

  /* ---------------- One drawing of a row ---------------- */
  function drawPanel(D, panel, writings, open, label) {
    const svg = svgEl('svg', { viewBox: PANEL_VIEW, class: 'dg-panel', role: 'img', 'aria-label': label });

    // blobs sit under the circle
    if (panel.blobs) {
      for (const c of D.cases) {
        const pts = panel.blobs[c.id];
        if (pts) svgEl('path', { d: blobPath(pts), class: 'dg-blob', 'data-case': c.id, style: `--c:${c.color}` }, svg);
      }
    }

    svgEl('line', { x1: 0, y1: -205, x2: 0, y2: 205, class: 'dg-cross' }, svg);
    svgEl('line', { x1: -205, y1: 0, x2: 205, y2: 0, class: 'dg-cross' }, svg);
    svgEl('circle', { cx: 0, cy: 0, r: R, class: 'dg-ring is-thin' }, svg);

    const a = panel.axes || {};
    if (a.top) multiline(svg, 0, -222, a.top, { class: 'dg-axis', 'text-anchor': 'middle' });
    if (a.bottom) multiline(svg, 0, 236, a.bottom, { class: 'dg-axis', 'text-anchor': 'middle' });
    const sideY = t => (String(t).includes('\n') ? -4 : 7);
    if (a.left) multiline(svg, -215, sideY(a.left), a.left, { class: 'dg-axis', 'text-anchor': 'end' });
    if (a.right) multiline(svg, 215, sideY(a.right), a.right, { class: 'dg-axis', 'text-anchor': 'start' });

    if (panel.cases) {
      for (const c of D.cases) {
        const p = panel.cases[c.id];
        if (!p) continue;
        const g = svgEl('g', { class: 'dg-case', 'data-case': c.id, style: `--c:${c.color}` }, svg);
        svgEl('path', { d: `M0,0 L${p[0]},${p[1]}`, class: 'dg-tri is-thin' }, g);
        svgEl('circle', { cx: p[0], cy: p[1], r: 9, class: 'dg-node' }, g);
        multiline(g, p[2], p[3], `${c.name}\n${c.sub}`, { class: 'dg-small' });
      }
    }

    for (const ref of panel.refs || []) {
      const g = svgEl('g', { class: 'dg-ref' }, svg);
      svgEl('circle', { cx: ref.x, cy: ref.y, r: ref.r, class: 'dg-ref-ring' }, g);
      multiline(g, ref.lx, ref.ly, ref.label, { class: 'dg-small' });
    }

    for (const item of panel.items || []) {
      const w = findWriting(writings, item.match);
      const { node } = item.match ? linkTarget(svg, w, open, `${item.label.replace('\n', ' ')}: geplant`) : { node: svgEl('g', {}, svg) };
      svgEl('circle', { cx: item.x, cy: item.y, r: item.r, class: 'dg-item-ring' }, node);
      multiline(node, item.lx, item.ly, item.label, { class: 'dg-small dg-pub-label' });
    }

    if (panel.dots) {
      for (const c of D.cases) {
        const p = panel.dots[c.id];
        if (!p) continue;
        const g = svgEl('g', { class: 'dg-case', 'data-case': c.id, style: `--c:${c.color}` }, svg);
        svgEl('circle', { cx: p[0], cy: p[1], r: 9, class: 'dg-node' }, g);
        svgEl('title', {}, g).textContent = `${c.name}: ${c.sub}`;
      }
    }
    return svg;
  }

  /* ---------------- Row view: three drawings and a slider ---------------- */
  function drawRow(D, rowId, writings, open, back, openRow) {
    const row = D.rows[rowId];
    const wrap = html('div', 'dg-zoom');

    const bar = html('div', 'dg-bar');
    const backBtn = html('button', 'about-btn dg-back', 'Übersicht');
    backBtn.type = 'button';
    backBtn.addEventListener('click', back);
    const rows = html('div', 'dg-rows');
    rows.setAttribute('role', 'group');
    rows.setAttribute('aria-label', 'Ebene');
    for (const f of D.fields) {
      if (!D.rows[f.id]) continue;
      const b = html('button', 'dg-row-btn', D.rows[f.id].title);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(f.id === rowId));
      b.addEventListener('click', () => openRow(f.id));
      rows.append(b);
    }
    bar.append(backBtn, rows);

    const stage = html('div', 'dg-stage');
    const track = html('div', 'dg-track');
    row.panels.forEach((panel, i) => {
      const slot = html('div', 'dg-slot');
      slot.append(drawPanel(D, panel, writings, open, `${row.title}: ${D.panelNames[i]}`));
      track.append(slot);
    });
    stage.append(track);

    // Slider: left, middle, right
    const slider = html('div', 'dg-slider');
    const range = html('input');
    range.type = 'range';
    range.min = '0';
    range.max = String(row.panels.length - 1);
    range.step = '1';
    range.setAttribute('aria-label', 'Zeichnung wählen');
    const stops = html('div', 'dg-stops');
    const stopBtns = D.panelNames.slice(0, row.panels.length).map((name, i) => {
      const b = html('button', 'dg-stop', name);
      b.type = 'button';
      b.addEventListener('click', () => show(i));
      stops.append(b);
      return b;
    });
    slider.append(range, stops);

    function show(i) {
      view.panel = Math.max(0, Math.min(row.panels.length - 1, i));
      range.value = String(view.panel);
      range.setAttribute('aria-valuetext', D.panelNames[view.panel]);
      track.style.transform = `translateX(${-100 * view.panel / row.panels.length}%)`;
      stopBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === view.panel)));
      [...track.children].forEach((slot, k) => { slot.inert = k !== view.panel; slot.setAttribute('aria-hidden', String(k !== view.panel)); });
    }
    range.addEventListener('input', () => show(Number(range.value)));

    // swipe on touch screens
    let x0 = null;
    stage.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    stage.addEventListener('pointerup', e => {
      if (x0 == null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) show(view.panel + (dx < 0 ? 1 : -1));
    });

    wrap.addEventListener('keydown', e => { if (e.key === 'Escape') back(); });

    wrap.append(bar, stage, slider);
    show(view.panel);
    return { node: wrap, focus: () => backBtn.focus() };
  }

  /*
    container: element to draw into
    writings:  the writing entries of the hub (title, file, url, slug …)
    open:      function(writing) that opens a writing in the reader
  */
  function renderDiagram(container, writings, open) {
    const D = window.DIAGRAM;

    function draw(focusAfter) {
      container.replaceChildren();
      container.classList.toggle('is-zoomed', Boolean(view.row));

      const stageBox = html('div', 'dg-figure');
      let pubList = null;
      let focus = null;
      if (view.row && D.rows[view.row]) {
        const r = drawRow(D, view.row, writings, open, () => { const last = view.row; view.row = null; draw(last); }, id => { view.row = id; view.panel = view.panel || 0; draw(); });
        stageBox.append(r.node);
        focus = r.focus;
      } else {
        const o = drawOverview(D, writings, open, id => { view.row = id; view.panel = 0; draw('zoom'); });
        stageBox.append(o.svg);
        pubList = o.list;
      }

      // Legend and note
      const side = html('div', 'dg-side');
      side.append(html('p', 'dg-note', `* ${D.note}`));
      const keys = html('div', 'dg-keys');
      if (!view.row) {
        const legend = html('ul', 'dg-legend');
        for (const [cls, text] of [['is-planned', 'geplante Publikationen'], ['is-published', 'publizierte Beiträge']]) {
          const li = html('li');
          li.append(html('span', `dg-key ${cls}`), html('span', '', text));
          legend.append(li);
        }
        keys.append(legend);
      }
      const cases = html('div', 'dg-cases');
      cases.setAttribute('role', 'group');
      cases.setAttribute('aria-label', 'Case Studies hervorheben');
      for (const c of D.cases) {
        const btn = html('button', 'dg-case-btn');
        btn.type = 'button';
        btn.style.setProperty('--c', c.color);
        btn.setAttribute('aria-pressed', String(view.pinned === c.id));
        const text = html('span', '', c.name);
        text.append(html('span', 'dg-key-sub', c.sub));
        btn.append(html('span', 'dg-key is-case'), text);
        btn.addEventListener('mouseenter', () => highlight(c.id));
        btn.addEventListener('mouseleave', () => highlight(view.pinned));
        btn.addEventListener('focus', () => highlight(c.id));
        btn.addEventListener('blur', () => highlight(view.pinned));
        btn.addEventListener('click', () => {
          view.pinned = view.pinned === c.id ? null : c.id;
          cases.querySelectorAll('.dg-case-btn').forEach(b => b.setAttribute('aria-pressed', String(b === btn && view.pinned === c.id)));
          highlight(view.pinned);
        });
        cases.append(btn);
      }
      keys.append(cases);
      side.append(keys);
      if (!view.row) side.append(html('p', 'dg-hint', D.hint));
      if (pubList) side.append(pubList);

      container.append(stageBox, side);

      // hovering a case in the drawing highlights it too
      container.querySelectorAll('.dg-case[data-case]').forEach(n => {
        n.addEventListener('mouseenter', () => highlight(n.dataset.case));
        n.addEventListener('mouseleave', () => highlight(view.pinned));
      });
      highlight(view.pinned);

      if (focusAfter === 'zoom' && focus) focus();
      else if (focusAfter && !view.row) container.querySelector(`.dg-field[aria-label^="${D.rows[focusAfter]?.title}"]`)?.focus();
    }

    function highlight(id) {
      container.classList.toggle('has-focus', Boolean(id));
      container.querySelectorAll('[data-case]').forEach(n => n.classList.toggle('is-on', n.dataset.case === id));
    }

    draw();
  }

  window.renderWritingsDiagram = renderDiagram;
})();
