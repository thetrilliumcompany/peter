// Figure "compaction", placed in index.html as <figure data-rf="compaction"></figure>.
// A bar of about 850,000 tokens collapses to about 75,000, of which roughly 20,000 are kept word for word.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt, T } = Riso;

  fig("compaction", {
    fit: false,
    w: 600,
    h: 262,
    morph: false,
    alt: "One of Peter's compactions, to scale. The context window holds a million tokens; about 850,000 of them collapse to about 75,000: a structured summary of the goal, constraints, progress, decisions and next steps, plus the last 20,000 tokens kept word for word. Below, compactions so far: 55 for Peter and 64 for the Manager.",
  }, (s, ui) => {
    const W = (n) => n / 1_000_000 * 600;
    let v = 850_000, done = false;
    const Y = 30, H = 52;
    s.paint(() => {
      s.label(0, 14, "context window · 1,000,000 tokens, to scale", { cls: "mono" });
      // the window, as a dashed tile, and what's in it
      s.frame(0, Y, 600, H, "k", { gap: 1 });
      const tail = W(20_000), body = Math.max(W(55_000), W(v) - tail);
      s.rect(2, Y + 2, body - 2, H - 4, "b", { color: done ? Riso.INK.b.strong : Riso.INK.b.mid });
      s.rect(2 + body, Y + 2, tail, H - 4, "k", { color: T.ink });
      const tl = `≈ ${fmt(Math.round(v / 1000) * 1000)} tokens`;
      if (W(v) > 300) s.label(W(v) - 14, Y + H / 2 + 6, tl, { anchor: "end", cls: "strong" });
      else s.label(W(v) + 14, Y + H / 2 + 6, tl, { cls: "strong" });
      if (done) {
        // what the 75,000 are made of
        s.guide(body / 2, Y + H, body / 2, 116);
        s.label(0, 130, "structured summary", { cls: "strong" });
        s.label(0, 148, "goal · constraints · progress · decisions · next steps", { cls: "mono" });
        s.guide(body + tail / 2, Y + H, body + tail / 2, 98);
        s.guide(body + tail / 2, 98, 240, 98);
        s.label(248, 103, "the last ~20,000 tokens, word for word", { cls: "strong" });
      }
      // compactions so far, one tick each
      for (const [name, n, ink, y] of [["peter", 55, "b", 214], ["manager", 64, "r", 242]]) {
        s.label(0, y + 5, name, { cls: "mono" });
        for (let i = 0; i < n; i++) s.rect(80 + i * 6.6, y - 9, 3.4, 18, ink, { color: Riso.INK[ink].strong });
        s.label(80 + n * 6.6 + 8, y + 5, `${n}`, { cls: "strong" });
      }
      s.label(0, 190, "compactions so far", { cls: "mono" });
    });
    let anim = 0;
    const run = (to) => {
      cancelAnimationFrame(anim);
      if (Riso.reduced) { v = to; done = to < 100000; s.redraw(); return; }
      const from = v, t0 = performance.now();
      const step = (t) => {
        const u = Math.min(1, (t - t0) / 1100), e = 1 - (1 - u) ** 3;
        v = from + (to - from) * e;
        done = u === 1 && to < 100000;
        s.redraw();
        if (u < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    };
    const b = ui.action("compact", () => {
      if (v > 100000) { run(75_000); b.textContent = "undo"; }
      else { run(850_000); b.textContent = "compact"; }
    });
  });
})();
