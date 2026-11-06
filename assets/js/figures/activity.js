// Figure "activity", placed in index.html as <figure data-rf="activity"></figure>.
// Everything Peter logged as sent, ten actions to a dot, against the one customer who paid.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt, units } = Riso;

  // completed actions through Nov 3, from runtime.db
  const ROWS = [
    ["emails sent", 3884],
    ["contact forms", 3196],
    ["calls made", 1232],
    ["email replies", 122],
  ];

  fig("activity", {
    w: 600,
    h: 156,
    tight: true,
    alt: "Peter's logged actions, ten to a dot: 3,884 emails, 3,196 contact forms, 1,232 calls and 122 email replies. Below them, a single black dot: one customer ($26).",
  }, (s) => {
    const NX = 40, LX = 48, X = 140, R = 596, G = 6.4, DOT = 4.6;
    const PR = Math.floor((R - X) / G) + 1;
    s.paint(() => {
      let y = 6;
      for (const [name, n] of ROWS) {
        const dots = Math.round(n / 10), rows = Math.ceil(dots / PR);
        // the label sits on the middle of its block of dots, not on the first row
        const mid = y + (rows - 1) * G / 2;
        s.label(NX, mid + 4.5, fmt(n), { anchor: "end", cls: "strong" });
        s.label(LX, mid + 4.5, name, { cls: "dim" });
        s.marks(units(dots, X, y, PR, G), "b", { dot: DOT });
        y += rows * G + 14;
      }
      // the one payment, in the same dot language
      s.label(NX, y + 4.5, "1", { anchor: "end", cls: "strong" });
      s.label(LX, y + 4.5, "paid", { cls: "dim" });
      s.marks([X, y], "k", { dot: DOT + 1.2, color: "#262323" });
      s.label(X + 10, y + 4, "one customer ($26)", { cls: "dim" });
      // what one dot is worth, in the empty corner
      s.marks([R - 74, y], "b", { dot: DOT });
      s.label(R, y + 4, "= 10 actions", { anchor: "end", cls: "dim" });
    });
  });
})();
