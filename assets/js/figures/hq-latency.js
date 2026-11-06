// Figure "hq-latency", placed in index.html as <figure data-rf="hq-latency"></figure>.
// Model latency, median and 95th percentile, by model.
// Uses the shared HQ chart types in charts/hq.js. See figures/README.md.
(() => {
  const { fig } = Riso;
  const { HQ, MODEL, modelInk, xAxis, AXIS_H } = Riso.hq;

  fig("hq-latency", {
    w: Riso.hq.W,
    h: 196 + AXIS_H,
    title: "How long each model took to answer",
    alt: "Model latency by model. GPT-6.1 Sol: median 25.8 s, 95th percentile 104.3 s. GPT-6 Astra: 7.8 s and 75.2 s. Claude Haiku 5.5: 4.9 s and 15.2 s. Claude Opus 5.5: 4.3 s and 11.0 s. Claude Sonnet 5.5: 3.1 s and 6.4 s.",
    minWidth: 480,
  }, (s) => {
    const W = Riso.hq.W;
    const rows = [...HQ.latency].sort((a, b) => b.p95 - a.p95);
    const secs = (v) => `${(v / 1000).toFixed(1)} s`;
    const X = Math.ceil(Math.max(...rows.map((r) => s.measure(MODEL[r.model])))) + 12;
    const max = Math.max(...rows.map((r) => r.p95));
    const BW = W - X - 10 - Math.ceil(s.measure("25.8 s", { cls: "strong" }) + s.measure("· 104.3 s", { cls: "tiny" })) - 10;
    const RH = 32;
    s.paint(() => {
      // key
      s.rect(2, 6, 10, 10, "b", { color: Riso.INK.b.strong });
      s.label(18, 15, "median", { cls: "mono" });
      s.rect(88, 6, 10, 10, "b", { color: Riso.INK.b.edge });
      s.label(104, 15, "95th percentile", { cls: "mono" });
      xAxis(s, X, BW, max, 32, 34 + rows.length * RH, (v) => `${v / 1000} s`, "seconds per call", 20000);
      rows.forEach((r, i) => {
        const y = 34 + i * RH, ink = modelInk(r.model);
        s.label(X - 10, y + 15, MODEL[r.model], { anchor: "end" });
        s.rect(X, y + 3, r.p95 / max * BW, RH - 12, ink, { color: Riso.INK[ink].edge });
        s.rect(X, y + 3, Math.max(2, r.p50 / max * BW), RH - 12, ink, { color: Riso.INK[ink].strong });
        // both numbers sit after the bar: the median dark, the 95th percentile pale
        const t = s.label(X + r.p95 / max * BW + 8, y + 15, secs(r.p50), { cls: "strong" });
        s.label(X + r.p95 / max * BW + 8 + t.getComputedTextLength() + 6, y + 15, `· ${secs(r.p95)}`, { cls: "tiny" });
      });
    });
  });
})();
