// Figure "tokens", placed in index.html as <figure data-rf="tokens"></figure>.
// 29.1 billion tokens as 290 marks of about 100 million each, in one box.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig } = Riso;

  const AGENTS = [
    { n: "peter and subagents", v: "27.46b · 94%", ink: "b", kinds: [
      { k: 0, dots: 273, num: "27.35" },
      { k: 2, dots: 1, num: "0.13" },
    ] },
    { n: "manager", v: "1.62b · 6%", ink: "r", kinds: [
      { k: 0, dots: 16, num: "1.57" },
    ] },
  ];
  const KINDS = [{ k: 0, n: "input", v: "28.96b · 99.5%" }, { k: 2, n: "output", v: "0.13b · 0.5%" }];
  // light to dark: input, (unused), output
  const SHADE = { b:["#8ec8ea", "#007ec7", "#00426b"], r: ["#f0aa9f", "#d4553f", "#86281a"] };
  fig("tokens", {
    w: 600,
    h: 262,
    tight: true,
    alt: "29.1 billion tokens as 290 marks of about 100 million each, in one box. Blue marks are Peter and his subagents (274), red the Manager (16). Every mark is input except one dark triangle of output. At list price that is $5,593 for Peter and $1,593 for the Manager, $7,187 in all: about $276 of model use for each dollar of revenue.",
  }, (s) => {
    let sel = null;
    const W = 600, H = 262;
    // key on the left, the box of marks filling the rest of the width
    const KX = 2, BX = 172, BR = W - 2, BY = 2, ROWS = 10, PAD = 11;
    const marks = AGENTS.flatMap((a, ai) => a.kinds.flatMap((kd) => Array(kd.dots).fill([ai, kd.k])));
    const COLS = Math.ceil(marks.length / ROWS);
    const G = (BR - BX - 2 * PAD) / (COLS - 1), R = G * 0.38, X = BX + PAD, Y = BY + PAD;
    const BW = BR - BX, BH = (ROWS - 1) * G + 2 * PAD;
    // marks snake down one column and up the next, so each run stays in one piece
    const cell = (j) => { const c = Math.floor(j / ROWS), r = j % ROWS; return [c, c % 2 ? ROWS - 1 - r : r]; };
    const NY = BY + BH + 46;
    const WHO = [["peter and subagents", "27.46b · 94% · $5,593"], ["manager", "1.62b · 6% · $1,593"]];
    const GREY = ["#c9c9c3", "#8a8a84", "#383838"];
    // four entries down the left, spread over the height of the box: who (colour), then what (shade and shape)
    const gap = (BH - 4 * 36) / 3;
    const items = [
      ...WHO.map(([n, v], ai) => ({ type: "agent", ai, y: BY + 16 + ai * 36 + ai * gap, n, v })),
      ...KINDS.map(({ k, n, v }, i) => ({ type: "kind", k, y: BY + 16 + (i + 2) * 36 + (i + 2) * gap, n, v })),
    ];
    s.paint(() => {
      // the marks sit on one card, lifted off the page like a dashboard panel
      s.rect(BX, BY, BW, BH, "k", { card: true });
      marks.forEach(([ai, k], j) => {
        // hovering fades whatever isn't picked; nothing moves or resizes
        const off = sel && (sel.type === "agent" ? sel.ai !== ai : sel.k !== k);
        const ink = AGENTS[ai].ink;
        const [c, r] = cell(j);
        s.mark(k, X + c * G, Y + r * G, R, ink, { color: SHADE[ink][k], fade: off ? 0.2 : null });
      });
      items.forEach((it) => {
        const on = sel && sel.type === it.type && (it.type === "agent" ? sel.ai === it.ai : sel.k === it.k);
        if (it.type === "agent") s.mark(0, KX + 6, it.y - 5, 6, AGENTS[it.ai].ink, { color: SHADE[AGENTS[it.ai].ink][1] });
        else s.mark(it.k, KX + 6, it.y - 5, 6, "k", { color: GREY[it.k] });
        s.label(KX + 20, it.y, it.n, { cls: it.type === "agent" ? "strong" : "", fill: on ? "#262323" : null });
        s.label(KX + 20, it.y + 17, it.v, { cls: "dim", fill: on ? "#262323" : null });
      });
      // three numbers along the bottom in the pixel face, each as wide as it needs, then what one mark is worth
      let x = KX;
      [["29.1b", "tokens"], ["$7,187", "at list price"], ["$276", "per $1 earned"]].forEach(([big, sub]) => {
        s.label(x - 1, NY, big, { cls: "huge" });
        s.label(x, NY + 22, sub, { cls: "dim" });
        x += Math.max(s.measure(big, { cls: "huge" }), s.measure(sub, { cls: "dim" })) + 44;
      });
      s.mark(0, BR - 54, NY - 11, R, "b", { color: SHADE.b[0] });
      s.label(BR, NY + 22, "100 million tokens", { anchor: "end", cls: "dim" });
    });
    const pick = (next) => { if (JSON.stringify(next) === JSON.stringify(sel)) return; sel = next; s.redraw(); };
    // pointing at a mark picks its agent
    const box = s.spot(BX, BY, BW, BH, { label: "tokens by agent", enter: () => {} });
    box.addEventListener("pointermove", (e) => {
      const { x: vx, y: vy } = s.point(e);
      const c = Math.round((vx - X) / G), r = Math.max(0, Math.min(ROWS - 1, Math.round((vy - Y) / G)));
      const j = c * ROWS + (c % 2 ? ROWS - 1 - r : r);
      if (marks[j]) pick({ type: "agent", ai: marks[j][0] });
    });
    items.forEach((it) => {
      const go = () => pick(it.type === "agent" ? { type: "agent", ai: it.ai } : { type: "kind", k: it.k });
      s.spot(KX - 2, it.y - 18, BX - KX - 6, 40, { label: it.n, enter: go, click: go });
    });
    s.svg.addEventListener("pointerleave", () => { if (sel) { sel = null; s.redraw(); } });
  });
})();
