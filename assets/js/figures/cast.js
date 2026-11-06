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
    alt: "The company's org chart. At the top, us: three partners, paying a $6,571 model bill. Below us, the Manager on GPT-6 Astra. Below the Manager, Peter on Claude Opus 5.5, with 1,370 subagents under him. Beside Peter, on a dotted line, the controller, which nudges him.",
  }, (s) => {
    const CX = 264, BLUE = Riso.INK.b.strong, RED = Riso.INK.r.strong, AMBER = Riso.INK.y.strong;
    const UY = 30, MY = 134, PY = 256, LX = CX + 56;
    const name = (x, y, title, line) => {
      s.label(x, y - 2, title, { cls: "strong" });
      s.label(x, y + 17, line, { cls: "mono" });
    };
    s.paint(() => {
      // the reporting lines first, so the people sit on top of them
      s.wire(`M${CX},${UY + 18}V${MY - 44}`, "k", { color: T.ink, w: 1.5 });
      s.wire(`M${CX},${MY + 44}V${PY - 44}`, "r", { color: RED });
      const cx = 52, cy = PY;
      s.seam(cx + 36, cy, CX - 46, cy, { color: AMBER, dash: "4 4" });
      // what travels along it
      s.label((cx + 36 + CX - 46) / 2, cy + 22, "nudge", { anchor: "middle", fill: Riso.INK.y.strong }).style.fontStyle = "italic";
      // us
      s.initials(CX - 33, UY, 15, "A");
      s.avatar(PFP.rohanth, CX, UY, 15, T.bg, { ring: 1 });
      s.avatar(PFP.shayaan, CX + 33, UY, 15, T.bg, { ring: 1 });
      name(LX, UY, "us", "$6,571 model bill");
      // the manager
      s.avatar(PFP.manager, CX, MY, 38, RED);
      name(LX, MY, "the manager", "gpt-6 astra");
      // peter
      s.avatar(PFP.peter, CX, PY, 38, BLUE);
      name(LX, PY, "peter", "claude opus 5.5");
      // the controller, as the alarm clock it is
      s.port(cx, cy, "y", false, { color: AMBER, r: 30 });
      s.node(cx, cy, 28, "y", { color: Riso.INK.y.pale, knock: 0 });
      s.wire(`M${cx},${cy}V${cy - 16}`, "y", { color: T.ink, w: 2.5 });
      s.wire(`M${cx},${cy}L${cx + 11},${cy + 6}`, "y", { color: T.ink, w: 2.5 });
      s.wire(`M${cx - 26},${cy - 26}l-6,-6M${cx + 26},${cy - 26}l6,-6`, "y", { color: AMBER, w: 3 });
      s.label(cx, cy + 56, "the controller", { anchor: "middle", cls: "strong" });
      // and Peter's direct reports
      const DY = PY + 70;
      s.wire(`M${CX},${PY + 44}V${DY - 8}`, "b", { color: BLUE, w: 1.5 });
      s.rect(190, DY - 9, 220, 1.5, "b", { color: BLUE, bg: true });
      for (let i = 0; i < 27; i++) s.node(194 + i * 8, DY, 2.6, "b", { color: Riso.INK.b.mid, knock: 0 });
      s.label(CX, DY + 24, "1,370 subagents", { anchor: "middle", cls: "mono" });
    });
  });
})();
