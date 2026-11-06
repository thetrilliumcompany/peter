// Figure "ledger", placed in index.html as <figure data-rf="ledger"></figure>.
// Peter writes bets, journal, plan, tasks and blockers through peterctl into one ledger.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  const ROWS = [["bets", "25 live"], ["journal", "3,058 rows"], ["plan", "next few hours"], ["tasks", "141"], ["blockers", "68"]];
  const READERS = [["manager review", "r"], ["idle nudge", "y"], ["peter, restarted", "b"], ["dashboard · hq", "k"]];
  fig("ledger", {
    w: 600,
    h: 290,
    alt: "Peter writes his bets, journal, plan, tasks and blockers into one ledger, runtime.db, only through peterctl. Four readers use the same rows: the Manager's review reads the bets, plan and journal; an idle nudge reads the bets; a restarted Peter reads his bets back; and the dashboard and HQ read everything. Counts on Nov 3.",
  }, (s) => {
    const SEAM = 132, LX = 160, LW = 220, RH = 42, LY = 44, RX = 440;
    const color = (ink) => (ink === "k" ? T.ink : ink === "y" ? Riso.INK.y.strong : Riso.INK[ink].strong);
    const pale = (ink) => (ink === "k" ? T.cell : Riso.INK[ink].pale);
    s.paint(() => {
      s.legend([["peter", Riso.INK.b.strong]], 0, 16, { mono: true });
      s.legend([["peterctl", Riso.INK.g.strong]], SEAM - 34, 16, { mono: true });
      s.label(LX + 54, 16, "runtime.db", { cls: "mono" });
      s.label(RX, 16, "who reads it", { cls: "mono" });
      s.seam(SEAM, 34, SEAM, 252);
      // Peter, and the only way into the ledger
      const PY = LY + 2 * RH + 17;
      s.rect(0, PY - 26, 96, 52, "b", { card: true, color: Riso.INK.b.pale });
      s.label(14, PY + 5, "peter", { cls: "strong" });
      s.wire(`M96,${PY}H${LX - 6}`, "b");
      s.port(SEAM, PY, "g", true, { color: Riso.INK.g.strong });
      s.rect(LX - 7, LY, 2, ROWS.length * RH - 8, "b", { color: Riso.INK.b.strong });
      // the tables
      ROWS.forEach(([n, c], i) => {
        const y = LY + i * RH;
        s.rect(LX, y, LW, RH - 8, "k", { card: true, color: T.cell });
        s.label(LX + 16, y + 22, n);
        s.label(LX + LW - 12, y + 22, c, { anchor: "end", cls: "mono" });
      });
      // the readers, all on the same rows
      s.rect(LX + LW + 7, LY, 2, ROWS.length * RH - 8, "k", { color: T.rest });
      READERS.forEach(([name, ink], i) => {
        const y = LY + 17 + i * 52 + 4;
        s.wire(`M${LX + LW + 9},${y}H${RX - 6}`, ink, { color: color(ink), arrow: 1 });
        s.rect(RX, y - 18, 160, 36, ink, { card: true, color: pale(ink) });
        s.label(RX + 14, y + 5, name, { cls: "strong" });
      });
    });
  });
})();
