// Figure "cast", placed in index.html as <figure data-rf="cast"></figure>, under the hero.
// The org chart of the company, with everyone's real numbers. It doubles as the colour key:
// Peter azure, the Manager red, the controller amber, us dark ink.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  const PFP = { peter: "assets/img/pfp-peter.jpg", manager: "assets/img/pfp-manager.jpg", rohanth: "assets/img/pfp-rohanth.jpg", shayaan: "assets/img/pfp-shayaan.jpg" };

  fig("cast", {
    w: 600,
    h: 380,
    alt: "The company's org chart. At the top, us: three partners who approve things and foot the $7,187 model bill. Below us, the Manager, on GPT-6 Astra, who reviewed Peter 1,757 times. Below the Manager, Peter, on Claude Opus 5.5, who got $100 and made $26. Off to the side, on a dotted-line report, the controller: a Python loop with no model that nudged Peter 342 times. Peter's direct reports: 1,385 subagents.",
  }, (s) => {
    const CX = 264, BLUE = Riso.INK.b.strong, RED = Riso.INK.r.strong, AMBER = Riso.INK.y.strong;
    const UY = 30, MY = 134, PY = 256, LX = CX + 56;
    const name = (x, y, title, line1, line2) => {
      s.label(x, y - 6, title, { cls: "strong" });
      s.label(x, y + 13, line1, { cls: "mono" });
      if (line2) s.label(x, y + 31, line2, { cls: "mono" });
    };
    s.paint(() => {
      // the reporting lines first, so the people sit on top of them
      s.wire(`M${CX},${UY + 18}V${MY - 44}`, "k", { color: T.ink, w: 1.5 });
      s.wire(`M${CX},${MY + 44}V${PY - 44}`, "r", { color: RED, flow: { ms: 1600, n: 2 } });
      // the controller reports to nobody and nudges everybody: a dotted-line report
      const cx = 52, cy = PY;
      s.seam(cx + 36, cy, CX - 46, cy, { color: AMBER, dash: "4 4" });
      s.label((cx + 36 + CX - 46) / 2, cy - 26, "dotted-line", { anchor: "middle", cls: "mono" });
      s.label((cx + 36 + CX - 46) / 2, cy - 10, "report", { anchor: "middle", cls: "mono" });
      // us
      s.node(CX - 33, UY, 15, "k", { color: "#3d3a3a", knock: 0 });
      s.label(CX - 33, UY + 5, "A", { anchor: "middle", cls: "strong", fill: "#fbfbf8" });
      s.avatar(PFP.rohanth, CX, UY, 15, T.bg, { ring: 1 });
      s.avatar(PFP.shayaan, CX + 33, UY, 15, T.bg, { ring: 1 });
      name(LX, UY + 2, "us, three partners", "approve things · foot the $7,187 bill");
      // the manager
      s.avatar(PFP.manager, CX, MY, 38, RED);
      name(LX, MY, "the manager", "gpt-6 astra", "reviewed peter 1,757 times");
      // peter
      s.avatar(PFP.peter, CX, PY, 38, BLUE);
      name(LX, PY, "peter", "claude opus 5.5", "got $100 · made $26");
      // the controller, as the alarm clock it is
      s.port(cx, cy, "y", false, { color: AMBER, r: 30 });
      s.node(cx, cy, 28, "y", { color: Riso.INK.y.pale, knock: 0 });
      s.wire(`M${cx},${cy}V${cy - 16}`, "y", { color: T.ink, w: 2.5 });
      s.wire(`M${cx},${cy}L${cx + 11},${cy + 6}`, "y", { color: T.ink, w: 2.5 });
      s.wire(`M${cx - 26},${cy - 26}l-6,-6M${cx + 26},${cy - 26}l6,-6`, "y", { color: AMBER, w: 3 });
      s.label(0, cy + 56, "the controller", { cls: "strong" });
      s.label(0, cy + 75, "a python loop, no model", { cls: "mono" });
      s.label(0, cy + 93, "nudged peter 342 times", { cls: "mono" });
      // and Peter's direct reports
      const DY = PY + 70;
      s.wire(`M${CX},${PY + 44}V${DY - 8}`, "b", { color: BLUE, w: 1.5 });
      s.rect(190, DY - 9, 220, 1.5, "b", { color: BLUE, bg: true });
      for (let i = 0; i < 27; i++) s.node(194 + i * 8, DY, 2.6, "b", { color: Riso.INK.b.mid, knock: 0 });
      s.label(190, DY + 24, "direct reports: 1,385 subagents", { cls: "mono" });
    });
  });
})();
