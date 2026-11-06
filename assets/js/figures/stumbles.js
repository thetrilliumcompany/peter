// Figure "stumbles", placed in index.html as <figure data-rf="stumbles"></figure>.
// How long each thing stayed broken: a grey dot on the day it broke, a coloured dot on the day it
// was fixed (blue for a prompt change, green for a tool change) and a line between them.
// The ones we could fix inside the system took a day; the slow ones sat outside it.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  // [what broke, broke at, fixed at (null = never), kind, the fix, partly?]
  // Times are days after Oct 19 (Toronto), from the run's commits, interventions, blockers and milestones.
  // kind: "prompt" = we changed his instructions; "tool" = we changed the system around him.
  const QUICK = [
    ["Peter waited for replies", 0.6, 1.62, "prompt", "nudged when idle"],
    ["Duplicate emails to 14 firms", 1.01, 1.08, "tool", "a unique key per send"],
    ["Paused over one forum's rule", 1.7, 2.57, "prompt", "pause only for harm"],
    ["Gmail blocked hello@", 3.36, 3.7, "tool", "850 sends a day, max"],
    ["Gmail limited him again", 9.43, 9.57, "tool", "a second mailbox"],
    ["Promised 50, found ~10", 12.3, 12.65, "prompt", "count first, then quote"],
  ];
  const SLOW = [
    ["Calls went silent (xAI)", 1.47, 7.65, "tool", "voice account topped up"],
    ["CAPTCHAs and ID checks", 1.45, 3.58, "tool", "we drive his browser, only partly", true],
    ["Disk full, batches unsent", 5.42, 8.4, "tool", "disk 25 → 50 GB"],
    ["Platforms turned him away", 1.45, null, "none", "never fixed, bets dropped"],
  ];
  const D = 15;

  fig("stumbles", {
    w: 600,
    h: 420,
    alt: "How long each stumble stayed broken, from October 19 to November 2: a grey dot when it broke, a coloured dot when it was fixed. Six were fixed within a day: Peter waiting for replies (nudged when idle), duplicate emails to 14 firms (a unique key per send), the Manager pausing him over one forum's rule (pause only for harm), Gmail blocking hello@ (at most 850 sends a day), Gmail limiting him again (a second mailbox) and promising 50 sites while finding about 10 (count first, then quote). The rest took days or never got fixed: calls went silent for six days until the xAI voice account was topped up, CAPTCHAs and ID checks were only partly solved by letting us drive his browser, a full disk took three days, and platforms that turned him away were never fixed, so those bets were dropped.",
  }, (s) => {
    const INK = { prompt: Riso.INK.b, tool: Riso.INK.g };
    const X0 = 196, X1 = 596, RH = 28;
    const dx = (d) => X0 + d / D * (X1 - X0);
    const AXY = 46, TOP = 56;
    const GA = TOP + 22, YA = GA + 6, GB = YA + QUICK.length * RH + 24, YB = GB + 6;
    const BOT = YB + SLOW.length * RH;

    const row = ([what, a, b, kind, fix, partly], y) => {
      const c = y + RH / 2, xa = dx(a);
      s.label(0, c + 4.5, what);
      if (b === null) {
        // never fixed: a dashed line from the day it broke off the edge of the chart
        // the dashed line stops short of the note at the end, so nothing shows through the text
        const tx = X1 - s.measure(fix, { cls: "tiny" });
        s.wire(`M${xa},${c}H${tx - 8}`, "k", { color: T.refDot, w: 1.5 });
        s.shapes.lastChild.setAttribute("stroke-dasharray", "4 4");
        s.node(xa, c, 5, "k", { color: T.refDot, knock: 2.5 });
        s.label(X1, c + 4, fix, { anchor: "end", cls: "tiny" });
        return;
      }
      const xb = dx(b), ink = INK[kind];
      if (partly) {
        // still partly broken after the fix: a dashed line that picks up after the note
        const tx = xb + 12 + s.measure(fix, { cls: "tiny" });
        s.wire(`M${tx + 8},${c}H${X1}`, "k", { color: ink.mid, w: 1.5 });
        s.shapes.lastChild.setAttribute("stroke-dasharray", "4 4");
      }
      s.wire(`M${xa},${c}H${xb}`, "k", { color: ink.mid, w: 3 });
      s.node(xa, c, 4.5, "k", { color: T.refDot, knock: 2.5 });
      s.node(xb, c, 5.5, "k", { color: ink.strong, knock: 2.5 });
      // the fix is named past its dot, or before the line when there's no room
      const w = s.measure(fix, { cls: "tiny" });
      if (partly) s.label(xb + 12, c + 4, fix, { cls: "tiny" });
      else if (xb + 12 + w <= X1) s.label(xb + 12, c + 4, fix, { cls: "tiny" });
      else s.label(xa - 12, c + 4, fix, { anchor: "end", cls: "tiny" });
    };

    s.paint(() => {
      s.legend([["broke", T.refDot], ["fixed in his prompt", Riso.INK.b.strong], ["fixed in his tools", Riso.INK.g.strong]], 0, 14);
      // the days across the top, with a light line every other day
      for (let d = 0; d <= D; d += 2) {
        s.rect(dx(d), TOP, 1, BOT - TOP, "k", { color: T.grid, bg: true });
        if (d < D) s.label(dx(d), AXY, d === 0 ? "oct 19" : d < 13 ? String(19 + d) : `nov ${d - 12}`, { anchor: "middle", cls: "tiny" });
      }
      s.rect(0, TOP, X1, 1, "k", { color: T.axis, bg: true });
      s.label(0, GA, "fixed within a day", { cls: "mono" });
      QUICK.forEach((r, i) => row(r, YA + i * RH));
      s.rect(0, GB - 14, X1, 1, "k", { color: T.grid, bg: true });
      s.label(0, GB, "took days, or never", { cls: "mono" });
      SLOW.forEach((r, i) => row(r, YB + i * RH));
    });
  });
})();
