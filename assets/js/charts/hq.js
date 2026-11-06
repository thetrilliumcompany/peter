// Shared chart types for the HQ figures in the appendix (rows of bars, columns, lines,
// slopes, stacked rows, big numbers, stacked days) and the small helpers they use.
// Each HQ figure in figures/ picks one of these and passes it data from data/appendix-data.js.
//
// They follow the chart grammar of Thinking Machines' Tinker page: reference marks grey, the subject
// in one colour, flat fills, hairline gridlines, values written on the marks, and comparisons of
// two values drawn with a dotted guide and a bracket that says the difference.
(() => {
  const { fig, fmt, T } = Riso;
  const HQ = window.HQ;
  // the colour a chart's subject is drawn in: the actor's hue, Tinker yellow for the controller,
  // dark ink for findings about people
  const accent = (ink) => (ink === "y" ? Riso.INK.y.mid : ink === "k" ? Riso.INK.k.mid : (Riso.INK[ink] || Riso.INK.g).strong);
  // the drawing width every HQ chart is laid out in; figures pass it to the kit as w.
  // 600 across the column draws at the same scale as the tokens figure.
  const W = 600;
  const dayLabel = (x) => {
    const m = /^2026-(\d\d)-(\d\d)$/.exec(x);
    if (!m) return x;
    return `${m[1] === "10" ? "oct" : "nov"} ${+m[2]}`;
  };
  const isDate = (x) => /^2026-\d\d-\d\d$/.test(x);
  const OUTCOME = { no_op: "no action", in_progress: "still going" };
  const nice = (s) => OUTCOME[s] || s.replace(/_/g, " ");
  const num = (v) => (Number.isInteger(v) ? fmt(v) : v < 1 ? `${(v * 100).toFixed(v < 0.1 ? 1 : 0)}%` : fmt(Math.round(v * 10) / 10));
  // Who a value belongs to decides its ink, same as everywhere on the page.
  const CH = 7.2; // width of a bold 13px character, near enough
  const inkFor = (label, base) => /manager|boss/i.test(label) ? "r" : /controller/i.test(label) ? "y" : base;
  const wrap = (t, max) => {
    if (t.length <= max) return [t];
    // break at the space nearest the middle, so neither line runs long
    let cut = -1;
    for (let i = t.indexOf(" "); i >= 0; i = t.indexOf(" ", i + 1)) if (cut < 0 || Math.abs(i - t.length / 2) < Math.abs(cut - t.length / 2)) cut = i;
    return cut < 0 ? [t] : [t.slice(0, cut), t.slice(cut + 1)];
  };

  // ---------- scales ----------
  const pctTick = (v) => `${+(v * 100).toFixed(1)}%`;
  const usdTick = (v) => `$${Number.isInteger(v) ? fmt(v) : v.toFixed(2)}`;
  const TICK = { pct: pctTick, usd: usdTick, n: fmt };
  // A horizontal scale: hairlines from top to bottom, tick values under them, the unit under those.
  // Draw it before the bars so the bars sit on top of the lines.
  function xAxis(s, x, w, max, top, bottom, tick, title, step = niceStep(max)) {
    const n = Math.floor(max / step + 1e-9);
    for (let k = 0; k <= n; k++) {
      const v = k * step, xx = x + v / max * w;
      s.rect(xx - 0.5, top, 1, bottom - top, "k", { color: T.grid, bg: true });
      s.label(xx, bottom + 16, tick(v), { anchor: xx < 16 ? "start" : xx > W - 16 ? "end" : "middle", cls: "tiny" });
    }
    if (title) s.label(x + w / 2, bottom + 34, title, { anchor: "middle", cls: "mono" });
  }
  const AXIS_H = 44; // the room xAxis needs under the bottom of a chart

  // ---------- rows of bars ----------
  function rowsChart(s, ui, cfg) {
    // cfg.rows() → [{ n, v, text, ink, read }]
    let sel = cfg.start ?? 0;
    const RH = cfg.rh || 30;
    const list = () => cfg.rows();
    s.paint(() => {
      const L = list();
      // gutters come from the measured labels and values, so the longest bar ends at the edge
      const lw = Math.max(...L.flatMap((r) => wrap(r.n, 30).map((t) => s.measure(t))));
      const X = Math.min(280, Math.ceil(lw) + 12);
      const max = Math.max(...L.map((r) => r.v)) || 1;
      const barW = Math.min(...L.map((r) => (W - X - 10 - Math.ceil(s.measure(r.text, { cls: "strong" })) - 4) / Math.max(r.v / max, 0.0001)));
      if (cfg.axis) xAxis(s, X, barW, max, 4, 6 + L.length * RH, TICK[cfg.axis[1]], cfg.axis[0]);
      // the baseline the bars grow from
      s.rect(X - 0.5, 4, 1, L.length * RH - 2, "k", { color: T.axis, bg: true });
      L.forEach((r, i) => {
        const y = 6 + i * RH;
        const on = i === sel;
        const lines = wrap(r.n, 30);
        lines.forEach((t, j) => s.label(X - 10, y + (lines.length > 1 ? 9 + j * 13 : 16), t, { anchor: "end", cls: "", fill: on ? T.ink : null }));
        const w = Math.max(2, r.v / max * barW);
        // only the row in focus is in colour; the rest are the grey it's measured against
        s.rect(X, y + 4, Math.round(w), RH - 12, r.ink, { color: on ? accent(r.ink) : T.ref });
        s.label(X + w + 8, y + 16, r.text, { cls: on ? "strong" : "tiny" });
      });
    });
    const describe = () => { const r = list()[sel]; if (r) ui.read(r.read || `<b>${r.n}:</b> ${r.text}.`); };
    const n = list().length;
    for (let i = 0; i < n; i++) {
      const pick = () => { sel = i; s.redraw(); describe(); };
      s.spot(0, 6 + i * RH, W, RH, { label: `row ${i + 1}`, enter: pick, click: pick });
    }
    describe();
    return { redraw: () => { s.redraw(); describe(); } };
  }

  function hbar(f, base) {
    const pts = f.series[0].pts;
    const parsed = pts.map((p) => {
      const of = /([\d.]+)% of ([\d,]+)/.exec(p.l || "");
      return { ...p, total: of ? +of[2].replace(/,/g, "") : null };
    });
    const hasCounts = parsed.every((p) => p.total != null);
    const sorted = pts.every((p, i) => !i || pts[i - 1].y >= p.y);
    return { h: pts.length * 30 + 14 + AXIS_H, build(s, ui) {
      let view = "share", order = "hq";
      const rows = () => {
        const L = parsed.map((p) => {
          const v = view === "count" ? p.y * p.total : p.y;
          const text = view === "count" ? `${fmt(Math.round(p.y * p.total))} of ${fmt(p.total)}` : (p.l || num(p.y));
          return { n: p.x, v, text, ink: inkFor(p.x, base) };
        });
        return order === "size" ? L.sort((a, b) => b.v - a.v) : L;
      };
      // the darkest row starts on the biggest value
      rowsChart(s, ui, { rows, axis: f.axis, start: parsed.reduce((b, p, i) => (p.y > parsed[b].y ? i : b), 0) });
    } };
  }

  // ---------- columns: categories or days ----------
  function columns(f, base) {
    const pts = f.series[0].pts;
    const dated = isDate(pts[0].x);
    if (pts.every((p) => /[\d.]+% of [\d,]+/.test(p.l || ""))) return parts(f, base);
    // a handful of categories reads better as full-width rows than as a few lonely columns
    if (!dated && pts.length <= 6) return hbar(f, base);
    return { h: 232, build(s, ui) {
      let sel = pts.reduce((b, p, i) => (p.y > pts[b].y ? i : b), 0), mode = "each";
      const GX = 40, BASE = 182, n = pts.length, X = GX + 4, cw = (W - X - 2) / n;
      const vals = () => {
        let run = 0;
        return pts.map((p) => { run += p.y; return mode === "sum" ? run : p.y; });
      };
      const fmtV = (v, p) => (mode === "sum" || !p.l ? num(v) : p.l);
      s.paint(() => {
        const V = vals(), max = Math.max(...V) || 1;
        if (f.axis) s.label(2, 14, f.axis[0], { cls: "mono" });
        // the day in focus is written in one fixed place, so nothing on the axis moves
        if (dated) s.label(W - 2, 14, `${dayLabel(pts[sel].x)}: ${fmtV(V[sel], pts[sel]).replace(/ \(.*/, "")}`, { anchor: "end", cls: "strong" });
        const step = niceStep(max);
        s.hgrid(GX, W - 2, [0, 1, 2, 3, 4, 5].map((k) => k * step).filter((v) => v <= max), (v) => BASE - v / max * 138, TICK[f.axis ? f.axis[1] : "n"]);
        pts.forEach((p, i) => {
          const h = V[i] / max * 138, x = X + i * cw, on = i === sel;
          const ink = inkFor(f.series[0].name, base);
          s.rect(Math.round(x + cw * 0.14), Math.round(BASE - h), Math.round(cw * 0.72), Math.max(2, Math.round(h)), ink, { color: on ? accent(ink) : T.ref });
          s.label(x + cw / 2, BASE - 6 - h, fmtV(V[i], p).replace(/ \(.*/, ""), { anchor: "middle", cls: on ? "strong" : "tiny" });
          // a note from the data sits beside its bar, reading leftwards when the bar is near the edge
          const note = (f.ann || []).find((q) => q.x === p.x);
          if (note) {
            const right = x + cw / 2 > W * 0.6;
            s.label(right ? x - 6 : x + cw + 6, BASE - h + 14, note.t, { anchor: right ? "end" : "start", cls: "dim" });
          }
          const name = dayLabel(p.x);
          // day labels stay put: as many as fit without touching, whichever bar is in focus
          if (dated) {
            const lw = s.measure("oct 30", { cls: "tiny" }) + 8, every = Math.max(1, Math.ceil(lw / cw));
            if (i % every === 0) s.label(x + cw / 2, BASE + 18, name, { anchor: "middle", cls: "tiny", fill: on ? "#262323" : null });
          }
          else wrap(name, Math.round(cw / 6.2)).forEach((t, j) => s.label(x + cw / 2, BASE + 18 + j * 13, t, { anchor: "middle", cls: "tiny", fill: on ? "#262323" : null }));
        });
      });
      const read = () => {
        const p = pts[sel], a = f.ann.find((q) => q.x === p.x);
        ui.read(`<b>${dayLabel(p.x)}:</b> ${mode === "sum" ? `${num(vals()[sel])} so far` : p.l || num(p.y)}${a ? `. ${a.t}.` : "."}`);
      };
      pts.forEach((p, i) => {
        const go = () => { sel = i; s.redraw(); read(); };
        s.spot(X + i * cw, 0, cw, 232, { label: dayLabel(p.x), enter: go, click: go });
      });
      read();
    } };
  }

  // ---------- lines over days ----------
  function lines(f, base) {
    const S = f.series, days = S[0].pts.map((p) => p.x);
    return { h: 250, build(s, ui) {
      let sel = days.length - 2;
      const X0 = 34, X1 = W - 12 - Math.ceil(Math.max(...S.map((q) => s.measure(q.name, { cls: "strong" })))), Y0 = 212, H = 188;
      const max = Math.max(...S.flatMap((q) => q.pts.map((p) => p.y))) * 1.08;
      const px = (i) => X0 + i / (days.length - 1) * (X1 - X0), py = (v) => Y0 - v / max * H;
      // the series the title is about is in colour; the one it's read against is grey
      const color = (q) => (q.hi ? accent(base) : T.refDot);
      s.paint(() => {
        if (f.axis) s.label(2, 12, f.axis[0], { cls: "mono" });
        s.hgrid(X0, X1, [0, 0.2, 0.4].filter((v) => v < max), py, (v) => `${Math.round(v * 100)}%`);
        days.forEach((d, i) => { if (i % 3 === 0) { s.ibeam(px(i), Y0 + 3); s.label(px(i), Y0 + 22, dayLabel(d), { anchor: "middle", cls: "tiny" }); } });
        s.guide(px(sel), Y0 - H, px(sel), Y0);
        for (const q of [...S].sort((a, b) => (a.hi ? 1 : 0) - (b.hi ? 1 : 0))) {
          const d = q.pts.map((p, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(p.y).toFixed(1)}`).join("");
          s.wire(d, "k", { color: color(q), w: q.hi ? 2.5 : 2 });
        }
        S.forEach((q) => {
          const last = q.pts[q.pts.length - 1];
          s.label(X1 + 8, py(last.y) + 4, q.name, { cls: q.hi ? "strong" : "dim" });
          s.node(px(sel), py(q.pts[sel].y), 4.5, "k", { color: color(q), knock: 3 });
        });
      });
      const read = () => ui.read(`<b>${dayLabel(days[sel])}:</b> ${S.map((q) => `${q.name} ${(q.pts[sel].y * 100).toFixed(0)}%`).join(", ")}.`);
      days.forEach((d, i) => {
        const go = () => { sel = i; s.redraw(); read(); };
        const cw = (X1 - X0) / (days.length - 1);
        s.spot(px(i) - cw / 2, 0, cw, 250, { label: dayLabel(d), enter: go, click: go });
      });
      read();
    } };
  }

  // ---------- parts of wholes: "x% of N" or "(x of N)" ----------
  // Each group is a bar as long as the group is big; the dark part is the share that got through.
  // o.whole and o.part name the two shades in the key.
  function parts(f, base, o = {}) {
    const P = f.series[0].pts.map((p) => {
      const of = /\(([\d,]+) of ([\d,]+)\)/.exec(p.l);
      if (of) {
        const hit = +of[1].replace(/,/g, ""), total = +of[2].replace(/,/g, "");
        return { name: p.x, total, hit, pct: (/^[\d.]+%/.exec(p.l) || [""])[0] };
      }
      const m = /([\d.]+)% of ([\d,]+)/.exec(p.l);
      const total = +m[2].replace(/,/g, "");
      return { name: p.x, total, hit: Math.round(+m[1] / 100 * total), pct: `${m[1]}%` };
    });
    const RH = 36;
    return { h: P.length * RH + 34 + AXIS_H, build(s) {
      const max = Math.max(...P.map((p) => p.total));
      const text = (p) => `${fmt(p.hit)} of ${fmt(p.total)}${o.pct && p.pct ? ` · ${p.pct}` : ""}`;
      const X = Math.min(240, Math.ceil(Math.max(...P.map((p) => s.measure(p.name)))) + 12);
      const BW = Math.min(...P.map((p) => (W - X - 10 - Math.ceil(s.measure(text(p), { cls: "tiny" })) - 2) / (p.total / max)));
      const ink = inkFor(f.series[0].name, base);
      const whole = o.whole || f.series[0].name.toLowerCase();
      const part = o.part || ((/share (?:where|that|of them where) (.*)$/i.exec(f.sub || "") || [])[1] || "the share in the title").replace(/^Peter /, "peter ");
      s.paint(() => {
        // the key starts over the bars, or at the left edge when it would run off the right
        const lw = [whole, part].reduce((a, t) => a + 13 + s.measure(t, { cls: "mono" }) + 20, -20);
        s.legend([[whole, T.ref], [part, accent(ink)]], X + lw > W - 2 ? 2 : X, 14);
        xAxis(s, X, BW, max, 28, 30 + P.length * RH, fmt, o.axis);
        P.forEach((p, i) => {
          const y = 30 + i * RH, w = p.total / max * BW;
          s.label(X - 10, y + 16, p.name, { anchor: "end" });
          s.rect(X, y + 4, Math.max(2, w), RH - 14, ink, { color: T.ref });
          if (p.hit) s.rect(X, y + 4, Math.max(2, p.hit / max * BW), RH - 14, ink, { color: accent(ink), corners: p.hit === p.total ? [1, 1, 1, 1] : [1, 0, 0, 1] });
          s.label(X + w + 8, y + 16, text(p), { cls: "tiny" });
        });
      });
    } };
  }

  // ---------- one strip of ordered buckets, with the title's claim bracketed ----------
  // The buckets run in order along one bar, darkest first. o.lead buckets are bracketed with o.note;
  // a bucket named "no …" is set apart in grey at the end.
  function strip(f, base, o = {}) {
    const pts = f.series[0].pts;
    const count = (p) => { const m = /\((\d[\d,]*)\)/.exec(p.l || ""); return m ? +m[1].replace(/,/g, "") : p.y; };
    const B = pts.map((p) => ({ name: p.x.toLowerCase(), n: count(p), pct: (/^[\d.]+%/.exec(p.l || "") || [""])[0], rest: /^no /i.test(p.x) }));
    return { h: 150 + (o.axis ? AXIS_H : 0), build(s) {
      const total = B.reduce((a, b) => a + b.n, 0);
      const X0 = 2, X1 = W - 2, Y = 52, H = 38;
      const ink = inkFor(f.series[0].name, base);
      const ordered = B.filter((b) => !b.rest).length;
      // dark to light along the order, so "sooner" reads as "stronger"
      const shade = (i) => {
        const c0 = Riso.INK[ink].strong, c1 = Riso.INK[ink].edge;
        const u = ordered > 1 ? i / (ordered - 1) : 0;
        const rgb = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
        const a = rgb(c0), b = rgb(c1);
        return "#" + a.map((v, k) => Math.round(v + (b[k] - v) * u).toString(16).padStart(2, "0")).join("");
      };
      let x = X0;
      const segs = B.map((b, i) => { const w = b.n / total * (X1 - X0); const g = { ...b, i, x, w }; x += w; return g; });
      s.paint(() => {
        // the bracket over the lead buckets, with the claim
        if (o.lead) {
          const end = segs[o.lead - 1].x + segs[o.lead - 1].w;
          s.wire(`M${X0 + 1},${Y - 6}V${Y - 11}H${end - 1}V${Y - 6}`, "k", { color: T.sub, w: 1, cap: "butt" });
          s.label(X0, Y - 19, o.note, { cls: "strong" });
        }
        // a scale along the strip, and the key moves down to clear it
        const KY = Y + H + (o.axis ? AXIS_H - 4 : 0);
        if (o.axis) o.counts
          ? xAxis(s, X0, X1 - X0, total, Y + H + 1, Y + H + 5, fmt, o.axis)
          : xAxis(s, X0, X1 - X0, total, Y + H + 1, Y + H + 5, (v) => `${Math.round(v / total * 100)}%`, o.axis, total / 4);
        const val = (g) => (o.counts ? fmt(g.n) : g.pct || fmt(g.n));
        const light = (g) => g.rest || g.i >= ordered / 2;
        for (const g of segs) {
          s.rect(g.x, Y, Math.max(1.5, g.w), H, ink, { color: g.rest ? T.ref : shade(g.i), corners: [+(g.i === 0), +(g.i === segs.length - 1), +(g.i === segs.length - 1), +(g.i === 0)] });
          // the value sits in its bucket when there's room
          if (g.w > s.measure(val(g), { cls: "strong" }) + 12) s.label(g.x + g.w / 2, Y + H / 2 + 5, val(g), { anchor: "middle", cls: "strong", fill: light(g) ? "#262323" : "#fbfbf8" });
        }
        // a key underneath, one column per bucket, in the same order
        const cw = (X1 - X0) / segs.length;
        segs.forEach((g, k) => {
          const kx = X0 + k * cw;
          s.mark(0, kx + 5, KY + 21, 4.5, ink, { color: g.rest ? T.ref : shade(g.i) });
          s.label(kx + 16, KY + 25, val(g), { cls: "strong" });
          s.label(kx, KY + 43, g.name, { cls: "tiny" });
        });
      });
    } };
  }

  // ---------- two values compared: Tinker's reference bar, result bar, guide and bracket ----------
  function compare(f, base) {
    const P = f.series[0].pts;
    return { h: 230, build(s) {
      const ink = inkFor(f.series[0].name, base);
      const [res, ref] = P[0].y >= P[1].y ? [P[0], P[1]] : [P[1], P[0]];
      const max = res.y * 1.18, Y0 = 186, H = 160;
      const y = (v) => Y0 - v / max * H;
      const GX = 48, BW = 104;
      const xRef = 150, xRes = 330;
      const step = niceStep(max);
      const ratio = res.y / ref.y;
      s.paint(() => {
        if (f.axis) s.label(2, 12, f.axis[0], { cls: "mono" });
        s.hgrid(GX, W - 2, [0, step, step * 2, step * 3].filter((v) => v <= max), y, (v) => (v < 1 ? `${Math.round(v * 100)}%` : fmt(v)));
        s.rect(xRef, y(ref.y), BW, Y0 - y(ref.y), "k", { color: T.ref });
        s.rect(xRes, y(res.y), BW, Y0 - y(res.y), ink, { color: accent(ink) });
        s.label(xRef + BW / 2, y(ref.y) - 8, ref.l || num(ref.y), { anchor: "middle", cls: "strong" });
        s.label(xRes + BW / 2, y(res.y) - 8, res.l || num(res.y), { anchor: "middle", cls: "strong" });
        // the reference carried across, and the gap between them written out
        s.guide(xRef + BW, y(ref.y), xRes + BW + 12, y(ref.y));
        s.bracket(xRes + BW + 12, y(res.y), y(ref.y), `${ratio.toFixed(1)}× as often`);
        const lab = (p, x) => wrap(p.x.toLowerCase(), 22).forEach((t, j) => s.label(x + BW / 2, Y0 + 20 + j * 15, t, { anchor: "middle", cls: "tiny" }));
        lab(ref, xRef);
        lab(res, xRes);
      });
    } };
  }

  // ---------- spend against revenue, as areas on one scale ----------
  function spendWall(f) {
    const get = (name) => f.series.find((q) => q.name === name).pts[0].y;
    const spend = get("Model spend"), revenue = get("Revenue"), share = get("Manager share of spend"), per = get("Spend per $1 of revenue");
    return { h: 210 + AXIS_H, build(s) {
      const X0 = 2, X1 = W - 2, H = 76, Y1 = 26, Y2 = Y1 + H + 46;
      const mw = (X1 - X0) * share, pw = (X1 - X0) - mw;
      const rw = (X1 - X0) * revenue / spend;
      s.paint(() => {
        xAxis(s, X0, X1 - X0, spend, Y1, Y2 + H, usdTick, "dollars");
        s.label(X0, Y1 - 10, `model spend at list price, $${fmt(Math.round(spend))}`, { cls: "dim" });
        s.rect(X0, Y1, pw, H, "b", { color: Riso.INK.b.mid, corners: [1, 0, 0, 1] });
        s.rect(X0 + pw, Y1, mw, H, "r", { color: Riso.INK.r.mid, corners: [0, 1, 1, 0] });
        s.label(X0 + 12, Y1 + 30, "peter and subagents", { cls: "strong" });
        s.label(X0 + 12, Y1 + 48, `$${fmt(Math.round(spend - spend * share))}`, { cls: "strong" });
        s.label(X0 + pw + 12, Y1 + 30, "manager", { cls: "strong" });
        s.label(X0 + pw + 12, Y1 + 48, `$${fmt(Math.round(spend * share))} · ${Math.round(share * 100)}%`, { cls: "strong" });
        s.label(X0, Y2 - 10, `revenue, on the same scale, $${fmt(revenue)}`, { cls: "dim" });
        s.rect(X0, Y2, Math.max(2, rw), H, "k", { color: "#262323" });
        s.label(X0 + 18, Y2 + 44, `$${fmt(Math.round(per))}`, { cls: "huge" });
        s.label(X0 + 18 + s.measure(`$${fmt(Math.round(per))}`, { cls: "huge" }) + 10, Y2 + 44, "of model spend for every $1 earned", { cls: "dim" });
      });
    } };
  }

  // ---------- before and after, as dumbbell rows ----------
  function slope(f, base) {
    const S = f.series;
    const RH = 32;
    return { h: S.length * RH + 66, build(s) {
      const all = S.flatMap((q) => q.pts.map((p) => p.y));
      const hiV = Math.max(...all), loV = Math.min(...all);
      const zoom = hiV <= 1.2 && loV > hiV * 0.5;
      const step = zoom ? 0.05 : 0.25;
      const min = zoom ? Math.floor((loV - 0.03) / step) * step : 0;
      const max = zoom ? Math.ceil((hiV + 0.03) / step) * step : hiV * 1.08;
      const LX = Math.min(260, Math.max(...S.map((q) => q.name.length)) * CH + 10), X0 = LX + 14, X1 = W - 120;
      const x = (v) => X0 + (v - min) / (max - min) * (X1 - X0);
      const [A, B] = S[0].pts.map((p) => nice(p.x).toLowerCase());
      s.paint(() => {
        const ink = inkFor(S[0].name, base);
        // before is grey, after is in colour, the way Tinker draws a reference against a result
        s.legend([[A, T.refDot], [B, accent(ink)]], 2, 14);
        if (f.axis) s.label(W - 4, 14, f.axis[0], { anchor: "end", cls: "mono" });
        if (max <= 1.2) for (let t = min; t <= max + 1e-9; t += step) {
          s.rect(x(t), 42, 1, S.length * RH + 2, "k", { color: T.grid, bg: true });
          s.label(x(t), 38, `${Math.round(t * 100)}%`, { anchor: "middle", cls: "tiny" });
        }
        S.forEach((q, i) => {
          const y = 58 + i * RH, [a, b] = q.pts, k = inkFor(q.name, base);
          s.label(LX, y + 4, q.name.toLowerCase(), { anchor: "end", cls: q.hi ? "strong" : "" });
          s.wire(`M${x(a.y).toFixed(1)},${y}H${x(b.y).toFixed(1)}`, "k", { color: accent(k), w: 2, fade: 0.45 });
          s.node(x(a.y), y, 5.5, "k", { color: T.refDot, knock: 3 });
          s.node(x(b.y), y, 5.5, "k", { color: accent(k), knock: 3 });
          s.label(W - 4, y + 4, `${a.l} → ${b.l}`, { anchor: "end", cls: q.hi ? "strong" : "dim" });
        });
      });
    } };
  }

  // ---------- stacked rows, with a colour key ----------
  function stacked(f) {
    const S = f.series, cats = S[0].pts.map((p) => p.x);
    const INKS = ["b", "k", "y", "r", "by", "br", "ry"];
    return { h: cats.length * 40 + 58 + AXIS_H, build(s) {
      let sel = null;
      const X = 196, BW = W - X - 12, KY = 14;
      // the key wraps onto as many lines as it needs
      const key = [];
      { let kx = 0, ky = KY; S.forEach((q, j) => { const w = q.name.length * 7 + 30; if (kx + w > W) { kx = 0; ky += 20; } key.push({ j, x: kx, y: ky, n: q.name.toLowerCase() }); kx += w; }); }
      const top = key[key.length - 1].y + 18;
      s.paint(() => {
        key.forEach(({ j, x, y, n }) => {
          s.rect(x, y - 9, 12, 10, INKS[j], { thin: sel == null || sel === j ? 1 : 3 });
          s.label(x + 17, y, n, { cls: "dim", fill: sel === j ? "#262323" : null });
        });
        if (f.axis) xAxis(s, X, BW, 1, top, top + cats.length * 40, pctTick, f.axis[0], 0.25);
        cats.forEach((c, i) => {
          const y = top + i * 40;
          s.label(X - 10, y + 19, c.toLowerCase(), { anchor: "end" });
          let x = X;
          const shown = S.map((q, j) => (q.pts[i].y * BW >= 1 ? j : -1)).filter((j) => j >= 0);
          S.forEach((q, j) => {
            const v = q.pts[i].y, w = v * BW;
            if (w < 1) return;
            // neighbours share an edge: both ends of it come from the same running total
            const first = +(j === shown[0]), last = +(j === shown[shown.length - 1]);
            s.rect(Math.round(x), y + 4, Math.max(2, Math.round(x + w) - Math.round(x)), 24, INKS[j], { thin: sel == null || sel === j ? 1 : 3, k: 0.3, p: 3, corners: [first, last, last, first] });
            if (w > 38) s.label(x + w / 2, y + 20, `${Math.round(v * 100)}%`, { anchor: "middle", cls: "tiny" });
            x += w;
          });
        });
      });
      key.forEach(({ j, x, y, n }) => {
        const go = () => { if (sel !== j) { sel = j; s.redraw(); } };
        s.spot(x - 2, y - 13, n.length * 7 + 24, 18, { label: n, enter: go, click: go });
      });
      s.svg.addEventListener("pointerleave", () => { if (sel != null) { sel = null; s.redraw(); } });
    } };
  }

  // ---------- big numbers ----------
  function big(f) {
    const S = f.series;
    return { h: 142, build(s, ui) {
      let sel = 0;
      const cw = W / S.length;
      const value = (q) => { const p = q.pts[0]; return (p.l || num(p.y)).replace(/ calls$/, ""); };
      // each group is as wide as its number or its label, and the groups spread to fill the row
      const groups = S.map((q) => {
        const v = value(q), size = Math.min(62, (cw - 16) / (v.length * 0.62));
        const lines = wrap(q.pts[0].x.toLowerCase(), Math.round(cw / 7));
        return { v, size, lines, w: Math.max(s.measureBig(v, size), ...lines.map((t) => s.measure(t, { cls: "dim" }))) };
      });
      const gap = (W - 4 - groups.reduce((a, g) => a + g.w, 0)) / Math.max(1, S.length - 1);
      let gx = 2;
      const xs = groups.map((g) => { const x = gx; gx += g.w + gap; return x; });
      s.paint(() => {
        groups.forEach(({ v, size, lines }, i) => {
          // the picked number goes dark; dollars are a real outcome
          s.text(v, xs[i], 74, i === sel ? "b" : "k", { size, weight: 700 });
          lines.forEach((t, j) => s.label(xs[i] + 2, 104 + j * 15, t, { cls: "dim", fill: i === sel ? T.ink : null }));
        });
      });
      const read = () => ui.read(`<b>${S[sel].pts[0].x}:</b> ${value(S[sel])}.`);
      S.forEach((q, i) => {
        const go = () => { sel = i; s.arm(); s.redraw(); read(); };
        s.spot(Math.max(0, xs[i] - gap / 2), 0, groups[i].w + gap, 142, { label: q.name, enter: go, click: go });
      });
      read();
    } };
  }

  // ---------- one figure per remaining finding ----------
  const MODEL = { "claude-opus-5-5": "claude opus 5.5", "gpt-6-astra": "gpt-6 astra", "claude-haiku-5-5": "claude haiku 5.5", "gpt-6.1-sol": "gpt-6.1 sol", "claude-sonnet-5-5": "claude sonnet 5.5" };
  const modelInk = (m) => (m.startsWith("gpt") ? "r" : "b");
  const big4 = (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)}b` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}m` : fmt(n));
  // a round step for a scale: 1, 2 or 5 times a power of ten, giving about three gridlines
  const niceStep = (max) => {
    const raw = max / 3, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : 5) * p;
  };
  function stackedDays(s, ui, cfg) {
    const GX = 44, n = cfg.days.length, X = GX + 4, cw = (W - X - 2) / n, TOP = 30;
    let sel = null;
    s.paint(() => {
      const L = cfg.layers();
      const tot = cfg.days.map((_, i) => L.reduce((a, l) => a + l.v[i], 0));
      const max = Math.max(...tot) || 1;
      // the key, with the day's total on the right
      s.legend(L.map((l) => [l.name, l.color || accent(l.ink)]), 2, 15);
      const pick = sel ?? tot.indexOf(Math.max(...tot));
      s.label(W - 2, 15, `${dayLabel(cfg.days[pick])}: ${cfg.fmt(tot[pick])}`, { anchor: "end", cls: "strong" });
      // a light scale behind the columns
      const step = cfg.step || niceStep(max);
      s.hgrid(GX, W - 2, [0, step, step * 2, step * 3].filter((v) => v <= max), (v) => TOP + 160 - v / max * 150, cfg.tick || ((v) => cfg.fmt(v)));
      cfg.days.forEach((d, i) => {
        let y = TOP + 160;
        const shown = L.filter((l) => l.v[i] / max * 150 >= 1);
        L.forEach((l) => {
          const h = l.v[i] / max * 150;
          const c = l.color || accent(l.ink);
          const bottom = +(l === shown[0]), top = +(l === shown[shown.length - 1]);
          if (h >= 1) s.rect(Math.round(X + i * cw + 3), Math.round(y - h), Math.round(cw - 6), Math.round(y) - Math.round(y - h), l.ink, { color: c, fade: sel == null || i === sel ? 1 : 0.35, corners: [top, top, bottom, bottom] });
          y -= h;
        });
        // day labels every third day, whichever day is in focus; its date is written in the corner
        if (i % 3 === 0) {
          s.ibeam(X + i * cw + cw / 2, TOP + 162, { color: i === pick ? T.ink : T.axis });
          s.label(X + i * cw + cw / 2, TOP + 181, dayLabel(d), { anchor: "middle", cls: "tiny", fill: i === pick ? "#262323" : null });
        }
      });
    });
    cfg.days.forEach((d, i) => {
      const go = () => { if (sel !== i) { sel = i; s.redraw(); } };
      s.spot(X + i * cw, TOP, cw, 190, { label: dayLabel(d), enter: go, click: go });
    });
    s.svg.addEventListener("pointerleave", () => { if (sel != null) { sel = null; s.redraw(); } });
    return { redraw: () => s.redraw() };
  }

  Riso.hq = { xAxis, AXIS_H, pctTick, usdTick, compare, niceStep, accent, parts, strip, spendWall, HQ, W, dayLabel, isDate, OUTCOME, nice, num, CH, inkFor, wrap, rowsChart, hbar, columns, lines, slope, stacked, big, MODEL, modelInk, big4, stackedDays };
})();
