// Drawing kit. Figures describe shapes in plain coordinates and this turns them
// into flat SVG: pale tinted fills with a hairline edge, stronger fills when
// selected. A change of state redraws, and the kit eases every shape from
// where it was to where it is now. Figures also draw themselves in the first
// time they scroll into view. Text never animates: it just sits where it's drawn. Wires marked { flow: true } carry a slow
// stream of dots while the figure is on screen.
//
//   Riso.fig("name", { w, h, title, sub, tag, alt }, (s, ui) => { ... });
//   <figure data-rf="name"></figure>
//
// Inks are letters: b blue Peter, r coral the Manager, y amber the controller,
// k graphite what actually happened. "by" is the outside world, and all three
// together ("bry") is a real outcome.

window.Riso = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FONT = '"Hanken Grotesk", system-ui, sans-serif';
  const smooth = (u) => u * u * (3 - 2 * u);
  const registry = new Map();

  // strong for lines and marks, mid for solid fills, pale and edge for quiet fills
  // Hues from Thinking Machines' Tinker palette: azure, red, amber/yellow, emerald.
  const INK = {
    b: { strong: "#0387e7", mid: "#8ec9f4", pale: "#e6f3fd", edge: "#c0e1f9" }, // Peter
    r: { strong: "#ef402c", mid: "#f8a9a0", pale: "#fdeeea", edge: "#fbcfca" }, // the Manager
    y: { strong: "#e09a1c", mid: "#ffce52", pale: "#fff6dc", edge: "#fbe3a3" }, // the controller
    k: { strong: "#282828", mid: "#4f4e4b", pale: "#ebebe6", edge: "#d6d6d0" },
    g: { strong: "#0e9972", mid: "#93d1c0", pale: "#e7f5f1", edge: "#c3e6dc" }, // the outside world
    p: { strong: "#7a5fb0", mid: "#cbbce6", pale: "#f4f0fb", edge: "#d9cff0" },
    o: { strong: "#d9742a", mid: "#f4bd92", pale: "#fff2e7", edge: "#f0d0b4" },
    x: { strong: "#262323", mid: "#2f2c2c", pale: "#ecece8", edge: "#d3d3cd" },
  };
  // The neutral set every figure shares: page, rest, reference and the lines that only organise.
  const T = {
    bg: "#f5f5f2",      // the page, used to knock marks out of the lines behind them
    cell: "#ebebe6",    // a tile at rest
    ref: "#dcdcd6",     // a reference bar, the thing being compared against
    refDot: "#a9a8a4",  // a reference point
    rest: "#d6d6d0",    // a wire nothing is moving along
    grid: "#e3e3de",    // gridlines
    axis: "#bdbdb7",    // the baseline under bars
    seam: "#9d9d98",    // a boundary
    guide: "#b3b3ad",   // a dotted guide from one value to another
    ink: "#282828",     // dark text, money, the current step
    sub: "rgba(38, 35, 35, 0.62)",
  };
  let avatarSeq = 0;
  const lum = (c) => {
    if (!c || c[0] !== "#") return 1;
    const h = c.length === 4 ? c.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : c;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  function inkOf(inks) {
    const s = [...new Set(inks)].sort().join("");
    if (s.length === 1) return INK[s] || INK.k;
    return { by: INK.g, br: INK.p, ry: INK.o }[s] || INK.x;
  }

  function make(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }
  const dotPaths = new WeakMap();
  function dots(pts) {
    let d = dotPaths.get(pts);
    if (!d) {
      const out = [];
      for (let i = 0; i < pts.length; i += 2) out.push(`M${pts[i].toFixed(1)} ${pts[i + 1].toFixed(1)}h0`);
      d = out.join("");
      dotPaths.set(pts, d);
    }
    return d;
  }


  // ---------- motion ----------
  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const out = (u) => 1 - Math.pow(1 - u, 3);
  const NUM = /-?\d*\.?\d+(?:e-?\d+)?/gi;
  const GEOM = { rect: ["x", "y", "width", "height"], circle: ["cx", "cy", "r"], text: ["x", "y"], line: ["x1", "y1", "x2", "y2"] };
  const SOFT = ["fill-opacity", "stroke-opacity", "stroke-width"];
  function rgb(c) {
    if (!c || c[0] !== "#") return null;
    const h = c.length === 4 ? c.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : c;
    return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const hex = (a) => "#" + a.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const lerp = (a, b, u) => a + (b - a) * u;
  // "$1,465" or "45% (231)": numbers that can count from one value to another

  // One clock per stage moves every attribute that is in flight.
  class Tweens {
    constructor() { this.list = new Map(); this.raf = 0; }
    add(el, key, set, dur, delay = 0) {
      if (reduced) { set(1); return; }
      let m = this.list.get(el);
      if (!m) this.list.set(el, (m = new Map()));
      m.set(key, { set, t0: performance.now() + delay, dur });
      set(0);
      if (!this.raf) this.raf = requestAnimationFrame((t) => this.tick(t));
    }
    tick(t) {
      this.raf = 0;
      for (const [el, m] of this.list) {
        for (const [key, w] of m) {
          const u = Math.max(0, Math.min(1, (t - w.t0) / w.dur));
          w.set(u);
          if (u >= 1) m.delete(key);
        }
        if (!m.size || !el.isConnected) this.list.delete(el);
      }
      if (this.list.size) this.raf = requestAnimationFrame((t2) => this.tick(t2));
    }
  }

  class Stage {
    constructor(host, w, h, pitch) {
      this.w = w; this.h = h; this.p = pitch;
      this.host = host;
      this.svg = make("svg", { viewBox: `0 0 ${w} ${h}` });
      this.shapes = make("g");
      this.ink = make("g");
      this.hot = make("g");
      this.movers = make("g");
      this.ghost = make("g");
      this.stream = make("g", { class: "rf-flow" });
      this.svg.append(this.ghost, this.shapes, this.stream, this.ink, this.movers, this.hot);
      host.append(this.svg);
      this.painter = null;
      this.filled = [];
      this.flows = [];
      this.tw = new Tweens();
      this.morph = true;
      this.intro = true;
      this.shown = false;
    }
    // Solid shapes are remembered so a label on top can drop its halo, and go
    // light on the dark ones.
    note(x, y, w, h, inks, o, small) {
      if (small) return;
      // a label on a fill goes light only when the fill is actually dark
      const dark = o.color ? lum(o.color) < 0.42 : (o.thin || 1) === 1 && (inkOf(inks) === INK.k || inkOf(inks) === INK.x);
      this.filled.push({ x, y, w, h, dark });
    }
    paint(fn) { this.painter = fn; this.redraw(); }
    arm() {}
    redraw(instant) {
      if (!this.painter) return;
      const morph = this.morph && this.shown && !reduced && !instant;
      const was = morph ? [[...this.shapes.children], [...this.ink.children]] : null;
      this.shapes.replaceChildren();
      this.ink.replaceChildren();
      this.filled = [];
      this.flows = [];
      this.painter(this);
      if (morph) {
        this.ease(was[0], [...this.shapes.children]);
        this.ease(was[1], [...this.ink.children]);
      }
      this.flowsChanged = true;
    }
    // Pair old and new shapes of the same kind in drawing order, and move each
    // new one from where its partner was. Extra new shapes fade in, leftovers out.
    ease(before, after, dur = 420) {
      // text swaps in place, it never slides, fades or counts
      before = before.filter((e) => e.tagName !== "text");
      after = after.filter((e) => e.tagName !== "text");
      const byTag = (els) => {
        const m = new Map();
        for (const e of els) { const k = e.tagName + (e.getAttribute("class") || "").replace(/ ?on-(dark|fill)/, ""); if (!m.has(k)) m.set(k, []); m.get(k).push(e); }
        return m;
      };
      const A = byTag(before), B = byTag(after);
      for (const [k, news] of B) {
        const olds = A.get(k) || [];
        news.forEach((n, i) => {
          const o = olds[i];
          if (!o) { this.fade(n, 0, 1, dur * 0.8); return; }
          this.between(o, n, dur);
        });
        A.set(k, olds.slice(news.length));
      }
      for (const left of A.values()) for (const o of left) {
        this.ghost.append(o);
        this.fade(o, +(o.style.opacity || 1), 0, dur * 0.6, () => o.remove());
      }
    }
    fade(el, a, b, dur, done) {
      this.tw.add(el, "opacity", (u) => { el.style.opacity = lerp(a, b, ease(u)); if (u >= 1) { if (b === 1) el.style.opacity = ""; if (done) done(); } }, dur);
    }
    between(o, n, dur) {
      const tag = n.tagName;
      const sets = [];
      for (const k of [...(GEOM[tag] || []), ...SOFT]) {
        const a = parseFloat(o.getAttribute(k)), b = parseFloat(n.getAttribute(k));
        if (Number.isFinite(a) && Number.isFinite(b) && a !== b) sets.push((u) => n.setAttribute(k, lerp(a, b, u).toFixed(2)));
      }
      for (const k of ["fill", "stroke"]) {
        const a = rgb(o.getAttribute(k)), b = rgb(n.getAttribute(k));
        if (a && b && a.join() !== b.join()) sets.push((u) => n.setAttribute(k, u >= 1 ? hex(b) : hex(a.map((v, i) => lerp(v, b[i], u)))));
      }
      if (tag === "path") {
        const da = o.getAttribute("d"), db = n.getAttribute("d");
        if (da && db && da !== db && da.replace(NUM, "#") === db.replace(NUM, "#")) {
          const na = da.match(NUM).map(Number), parts = db.split(NUM), nb = db.match(NUM).map(Number);
          sets.push((u) => n.setAttribute("d", u >= 1 ? db : parts.map((p, i) => (i < nb.length ? p + lerp(na[i], nb[i], u).toFixed(1) : p)).join("")));
        }
      }
      const op = o.style.opacity;
      if (op && op !== "1") sets.push((u) => { n.style.opacity = u >= 1 ? "" : lerp(+op, 1, u); });
      if (sets.length) this.tw.add(n, "morph", (u) => { const e = ease(u); for (const f of sets) f(u >= 1 ? 1 : e); }, dur);
    }
    // First time on screen: bars grow from their base, lines draw, circles open. Left to right,
    // under a second in all. Labels and numbers are simply there from the start.
    reveal() {
      if (this.shown) return;
      this.shown = true;
      if (reduced || !this.intro) return;
      const W = this.w, base = (x) => Math.max(0, Math.min(1, x / W)) * 300;
      // a rect is a bar when at least two others share its left edge (rows) or
      // its floor (columns); anything else is a box and only fades in
      const rects = [...this.shapes.querySelectorAll("rect")].map((e) => ["x", "y", "width", "height"].map((k) => parseFloat(e.getAttribute(k))));
      const tally = (f) => { const m = new Map(); for (const r of rects) { const k = Math.round(f(r)); m.set(k, (m.get(k) || 0) + 1); } return m; };
      const lefts = tally((r) => r[0]), floors = tally((r) => r[1] + r[3]);
      for (const e of this.shapes.children) {
        const tag = e.tagName, g = (k) => parseFloat(e.getAttribute(k));
        if (tag === "text") continue;
        if (tag === "rect") {
          const x = g("x"), y = g("y"), w = g("width"), h = g("height");
          if (w > h * 1.6 && h <= 44 && lefts.get(Math.round(x)) >= 3) this.tw.add(e, "in", (u) => e.setAttribute("width", (w * out(u)).toFixed(2)), 700, base(x));
          else if (h > w * 1.2 && w <= 80 && floors.get(Math.round(y + h)) >= 3) this.tw.add(e, "in", (u) => { const v = h * out(u); e.setAttribute("y", (y + h - v).toFixed(2)); e.setAttribute("height", v.toFixed(2)); }, 700, base(x));
          else this.fade(e, 0, 1, 600), (this.tw.list.get(e).get("opacity").t0 += base(x));
        } else if (tag === "circle") {
          const r = g("r");
          this.tw.add(e, "in", (u) => e.setAttribute("r", (r * out(u)).toFixed(2)), 650, base(g("cx")));
        } else if (tag === "path" && e.getAttribute("fill") === "none" && !e.getAttribute("stroke-dasharray") && !/h0/.test(e.getAttribute("d"))) {
          const len = e.getTotalLength();
          const x0 = parseFloat((e.getAttribute("d").match(NUM) || [0])[0]);
          e.setAttribute("stroke-dasharray", `${len} ${len}`);
          this.tw.add(e, "in", (u) => {
            if (u >= 1) { e.removeAttribute("stroke-dasharray"); e.removeAttribute("stroke-dashoffset"); return; }
            e.setAttribute("stroke-dashoffset", (len * (1 - out(u))).toFixed(1));
          }, 800, base(x0));
        } else {
          const x0 = parseFloat(e.getAttribute("x") ?? (e.getAttribute("d") || "").match(NUM)?.[0] ?? 0);
          this.fade(e, 0, 1, 650);
          this.tw.list.get(e).get("opacity").t0 += base(x0) + 120;
        }
      }
    }
    // A wire that carries traffic: dots drift along it while the figure is visible.
    flow(d, inks, o = {}) {
      this.flows.push({ d, c: inkOf(inks).strong, ms: o.ms || 2600, n: o.n || 2, r: o.r || 2.4 });
    }
    streamTick(t) {
      if (this.flowsChanged) {
        this.flowsChanged = false;
        const key = this.flows.map((f) => f.d + f.c).join("|");
        if (key !== this.flowKey) {
          this.flowKey = key;
          this.stream.replaceChildren();
          this.dots = this.flows.map((f) => {
            const probe = make("path", { d: f.d });
            const len = probe.getTotalLength();
            const ds = [];
            for (let j = 0; j < f.n; j++) { const c = make("circle", { r: f.r, fill: f.c }); this.stream.append(c); ds.push(c); }
            return { f, probe, len, ds };
          });
        }
      }
      for (const { f, probe, len, ds } of this.dots || []) {
        ds.forEach((c, j) => {
          const u = ((t / f.ms) + j / f.n) % 1;
          const q = probe.getPointAtLength(u * len);
          c.setAttribute("cx", q.x.toFixed(1)); c.setAttribute("cy", q.y.toFixed(1));
          c.setAttribute("opacity", Math.min(1, Math.sin(Math.PI * u) * 1.6).toFixed(2));
        });
      }
    }
    fills(inks, o, small) {
      const c = inkOf(inks), thin = o.thin || 1;
      if (small) return { fill: c.strong, "fill-opacity": thin > 1 ? 0.45 : 1 };
      if (thin > 1) return { fill: c.pale, stroke: c.edge, "stroke-width": 1 };
      return { fill: c.mid };
    }
    // o.bg: a background band, so labels drawn on it keep their own colour
    rect(x, y, w, h, inks, o = {}) {
      const small = Math.min(w, h) < 5;
      if (!o.bg) this.note(x, y, w, h, inks, o, small);
      const f = this.fills(inks, o, small);
      if (o.color) { f.fill = o.color; delete f.stroke; f["fill-opacity"] = o.fade ?? 1; }
      this.shapes.append(make("rect", { x, y, width: w, height: h, rx: small ? 0.5 : Math.min(3, Math.min(w, h) / 3), ...f }));
    }
    // a small solid mark: 0 circle, 1 square, 2 triangle, all the same visual size
    mark(shape, cx, cy, r, inks, o = {}) {
      const f = this.fills(inks, o, true);
      if (o.color) f.fill = o.color;
      if (o.fade) f["fill-opacity"] = o.fade;
      if (shape === 0) { this.shapes.append(make("circle", { cx, cy, r, ...f })); return; }
      if (shape === 1) { const a = r * 0.9; this.shapes.append(make("rect", { x: cx - a, y: cy - a, width: a * 2, height: a * 2, rx: 1, ...f })); return; }
      const t = r * 1.25;
      this.shapes.append(make("path", { d: `M${cx.toFixed(1)},${(cy - t).toFixed(1)}L${(cx + t * 0.92).toFixed(1)},${(cy + t * 0.62).toFixed(1)}L${(cx - t * 0.92).toFixed(1)},${(cy + t * 0.62).toFixed(1)}Z`, ...f }));
    }
    circle(cx, cy, r, inks, o = {}) {
      this.note(cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, inks, o, r < 13);
      this.shapes.append(make("circle", { cx, cy, r, ...this.fills(inks, o, r < 13) }));
    }
    text(str, x, y, inks, o = {}) {
      const t = make("text", { x, y, "text-anchor": o.anchor || "start", class: "rf-big" });
      t.style.fontSize = `${(o.size || 48) * 0.92}px`;
      t.style.fill = inkOf(inks).strong;
      t.textContent = str;
      this.shapes.append(t);
    }
    run(d, inks, o = {}) {
      const c = inkOf(inks);
      const rib = o.rib ?? (o.arrow ? 1.6 : 0);
      const col = o.color || c.strong;
      const attrs = { d, fill: "none", stroke: col, "stroke-linecap": "round", "stroke-linejoin": "round" };
      if (rib) {
        attrs["stroke-width"] = Math.max(1.25, rib * 0.72);
      } else {
        const gap = o.gap || this.p * 1.25;
        attrs["stroke-width"] = 1.1;
        attrs["stroke-dasharray"] = `${Math.max(1, gap * 0.45)} ${gap * 0.75}`;
        attrs["stroke-opacity"] = 0.75;
      }
      const path = make("path", attrs);
      this.shapes.append(path);
      if (o.flow) this.flow(d, inks, o.flow === true ? {} : o.flow);
      if (o.arrow) {
        const len = path.getTotalLength();
        const a = path.getPointAtLength(len), b = path.getPointAtLength(Math.max(0, len - 4));
        const t = Math.atan2(a.y - b.y, a.x - b.x), s = 6.5;
        const pt = (r, an) => `${(a.x + r * Math.cos(an)).toFixed(1)} ${(a.y + r * Math.sin(an)).toFixed(1)}`;
        this.shapes.append(make("path", { d: `M${pt(0, 0)}L${pt(s, t + Math.PI - 0.5)}L${pt(s, t + Math.PI + 0.5)}Z`, fill: col }));
      }
    }
    frame(x, y, w, h, inks, o = {}) {
      const c = inkOf(inks);
      this.shapes.append(make("rect", { x, y, width: w, height: h, rx: 6, fill: "none", stroke: c.edge === INK.k.edge ? "#c4c4bd" : c.edge, "stroke-width": 1, "stroke-dasharray": o.gap ? "3 3" : null }));
    }
    // many dots in one path. o.dot sets the dot's diameter directly; o.color and o.fade override the ink.
    marks(pts, inks, o = {}) {
      const r = (o.p || this.p) * (o.size || 0.56);
      this.shapes.append(make("path", { d: dots(pts), fill: "none", stroke: o.color || inkOf(inks).strong, "stroke-width": o.dot || Math.max(1.3, r * 1.7), "stroke-linecap": "round", "stroke-opacity": o.fade }));
    }
    // any filled shape, given as a path
    area(d, color, opacity = 1) {
      this.shapes.append(make("path", { d, fill: color, "fill-opacity": opacity }));
    }
    // a band between two blocks, thickness w, for flow diagrams
    ribbon(x0, x1, y0, y1, w, inks, o = {}) {
      const mx = (x0 + x1) / 2, h = w / 2;
      const d = `M${x0} ${(y0 - h).toFixed(1)}C${mx} ${(y0 - h).toFixed(1)} ${mx} ${(y1 - h).toFixed(1)} ${x1} ${(y1 - h).toFixed(1)}V${(y1 + h).toFixed(1)}C${mx} ${(y1 + h).toFixed(1)} ${mx} ${(y0 + h).toFixed(1)} ${x0} ${(y0 + h).toFixed(1)}Z`;
      this.shapes.append(make("path", { d, fill: inkOf(inks).strong, "fill-opacity": o.opacity ?? 0.26 }));
    }
    // ---------- the Tinker vocabulary ----------
    // A connection. Solid, grey at rest, the actor's colour when something is moving along it.
    wire(d, inks, o = {}) {
      const on = o.on ?? true;
      const col = on ? (o.color || inkOf(inks).strong) : T.rest;
      const w = o.w || 2;
      const path = make("path", { d, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": o.cap || "round", "stroke-linejoin": "round", "stroke-opacity": o.fade });
      this.shapes.append(path);
      if (o.flow && on) this.flow(d, inks, o.flow === true ? {} : o.flow);
      if (o.arrow) {
        // a small open chevron at the end, or at fraction o.arrow along the path
        const len = path.getTotalLength(), at = o.arrow === true || o.arrow === 1 ? len : len * o.arrow;
        const a = path.getPointAtLength(at), b = path.getPointAtLength(Math.max(0, at - 3));
        const t = Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI;
        this.shapes.append(make("path", { d: "M-5,-4.2L0,0L-5,4.2", transform: `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${t.toFixed(1)})`, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-opacity": o.fade }));
      }
      return path;
    }
    // A boundary between zones: a dashed hairline instead of a box.
    seam(x1, y1, x2, y2, o = {}) {
      this.shapes.append(make("line", { x1, y1, x2, y2, stroke: o.color || T.seam, "stroke-width": 1, "stroke-dasharray": o.dash || "3 5" }));
    }
    // A dotted guide from one value across to another.
    guide(x1, y1, x2, y2, o = {}) {
      this.shapes.append(make("line", { x1, y1, x2, y2, stroke: o.color || T.guide, "stroke-width": 1, "stroke-dasharray": "2 3" }));
    }
    // A difference, written out: an I-beam from y0 to y1 at x, with its label beside it.
    bracket(x, y0, y1, text, o = {}) {
      const c = o.color || T.sub, cap = 4;
      this.shapes.append(make("path", { d: `M${x - cap},${y0}H${x + cap}M${x},${y0}V${y1}M${x - cap},${y1}H${x + cap}`, fill: "none", stroke: c, "stroke-width": 1 }));
      if (text) this.label(o.side === "left" ? x - 10 : x + 10, (y0 + y1) / 2 + 5, text, { anchor: o.side === "left" ? "end" : "start", cls: "strong", fill: o.ink });
    }
    // A node: a filled dot, knocked out of the wires behind it. o.ring adds the "you are here" ring.
    node(cx, cy, r, inks, o = {}) {
      const col = o.color || inkOf(inks).strong;
      if (o.ring) this.shapes.append(make("circle", { cx, cy, r: r + 5, fill: T.bg, stroke: col, "stroke-width": 2 }));
      this.shapes.append(make("circle", { cx, cy, r, fill: col, stroke: T.bg, "stroke-width": o.ring ? 0 : (o.knock ?? 5), "paint-order": "stroke", "fill-opacity": o.fade }));
    }
    // A port where a wire crosses a boundary: hollow at rest, filled once something goes through.
    port(cx, cy, inks, on, o = {}) {
      const col = o.color || inkOf(inks).strong, r = o.r || 5.5;
      this.shapes.append(make("circle", { cx, cy, r: r + 3, fill: T.bg }));
      this.shapes.append(make("circle", { cx, cy, r, fill: on ? col : T.bg, stroke: col, "stroke-width": 2 }));
    }
    // A numbered step marker: a small disc, dark when it's the current step.
    marker(n, cx, cy, on) {
      this.shapes.append(make("circle", { cx, cy, r: 14, fill: T.bg }));
      this.shapes.append(make("circle", { cx, cy, r: 11, fill: on ? T.ink : T.bg, stroke: on ? T.ink : "#cfcfc9", "stroke-width": 1 }));
      const t = make("text", { x: cx, y: cy + 4.2, "text-anchor": "middle", class: "rf-t mark-n" });
      t.style.fill = on ? "#fbfbf8" : T.ink;
      t.textContent = n;
      this.ink.append(t);
    }
    // A profile picture, clipped to a circle, inside a ring in the actor's colour.
    avatar(href, cx, cy, r, ring, o = {}) {
      const id = `rf-av-${++avatarSeq}`;
      const clip = make("clipPath", { id });
      clip.append(make("circle", { cx, cy, r }));
      this.shapes.append(clip);
      this.shapes.append(make("circle", { cx, cy, r: r + (o.ring ?? 3.5), fill: ring }));
      this.shapes.append(make("circle", { cx, cy, r: r + 1, fill: T.bg }));
      this.shapes.append(make("image", { href, x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, "clip-path": `url(#${id})`, preserveAspectRatio: "xMidYMid slice" }));
    }
    // A legend row: a dot and a label per entry. Returns where it ended.
    legend(items, x, y, o = {}) {
      let cx = x;
      for (const [text, color] of items) {
        this.shapes.append(make("circle", { cx: cx + 4, cy: y - 4.5, r: 4, fill: color }));
        const t = this.label(cx + 13, y, text, { cls: o.mono === false ? "dim" : "mono" });
        cx += 13 + t.getComputedTextLength() + (o.gap || 20);
      }
      return cx;
    }
    // Horizontal gridlines with tick labels on the left, the way Tinker's charts do it.
    hgrid(x0, x1, ticks, y, fmt, o = {}) {
      for (const v of ticks) {
        const yy = y(v);
        this.shapes.append(make("line", { x1: x0, y1: yy, x2: x1, y2: yy, stroke: v === 0 && !o.noBase ? T.axis : T.grid, "stroke-width": 1 }));
        if (fmt) this.label(x0 - 8, yy + 4, fmt(v), { anchor: "end", cls: "tiny" });
      }
    }
    label(x, y, str, o = {}) {
      let under = null;
      for (const f of this.filled) if (x >= f.x && x <= f.x + f.w && y - 4 >= f.y && y - 4 <= f.y + f.h) under = f;
      const on = under ? (under.dark ? "on-dark" : "on-fill") : "";
      const t = make("text", { x, y, "text-anchor": o.anchor || "start", class: `rf-t ${o.cls || ""} ${on}` });
      if (o.size) t.style.fontSize = `${o.size}px`;
      if (o.weight) t.style.fontWeight = o.weight;
      if (o.fill) t.style.fill = o.fill;
      t.textContent = str;
      this.ink.append(t);
      return t;
    }
    // how wide a label would be, in the drawing's own units (same options as label)
    measure(str, o = {}) {
      const t = make("text", { class: `rf-t ${o.cls || ""}` });
      if (o.size) t.style.fontSize = `${o.size}px`;
      t.textContent = str;
      this.ink.append(t);
      const w = t.getComputedTextLength();
      t.remove();
      return w;
    }
    // the same for a big number drawn with s.text
    measureBig(str, size) {
      const t = make("text", { class: "rf-big" });
      t.style.fontSize = `${size * 0.92}px`;
      t.style.fontWeight = 700;
      t.textContent = str;
      this.ink.append(t);
      const w = t.getComputedTextLength();
      t.remove();
      return w;
    }
    // where a pointer event is, in the drawing's own units
    point(e) {
      const m = this.svg.getScreenCTM().inverse();
      return { x: m.a * e.clientX + m.c * e.clientY + m.e, y: m.b * e.clientX + m.d * e.clientY + m.f };
    }
    // Trim the drawing to what's on it, top and bottom, so no figure carries dead space.
    // Widths stay as drawn, so text keeps its size.
    fit(pad = 7) {
      let y0 = Infinity, y1 = -Infinity;
      for (const g of [this.shapes, this.ink]) for (const el of g.children) {
        let b; try { b = el.getBBox(); } catch { continue; }
        if (!b.width && !b.height) continue;
        y0 = Math.min(y0, b.y); y1 = Math.max(y1, b.y + b.height);
      }
      if (!Number.isFinite(y0)) return;
      const top = Math.floor(y0 - pad), h = Math.ceil(y1 + pad) - top;
      this.svg.setAttribute("viewBox", `0 ${top} ${this.w} ${h}`);
      this.host.style.aspectRatio = `${this.w} / ${h}`;
    }
    spot(x, y, w, h, { label, enter, leave, click }) {
      const r = make("rect", { x, y, width: w, height: h, class: "rf-hot", "aria-label": label });
      if (click || enter) { r.setAttribute("tabindex", "0"); r.setAttribute("role", "button"); }
      if (enter) { r.addEventListener("pointerenter", enter); r.addEventListener("focus", enter); }
      if (leave) { r.addEventListener("pointerleave", leave); r.addEventListener("blur", leave); }
      if (click) {
        r.addEventListener("click", click);
        r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); click(); } });
      }
      this.hot.append(r);
      return r;
    }
    packet(d, ink, ms = 900) {
      if (reduced) return Promise.resolve();
      const probe = make("path", { d });
      const len = probe.getTotalLength();
      const m = make("circle", { r: 4.5, fill: inkOf(ink).strong });
      this.movers.append(m);
      return new Promise((res) => {
        const t0 = performance.now();
        const tick = (t) => {
          const u = Math.min(1, (t - t0) / ms);
          const q = probe.getPointAtLength(smooth(u) * len);
          m.setAttribute("cx", q.x); m.setAttribute("cy", q.y);
          if (u < 1) requestAnimationFrame(tick);
          else { m.remove(); res(); }
        };
        requestAnimationFrame(tick);
      });
    }
  }

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function makeUi(fig, s) {
    const controls = el("div", "rf-controls");
    const readout = el("div", "rf-readout");
    readout.setAttribute("aria-live", "polite");
    return {
      controls, readout, fig,
      choice(options, onPick, start = 0, label = "") {
        const row = el("div", "rf-choice");
        row.setAttribute("role", "group");
        if (label) { row.setAttribute("aria-label", label); row.append(el("span", "rf-choice-label", label)); }
        const seg = el("div", "rf-seg");
        const btns = options.map((o, i) => {
          const b = el("button", "rf-btn", o.label || o);
          b.type = "button";
          b.addEventListener("click", () => set(i));
          seg.append(b);
          return b;
        });
        row.append(seg);
        let cur = start;
        function set(i, quiet) {
          cur = i;
          btns.forEach((b, j) => b.setAttribute("aria-pressed", j === i ? "true" : "false"));
          if (!quiet) onPick(options[i].value ?? i, i);
        }
        set(start, true);
        controls.append(row);
        return { set, row, size: options.length, get: () => cur };
      },
      action(label, onClick) {
        const b = el("button", "rf-btn rf-act", label);
        b.type = "button";
        b.addEventListener("click", () => onClick(b));
        controls.append(b);
        return b;
      },
      slider(label, min, max, value, step, onInput) {
        const w = el("label", "rf-slider");
        w.append(el("span", "rf-choice-label", label));
        const i = el("input");
        i.type = "range"; i.min = min; i.max = max; i.step = step; i.value = value;
        i.addEventListener("input", () => onInput(+i.value));
        w.append(i);
        controls.append(w);
        return i;
      },
      read(html) { readout.innerHTML = html; },
      // A play button that walks a choice or a slider forward on its own, like
      // a short guided tour. Touching the control yourself stops it.
      play(target, { ms = 2600, steps = 12, from } = {}) {
        const isRange = target instanceof HTMLInputElement;
        const b = el("button", "rf-btn rf-play", "");
        b.type = "button";
        const bar = el("span", "rf-play-bar");
        let timer = 0, t0 = 0, raf = 0;
        const label = (on) => { b.innerHTML = on ? '<span class="rf-play-i">❚❚</span> pause' : '<span class="rf-play-i">▶</span> play'; b.append(bar); b.setAttribute("aria-pressed", on); };
        label(false);
        const total = isRange ? steps : target.size;
        const at = () => (isRange ? Math.round((+target.value - +target.min) / (+target.max - +target.min) * (steps - 1)) : target.get());
        const go = (i) => {
          if (isRange) { target.value = +target.min + (+target.max - +target.min) * i / (steps - 1); target.dispatchEvent(new Event("input")); }
          else target.set(i);
        };
        const progress = () => {
          const f = isRange ? at() / (total - 1) : (performance.now() - t0) / ms;
          bar.style.transform = `scaleX(${Math.min(1, f)})`;
          raf = requestAnimationFrame(progress);
        };
        const stop = () => { clearInterval(timer); cancelAnimationFrame(raf); timer = 0; label(false); bar.style.transform = "scaleX(0)"; };
        const step = () => {
          const n = at() + 1;
          if (n >= total) { stop(); return; }
          go(n); t0 = performance.now();
        };
        b.addEventListener("click", () => {
          if (timer) { stop(); return; }
          if (at() >= total - 1 || from != null) go(from ?? 0);
          label(true); t0 = performance.now();
          if (!reduced) raf = requestAnimationFrame(progress);
          timer = setInterval(step, ms);
        });
        const host = isRange ? target.closest(".rf-slider") : target.row;
        host.addEventListener("pointerdown", () => timer && stop());
        host.addEventListener("keydown", () => timer && stop());
        host.prepend(b);
        return { stop };
      },
      whileVisible(fn) {
        s.morph = false;
        if (reduced) { fn(0, 0); return; }
        let vis = false, last = 0, raf = 0;
        const tick = (t) => {
          if (!vis) return;
          fn(t, t - (last || t));
          last = t;
          raf = requestAnimationFrame(tick);
        };
        new IntersectionObserver((es) => {
          vis = es[0].isIntersecting;
          if (vis) { last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
        }).observe(fig);
      },
      onFirstView(fn) {
        s.intro = false;
        const io = new IntersectionObserver((es) => {
          if (es[0].isIntersecting) { io.disconnect(); fn(); }
        }, { threshold: 0.35 });
        io.observe(fig);
      },
    };
  }

  // Hide each figure until it is a quarter on screen, then let it draw itself in.
  // Wires with traffic only move while the figure can be seen.
  function watch(fig, s) {
    if (reduced || !("IntersectionObserver" in window)) { s.shown = true; return; }
    if (s.intro) {
      s.svg.style.visibility = "hidden";
      const io = new IntersectionObserver((es) => {
        const e = es[0];
        if (!e.isIntersecting || (e.intersectionRatio < 0.25 && e.intersectionRect.height < 320)) return;
        io.disconnect();
        s.svg.style.visibility = "";
        s.reveal();
      }, { threshold: [0, 0.1, 0.25, 0.5] });
      io.observe(fig);
    } else s.shown = true;
    let vis = false, raf = 0;
    const tick = (t) => { if (!vis) return; s.streamTick(t); raf = requestAnimationFrame(tick); };
    new IntersectionObserver((es) => {
      vis = es[0].isIntersecting && s.flows.length > 0;
      cancelAnimationFrame(raf);
      if (vis) raf = requestAnimationFrame(tick);
    }).observe(fig);
  }

  function mount(fig) {
    const def = registry.get(fig.dataset.rf);
    if (!def) { console.warn("no figure", fig.dataset.rf); return; }
    const { o, build } = def;
    const w = o.wide ? 960 : (o.w || 720);
    fig.classList.add("rf");
    if (o.wide) fig.classList.add("rf-wide");
    if (o.tight) fig.classList.add("rf-tight");
    fig.replaceChildren();
    const panel = el("div", "rf-panel");
    fig.append(panel);
    if (o.tag) panel.append(el("div", "rf-eyebrow", o.tag));
    if (o.title) panel.append(el("h4", "rf-title", o.title));
    if (o.sub) panel.append(el("p", "rf-sub", o.sub));
    const scroller = el("div", "rf-scroll");
    const host = el("div", "rf-stage");
    host.style.aspectRatio = `${w} / ${o.h}`;
    if (o.minWidth != null) host.style.minWidth = `${o.minWidth}px`;
    host.setAttribute("role", "img");
    host.setAttribute("aria-label", o.alt || o.caption || fig.dataset.rf);
    scroller.append(host);
    panel.append(scroller);
    const s = new Stage(host, w, o.h, o.pitch || 3);
    const ui = makeUi(fig, s);
    // No text box or caption under a figure: anything a reader needs is drawn inside it.
    // ui.read() is kept so older figures don't break, but it shows nothing.
    panel.append(ui.controls);
    if (o.extra) ui.extra = panel.appendChild(el("div", "rf-extra"));
    build(s, ui);
    if (o.fit !== false) s.fit();
    if (o.intro === false) s.intro = false;
    if (o.morph === false) s.morph = false;
    watch(fig, s);
    if (!ui.controls.children.length) ui.controls.remove();
    // figures have no card: they sit straight on the page (see figure.rf in site.css)
  }

  function start() {
    const go = () => {
      document.querySelectorAll("figure[data-rf]").forEach(mount);
      document.dispatchEvent(new Event("press:ready"));
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else queueMicrotask(start);

  function units(count, x, y, perRow, gap) {
    const pts = [];
    for (let i = 0; i < count; i++) pts.push(x + (i % perRow) * gap, y + Math.floor(i / perRow) * gap);
    return pts;
  }

  return {
    T,
    fig(name, o, build) { registry.set(name, { o, build }); },
    units, reduced, el, INK, FONT, smooth,
    fmt: (n) => n.toLocaleString("en-US"),
  };
})();
