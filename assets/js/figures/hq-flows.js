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
    const CX = [0, 150, 336, 500];
    const NW = 10, TOP = 30, H = 430;
    // Only the biggest blocks keep their own name; the long tail of small ones joins "other",
    // so the picture shows the main roads instead of a hundred hairlines.
    const KEEP = [2, 7, 6, 3];
    const raw = HQ.flows.map(([a, t, st, o, n]) => ({ v: [a, t, st, o], n }));
    const biggest = KEEP.map((k, c) => {
      const m = new Map();
      for (const f of raw) m.set(f.v[c], (m.get(f.v[c]) || 0) + f.n);
      return new Set([...m].sort((a, b) => b[1] - a[1]).filter(([key]) => !/^(other|no_storyline)$/.test(key)).slice(0, k).map(([key]) => key));
    });
    const merged = new Map();
    for (const f of raw) {
      const v = f.v.map((x, c) => (biggest[c].has(x) ? x : "other"));
      merged.set(v.join("|"), (merged.get(v.join("|")) || 0) + f.n);
    }
    const tuples = [...merged].map(([k, n]) => ({ v: k.split("|"), n }));
    const nodesAt = (c) => {
      const m = new Map();
      for (const f of tuples) m.set(f.v[c], (m.get(f.v[c]) || 0) + f.n);
      // biggest first, "other" always last
      return [...m].sort((a, b) => (a[0] === "other") - (b[0] === "other") || b[1] - a[1]);
    };
    const NODES = STAGES.map((_, c) => nodesAt(c));
    const totalRuns = tuples.reduce((a, f) => a + f.n, 0);
    const GAP = 10;
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
        const t = Math.max(y + Math.min(h, 34) / 2 + 4, last + 30);
        out.set(k, t); last = t;
      }
      return out;
    });
    s.paint(() => {
      STAGES.forEach((n, c) => s.label(CX[c], 14, n, { cls: "mono" }));
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
          if (l.n < (filter ? 1 : 12)) continue;
          s.ribbon(CX[c] + NW, CX[c + 1], l.y0, l.y1, Math.max(0.8, l.w), l.ag === "peter" ? "b" : "r", { opacity: filter ? 0.4 : 0.24 });
        }
      }
      NODES.forEach((col, c) => col.forEach(([k]) => {
        const [y, h] = pos[c].get(k);
        const on = filter && filter[0] === c && filter[1] === k;
        // nodes are neutral tiles; the picked one goes dark, the ribbons carry who
        s.rect(CX[c], Math.round(y), NW, Math.max(3, Math.round(h)), "k", { color: on ? T.ink : "#8a8a84" });
        // the name, and under it how many runs went through, on a halo so the ribbons don't cut through
        const ly = labelY[c].get(k), n = col.find((q) => q[0] === k)[1];
        s.label(CX[c] + NW + 7, ly - 3, nice(k), { cls: on ? "strong" : "" }).classList.add("halo");
        s.label(CX[c] + NW + 7, ly + 12, `${fmt(Math.round(n))} runs`, { cls: "mono" }).classList.add("halo");
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
      s.spot(CX[c] - 4, top - 4, 150, bottom - top + 22, { label: nice(k), click: go });
    }));
    read();
  });
})();
