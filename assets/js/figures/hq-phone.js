// Figure "hq-phone", placed in index.html as <figure data-rf="hq-phone"></figure>.
// Daily phone cost split between Twilio and xAI voice.
// Uses the shared HQ chart types in charts/hq.js. See figures/README.md.
(() => {
  const { fig, fmt, T } = Riso;
  const { HQ, stackedDays } = Riso.hq;

  fig("hq-phone", {
    w: Riso.hq.W,
    h: 210,
    title: "Phone cost per day",
    sub: "Twilio's actual bill plus our estimate for xAI voice at $0.08 a minute.",
    alt: "Daily phone cost split between Twilio and xAI voice.",
    minWidth: 480,
  }, (s, ui) => {
    stackedDays(s, ui, { days: HQ.phone.days, fmt: (v) => `$${v.toFixed(2)}`, layers: () => [{ name: "twilio", ink: "k", color: T.refDot, v: HQ.phone.twilio }, { name: "xai voice", ink: "g", v: HQ.phone.xai }], step: 5, tick: (v) => `$${v}` });
  });
})();
