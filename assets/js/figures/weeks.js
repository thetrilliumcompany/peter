// Figure "weeks", placed in index.html as <figure data-rf="weeks"></figure>.
// How often each behaviour tag showed up in Peter's runs, week 1 against week 2.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  // share of Peter's analysed runs with each tag (HQ, Nov 4, n = 4,070). Week 1 is the first seven days.
  const TAGS = [
    ["waiting, not acting", 52, 49],
    ["tool failures", 40, 35],
    ["volume over fit", 39, 29],
    ["honest corrections", 29, 30],
    ["persistence", 27, 22],
    ["unsupported claims", 24, 17],
    ["manager pushback", 10, 14],
    ["deadline pressure", 5.2, 3.3],
  ];
  // week 1 is the grey reference, week 2 the result, the way Tinker compares a base and a trained model
  const W1 = "#a9a8a4", W2 = "#0387e7";

  fig("weeks", {
    w: 600,
    h: 292,
    tight: true,
    alt: "For each behaviour tag, the share of Peter's runs in week 1 and week 2. Waiting instead of acting 52% to 49%, tool failures 40% to 35%, volume over fit 39% to 29%, honest corrections 29% to 30%, persistence 27% to 22%, unsupported claims 24% to 17%, manager pushback 10% to 14%, deadline pressure 5.2% to 3.3%.",
  }, (s) => {
    const LX = 142, X0 = 154, X1 = 484, VX = 596, Y0 = 50, RH = 30;
    const x = (v) => X0 + v / 55 * (X1 - X0);
    s.paint(() => {
      // key and scale
      s.legend([["week 1", W1], ["week 2", W2]], 2, 14);
      s.label(VX, 14, "share of his runs", { anchor: "end", cls: "mono" });
      for (const v of [0, 25, 50]) {
        s.rect(x(v), Y0 - 18, 1, TAGS.length * RH + 6, "k", { color: T.grid, bg: true });
        s.label(x(v), Y0 - 22, `${v}%`, { anchor: "middle", cls: "tiny" });
      }
      // one row per tag: a line from week 1 to week 2
      TAGS.forEach(([name, a, b], i) => {
        const y = Y0 + i * RH;
        s.label(LX, y + 4, name, { anchor: "end" });
        s.wire(`M${x(a).toFixed(1)},${y}H${x(b).toFixed(1)}`, "b", { color: W2, w: 2, fade: 0.45 });
        s.node(x(a), y, 5.5, "k", { color: W1, knock: 3 });
        s.node(x(b), y, 5.5, "b", { color: W2, knock: 3 });
        const fmtv = (v) => (v % 1 ? v.toFixed(1) : v);
        s.label(VX, y + 4, `${fmtv(a)}% → ${fmtv(b)}%`, { anchor: "end", cls: b > a ? "strong" : "dim" });
      });
    });
  });
})();
