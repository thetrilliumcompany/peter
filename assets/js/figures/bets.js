// Figure "bets", placed in index.html as <figure data-rf="bets"></figure>.
// All 62 bets Peter opened by Nov 2, each a bar from the day it opened to the day it ended,
// in two groups: the ones killed by Nov 2, and the ones still live.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  const CUT = 15.04; // end of Nov 2 in days after Oct 19 00:00, Toronto
  const BETS = window.PETER_BETS.filter((b) => b.start < CUT); // data/bets-data.js, from runtime.bets
  const REVIEW = 7.91; // the week-one review, Oct 26
  // Tinker's grammar: what was dropped is the grey reference; what's still live is the subject
  const KILLED = "#cfcfc9", LIVE = "#0387e7", PAID = "#282828";

  fig("bets", {
    w: 600,
    h: 640,
    alt: "All 62 bets Peter opened by November 2, each a bar from when it opened to when it ended, in two groups.  40 were killed by November 2, many of them together at the week-one review on October 26.  22 were still live on November 2; one of them, in black, is the only one that earned money.",
  }, (s) => {
    const X = 2, R = 598, D1 = 15.6, RH = 6.6;
    const x = (d) => X + d / D1 * (R - X);
    const live = (b) => b.end === null || b.end > CUT;
    const byStart = (a, b) => a.start - b.start;
    const groups = [
      { name: "abandoned", color: KILLED, bets: BETS.filter((b) => !live(b)).sort(byStart) },
      { name: "still live", color: LIVE, bets: BETS.filter(live).sort(byStart) },
    ];
    const liveAt = (d) => BETS.filter((b) => b.start <= d && (b.end === null || b.end > d)).length;
    const days = [["oct 19", 0], ["21", 2], ["23", 4], ["25", 6], ["27", 8], ["29", 10], ["31", 12], ["nov 2", 14]];
    // rows, with a gap and a heading between the groups
    const rows = [];
    let y = 116;
    for (const g of groups) {
      g.y = y;
      y += 22;
      for (const b of g.bets) { rows.push({ b, y, color: b.sold ? PAID : g.color }); y += RH; }
      y += 14;
    }
    const BOT = y - 14;
    let sel = rows.findIndex((r) => r.b.sold);
    s.paint(() => {
      // how many were live at once
      s.label(X, 12, "bets live at once", { cls: "mono" });
      for (let d = 0; d < CUT; d += 0.25) {
        const n = liveAt(d);
        s.rect(x(d), 76 - n * 1.6, (R - X) / (D1 / 0.25) - 1, n * 1.6, "b", { color: "#c0e1f9" });
      }
      s.label(x(6.2), 76 - 29 * 1.6 - 6, "29", { anchor: "middle", cls: "strong" });
      // days, as faint lines through everything
      days.forEach(([n, d]) => {
        s.rect(x(d), 80, 1, BOT - 80, "k", { color: T.grid });
        s.label(x(d) + 4, 96, n, { cls: "tiny" });
      });
      // the week-one review
      s.seam(x(REVIEW), 24, x(REVIEW), BOT, { color: T.ink, dash: "4 4" });
      s.label(x(REVIEW) + 6, 32, "oct 26: week-one review", { cls: "tiny strong" });
      // group headings
      for (const g of groups) {
        s.rect(X, g.y + 4, 12, 6, "b", { color: g.color });
        s.label(X + 18, g.y + 11, `${g.bets.length} ${g.name}`, { cls: "strong" });
      }
      // a faint band behind the bet under the pointer, then the bars
      s.rect(X, rows[sel].y - 1, R - X, RH, "k", { color: "#e6e6e1", bg: true });
      for (const r of rows) {
        const e = Math.min(r.b.end ?? CUT, CUT);
        s.rect(x(r.b.start), r.y, Math.max(3, x(e) - x(r.b.start)), 4.6, "b", { color: r.color });
      }
      // the bet under the pointer, named underneath
      const b = rows[sel].b;
      s.mark(0, X + 6, BOT + 28, 5, "b", { color: rows[sel].color });
      s.label(X + 18, BOT + 33, b.name, { cls: "strong" });
      s.label(X + 18, BOT + 51, `opened ${b.startLabel} · ${b.end === null ? "still live" : b.end > CUT ? `live on Nov 2, killed ${b.endLabel}` : `killed ${b.endLabel}`}${b.sold ? " · the only one that paid" : ""}`, { cls: "dim" });
    });
    // hovering a row names its bet; nothing else moves
    const hit = s.spot(0, rows[0].y - 2, 600, BOT - rows[0].y + 4, { label: "bets", enter: () => {} });
    for (const type of ["pointermove", "pointerdown"]) hit.addEventListener(type, (e) => {
      const vy = s.point(e).y;
      let best = sel, dist = 1e9;
      rows.forEach((r, i) => { const d = Math.abs(r.y + 2.3 - vy); if (d < dist) { dist = d; best = i; } });
      if (best !== sel && dist < RH) { sel = best; s.redraw(); }
    });
  });
})();
