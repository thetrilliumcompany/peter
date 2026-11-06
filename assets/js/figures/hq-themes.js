// Figure "hq-themes", placed in index.html as <figure data-rf="hq-themes"></figure>.
// Twelve themes in the agents' moments with people, led by hang-ups, gatekeepers and warm leads.
// Uses the shared HQ chart types in charts/hq.js. See figures/README.md.
(() => {
  const { fig, fmt } = Riso;
  const { HQ, rowsChart } = Riso.hq;

  fig("hq-themes", {
    w: Riso.hq.W,
    h: HQ.themes.length * 30 + 14 + Riso.hq.AXIS_H,
    title: "What the agents' moments with people were about",
    alt: "Twelve themes in the agents' moments with people, led by hang-ups, gatekeepers and warm leads.",
    minWidth: 480,
  }, (s, ui) => {
    rowsChart(s, ui, { axis: ["moments", "n"], rows: () => HQ.themes.map((t) => ({ n: t.n, v: t.c, text: fmt(t.c), ink: "g", read: `<b>${t.n}, ${fmt(t.c)} moments.</b> ${t.s}` })) });
  });

  // ---------- the trends tab ----------
})();
