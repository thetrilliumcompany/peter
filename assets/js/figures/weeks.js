// Figure "weeks", placed in index.html as <figure data-rf="weeks"></figure>.
// How often each behaviour tag showed up in Peter's runs, week 1 against week 2.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  // share of Peter's analysed runs with each tag (through Nov 2, n = 3,941). Week 1 is the first seven days.
  const TAGS = [
    ["waiting, not acting", 52, 46],
    ["tool failures", 40, 36],
    ["volume over fit", 39, 30],
    ["honest corrections", 29, 29],
    ["persistence", 27, 23],
    ["unsupported claims", 24, 17],
    ["manager pushback", 10.0, 13],
    ["deadline pressure", 5.2, 3.2],
  ];
  // week 1 is the grey reference, week 2 the result, the way Tinker compares a base and a trained model
  const W1 = "#a9a8a4", W2 = "#0387e7";

  fig("weeks", {
    w: 600,
    h: 292,
    tight: true,
    alt: "For each behaviour tag, the share of Peter's runs in week 1 and week 2: waiting, not acting 52% to 46%, tool failures 40% to 36%, volume over fit 39% to 30%, honest corrections 29% to 29%, persistence 27% to 23%, unsupported claims 24% to 17%, manager pushback 10.0% to 13%, deadline pressure 5.2% to 3.2%.",
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
