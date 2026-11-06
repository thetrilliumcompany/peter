// Figure "stumbles", placed in index.html as <figure data-rf="stumbles"></figure>.
// A timeline from October 19 to November 3.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt, T } = Riso;

  const OUT = [16, 114, 909, 525, 928, 901, 1097, 743, 557, 588, 351, 374, 370, 319, 246, 272];
  // day = days after Oct 19, Toronto. Every date is from the run's commits, interventions, blockers or milestones.
  const EVENTS = [
    [1.01, "manager", "Oct 20 · Duplicate emails hit 14 firms", "A sender restart sent the same cold email twice. The Manager paused Peter and had a subagent audit the sender, read-only."],
    [1.02, "us", "Oct 20 · A unique key on every send", "A keyed claim in the sender, no resend after an error, and a paused Peter is refused at the gate."],
    [1.45, "world", "Oct 20 · Craigslist refuses the headless browser", "The ad never posted."],
    [1.47, "world", "Oct 20 · xAI returns 402", "Answered calls went silent. Peter stopped calling."],
    [1.49, "manager", "Oct 20 · Calls shelved after 27 dials", "The Manager stopped the AODA cold-call pilot."],
    [1.62, "us", "Oct 20 · Peter never waits", "Wait tool denied, nudge after 5 minutes without progress, and the prompt asks for 3+ things in flight."],
    [1.7, "manager", "Oct 20 · Pause over a forum's AI rule", "The Manager paused Peter over one community's ban on AI content."],
    [2.57, "us", "Oct 21 · We hold the approvals", "Standing authorisations in both prompts. The Manager pauses only for active harm. Peter resumed."],
    [2.59, "us", "Oct 21 · Voice fixes", "Key presses for phone menus, no fixed call length, wait for the callee's greeting."],
    [2.58, "world", "Oct 21 · Card declined", "A $10 Google Ads verification failed on the company Visa."],
    [2.73, "peter", "Oct 21 · Pivot to a C$99 fix", "A browser-warning fix instead of paperwork."],
    [2.76, "world", "Oct 21 · Gmail's spam filter", "It rejected the offer emails, so that offer went phone-only."],
    [3.02, "peter", "Oct 22 · 1,618 Perth websites", "Scanned for broken HTTPS: 13 broken, 5 verified with landlines, 6 dials, no conversation past the opener."],
    [3.3, "manager", "Oct 22 · Agency QA cancelled", "About 560 sends, no positive replies, one complaint."],
    [3.36, "world", "Oct 22 · Gmail's limit", "1,032 sends in 24 hours. Gmail blocked hello@ for a day and even a test bounced."],
    [3.39, "manager", "Oct 22 · Calls halted", "Over a missing recording notice."],
    [3.58, "us", "Oct 22 · noVNC", "So we can do CAPTCHA and ID steps in Peter's browser. He links us in when he's stuck."],
    [3.7, "us", "Oct 22 · A rolling send limit", "850 in 24 hours: 750 for outreach, 100 kept for replies."],
    [5.42, "peter", "Oct 24 · Nine batches, nothing sent", "With the disk full, the sender marked them finished. He requeued them and checked Gmail's Sent folder."],
    [5.71, "world", "Oct 24 · xAI out of credit", "Calls connect, then go silent."],
    [7.65, "us", "Oct 26 · xAI topped up", "Voice works again."],
    [7.9, "us", "Oct 26 · One more week", "The first deadline was two hours away. We moved it to Nov 2, and a week-one review killed 25 live bets in one go."],
    [8.4, "us", "Oct 27 · Disk 25 → 50 GB", "One resize and a reboot. Every service came back by itself."],
    [8.41, "world", "Oct 27 · Prepaid card refused", "Reddit Ads doesn't take them, so that ad never ran."],
    [9.41, "peter", "Oct 28 · First sale: $13", "The customer pays and asks for more.", 1],
    [9.43, "world", "Oct 28 · Gmail limit again", "At about 140 messages in 24 hours this time. The reputation was the real limit."],
    [9.46, "manager", "Oct 28 · Concentrate on opening-soon lists", "The other cohorts went reply-only."],
    [9.55, "world", "Oct 28 · Google suspends peter@", "About 15 minutes after a browser sign-in from the VM."],
    [9.57, "us", "Oct 28 · A second mailbox", "peter@ for customers, hello@ for cold outreach."],
    [9.87, "us", "Oct 28 · Anti-slop", "Design and writing skills, and the Manager checks for sloppy deliverables."],
    [9.9, "us", "Oct 28 · Customer desk and sign-off", "A model reads every customer email. Emails to paying customers now need the Manager."],
    [10.08, "peter", "Oct 29 · Repeats caught", "Three of nine sites in a $16 batch were ones the customer had already paid for. He pulled the link."],
    [11.1, "manager", "Oct 30 · “Haven't tested willingness to pay”", "On the first ten calls of the Australian round."],
    [11.5, "manager", "Oct 30 · 45 minutes, 15 outside requests", "The Manager noticed the tunnel vision and pushed Peter outside spreadsheets, websites and automation."],
    [12.4, "peter", "Oct 31 · 36 misrouted replies", "Replies since Oct 21 had gone to his own inbox. He patched the sender."],
    [12.65, "us", "Oct 31 · Count first, then quote", "After 50 sites were promised and about 10 were found."],
    [13.4, "us", "Nov 1 · Disk 50 → 75 GB", "The second resize."],
    [13.74, "peter", "Nov 1 · Second sale: another $13", "That makes $26. The customer buys again, after the Manager checks the emails and sends Peter back.", 1],
    [14.65, "us", "Nov 2 · Manager moves to GPT-6.1 Sol", "Astra had hit capacity at OpenAI."],
    [14.96, "us", "Nov 2 · The deadline moves to Nov 12", "With an hour to spare."],
    [15.4, "world", "Nov 3 · hello@ blocked again", "Five of five sends rejected in a morning."],
  ];
  fig("stumbles", {
    w: 600,
    h: 340,
    alt: "A timeline from October 19 to November 3. Bars show emails, forms and calls sent per day. Four rows of dots below mark what Peter changed, when the Manager stepped in, when we stepped in, and what outside blockers got in the way. The two large dots are the two $13 sales.",
  }, (s) => {
    let sel = EVENTS.findIndex((e) => e[4]);
    const X = 4, R = 596, D = 16;
    const dx = (d) => X + d / D * (R - X);
    const cw = (R - X) / D;
    // each row is named above its line, so the timeline gets the full width
    const ROWS = [
      ["peter", "peter changed course", "b", 168],
      ["manager", "manager stepped in", "r", 206],
      ["us", "we stepped in", "k", 244],
      ["world", "outside blockers", "by", 282],
    ];
    const rowOf = Object.fromEntries(ROWS.map((r) => [r[0], r]));
    const ACT = { b: Riso.INK.b.strong, r: Riso.INK.r.strong, k: "#282828", by: Riso.INK.g.strong };
    const days = ["oct 19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "nov 1", "2", "3"];
    s.paint(() => {
      // what went out each day
      s.label(X, 12, "emails, forms and calls sent each day", { cls: "mono" });
      OUT.forEach((n, i) => {
        const h = Math.max(2, n / 1097 * 68);
        s.rect(dx(i) + 3, 108 - h, cw - 6, h, "k", { color: T.ref });
        s.label(dx(i) + cw / 2, 102 - h, fmt(n), { anchor: "middle", cls: "tiny" });
        s.label(dx(i) + cw / 2, 126, days[i], { anchor: "middle", cls: "tiny" });
      });
      // a faint guide from the picked event up to its day
      const e = EVENTS[sel];
      s.guide(dx(e[0]), 132, dx(e[0]), rowOf[e[1]][3] - 8);
      for (const [who, name, ink, y] of ROWS) {
        s.mark(0, X + 4, y - 18, 4, ink, { color: ACT[ink] });
        s.label(X + 14, y - 13, name, { cls: "tiny", fill: who === e[1] ? "#262323" : null });
        s.rect(X, y - 0.5, R - X, 1, "k", { color: T.grid, bg: true });
      }
      // dots never change on hover; the guide line and the line below show the pick
      EVENTS.forEach((ev) => {
        const sale = !!ev[4];
        const x = Math.round(dx(ev[0])), y = rowOf[ev[1]][3];
        s.node(x, y, sale ? 7.5 : 5, "k", { color: sale ? T.ink : ACT[rowOf[ev[1]][2]], knock: 2.5 });
        if (sale) s.label(x, y - 14, "$13 sale", { anchor: "middle", cls: "tiny strong" });
      });
      const ink = rowOf[e[1]][2];
      s.mark(0, X + 4, 316, 4.5, "k", { color: e[4] ? T.ink : ACT[ink] });
      s.label(X + 14, 321, `${e[2]}`, { cls: "strong" });
    });
    // nearest event under the pointer, so tightly packed days are still reachable
    const pick = (i) => { if (i !== sel) { sel = i; s.redraw(); } };
    for (const [who, , , y] of ROWS) {
      const hit = s.spot(X, y - 12, R - X, 24, { label: `${rowOf[who][1]}`, enter: () => {} });
      for (const type of ["pointermove", "pointerdown"]) hit.addEventListener(type, (ev) => {
        const vx = s.point(ev).x;
        let best = -1, dist = 1e9;
        EVENTS.forEach((e, i) => { if (e[1] === who) { const q = Math.abs(dx(e[0]) - vx); if (q < dist) { dist = q; best = i; } } });
        if (best >= 0) pick(best);
      });
    }
  });

  // ---------- offers ----------
})();
