// Figure "production", placed in index.html as <figure data-rf="production"></figure>.
// Two output curves against human work hours.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  fig("production", {
    w: 600,
    h: 330,
    alt: "Two illustrative output curves against human work hours. The curve with AI sits above the curve without it. At a given number of hours, the vertical gap between them is extra output for the same hours; the horizontal gap is hours saved for the same output.",
  }, (s, ui) => {
    const X0 = 4, X1 = 596, Y0 = 290, H = 250;
    const a = (h) => 0.72 * (1 - Math.exp(-h / 0.42));
    const b = (h) => 1 * (1 - Math.exp(-h / 0.3));
    const inv = (v) => -0.3 * Math.log(1 - v);
    const px = (h) => X0 + h * (X1 - X0);
    const py = (v) => Y0 - v * H;
    const curve = (f) => { let d = ""; for (let h = 0; h <= 1.001; h += 0.02) d += `${d ? "L" : "M"}${px(h).toFixed(1)},${py(f(h)).toFixed(1)}`; return d; };
    const dA = curve(a), dB = curve(b);
    let h = 0.46, mode = "both";
    s.paint(() => {
      // hairline grid, no y axis: these curves are illustrative, so there are no numbers
      s.hgrid(X0, X1, [0, 0.25, 0.5, 0.75, 1], py, null);
      s.label(X0, 16, "output, at a fixed quality bar", { cls: "mono" });
      s.label(X1, Y0 + 22, "human work hours →", { anchor: "end", cls: "mono" });
      s.wire(dA, "k", { color: T.refDot, w: 2 });
      s.wire(dB, "b", { color: Riso.INK.b.strong, w: 2.5 });
      s.label(px(1), py(b(1)) - 12, "with ai", { anchor: "end", cls: "strong", fill: "#026dbb" });
      s.label(px(1), py(a(1)) + 22, "without ai", { anchor: "end", cls: "strong" });
      const qh = Math.round(h * 100) / 100;
      const va = a(qh), vb = b(qh), hs = inv(va);
      if (mode !== "saved") {
        // the same hours, more output: a vertical bracket between the curves
        s.guide(px(qh), py(va), px(qh), py(vb));
        s.bracket(px(qh) + 14, py(vb), py(va), "extra output");
        s.label(px(qh) + 24, (py(vb) + py(va)) / 2 + 22, "same hours", { cls: "tiny" });
      }
      if (mode !== "output") {
        // the same output, fewer hours: a horizontal bracket back to the curve with AI
        s.guide(px(hs), py(va), px(qh), py(va));
        const y = py(va) + 16, c = 4;
        s.wire(`M${px(hs)},${y - c}V${y + c}M${px(hs)},${y}H${px(qh)}M${px(qh)},${y - c}V${y + c}`, "k", { color: T.sub, w: 1, cap: "butt" });
        s.label((px(hs) + px(qh)) / 2, y + 20, "hours saved", { anchor: "middle", cls: "strong" });
        s.label((px(hs) + px(qh)) / 2, y + 36, "same output", { anchor: "middle", cls: "tiny" });
      }
      s.node(px(qh), py(va), 5.5, "k", { color: T.ink, knock: 3 });
      if (mode !== "output") s.node(px(hs), py(va), 5, "b", { color: Riso.INK.b.strong, knock: 3 });
    });
    ui.slider("hours worked", 0.14, 0.88, h, 0.01, (v) => { h = v; s.redraw(true); });
    ui.choice([{ label: "both", value: "both" }, { label: "more output", value: "output" }, { label: "fewer hours", value: "saved" }], (v) => { mode = v; s.redraw(); });
  });
})();
