// Figure "two-agents", placed in index.html as <figure data-rf="two-agents"></figure>.
// Peter's median context of 466,000 tokens is a large blue circle; the Manager's 147,000 is a smaller red circle.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt, T } = Riso;

  const DECISIONS = [
    ["advice", 623, "35%", "Advice waits in Peter's inbox until he reads it."],
    ["no action", 577, "33%", "Reviewed, nothing to do."],
    ["woke an idle peter", 427, "24%", "About a quarter of all reviews ended by waking him. HQ's analysis counts 342 separate nudges from the controller by Nov 4, and 227 reviews called because he kept idling."],
    ["paused", 78, "4.4%", "The Manager paused Peter. On Oct 20 it was over duplicate emails to 14 firms, and later that day over a forum's ban on AI content. We lifted that second pause ourselves."],
    ["restarted", 23, "1.3%", "The Manager restarted Peter."],
    ["redirected", 22, "1.3%", "A redirect interrupts Peter mid-turn. Waiting fell from 59% to 51% of his next 10 runs, on a sample of 22. No other decision moved it by more than 2 points."],
    ["escalated", 7, "0.4%", "Sent up to us, the humans."],
  ];
  fig("two-agents", {
    w: 600,
    h: 470,
    alt: "Peter, who runs the business, and the Manager, who reviews him, as two columns joined by the ledger: Peter writes it, the Manager reads it. Circle area is median context per model call, on one scale: 466,000 tokens for Peter, 147,000 for the Manager. Below, how the Manager's 1,757 reviews ended: advice 623, no action 577, woke an idle Peter 427, paused 78, restarted 23, redirected 22, escalated 7.",
  }, (s) => {
    let sel = 2;
    const PX = 150, MX = 450, CY = 120, Rp = 66, Rm = Rp * Math.sqrt(147 / 466);
    const RED = Riso.INK.r.strong, BLUE = Riso.INK.b.strong;
    const RX = 168, RW = 366, RY = 300, RH = 24, max = 623, total = 1757;
    s.paint(() => {
      const head = (x, text, color) => s.legend([[text, color]], x - (s.measure(text, { cls: "mono" }) + 13) / 2, 16, { mono: true });
      head(PX, "peter · runs the business", BLUE);
      head(MX, "manager · reviews him", RED);
      // the ledger between them: Peter writes it, the Manager reads it
      s.wire(`M${PX + Rp + 6},${CY}H262`, "b", { arrow: 1, flow: { ms: 2200, n: 1 } });
      s.wire(`M338,${CY}H${MX - Rm - 8}`, "r", { arrow: 1, flow: { ms: 2200, n: 1 } });
      s.rect(262, CY - 20, 76, 40, "k", { card: true, color: T.cell });
      s.label(300, CY + 5, "ledger", { anchor: "middle", cls: "mono" });
      s.label(242, CY - 12, "writes", { anchor: "middle", cls: "mono" });
      s.label(366, CY - 12, "reads", { anchor: "middle", cls: "mono" });
      // context per model call, as area, on one scale
      s.circle(PX, CY, Rp, "b", { color: Riso.INK.b.pale });
      s.shapes.lastChild.setAttribute("fill", Riso.INK.b.pale);
      s.circle(MX, CY, Rm, "r");
      s.shapes.lastChild.setAttribute("fill", Riso.INK.r.pale);
      s.label(PX, CY + 1, "466k tokens", { anchor: "middle", cls: "strong" });
      s.label(PX, CY + 19, "median context", { anchor: "middle", cls: "mono" });
      s.label(MX, CY + 5, "147k", { anchor: "middle", cls: "strong" });
      s.label(PX, 222, "claude opus 5.5 · 1,385 subagents", { anchor: "middle", cls: "mono" });
      s.label(MX, 222, "gpt-6 astra, then 6.1 sol", { anchor: "middle", cls: "mono" });
      s.label(MX, 240, "39 subagents, read-only", { anchor: "middle", cls: "mono" });
      // how the reviews ended, largest first; the telling one in red
      s.label(0, RY - 22, `how the manager's ${fmt(total)} reviews ended`, { cls: "mono" });
      s.rect(RX - 0.5, RY - 4, 1, DECISIONS.length * RH, "k", { color: T.grid, bg: true });
      DECISIONS.forEach(([name, n, pct], i) => {
        const y = RY + i * RH, on = i === sel, w = Math.max(2, n / max * RW);
        s.label(RX - 10, y + 12, name, { anchor: "end", fill: on ? T.ink : null });
        s.rect(RX, y + 2, w, RH - 9, "r", { color: on ? RED : T.ref });
        s.label(RX + w + 8, y + 12, `${fmt(n)} · ${pct}`, { cls: on ? "strong" : "tiny" });
      });
    });
    DECISIONS.forEach((d, i) => s.spot(0, RY + i * RH - 2, 600, RH, { label: `${d[0]}, ${d[1]} reviews`, enter: () => { if (sel !== i) { sel = i; s.redraw(); } } }));
  });
})();
