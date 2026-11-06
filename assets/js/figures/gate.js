// Figure "gate", placed in index.html as <figure data-rf="gate"></figure>.
// Every email draft the Manager reviewed, one dot each, with the ones it stopped on the left.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt } = Riso;

  // through Nov 3, automated classification of the Manager's decisions on email drafts
  const GROUPS = [
    { n: "rejected: unsupported claims", c: 175, color: Riso.INK.r.strong },
    { n: "rejected: other reasons", c: 117, color: Riso.INK.r.mid },
    { n: "let through", c: 855, color: Riso.INK.b.edge },
  ];

  fig("gate", {
    w: 600,
    h: 196,
    tight: true,
    alt: "1,147 dots, one per email draft the Manager reviewed. 292 were rejected before a customer saw them: 175 for claims the evidence didn't support, 117 for other reasons. The other 855 went through.",
  }, (s) => {
    let sel = null;
    const ROWS = 16, X = 2, Y = 34;
    const G = (596 - X - 3) / (Math.ceil(1147 / ROWS) - 1);
    const total = GROUPS.reduce((a, g) => a + g.c, 0);
    const LY = Y + ROWS * G + 26;
    s.paint(() => {
      s.label(X - 2, 14, `${fmt(total)} email drafts the manager reviewed`, { cls: "mono" });
      // down each column, so each group is a solid block from the left
      let i = 0;
      GROUPS.forEach((g, k) => {
        const pts = [];
        for (let j = 0; j < g.c; j++, i++) pts.push(X + 3 + Math.floor(i / ROWS) * G, Y + (i % ROWS) * G);
        s.marks(pts, "k", { color: g.color, dot: 6, fade: sel != null && sel !== k ? 0.25 : null });
      });
      GROUPS.forEach((g, k) => {
        const x = X + [0, 208, 398][k];
        const on = sel === k;
        s.mark(0, x + 5, LY - 4, 4.5, "k", { color: g.color });
        s.label(x + 16, LY, fmt(g.c), { cls: "strong" });
        s.label(x + 16, LY + 17, g.n, { cls: "dim", fill: on ? "#262323" : null });
      });
    });
    const pick = (k) => { if (k !== sel) { sel = k; s.redraw(); } };
    GROUPS.forEach((g, k) => s.spot(X + [0, 208, 398][k] - 4, LY - 18, [204, 186, 200][k], 42, { label: g.n, enter: () => pick(k), click: () => pick(k) }));
    s.svg.addEventListener("pointerleave", () => pick(null));
  });
})();
