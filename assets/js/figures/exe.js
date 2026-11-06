// Figure "exe", placed in index.html as <figure data-rf="exe"></figure>.
// Peter's calls leave the VM with no key; exe.dev's proxy on the boundary adds it.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, T } = Riso;

  const SERVICES = ["Stripe", "Slack", "Gmail"];
  const C = { peter: Riso.INK.b.strong, proxy: Riso.INK.g.strong };

  fig("exe", {
    w: 600,
    h: 230,
    alt: "Peter on one exe.dev VM. His requests to Stripe, Slack and Gmail leave the VM with no key, and exe.dev's proxy, on the VM's boundary, adds the key on the way out.",
  }, (s) => {
    const BUS = 186, SEAM = 330, TX = 440, ROW = [78, 136, 194];
    const head = (x, text, color, anchor = "middle") => {
      const w = s.measure(text, { cls: "mono" });
      s.legend([[text, color]], anchor === "middle" ? x - (w + 13) / 2 : x, 16, { mono: true });
    };
    s.paint(() => {
      head(0, "peter's vm", C.peter, "start");
      head(SEAM, "exe.dev proxy", C.proxy);
      head(TX, "services", T.refDot, "start");
      // the boundary of the VM
      s.seam(SEAM, 30, SEAM, 222);
      // Peter, and the bus his calls leave on
      s.rect(0, ROW[1] - 30, 136, 60, "b", { card: true, color: Riso.INK.b.pale });
      s.label(14, ROW[1] + 5, "peter", { cls: "strong" });
      s.wire(`M136,${ROW[1]}H${BUS}`, "b");
      s.wire(`M${BUS},${ROW[0]}V${ROW[2]}`, "b");
      s.label(SEAM - 14, ROW[0] - 9, "no key", { anchor: "end", cls: "mono" });
      s.label(SEAM + 14, ROW[0] - 9, "+ key", { cls: "mono", fill: "#0b7a5b" });
      SERVICES.forEach((name, i) => {
        const y = ROW[i];
        // out of the VM with no key, through the proxy, on to the service with one
        s.wire(`M${BUS},${y}H${SEAM}`, "b", { flow: { ms: 1600, n: 2 } });
        s.wire(`M${SEAM},${y}H${TX}`, "g", { color: C.proxy, flow: { ms: 1600, n: 2 } });
        s.node(BUS, y, 5, "b");
        s.port(SEAM, y, "g", true, { color: C.proxy });
        s.rect(TX, y - 22, 160, 44, "g", { card: true, color: Riso.INK.g.pale });
        s.label(TX + 16, y + 5, name, { cls: "strong" });
      });
    });
  });
})();
