// Figure "hq-model-mix", placed in index.html as <figure data-rf="hq-model-mix"></figure>.
// Each model's share of the spend against its share of the calls, with the two bars joined by model.
// Uses the shared HQ chart types in charts/hq.js. See figures/README.md.
(() => {
  const { fig, fmt } = Riso;
  const { HQ, MODEL, xAxis, pctTick, AXIS_H } = Riso.hq;

  // Claude models in blues, OpenAI models in reds; the ordering keeps each side together
  const ORDER = ["claude-opus-5-5", "claude-haiku-5-5", "claude-sonnet-5-5", "gpt-6-astra", "gpt-6.1-sol"];
  const COLOR = { "claude-opus-5-5": Riso.INK.b.strong, "claude-haiku-5-5": Riso.INK.b.mid, "claude-sonnet-5-5": "#0155bf", "gpt-6-astra": Riso.INK.r.strong, "gpt-6.1-sol": Riso.INK.r.mid };

  fig("hq-model-mix", {
    w: Riso.hq.W,
    h: 236 + AXIS_H,
    title: "Each model's share of the spend and of the calls",
    alt: "Two bars split by model. Share of spend: Claude Opus 5.5 75%, GPT-6 Astra 21%, Claude Haiku 5.5 3%, GPT-6.1 Sol 1%. Share of calls: Claude Haiku 5.5 64%, Claude Opus 5.5 30%, GPT-6 Astra 5%, GPT-6.1 Sol 1%. Haiku made nearly two-thirds of the calls for about 3% of the money.",
    minWidth: 480,
  }, (s) => {
    let sel = null;
    const rows = ORDER.map((m) => HQ.mix.find((r) => r.model === m)).filter(Boolean);
    const X0 = 84, X1 = Riso.hq.W - 2, BH = 34, Y1 = 8, Y2 = 104;
    const totals = { cost: rows.reduce((a, r) => a + r.cost, 0), calls: rows.reduce((a, r) => a + r.calls, 0) };
    // where each model's slice starts and ends on a bar
    const spans = (k) => { let x = X0; return rows.map((r) => { const w = r[k] / totals[k] * (X1 - X0); const out = [x, x + w]; x += w; return out; }); };
    const A = spans("cost"), B = spans("calls");
    const pct = (v) => (v >= 0.095 ? `${Math.round(v * 100)}%` : v >= 0.005 ? `${Math.round(v * 100)}%` : "");
    s.paint(() => {
      s.label(X0 - 10, Y1 + 15, "spend", { anchor: "end", cls: "strong" });
      s.label(X0 - 10, Y1 + 31, `$${fmt(Math.round(totals.cost))}`, { anchor: "end", cls: "tiny" });
      s.label(X0 - 10, Y2 + 15, "calls", { anchor: "end", cls: "strong" });
      s.label(X0 - 10, Y2 + 31, fmt(totals.calls), { anchor: "end", cls: "tiny" });
      rows.forEach((r, i) => {
        const off = sel != null && sel !== i;
        const c = COLOR[r.model];
        // the band joining a model's two slices
        const [a0, a1] = A[i], [b0, b1] = B[i];
        const my = (Y1 + BH + Y2) / 2;
        const d = `M${a0},${Y1 + BH}C${a0},${my} ${b0},${my} ${b0},${Y2}H${b1}C${b1},${my} ${a1},${my} ${a1},${Y1 + BH}Z`;
        s.area(d, c, off ? 0.05 : 0.18);
        s.rect(a0, Y1, Math.max(1, a1 - a0 - 1), BH, "b", { color: c, fade: off ? 0.25 : null });
        s.rect(b0, Y2, Math.max(1, b1 - b0 - 1), BH, "b", { color: c, fade: off ? 0.25 : null });
        const dark = r.model === "claude-opus-5-5" || r.model === "claude-sonnet-5-5" || r.model === "gpt-6-astra";
        const t1 = pct(r.cost / totals.cost), t2 = pct(r.calls / totals.calls);
        if (a1 - a0 > 34 && t1) s.label((a0 + a1) / 2, Y1 + BH / 2 + 5, t1, { anchor: "middle", cls: "strong", fill: dark ? "#fbfbf8" : "#262323" });
        if (b1 - b0 > 34 && t2) s.label((b0 + b1) / 2, Y2 + BH / 2 + 5, t2, { anchor: "middle", cls: "strong", fill: dark ? "#fbfbf8" : "#262323" });
      });
      // key: one entry per model, with its spend and calls
      xAxis(s, X0, X1 - X0, 1, Y2 + BH + 1, Y2 + BH + 5, pctTick, "share of total", 0.25);
      const KY = Y2 + BH + 30 + AXIS_H, cw = (X1 - 2) / rows.length;
      rows.forEach((r, i) => {
        const kx = 2 + i * cw, on = sel === i;
        s.rect(kx, KY - 9, 10, 10, "b", { color: COLOR[r.model] });
        s.label(kx + 16, KY, MODEL[r.model].replace("claude ", ""), { cls: "strong", fill: on ? "#262323" : null });
        s.label(kx, KY + 18, `$${fmt(Math.round(r.cost))}`, { cls: "tiny", fill: on ? "#262323" : null });
        s.label(kx, KY + 34, `${fmt(r.calls)} calls`, { cls: "tiny", fill: on ? "#262323" : null });
      });
    });
    const pick = (i) => { if (i !== sel) { sel = i; s.redraw(); } };
    rows.forEach((r, i) => {
      s.spot(A[i][0], Y1, Math.max(4, A[i][1] - A[i][0]), BH, { label: MODEL[r.model], enter: () => pick(i), click: () => pick(i) });
      s.spot(B[i][0], Y2, Math.max(4, B[i][1] - B[i][0]), BH, { label: MODEL[r.model], enter: () => pick(i), click: () => pick(i) });
      s.spot(2 + i * (Riso.hq.W - 4) / rows.length, Y2 + BH + 14 + AXIS_H, (Riso.hq.W - 4) / rows.length, 56, { label: MODEL[r.model], enter: () => pick(i), click: () => pick(i) });
    });
    s.svg.addEventListener("pointerleave", () => pick(null));
  });
})();
