// Figure "cast", placed in index.html as <figure data-rf="cast"></figure>, under the hero.
// The org chart of the company, left to right, with everyone's real numbers. It doubles as the colour key:
// Peter azure, the Manager red, the controller amber, us dark ink.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  const PFP = { peter: "assets/img/pfp-peter.jpg", manager: "assets/img/pfp-manager.jpg", rohanth: "assets/img/pfp-rohanth.jpg", shayaan: "assets/img/pfp-shayaan.jpg" };

  fig("cast", {
    w: 600,
    h: 230,
    alt: "The company's org chart, left to right. First us: three partners, paying a $6,571 model bill. We oversee the Manager on GPT-6 Astra, who oversees Peter on Claude Opus 5.5, who runs 1,370 subagents. Above Peter, on a dotted line, the controller nudges him.",
  }, (s) => {
    const BLUE = Riso.INK.b.strong, RED = Riso.INK.r.strong, AMBER = Riso.INK.y.strong;
    const CY = 136, R = 34, UX = 64, MX = 226, PX = 370, SX = 482;
    const name = (x, title, line) => {
      s.label(x, CY + R + 24, title, { anchor: "middle", cls: "strong" });
      s.label(x, CY + R + 43, line, { anchor: "middle", cls: "mono" });
    };
    s.paint(() => {
      // the reporting lines first, so the people sit on top of them
      s.wire(`M${UX + 56},${CY}H${MX - R - 8}`, "k", { color: T.ink, w: 1.5 });
      s.wire(`M${MX + R + 8},${CY}H${PX - R - 8}`, "r", { color: RED });
      s.wire(`M${PX + R + 8},${CY}H${SX - 6}`, "b", { color: BLUE, w: 1.5 });
      // the controller reports to nobody and nudges Peter from above
      const cy = 34;
      s.seam(PX, cy + 36, PX, CY - R - 8, { color: AMBER, dash: "4 4" });
      s.label(PX + 10, (cy + 36 + CY - R - 8) / 2 + 5, "nudge", { fill: Riso.INK.y.strong }).style.fontStyle = "italic";
      s.port(PX, cy, "y", false, { color: AMBER, r: 26 });
      s.node(PX, cy, 24, "y", { color: Riso.INK.y.pale, knock: 0 });
      s.wire(`M${PX},${cy}V${cy - 14}`, "y", { color: T.ink, w: 2.5 });
      s.wire(`M${PX},${cy}L${PX + 10},${cy + 5}`, "y", { color: T.ink, w: 2.5 });
      s.label(PX - 40, cy + 5, "the controller", { anchor: "end", cls: "strong" });
      // us
      s.initials(UX - 33, CY, 15, "A");
      s.avatar(PFP.rohanth, UX, CY, 15);
      s.avatar(PFP.shayaan, UX + 33, CY, 15);
      name(UX, "us", "$6,571 bill");
      // the manager and peter
      s.avatar(PFP.manager, MX, CY, R);
      name(MX, "the manager", "gpt-6 astra");
      s.avatar(PFP.peter, PX, CY, R);
      name(PX, "peter", "claude opus 5.5");
      // and Peter's direct reports
      s.rect(SX - 6, CY - 22, 1.5, 44, "b", { color: BLUE, bg: true });
      for (let i = 0; i < 40; i++) s.node(SX + 6 + (i % 8) * 13, CY - 19.5 + Math.floor(i / 8) * 9.75, 3, "b", { color: Riso.INK.b.mid, knock: 0 });
      name(SX + 50, "subagents", "1,370");
    });
  });
})();
