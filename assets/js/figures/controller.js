// Figure "controller", placed in index.html as <figure data-rf="controller"></figure>.
// The controller sits at the centre with Peter, the Manager, us and Slack around it.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  fig("controller", {
    w: 600,
    h: 300,
    alt: "Who talks to the controller. Peter, the Manager and we go through peterctl; Slack's four commands, !status, !pause, !resume and !stop, go straight to the controller with no model in the loop. The controller is a Python service with one SQLite file and no model: every 30 seconds it delivers messages, polls Gmail and Stripe, nudges Peter if he's idle and schedules the Manager's reviews. With both models down it keeps running, and the kill switch still works.",
  }, (s, ui) => {
    let down = false, paused = false, sending = false, tick = 0, last = 0;
    const NX = 150, SEAM = 250, RAIL = 334, CX = 350;
    const ROWS = [
      { k: "peter", sub: "inbox · ledger · gate", ink: "b", y: 76, model: true },
      { k: "manager", sub: "decisions", ink: "r", y: 128, model: true },
      { k: "us", sub: "restart · extend · stop", ink: "k", y: 180 },
      { k: "slack", sub: "!status !pause !resume !stop", ink: "k", y: 232, direct: true },
    ];
    const JOBS = [["deliver messages", "5 s"], ["poll gmail, stripe", "60 s"], ["nudge if idle", "5 min"], ["schedule reviews", "15 min"]];
    s.paint(() => {
      s.label(0, 16, "who calls it", { cls: "mono" });
      s.legend([["peterctl", Riso.INK.g.strong]], SEAM - 40, 16, { mono: true });
      s.legend([["controller", Riso.INK.y.mid]], CX + 8, 16, { mono: true });
      s.seam(SEAM, 36, SEAM, 254);
      // the controller: a service with one file and no model
      s.rect(RAIL - 1.5, 46, 3, 206, "y", { color: Riso.INK.y.mid });
      s.rect(CX, 46, 250, 206, "y", { color: Riso.INK.y.pale });
      s.label(CX + 16, 72, "python · one sqlite file", { cls: "strong" });
      s.label(CX + 16, 90, "no model in the loop", { cls: "mono" });
      JOBS.forEach(([job, every], i) => {
        const y = 122 + i * 22;
        s.label(CX + 16, y, job, { cls: "mono" });
        s.label(CX + 234, y, every, { anchor: "end", cls: "mono" });
      });
      // its own clock, which keeps going whatever the models do
      s.label(CX + 16, 236, "loop", { cls: "mono" });
      s.rect(CX + 62, 228, 172, 8, "k", { color: "#f3e3b8" });
      s.rect(CX + 62, 228, 172 * (tick + 1) / 30, 8, "y", { color: Riso.INK.y.strong });
      ROWS.forEach((r) => {
        const off = r.model && down;
        const live = !off && (!r.direct || sending);
        const col = r.ink === "k" ? T.ink : Riso.INK[r.ink].strong;
        s.label(0, r.y + 1, r.k, { cls: "strong", fill: off ? T.refDot : null });
        let status = r.sub;
        if (off) status = "model down";
        if (r.k === "peter" && paused && !off) status = "paused";
        s.label(0, r.y + 19, status, { cls: "mono", fill: status === "paused" ? Riso.INK.y.strong : null });
        s.wire(`M${NX},${r.y}H${RAIL}`, r.ink, { on: live, color: col, flow: live && { ms: 1700, n: 1 } });
        s.node(NX, r.y, 5.5, r.ink, { color: off ? T.ref : r.k === "peter" && paused ? Riso.INK.y.mid : col });
        if (!r.direct) s.port(SEAM, r.y, "g", live, { color: Riso.INK.g.strong });
        else s.label(SEAM + 8, r.y - 8, "no model", { cls: "mono" });
      });
    });
    ui.whileVisible((t) => { if (t - last < 500) return; last = t; tick = (tick + 1) % 30; s.redraw(); });
    ui.choice([{ label: "models up", value: false }, { label: "models down", value: true }], (v) => { down = v; s.redraw(); });
    ui.action("send !pause", async (b) => {
      b.disabled = true;
      sending = true; s.redraw();
      await new Promise((r) => setTimeout(r, Riso.reduced ? 0 : 1400));
      paused = !paused; sending = false; s.redraw();
      b.textContent = paused ? "send !resume" : "send !pause";
      b.disabled = false;
    });
  });
})();
