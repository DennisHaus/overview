'use strict';

/*
  Diagram above the list of writings: three research fields, three case
  studies and the publications between them.

  Everything you may want to change is in DIAGRAM below. Positions are
  in the drawing's own units (the drawing runs from x -50 to 1830 and y 0 to 1720).

  A publication becomes a link by itself as soon as a writing in
  writings.json has a title containing its "match" text: with a PDF it
  opens in the reader, with only a DOI or URL it opens the publisher page.
  Publications with a match are drawn as filled dots (published),
  the others as open dots (planned).
*/
window.DIAGRAM = {
  note: 'Wie ein Entwurf im richtigen Massstab verräumlicht wird, muss eine Methode im richtigen Zeitmassstab arbeiten. Diese Übereinstimmung wird hier als Zeitkongruenz bezeichnet. Im Diagramm wird dies durch die ähnliche Verschiebung sichtbar.',
  centerLabel: 'Zeitkongruenz*',

  // The three fields: centre, radius, and where the name sits
  fields: [
    { id: 'theory', name: ['theoretisch', 'konzeptionell'], cx: 825, cy: 485, r: 260, lx: 825, ly: 18 },
    { id: 'method', name: ['methodisch'], cx: 360, cy: 1290, r: 260, lx: -28, ly: 1600 },
    { id: 'landscape', name: ['landschaftstypologisch'], cx: 1290, cy: 1290, r: 260, lx: 1300, ly: 1600 },
  ],

  // The three case studies: one point per field (theory, method, landscape)
  cases: [
    { id: 'cs1', name: 'Case Study 1', sub: 'Landschaft als Litoral', color: '#86a98a',
      points: [[903, 537], [414, 1363], [1367, 1343]] },
    { id: 'cs2', name: 'Case Study 2', sub: 'Terrain in Bewegung', color: '#d9775c',
      points: [[965, 368], [453, 1235], [1430, 1175]] },
    { id: 'cs3', name: 'Case Study 3', sub: 'Wasser in der Zeit', color: '#8a9ad4',
      points: [[792, 544], [269, 1247], [1256, 1267]] },
  ],

  // Publications: label as shown, position of the dot, and the title text to look for
  publications: [
    { label: 'JoLA? (Drifting Lines)', x: 790, y: 776, match: 'Drifting Lines' },
    { label: 'trans (Beyond Left and Right)', x: 1008, y: 816, match: 'Beyond Left and Right' },
    { label: 'LUP? (Forensic Topography)', x: 604, y: 1075, match: 'Forensic Topography' },
    { label: 'JoDLA (MPM Simulation)', x: 682, y: 1137, match: 'MPM' },
    { label: 'JoLA? (Photogrammetry Walking)', x: 1060, y: 1150, match: 'Photogrammetry Walking' },
    { label: 'JoDLA (Interactive Platforms)', x: 645, y: 1185, match: 'Interactive Platform' },
    { label: 'JoDLA (Hybride Modelle)', x: 655, y: 1278, match: 'Hybrid Terrain Modeling' },
  ],
};

/* ---------------------------------------------------------------------
   Drawing. Nothing below needs changing for new publications.
   --------------------------------------------------------------------- */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const VIEW = '-50 0 1880 1720';

  function svgEl(name, attrs = {}, parent) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.append(node);
    return node;
  }

  function findWriting(writings, match) {
    if (!match) return null;
    const needle = match.toLowerCase();
    return writings.find(w => w.title.toLowerCase().includes(needle)) || null;
  }

  /*
    container: element to draw into
    writings:  the writing entries of the hub (title, file, url, slug …)
    open:      function(writing) that opens a writing in the reader
  */
  function renderDiagram(container, writings, open) {
    const D = window.DIAGRAM;
    container.replaceChildren();

    // Legend and note
    const side = document.createElement('div');
    side.className = 'dg-side';
    const note = document.createElement('p');
    note.className = 'dg-note';
    note.textContent = `* ${D.note}`;
    side.append(note);

    const legend = document.createElement('ul');
    legend.className = 'dg-legend';
    const addKey = (cls, text, sub) => {
      const li = document.createElement('li');
      const mark = document.createElement('span');
      mark.className = `dg-key ${cls}`;
      const label = document.createElement('span');
      label.textContent = text;
      if (sub) {
        const s = document.createElement('span');
        s.className = 'dg-key-sub';
        s.textContent = sub;
        label.append(s);
      }
      li.append(mark, label);
      legend.append(li);
      return li;
    };
    addKey('is-planned', 'geplante Publikationen');
    addKey('is-published', 'publizierte Beiträge');
    side.append(legend);

    const cases = document.createElement('div');
    cases.className = 'dg-cases';
    cases.setAttribute('role', 'group');
    cases.setAttribute('aria-label', 'Case Studies hervorheben');
    side.append(cases);

    // Drawing
    const svg = svgEl('svg', {
      viewBox: VIEW,
      class: 'dg-svg',
      role: 'img',
      'aria-label': 'Diagramm: Zeitkongruenz zwischen theoretisch-konzeptionellen, methodischen und landschaftstypologischen Beiträgen',
    });
    const defs = svgEl('defs', {}, svg);
    const marker = svgEl('marker', {
      id: 'dg-arrow', viewBox: '0 0 20 20', refX: '14', refY: '10',
      markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse', markerUnits: 'strokeWidth',
    }, defs);
    svgEl('path', { d: 'M3 3 L15 10 L3 17', class: 'dg-arrowhead' }, marker);

    // Fields: circle, cross, name
    for (const f of D.fields) {
      const g = svgEl('g', { class: 'dg-field' }, svg);
      const ext = f.r + 75;
      svgEl('line', { x1: f.cx, y1: f.cy - ext, x2: f.cx, y2: f.cy + ext, class: 'dg-cross' }, g);
      svgEl('line', { x1: f.cx - ext, y1: f.cy, x2: f.cx + ext, y2: f.cy, class: 'dg-cross' }, g);
      svgEl('circle', { cx: f.cx, cy: f.cy, r: f.r, class: 'dg-ring' }, g);
      const name = svgEl('text', { x: f.lx, y: f.ly, class: 'dg-field-name', 'text-anchor': f.id === 'theory' ? 'middle' : 'start' }, g);
      f.name.forEach((line, i) => {
        const t = svgEl('tspan', { x: f.lx, dy: i ? '1.15em' : '0.8em' }, name);
        t.textContent = line;
      });
    }

    // Arrows between the fields
    for (const d of [
      'M197 1000 C180 760 300 520 515 412',
      'M1190 435 C1400 580 1500 800 1465 1045',
      'M508 1572 C750 1720 950 1720 1178 1560',
    ]) svgEl('path', { d, class: 'dg-arc', 'marker-start': 'url(#dg-arrow)', 'marker-end': 'url(#dg-arrow)' }, svg);

    const center = svgEl('text', { x: 843, y: 985, class: 'dg-center', 'text-anchor': 'middle' }, svg);
    center.textContent = D.centerLabel;

    // Case-study triangles
    const caseGroups = new Map();
    for (const c of D.cases) {
      const g = svgEl('g', { class: 'dg-case', style: `--c:${c.color}` }, svg);
      const [a, b, d] = c.points;
      svgEl('path', { d: `M${a} L${b} L${d} Z`, class: 'dg-tri' }, g);
      for (const [x, y] of c.points) svgEl('circle', { cx: x, cy: y, r: 15, class: 'dg-node' }, g);
      const title = svgEl('title', {}, g);
      title.textContent = `${c.name}: ${c.sub}`;
      caseGroups.set(c.id, g);
    }

    // Publications on top
    const pubList = document.createElement('ul');
    pubList.className = 'dg-pubs';
    for (const p of D.publications) {
      const w = findWriting(writings, p.match);
      const href = w ? (w.file ? `?read=${encodeURIComponent(w.slug)}` : w.url) : '';
      const what = !w ? `${p.label}: geplant`
        : w.file ? `${w.title} lesen`
        : w.url ? `${w.title} beim Verlag öffnen`
        : `${w.title}: publiziert, noch ohne PDF oder Link`;

      const node = href ? svgEl('a', { href, class: 'dg-pub is-link' }, svg) : svgEl('g', { class: 'dg-pub' }, svg);
      if (w && !w.file) { node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener'); }
      if (href) node.setAttribute('aria-label', what);
      svgEl('circle', { cx: p.x, cy: p.y, r: 9, class: w ? 'dg-dot is-published' : 'dg-dot' }, node);
      const t = svgEl('text', { x: p.x + 14, y: p.y + 24, class: 'dg-pub-label' }, node);
      t.textContent = p.label;
      const tip = svgEl('title', {}, node);
      tip.textContent = what;

      // same entries as a plain list, for small screens
      const li = document.createElement('li');
      const mark = document.createElement('span');
      mark.className = `dg-key ${w ? 'is-published' : 'is-planned'}`;
      const label = href ? document.createElement('a') : document.createElement('span');
      label.textContent = p.label;
      if (href) {
        label.href = href;
        if (w && !w.file) { label.target = '_blank'; label.rel = 'noopener'; }
      }
      li.append(mark, label);
      pubList.append(li);

      if (w && w.file) {
        for (const target of [node, label]) {
          target.addEventListener('click', e => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            e.preventDefault();
            open(w);
          });
        }
      }
    }

    // Case-study buttons: hover to preview, click to keep one highlighted
    let pinned = null;
    const highlight = id => {
      svg.classList.toggle('has-focus', Boolean(id));
      for (const [cid, g] of caseGroups) g.classList.toggle('is-on', cid === id);
    };
    for (const c of D.cases) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dg-case-btn';
      btn.style.setProperty('--c', c.color);
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = '<span class="dg-key is-case"></span><span></span>';
      const text = btn.lastChild;
      text.textContent = c.name;
      const sub = document.createElement('span');
      sub.className = 'dg-key-sub';
      sub.textContent = c.sub;
      text.append(sub);
      btn.addEventListener('mouseenter', () => highlight(c.id));
      btn.addEventListener('mouseleave', () => highlight(pinned));
      btn.addEventListener('focus', () => highlight(c.id));
      btn.addEventListener('blur', () => highlight(pinned));
      btn.addEventListener('click', () => {
        pinned = pinned === c.id ? null : c.id;
        cases.querySelectorAll('.dg-case-btn').forEach(b => b.setAttribute('aria-pressed', String(b === btn && pinned === c.id)));
        highlight(pinned);
      });
      cases.append(btn);
      const g = caseGroups.get(c.id);
      g.addEventListener('mouseenter', () => highlight(c.id));
      g.addEventListener('mouseleave', () => highlight(pinned));
    }

    const figure = document.createElement('div');
    figure.className = 'dg-figure';
    figure.append(svg);
    side.append(pubList);
    container.append(side, figure);
  }

  window.renderWritingsDiagram = renderDiagram;
})();
