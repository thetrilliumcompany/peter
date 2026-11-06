// Figure "hq-flows", placed in index.html as <figure data-rf="hq-flows"></figure>.
// A flow diagram from agent to trigger to storyline to outcome for every analysed run.
// Uses the shared HQ chart types in charts/hq.js. See figures/README.md.
(() => {
  const { fig, fmt, T } = Riso;
  const { HQ, nice } = Riso.hq;

  fig("hq-flows", {
    w: Riso.hq.W,
    h: 560,
    title: "Every run: who ran, what started it, what it was about, how it ended",
    sub: "Blue is Peter, red the Manager. Click a block to see only the runs through it.",
    alt: "A flow diagram from agent to trigger to storyline to outcome for every analysed run.",
    minWidth: 480,
  }, (s, ui) => {
    let filter = null;
    const STAGES = ["agent", "trigger", "storyline", "outcome"];
    const CX = [6, 140, 328, 522];
    const NW = 14, TOP = 26, H = 452;
    const tuples = HQ.flows.map(([a, t, st, o, n]) => ({ v: [a, t, st, o], n }));
    const nodesAt = (c) => {
      const m = new Map();
      for (const f of tuples) m.set(f.v[c], (m.get(f.v[c]) || 0) + f.n);
      return [...m].sort((a, b) => b[1] - a[1]);
    };
    const NODES = STAGES.map((_, c) => nodesAt(c));
    const totalRuns = tuples.reduce((a, f) => a + f.n, 0);
    const GAP = 5;
    const scale = Math.min(...NODES.map((col) => (H - GAP * (col.length - 1)) / totalRuns));
    const pos = NODES.map((col) => {
      let y = TOP; const out = new Map();
      for (const [k, n] of col) { const h = Math.max(3, n * scale); out.set(k, [y, h]); y += h + GAP; }
      return out;
    });
    // small blocks sit close together, so their labels get pushed apart
    const labelY = NODES.map((col, c) => {
      let last = -99; const out = new Map();
      for (const [k] of col) {
        const [y, h] = pos[c].get(k);
        const t = Math.max(y + Math.min(h, 22) / 2 + 4, last + 12.5);
        out.set(k, t); last = t;
      }
      return out;
    });
    s.paint(() => {
      STAGES.forEach((n, c) => s.label(CX[c], 14, n, { cls: "mono" }));
      // the scale: how tall a block or ribbon is for 500 runs
      const SY = TOP + H + 16, SH = 500 * scale;
      s.rect(CX[0], SY, NW, SH, "k", { color: "#a9a8a4" });
      s.label(CX[0] + NW + 6, SY + SH / 2 + 4, "height of 500 runs", { cls: "mono" });
      const live = filter ? tuples.filter((f) => f.v[filter[0]] === filter[1]) : tuples;
      for (let c = 0; c < 3; c++) {
        const links = new Map();
        for (const f of live) {
          const k = `${f.v[0]}|${f.v[c]}|${f.v[c + 1]}`;
          links.set(k, (links.get(k) || 0) + f.n);
        }
        const L = [...links].map(([k, n]) => { const [ag, a, b] = k.split("|"); return { ag, a, b, n, w: Math.max(0.6, n * scale) }; });
        // leave and enter each block in the order of the far end, which undoes most crossings
        const stackInto = (key, far, at, slot) => {
          const used = new Map();
          [...L].sort((p, q) => far(p) - far(q) || p.ag.localeCompare(q.ag)).forEach((l) => {
            const o = used.get(key(l)) || 0;
            used.set(key(l), o + l.w);
            l[slot] = at.get(key(l))[0] + o + l.w / 2;
          });
        };
        stackInto((l) => l.a, (l) => pos[c + 1].get(l.b)[0], pos[c], "y0");
        stackInto((l) => l.b, (l) => pos[c].get(l.a)[0], pos[c + 1], "y1");
        for (const l of L) {
          // the smallest paths only appear once a block is picked
          if (l.n < (filter ? 1 : 6)) continue;
          s.ribbon(CX[c] + NW, CX[c + 1], l.y0, l.y1, Math.max(0.8, l.w), l.ag === "peter" ? "b" : "r", { opacity: filter ? 0.42 : 0.3 });
        }
      }
      NODES.forEach((col, c) => col.forEach(([k]) => {
        const [y, h] = pos[c].get(k);
        const on = filter && filter[0] === c && filter[1] === k;
        // nodes are neutral tiles; the picked one goes dark, the ribbons carry who
        s.rect(CX[c], Math.round(y), NW, Math.max(3, Math.round(h)), "k", { color: on ? T.ink : "#a9a8a4" });
        s.label(CX[c] + NW + 6, labelY[c].get(k), nice(k), { cls: on ? "strong" : "tiny" });
      }));
    });
    const read = () => {
      if (!filter) { ui.read(`<b>All ${fmt(HQ.runs)} runs.</b> Click a block to isolate it.`); return; }
      const live = tuples.filter((f) => f.v[filter[0]] === filter[1]);
      const sum = live.reduce((a, f) => a + f.n, 0);
      const by = new Map();
      for (const f of live) by.set(f.v[3], (by.get(f.v[3]) || 0) + f.n);
      const parts = [...by].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${nice(k)} ${Math.round(n / sum * 100)}%`).join(", ");
      ui.read(`<b>${nice(filter[1])}: ${fmt(Math.round(sum))} runs.</b> Ended in ${parts}.`);
    };
    NODES.forEach((col, c) => col.forEach(([k]) => {
      const [y, h] = pos[c].get(k), ly = labelY[c].get(k);
      const top = Math.min(y, ly - 11), bottom = Math.max(y + h, ly + 3);
      const go = () => { filter = filter && filter[0] === c && filter[1] === k ? null : [c, k]; s.arm(); s.redraw(); read(); };
      s.spot(CX[c] - 4, top, 150, bottom - top, { label: nice(k), click: go });
    }));
    read();
  });
})();
