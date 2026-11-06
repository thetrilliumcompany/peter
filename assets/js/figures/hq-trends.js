// Figure "hq-trends", placed in index.html as <figure data-rf="hq-trends"></figure>.
// An explorer of behaviour tags by day.
// Uses the shared HQ chart types in charts/hq.js. See figures/README.md.
(() => {
  const { fig, fmt } = Riso;
  const { HQ, W, dayLabel, nice, niceStep, pctTick } = Riso.hq;

  const COMBINE = (agent, group) => {
    const out = {};
    for (const a of agent === "both" ? ["peter", "manager"] : [agent]) {
      for (const [k, v] of Object.entries(HQ.trends.groups[a][group])) {
        out[k] = out[k] ? out[k].map((x, i) => x + v[i]) : [...v];
      }
    }
    return out;
  };
  fig("hq-trends", {
    w: Riso.hq.W,
    fit: false,
    h: 352,
    title: "Every tag, day by day",
    alt: "An explorer of behaviour tags by day. Choosing a tag shows the share or count of that day's runs carrying it.",
    minWidth: 520,
  }, (s, ui) => {
    let agent = "both", group = "pattern", sel = 0, mode = "share";
    const LX = 178, CX = 252, CW = (W - CX - 6) / HQ.trends.days.length, RH = 24, TOP = 8, RN = 14, Y0 = 322;
    const list = () => Object.entries(COMBINE(agent, group)).map(([k, v]) => [k, v, v.reduce((a, b) => a + b, 0)]).sort((a, b) => b[2] - a[2]).slice(0, RN);
    const totals = () => HQ.trends.days.map((_, i) => (agent === "manager" ? 0 : HQ.trends.total.peter[i]) + (agent === "peter" ? 0 : HQ.trends.total.manager[i]));
    s.paint(() => {
      const L = list();
      if (sel >= L.length) sel = 0;
      const T = totals();
      L.forEach(([k, , c], i) => {
        const on = i === sel, y = TOP + i * RH;
        s.label(LX - 44, y + 15, nice(k), { anchor: "end", cls: on ? "strong" : "" });
        s.label(LX + 28, y + 15, fmt(c), { anchor: "end", cls: on ? "strong" : "tiny" });
      });
      const row = L[sel];
      if (!row) return;
      const V = row[1].map((v, i) => (mode === "share" ? (T[i] ? v / T[i] : 0) : v));
      const max = Math.max(...V) || 1;
      const ink = agent === "manager" ? "r" : "b";
      s.label(W - 6, 14, mode === "share" ? "share of the day's runs" : "runs", { anchor: "end", cls: "mono" });
      const step = niceStep(max);
      s.hgrid(CX, W - 6, [0, 1, 2, 3, 4, 5].map((k) => k * step).filter((v) => v <= max), (v) => Y0 - v / max * 270, mode === "share" ? pctTick : fmt);
      V.forEach((v, i) => {
        const h = v / max * 270;
        s.rect(Math.round(CX + i * CW + 2), Math.round(Y0 - h), Math.round(CW - 4), Math.max(1, Math.round(h)), ink, { p: 3, k: 0.3 });
        if (i % 3 === 0) s.label(CX + i * CW + CW / 2, Y0 + 18, dayLabel(HQ.trends.days[i]), { anchor: "middle", cls: "tiny" });
      });
      const top = V.indexOf(max);
      s.label(CX + top * CW + CW / 2, Y0 - 276, mode === "share" ? `${Math.round(max * 100)}%` : fmt(max), { anchor: "middle", cls: "strong" });
    });
    const read = () => { const r = list()[sel]; if (r) ui.read(`<b>${nice(r[0])}:</b> ${fmt(r[2])} runs.`); };
    for (let i = 0; i < RN; i++) {
      const go = () => { sel = i; s.arm(); s.redraw(); read(); };
      s.spot(0, TOP + i * RH, LX + 32, RH, { label: `value ${i + 1}`, click: go, enter: () => { if (sel !== i) { sel = i; s.redraw(); read(); } } });
    }
    ui.choice(["pattern", "trigger", "storyline", "outcome", "channel"].map((g) => ({ label: `${g}s`, value: g })), (v) => { group = v; sel = 0; s.redraw(); read(); }, 0, "tag");
    ui.choice([{ label: "both", value: "both" }, { label: "peter", value: "peter" }, { label: "manager", value: "manager" }], (v) => { agent = v; s.redraw(); read(); }, 0, "who");
    ui.choice([{ label: "share of the day's runs", value: "share" }, { label: "count", value: "count" }], (v) => { mode = v; s.redraw(); }, 0, "show");
    read();
  });

  // ---------- the flows tab ----------
})();
