// Figure "map", placed in index.html as <figure data-rf="map"></figure>.
// A dotted world map of where Peter sold. Click a pin to see what happened there.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  // A country with no named place gets one pin for itself, from "general".
  const PLACES = {
    c: { n: "Canada", pins: [
      { n: "Ontario", at: [-85, 50], items: ["Oct 20 · AODA paperwork for employers, then via HR consultants", "Oct 21 · C$99 browser-warning fix", "Oct 28 · Opening-soon list, cold calls in Toronto: 0 of 8 interested"] },
      { n: "Quebec", at: [-72, 52], items: ["Dropped three firms because his template was in English, until the Manager told him to write it in French"] },
    ] },
    u: { n: "United States", pins: [
      { n: "Arizona", at: [-111.7, 34.2], items: ["Oct 29 · Phoenix sample-first split: 14 calls, no decision-maker"] },
      { n: "Texas", at: [-99, 31.5], items: ["Oct 29 · Dallas–Fort Worth opening-soon list, $13", "Website-fix bet kept running"] },
      { n: "Indiana", at: [-86.2, 40], items: ["Oct 31 · 50-row list for a Muncie cleaner, $49: promised before counting"] },
    ] },
    g: { n: "United Kingdom", pins: [
      { n: "Plymouth", at: [-4.1, 50.4], items: ["Oct 25 · Office-move list, $49 for 50 entries"] },
      { n: "Leeds", at: [-1.5, 53.8], items: ["Oct 27 · About ten sites, $19. Gumtree listing, £7.99"] },
    ] },
    i: { n: "Ireland", general: ["Oct 23 · Halloween event art, $40, with the UK"], pins: [] },
    a: { n: "Australia", pins: [
      { n: "Perth", at: [115.9, -32], items: ["Oct 22 · 1,618 websites checked for HTTPS faults"] },
      { n: "Brisbane", at: [153, -27.5], items: ["Oct 28 · Cold-call test, capped at about 25 numbers"] },
      { n: "Sydney", at: [151.2, -33.9], paid: true, items: ["Oct 29 · List of 7 sites, $13: paid", "Nov 2 · $13 again: paid. Single sites at $1.30"] },
    ] },
    n: { n: "New Zealand", general: ["Oct 21 · Agency QA, proof-first test", "Office-move list, $19, also pitched to shredding firms: three opened the Stripe link, none paid"], pins: [] },
    m: { n: "Malaysia", general: ["The Australia offer, carried over as the business day began"], pins: [] },
    s: { n: "Singapore", general: ["Oct 21 · Agency QA, proof-first test", "The Australia offer, carried over as the business day began"], pins: [] },
  };
  // Countries with no named city get one pin for the whole country.
  const SOLO = { i: [-8, 53], n: [174, -41], m: [102, 3], s: [103.8, 1.3] };
  const PINS = Object.entries(PLACES).flatMap(([k, p]) => (SOLO[k]
    ? [{ k, n: p.n, at: SOLO[k], items: p.general }]
    : p.pins.map((q) => ({ ...q, k }))));

  fig("map", {
    wide: true,
    minWidth: 0,
    h: 345,
    extra: true,
    alt: "A dotted world map with pins where Peter tried selling, across Canada, the United States, the UK, Ireland, Australia, New Zealand, Malaysia and Singapore. Choosing a pin shows what happened there. Only Sydney, Australia, paid.",
  }, (s, ui) => {
    const SYDNEY = PINS.find((q) => q.paid);
    let sel = SYDNEY, hoverPin = null;
    const W = 960, H = 345, G = 6.8;
    // The map shrinks to fit its column, so pins scale back up to stay a steady size on screen.
    const scale = () => Math.min(2.7, Math.max(1, 720 / (s.host.clientWidth || innerWidth)));
    let K = scale();
    // Labels on the map itself only where there's room; the story below always names the place.
    const roomy = () => K < 1.25;
    const LAND = [];
    window.RISO_MAP.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row[i] !== ".") LAND.push([i, j, row[i]]);
    });
    const px = (lon) => (lon + 168) / 2.5 * G + 2;
    const py = (lat) => (72 - lat) / 2.5 * G + 4;
    const cells = {};
    for (const [i, j, ch] of LAND) (cells[ch] = cells[ch] || []).push(i * G + 2, j * G + 4);

    const pinLabel = (q, cls) => {
      // Labels sit to the right unless they'd run off the map.
      const text = q.paid ? `${q.n} · $26` : q.n;
      const gap = (q === sel ? 24 : 12) * K;
      const left = px(q.at[0]) + gap + text.length * 8.9 * K > W;
      s.label(px(q.at[0]) + (left ? -gap : gap), py(q.at[1]) + 6 * K, text, { anchor: left ? "end" : "start", cls, size: 18 * K });
    };
    // Pins are Tinker nodes, knocked out of the dots behind them; the picked one gets a ring.
    const dot = (q, r, color, ring) => s.node(px(q.at[0]), py(q.at[1]), r, "k", { color, ring, knock: 2.5 * K });
    s.paint(() => {
      for (const [ch, pts] of Object.entries(cells)) {
        if (!PLACES[ch]) { s.marks(pts, "k", { p: G, size: 0.17 * Math.min(K, 1.6), color: "#b9b9b3" }); continue; }
        const on = ch === sel.k;
        s.marks(pts, "b", { p: G, size: (on ? 0.42 : 0.3) * Math.min(K, 1.3), color: on ? Riso.INK.b.strong : Riso.INK.b.mid });
      }
      // hovering a pin changes its colour, never its size
      for (const q of PINS) {
        if (q === sel) continue;
        dot(q, 5 * K, q.paid ? T.ink : q === hoverPin ? Riso.INK.b.strong : "#6b6866");
      }
      dot(sel, 6 * K, sel.paid ? T.ink : Riso.INK.b.strong, true);
      if (roomy()) {
        if (SYDNEY !== sel && SYDNEY !== hoverPin) pinLabel(SYDNEY, "strong");
        if (hoverPin && hoverPin !== sel) pinLabel(hoverPin, "");
        pinLabel(sel, "strong");
      }
    });
    // Under the map, in page text so it wraps at any width: a header, then one line per item with its date where it has one.
    const lines = (items) => `<ul class="map-list">${items.map((t) => {
      const cut = t.indexOf(" · ");
      const dated = /^(Oct|Nov) \d/.test(t) && cut > 0;
      return `<li><span>${dated ? t.slice(0, cut) : ""}</span><div>${dated ? t.slice(cut + 3) : t}</div></li>`;
    }).join("")}</ul>`;
    const describe = () => { ui.extra.innerHTML = `<div class="map-story"><b>${sel.paid ? `${sel.n} · $26` : sel.n}</b>${lines(sel.items)}</div>`; };
    addEventListener("resize", () => { const k = scale(); if (k !== K) { K = k; s.redraw(true); } });

    // The nearest pin under the pointer, so pins that sit close together stay reachable.
    const viewAt = (ev) => { const p = s.point(ev); return [p.x, p.y]; };
    const pinAt = (x, y) => {
      let best = null, dist = 16 * K;
      for (const q of PINS) {
        const d = Math.hypot(px(q.at[0]) - x, py(q.at[1]) - y);
        if (d < dist) { dist = d; best = q; }
      }
      return best;
    };
    const pick = (q) => { sel = q; s.redraw(true); describe(); };
    const cover = s.spot(0, 0, W, H, { label: "Map", click: (ev) => {
      if (!ev || ev.clientX == null) return;
      const q = pinAt(...viewAt(ev));
      if (q) pick(q);
    } });
    cover.removeAttribute("tabindex");
    cover.style.cursor = "default";
    cover.addEventListener("pointermove", (ev) => {
      const q = pinAt(...viewAt(ev));
      cover.style.cursor = q ? "pointer" : "default";
      if (q !== hoverPin) { hoverPin = q; s.redraw(true); }
    });
    cover.addEventListener("pointerleave", () => { hoverPin = null; s.redraw(true); });
    // Keyboard reaches each pin directly; the pointer goes through the map above.
    for (const q of PINS) {
      const r = 8 * K;
      const el = s.spot(px(q.at[0]) - r, py(q.at[1]) - r, r * 2, r * 2, { label: q.n, click: () => pick(q) });
      el.style.pointerEvents = "none";
    }
    describe();
  });
})();
