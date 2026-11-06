// Figure "two-agents", placed in index.html as <figure data-rf="two-agents"></figure>.
// How the Manager's reviews of Peter ended, largest first.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt, T } = Riso;

  const DECISIONS = [
    ["advice", 549, "34%", "Advice waits in Peter's inbox until he reads it."],
    ["no action", 531, "33%", "Reviewed, nothing to do."],
    ["woke an idle peter", 407, "25%", "About a quarter of all reviews ended by waking him. "],
    ["paused", 78, "4.8%", "The Manager paused Peter. On Oct 20 it was over duplicate emails to 14 firms, and later that day over a forum's ban on AI content. We lifted that second pause ourselves."],
    ["restarted", 20, "1.2%", "The Manager restarted Peter."],
    ["redirected", 18, "1.1%", "A redirect interrupts Peter mid-turn. Waiting fell from 59% to 51% of his next 10 runs, on a sample of 22. No other decision moved it by more than 2 points."],
    ["escalated", 7, "0.4%", "Sent up to us, the humans."],
  ];
  fig("two-agents", {
    w: 600,
    h: 220,
    alt: "How the Manager's 1,610 reviews ended: advice 549, no action 531, woke an idle Peter 407, paused 78, restarted 20, redirected 18, escalated 7.",
  }, (s) => {
    let sel = 2;
    const RED = Riso.INK.r.strong;
    const RX = 168, RW = 366, RY = 40, RH = 24, max = 549, total = 1610;
    s.paint(() => {
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
