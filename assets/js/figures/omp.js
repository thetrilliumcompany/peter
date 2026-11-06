// Figure "omp", placed in index.html as <figure data-rf="omp"></figure>.
// Peter's session as a loop: when a turn ends with nothing queued, the goal is re-injected.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt, T } = Riso;

  fig("omp", {
    w: 600,
    h: 260,
    alt: "Peter's OMP session as a loop: he works through a turn and hands tasks to subagents, and when the turn ends goal mode sends him round again, 3,702 times by Nov 3. Up to eleven subagents ran at once, 1,385 in all.",
  }, (s, ui) => {
    const BUS = 172, RET = 96, Y = [74, 132, 190], SEAM = 300, POOL = 330;
    // eleven subagent slots, each part-way through its brief
    const lanes = Array.from({ length: 12 }, (_, i) => ({ t: (i * 0.37) % 1, dur: 0.7 + ((i * 7) % 5) * 0.18, dead: i === 11 }));
    let u = 0, last = 0;
    // the loop the marker travels: down the bus, back along the bottom, up the return path, across the top
    const LOOP = [[BUS, Y[0]], [BUS, Y[2]], [RET, Y[2]], [RET, Y[0]], [BUS, Y[0]]];
    const seg = LOOP.slice(1).map((p, i) => Math.hypot(p[0] - LOOP[i][0], p[1] - LOOP[i][1]));
    const total = seg.reduce((a, b) => a + b, 0);
    const at = (v) => {
      let d = v * total;
      for (let i = 0; i < seg.length; i++) {
        if (d <= seg[i]) { const k = d / seg[i]; return [LOOP[i][0] + (LOOP[i + 1][0] - LOOP[i][0]) * k, LOOP[i][1] + (LOOP[i + 1][1] - LOOP[i][1]) * k]; }
        d -= seg[i];
      }
      return LOOP[0];
    };
    s.paint(() => {
      s.legend([["peter's loop", Riso.INK.b.strong]], 0, 16, { mono: true });
      s.legend([["subagents", T.refDot]], POOL, 16, { mono: true });
      s.seam(SEAM, 34, SEAM, 226);
      // the loop: the turn runs down the bus, goal mode brings it back to the top
      s.wire(`M${BUS},${Y[0]}V${Y[2]}`, "b");
      s.wire(`M${BUS},${Y[2]}H${RET}V${Y[0]}H${BUS}`, "b", { arrow: 0.93 });
      s.label(RET - 10, Y[1] - 6, "goal", { anchor: "end", cls: "mono" });
      s.label(RET - 10, Y[1] + 12, "× 3,702", { anchor: "end", cls: "strong" });
      s.label(BUS + 14, Y[1] - 8, "task", { cls: "mono" });
      // handing work across to the subagents
      s.wire(`M${BUS},${Y[1]}H${POOL - 8}`, "b", { flow: { ms: 1800, n: 2 } });
      s.port(SEAM, Y[1], "b", true);
      s.rect(POOL - 8, 52, 2, 158, "b", { color: Riso.INK.b.strong });
      for (const y of Y) s.node(BUS, y, 5.5, "b");
      // the marker: where Peter is in his loop right now
      const [mx, my] = at(u);
      s.node(mx, my, 4, "k", { color: T.ink, knock: 3 });
      // the pool of subagents, each a tile with how far through its brief it is
      lanes.forEach((l, i) => {
        const x = POOL + (i % 4) * 68, y = 52 + Math.floor(i / 4) * 54;
        if (l.dead) { s.rect(x, y, 60, 46, "k", { color: T.bg }); s.frame(x, y, 60, 46, "k", { gap: 1 }); return; }
        s.rect(x, y, 60, 46, "k", { card: true, color: l.t > 0.94 ? Riso.INK.b.pale : T.cell });
        s.rect(x + 7, y + 7 + 32 * (1 - l.t), 5, Math.max(1, 32 * l.t), "b", { color: l.t > 0.94 ? Riso.INK.b.strong : Riso.INK.b.mid });
      });
      s.label(POOL, 232, "× 1,385", { cls: "strong" });
    });
    ui.whileVisible((t) => {
      if (t - last < 50) return;
      const step = last ? (t - last) / 1000 : 0;
      last = t;
      u += step * 0.16;
      if (u >= 1) u -= 1;
      for (const l of lanes) { if (l.dead) continue; l.t += step * 0.1 / l.dur; if (l.t > 1) l.t = 0; }
      s.redraw();
    });
  });
})();
