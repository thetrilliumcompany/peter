// Figure "production", placed in index.html as <figure data-rf="production"></figure>.
// Two output curves against human work hours.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  fig("production", {
    w: 600,
    h: 300,
    alt: "Two illustrative output curves against human work hours. The curve with AI sits above the curve without it. At a given number of hours, the vertical gap between them is extra output for the same hours; the horizontal gap is hours saved for the same output.",
  }, (s) => {
    const X0 = 4, X1 = 596, Y0 = 290, H = 250;
    const a = (h) => 0.72 * (1 - Math.exp(-h / 0.42));
    const b = (h) => 1 * (1 - Math.exp(-h / 0.3));
    const inv = (v) => -0.3 * Math.log(1 - v);
    const px = (h) => X0 + h * (X1 - X0);
    const py = (v) => Y0 - v * H;
    const curve = (f) => { let d = ""; for (let h = 0; h <= 1.001; h += 0.02) d += `${d ? "L" : "M"}${px(h).toFixed(1)},${py(f(h)).toFixed(1)}`; return d; };
    const dA = curve(a), dB = curve(b);
    const h = 0.46;
    s.paint(() => {
      // no numbers: these curves are illustrative
      s.hgrid(X0, X1, [0], py, null);
      s.label(X0, 16, "output", { cls: "mono" });
      s.label(X1, Y0 + 22, "hours →", { anchor: "end", cls: "mono" });
      s.wire(dA, "k", { color: T.refDot, w: 2 });
      s.wire(dB, "b", { color: Riso.INK.b.strong, w: 2.5 });
      s.label(px(1), py(b(1)) - 12, "with ai", { anchor: "end", cls: "strong", fill: "#026dbb" });
      s.label(px(1), py(a(1)) + 22, "without ai", { anchor: "end", cls: "strong" });
      const va = a(h), vb = b(h), hs = inv(va);
      // the same hours, more output
      s.guide(px(h), py(va), px(h), py(vb));
      s.bracket(px(h) + 14, py(vb), py(va), "more output");
      // the same output, fewer hours
      s.guide(px(hs), py(va), px(h), py(va));
      const y = py(va) + 16, c = 4;
      s.wire(`M${px(hs)},${y - c}V${y + c}M${px(hs)},${y}H${px(h)}M${px(h)},${y - c}V${y + c}`, "k", { color: T.sub, w: 1, cap: "butt" });
      s.label((px(hs) + px(h)) / 2, y + 20, "fewer hours", { anchor: "middle", cls: "strong" });
      s.node(px(h), py(va), 5.5, "k", { color: T.ink, knock: 3 });
      s.node(px(hs), py(va), 5, "b", { color: Riso.INK.b.strong, knock: 3 });
    });
  });
})();
