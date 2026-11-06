// Figure "herdr", placed in index.html as <figure data-rf="herdr"></figure>.
// A Herdr window with four panes: setup, operator, Manager and Peter.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  fig("herdr", {
    w: 600,
    h: 300,
    alt: "A Herdr server holds four panes: setup and operator, idle, and the Manager and Peter, working. Viewers, an ssh session and two laptops, attach across the server's boundary. Closing the laptops only detaches them; the panes keep running. If Peter's process dies, Herdr reports it and the controller restarts him in the same pane.",
  }, (s, ui) => {
    const panes = [
      { n: "setup", sub: "one prompt thread", ink: "k", st: "idle" },
      { n: "operator", sub: "peterctl, by hand", ink: "k", st: "idle" },
      { n: "manager", sub: "omp", ink: "r", st: "working" },
      { n: "peter", sub: "omp", ink: "b", st: "working" },
    ];
    const VIEWERS = [[150, "ssh session"], [300, "laptop"], [450, "laptop"]];
    const TW = 141, TY = 38, TH = 112, SEAM = 186, VY = 226;
    let attached = true, peter = "working", tick = 0, last = 0;
    s.paint(() => {
      s.legend([["herdr server · systemd, lingering", Riso.INK.y.mid]], 0, 16, { mono: true });
      panes.forEach((p, i) => {
        const x = i * (TW + 12), st = p.n === "peter" ? peter : p.st;
        const col = p.ink === "k" ? T.refDot : Riso.INK[p.ink].strong;
        if (st === "exited") {
          // a dead pane, the way Tinker draws a failed GPU
          s.frame(x, TY, TW, TH, "k", { gap: 1 });
        } else {
          s.rect(x, TY, TW, TH, p.ink, { color: st === "restarting" ? Riso.INK.y.pale : st === "working" ? Riso.INK[p.ink].pale : T.cell });
          if (st === "working" || st === "restarting") s.rect(x, TY, 4, TH, p.ink, { color: st === "restarting" ? Riso.INK.y.mid : col });
        }
        s.label(x + 16, TY + 26, p.n, { cls: "strong" });
        s.label(x + 16, TY + 44, p.sub, { cls: "mono" });
        // activity: bars that move while the pane works, flat while it waits
        for (let m = 0; m < 6; m++) {
          const work = st === "working", h = work ? 6 + ((tick * 3 + m * 5 + i * 7) % 11) * 2.4 : 4;
          s.rect(x + 16 + m * 9, TY + 84 - h, 5, h, p.ink, { color: work ? col : T.ref });
        }
        s.label(x + 16, TY + TH - 10, st === "restarting" ? "restarting" : st, { cls: "mono", fill: st === "exited" ? Riso.INK.r.strong : null });
      });
      // the window holding all four panes; a viewer attaches to the whole window, not one pane
      const RAIL = TY + TH + 14;
      s.rect(0, RAIL - 1, 600, 2, "k", { color: T.ink });
      // the server's edge; viewers attach across it
      s.seam(0, SEAM, 600, SEAM);
      s.label(600, SEAM - 8, "↑ on the server", { anchor: "end", cls: "mono" });
      s.label(600, SEAM + 19, "↓ viewers", { anchor: "end", cls: "mono" });
      VIEWERS.forEach(([x, name], i) => {
        const on = attached || i === 0;
        if (on) s.wire(`M${x},${VY}V${RAIL}`, "k", { color: T.ink, w: 1.5, flow: { ms: 1500 + i * 250, n: 1, r: 2.2 } });
        else s.wire(`M${x},${VY}V${SEAM + 10}`, "k", { on: false, w: 1.5 });
        s.port(x, SEAM, "k", on, { color: T.ink, r: 5 });
        if (!on) s.label(x + 12, SEAM + 22, "detached", { cls: "mono" });
        s.rect(x - 60, VY, 120, 38, "k", { color: T.cell });
        s.label(x, VY + 24, name, { anchor: "middle", cls: on ? "strong" : "dim" });
      });
    });
    ui.whileVisible((t) => { if (t - last < 280) return; last = t; tick = (tick + 1) % 1000; s.redraw(); });
    ui.choice([{ label: "laptops open", value: true }, { label: "close them", value: false }], (v) => { attached = v; s.redraw(); });
    ui.action("crash peter", async (b) => {
      b.disabled = true;
      const wait = (ms) => new Promise((r) => setTimeout(r, Riso.reduced ? 0 : ms));
      peter = "exited"; s.redraw();
      await wait(1500);
      peter = "restarting"; s.redraw();
      await wait(1300);
      peter = "working"; s.redraw();
      b.disabled = false;
    });
  });
})();
