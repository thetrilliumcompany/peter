// Figure "hq-daily-spend", placed in index.html as <figure data-rf="hq-daily-spend"></figure>.
// Daily model spend for Peter and the Manager from October 19 to November 3.
// Uses the shared HQ chart types in charts/hq.js. See figures/README.md.
(() => {
  const { fig, fmt } = Riso;
  const { HQ, stackedDays } = Riso.hq;

  fig("hq-daily-spend", {
    w: Riso.hq.W,
    h: 210,
    title: "Model spend per day",
    sub: "API list price. Subscriptions paid for this in practice, so these are estimates.",
    alt: "Daily model spend for Peter and the Manager from October 19 to November 3.",
    minWidth: 480,
  }, (s, ui) => {
    stackedDays(s, ui, { days: HQ.daily.days, fmt: (v) => `$${fmt(Math.round(v))}`, layers: () => [
      { name: "peter and subagents", ink: "b", v: HQ.daily.peterCost },
      { name: "the manager", ink: "r", v: HQ.daily.managerCost },
    ], step: 200, tick: (v) => `$${v}` });
  });
})();
