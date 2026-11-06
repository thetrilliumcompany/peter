// Every HQ finding in data/appendix-data.js becomes a figure "hq-<id>", drawn with the chart
// type the finding names (hbar, bar, slope, line, stacked_bar, big_number) from charts/hq.js.
// To change one finding's chart, edit its entry in the data; to change how a type looks, edit charts/hq.js.
(() => {
  const { fig } = Riso;
  const { HQ, hbar, columns, lines, slope, stacked, big, parts, strip, spendWall, compare } = Riso.hq;
  // What each chart shows: a plain title, the scale's unit and format, and a sub only where the
  // chart can't be read correctly without one. The default is no sub.
  // The data's own title and takeaway stay in the alt text.
  const LABELS = {
    "revenue-vs-model-spend": { title: "Model spend against revenue", alt: "Model spend against revenue through November 2. Peter and the Manager used $6,571 of models at API list price, 23% of it the Manager's, and earned $26: about $253 for every $1." },
    "effort-vs-revenue": { title: "Peter's model spend by business line", axis: ["model spend", "usd"] },
    "redirect-run-cost": { title: "Average model cost per run, by what started the run", axis: ["cost per run", "usd"] },
    "channel-reach": { title: "Peter's outreach by channel, and how much of it reached a person" },
    "reply-speed": { title: "How long Peter took to answer a prospect's email" },
    "business-hours": { title: "Emails and form notes arriving in business hours, by country", sub: "9:00 to 17:00 on a weekday, local time.", axis: ["share arriving in business hours", "pct"] },
    "contact-form-failures": { title: "Why contact-form attempts failed", axis: ["share of failed attempts", "pct"] },
    "humans-call-reactions": { title: "Calls by the other side's main reaction", axis: ["share of calls", "pct"] },
    "humans-hang-up-timing": { title: "Time from Peter's first words to the hang-up" },
    "humans-gatekeepers": { title: "Calls that reached a person, by who answered first" },
    "humans-ai-question": { title: "How calls went when someone asked if Peter was an AI" },
    "ai-disclosure-on-calls": { title: "When Peter said he was an AI on calls", sub: "782 is his outbound calls with at least one line from him, 19 is the calls where someone asked, and 17 is the times he said so.", alt: "Peter opened 0 of 782 outbound calls by saying he was an AI. He said so on 17 of the 19 calls where someone asked, and 10 of those 17 ended within 1 more remark.", axis: ["share of each group", "pct"] },
    "humans-rejection": { title: "How the agents reacted when people said no", axis: ["share of moments", "pct"] },
    "humans-surprise-by-role": { title: "How often people surprised the agents, by role", axis: ["share of moments", "pct"] },
    "humans-surprise-words": { title: "Words of surprise in Peter's reasoning", sub: "Unexpected, surprising, strange or turns out.", axis: ["share of runs", "pct"] },
    "humans-stance-by-role": { title: "How the agents treated each kind of person", axis: ["share of moments", "pct"] },
    "boss-redirect-effect": { title: "Peter's waiting before and after a Manager review, by the Manager's decision", sub: "10 runs before and 10 after each review.", axis: ["share of runs", "pct"] },
    "questions-to-the-boss": { title: "Questions Peter sent the Manager, per day", axis: ["questions", "n"] },
    "humans-partner-deference": { title: "How the agents treated the partners, week 1 and week 2", axis: ["share of moments", "pct"] },
    "honesty-ledger": { title: "Peter's unsupported claims and honest corrections, per day", axis: ["share of runs", "pct"] },
    "reasoning-phrases": { title: "Kinds of phrase in Peter's reasoning", axis: ["share of runs", "pct"] },
    "invented-tools": { title: "Calls to tools that don't exist, per day", axis: ["calls", "n"] },
  };
  // findings that read better as a different chart than their data type suggests
  const DRAW = {
    // the traces through Nov 2, deduplicated by agent and span ID: the same totals the article quotes
    "revenue-vs-model-spend": () => spendWall({ series: [
      { name: "Model spend", pts: [{ y: 6570.77 }] }, { name: "Revenue", pts: [{ y: 26 }] },
      { name: "Manager share of spend", pts: [{ y: 1533.74 / 6570.77 }] }, { name: "Spend per $1 of revenue", pts: [{ y: 6570.77 / 26 }] },
    ] }),
    "channel-reach": (f, base) => parts(f, base, { whole: "emails, forms and calls", part: "a person responded", pct: true, axis: "touches" }),
    "humans-gatekeepers": (f, base) => parts(f, base, { whole: "calls", part: "reached someone who could decide", pct: true, axis: "calls" }),
    "humans-ai-question": (f, base) => hbar({ ...f, axis: ["share of those calls", "pct"] }, base),
    // three counts with different bases, drawn as shares so they sit on one scale. Call transcripts through
    // Nov 2; "asked" and "said so" are the same read of each call as humans-ai-question.
    "ai-disclosure-on-calls": (f, base) => hbar({ ...f, series: [{ name: f.series[0].name, pts: [
      ["Opened by saying he is an AI", 0, 782], ["Said he is an AI when asked", 17, 19], ["Call ended within 1 more remark", 10, 17],
    ].map(([x, a, b]) => ({ x, y: a / b, l: `${a} of ${b}` })) }] }, base),
    "humans-hang-up-timing": (f, base) => strip(f, base, { lead: 2, note: "45% within 10 seconds", axis: "share of those calls" }),
    "reply-speed": (f, base) => strip(f, base, { lead: 1, note: "18 within 5 minutes", counts: true, axis: "replies" }),
    "humans-surprise-words": (f, base) => compare(f, base),
  };
  // people on the other end are the outside world, drawn in its emerald
  const BASE = { humans: "g", funnel: "b", time: "b", cost: "b", reasoning: "b", reliability: "b", manager: "r", communication: "b" };
  const KIND = { hbar, bar: columns, slope, line: lines, stacked_bar: stacked, big_number: big };
  for (const [id, raw] of Object.entries(HQ.findings)) {
    // the charts stop at the end of Nov 2, so any day after that comes off the dated ones
    const series = raw.series.map((q) => ({ ...q, pts: q.pts.filter((p) => !/^2026-11-(0[3-9]|[12])/.test(p.x)) }));
    const f = { ...raw, series, sub: undefined, ...LABELS[id] };
    const base = BASE[f.cat] || "b";
    const made = (DRAW[id] || KIND[f.type])(f, base);
    fig(`hq-${id}`, {
      w: Riso.hq.W,
      h: made.h,
      title: f.title,
      sub: f.sub,
      alt: f.alt || `${raw.title}. ${raw.take}`,
      minWidth: 480,
    }, made.build);
  }

  // ---------- the costs tab ----------
})();
