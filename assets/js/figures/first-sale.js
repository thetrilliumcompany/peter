// Figure "first-sale", placed in index.html as <figure data-rf="first-sale"></figure>.
// The only customer, as a conversation: who said what to whom, in order, with the two payments.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig } = Riso;

  // when, from, to, what. Stripe and Gmail records, Toronto time; "self" is a note on one lane.
  // Two moments have no exact time in the records, so they carry no date. Names stay out of this figure.
  const STEPS = [
    ["oct 27, 2:04 am", "peter", "customer", "a free sample of sites"],
    ["2:25 am", "customer", "peter", "likes it, wants more notice"],
    ["3:07 am", "peter", "customer", "7 sites opening soon, $13"],
    ["oct 28, 9:55 am", "customer", "peter", "pays $13, asks for more", "pay"],
    ["8:11 pm", "customer", "peter", "turns down the next sheet"],
    ["9:11 pm", "customer", "peter", "won't pay $13 for three leads"],
    ["oct 29", "peter", "self", "catches repeat sites, pulls a link"],
    ["", "peter", "self", "nearly stops selling to him"],
    ["", "manager", "peter", "read the emails again"],
    ["nov 1, 5:51 pm", "customer", "peter", "pays $13 again: $26 in all", "pay"],
  ];
  const LANE = { manager: 150, peter: 290, customer: 590 };
  const INK = { manager: "#ef402c", peter: "#0387e7", customer: "#8a8a84", pay: "#282828" };

  fig("first-sale", {
    w: 600,
    h: 420,
    alt: "The only customer, as a conversation. Oct 27: Peter sends a free sample, the customer likes it and wants more notice, and at 3:07 am Peter sends 7 sites for $13. Oct 28 at 9:55 am the customer pays. That evening the customer turns down the next sheet and won't pay $13 for three leads. Oct 29: Peter catches repeat sites. He nearly stops selling to the customer until the Manager tells him to read the emails again. Nov 1 at 5:51 pm the customer pays $13 again, $26 in all.",
  }, (s) => {
    const Y0 = 58, RH = 36;
    const BOT = Y0 + (STEPS.length - 1) * RH + 18;
    s.paint(() => {
      // who's who, and their lifelines
      for (const [who, name] of [["manager", "the manager"], ["peter", "peter"], ["customer", "the customer"]]) {
        const x = LANE[who];
        s.mark(0, x, 12, 6, "b", { color: INK[who] });
        s.label(x, 36, name, { anchor: who === "customer" ? "end" : "middle", cls: "strong" });
        s.rect(x - 0.5, 44, 1, BOT - 44, "k", { color: "#e1e1dc" });
      }
      STEPS.forEach(([when, from, to, what, kind], i) => {
        const y = Y0 + i * RH;
        if (when) s.label(2, y + 4, when, { cls: "mono" });
        if (to === "self") {
          // a note on one lane
          s.mark(0, LANE[from], y, 4.5, "b", { color: INK[from] });
          s.label(LANE[from] + 12, y + 5, what, { cls: "dim" });
          return;
        }
        const x0 = LANE[from], x1 = LANE[to], dir = Math.sign(x1 - x0);
        const pay = kind === "pay";
        s.wire(`M${x0},${y}H${x1 - dir * 3}`, "b", { w: pay ? 2.5 : 1.6, arrow: 1, color: pay ? INK.pay : INK[from] });
        s.mark(0, x0, y, 3.5, "b", { color: pay ? INK.pay : INK[from] });
        // the label sits just above the arrow, starting from the sender's side
        const lx = Math.min(x0, x1) + 10;
        s.label(lx, y - 7, what, { cls: pay ? "strong" : "", fill: pay ? "#262323" : null });
      });
    });
  });
})();
