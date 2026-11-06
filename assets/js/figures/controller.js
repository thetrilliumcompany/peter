// Figure "controller", placed in index.html as <figure data-rf="controller"></figure>.
// Peter, the Manager and we reach the controller through peterctl; Slack's commands go straight in.
// See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  const ROWS = [["peter", "b", 58], ["manager", "r", 110], ["us", "k", 162], ["slack", "k", 214, true]];

  fig("controller", {
    w: 600,
    h: 260,
    alt: "Peter, the Manager and we reach the controller through peterctl. Slack's commands go straight to it with no model in the loop, so the kill switch works even when the models are down. The controller itself uses no model.",
  }, (s) => {
    const NX = 110, SEAM = 270, RAIL = 400;
    const G = Riso.INK.g.strong, Y = Riso.INK.y;
    s.paint(() => {
      s.legend([["peterctl", G]], SEAM - 40, 16, { mono: true });
      s.seam(SEAM, 34, SEAM, 236);
      ROWS.forEach(([name, ink, y, direct]) => {
        const col = ink === "k" ? T.ink : Riso.INK[ink].strong;
        s.label(0, y + 5, name, { cls: "strong" });
        s.wire(`M${NX},${y}H${RAIL}`, ink, { color: col, flow: { ms: 1700, n: 1 } });
        s.node(NX, y, 5.5, ink, { color: col });
        if (direct) s.label(SEAM + 12, y - 9, "no model", { cls: "mono" });
        else s.port(SEAM, y, "g", true, { color: G });
      });
      s.rect(RAIL, 34, 200, 202, "y", { color: Y.pale });
      s.rect(RAIL, 34, 4, 202, "y", { color: Y.mid });
      s.label(RAIL + 100, 132, "controller", { anchor: "middle", cls: "strong" });
      s.label(RAIL + 100, 151, "every 30 s", { anchor: "middle", cls: "mono" });
    });
  });
})();
