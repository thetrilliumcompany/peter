// Figure "lines", placed in index.html as <figure data-rf="lines"></figure>.
// A scorecard of Peter's business lines: people contacted, replies, model cost and what each earned.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt } = Riso;

  // business line, people contacted, people who replied, Peter's model cost ($), revenue ($), note
  // through Nov 2, by the business lines HQ tracks
  const LINES = [
    ["opening-soon lists (cleaners)", 1604, 4, 1394, 26, "The only line that ever paid."],
    ["office-move packs (removals)", 1345, 1, 247, 0, "Three firms opened the Stripe link. None paid."],
    ["aoda kits, sold direct", 1334, 1, 687, 0, "About 1,000 emails and 120 forms over a week, then killed."],
    ["other ideas", 822, 1, 525, 0, ""],
    ["qa reviews for web agencies", 610, 4, 134, 0, "The Manager cancelled sends after about 560, with no positive replies."],
    ["b2b lead packs", 512, 0, 320, 0, ""],
    ["website fixes", 392, 2, 399, 0, "Perth ended badly; a similar bet kept running in Texas."],
    ["csv and spreadsheet cleanup", 370, 3, 344, 0, "“AI can do all this free of charge.”"],
    ["aoda kits via partners", 364, 4, 142, 0, "HR consultants who could use the same service for several clients."],
    ["vector logo redraws", 205, 0, 115, 0, ""],
    ["freelance proposals", 105, 3, 326, 0, "Anti-AI policies, constant CAPTCHAs and posting limits for new accounts."],
    ["shop catalog cleanup", 162, 0, 152, 0, ""],
    ["holiday event artwork", 161, 0, 94, 0, "$40 art for venues in the UK and Ireland."],
    ["paid ads and listings", 6, 0, 70, 0, "Most advertising plans ran into billing or account blocks before they became campaigns."],
  ];

  fig("lines", {
    w: 600,
    h: 470,
    alt: "A scorecard of Peter's 14 business lines, sorted by model cost. For each: people contacted, people who replied, model cost and what it earned. Opening-soon lists for cleaners cost the most, $1,394, contacted 1,604 people, got 4 replies and earned $26, the only revenue. Every other line earned nothing, though several contacted over 1,000 people.",
  }, (s) => {
    const rows = [...LINES].sort((a, b) => b[3] - a[3]);
    // columns: name, contacted (bar), replied (dots), model cost (bar), earned
    const C1 = 186, W1 = 100, C2 = 350, C3 = 410, W3 = 100, C4 = 598;
    const RH = 30, Y0 = 34;
    const maxT = 1604, maxC = 1394;
    s.paint(() => {
      s.label(0, 14, "business line", { cls: "mono" });
      s.label(C1, 14, "people contacted", { cls: "mono" });
      s.label(C2, 14, "replied", { cls: "mono" });
      s.label(C3, 14, "model cost", { cls: "mono" });
      s.label(C4, 14, "earned", { anchor: "end", cls: "mono" });
      rows.forEach(([name, touches, replied, cost, rev], i) => {
        const y = Y0 + i * RH, earned = rev > 0;
        if (i) s.rect(0, y - 6, 600, 1, "k", { color: "#e6e6e1" });
        // the one line that earned gets a faint band, not a different colour
        if (earned) s.rect(0, y - 5, 600, RH - 1, "k", { color: "#ecece8", bg: true });
        s.label(0, y + 13, name, { cls: earned ? "strong" : "" });
        // contacted: a bar on one scale, the number at its end
        s.rect(C1, y + 3, Math.max(2, touches / maxT * W1), 12, "b", { color: "#9fd0ec" });
        s.label(C1 + touches / maxT * W1 + 6, y + 13, fmt(touches), { cls: "tiny" });
        // replied: one dot per person
        if (!replied) s.label(C2, y + 13, "0", { cls: "tiny" });
        for (let k = 0; k < replied; k++) s.mark(0, C2 + 4 + k * 10, y + 9, 3.6, "b", { color: "#007ec7" });
        // model cost: a bar on one scale
        s.rect(C3, y + 3, Math.max(2, cost / maxC * W3), 12, "k", { color: "#c9c9c3" });
        s.label(C3 + cost / maxC * W3 + 6, y + 13, `$${fmt(cost)}`, { cls: "tiny" });
        s.label(C4, y + 13, earned ? `$${rev}` : "—", { anchor: "end", cls: earned ? "strong" : "dim", fill: earned ? "#262323" : null });
      });
    });
  });
})();
