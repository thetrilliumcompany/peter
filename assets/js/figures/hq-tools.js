// Figure "hq-tools", placed in index.html as <figure data-rf="hq-tools"></figure>.
// Tool calls by tool: bash, web search and read lead, followed by eval, grep and write.
// Uses the shared HQ chart types in charts/hq.js. See figures/README.md.
(() => {
  const { fig, fmt } = Riso;
  const { HQ, rowsChart } = Riso.hq;

  fig("hq-tools", {
    w: Riso.hq.W,
    h: HQ.tools.length * 30 + 14 + Riso.hq.AXIS_H,
    title: "Tool calls by tool",
    alt: "Tool calls by tool: bash, web search and read lead, followed by eval, grep and write.",
    minWidth: 480,
  }, (s, ui) => {
    const secs = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${v} ms`);
    // calls as the bar; how long each took on average rides along in the label
    rowsChart(s, ui, { axis: ["calls", "n"], rows: () => HQ.tools.map((t) => ({ n: t.n, v: t.calls, text: `${fmt(t.calls)} · ${secs(t.ms)} avg`, ink: t.fake ? "k" : "b" })) });
  });
})();
