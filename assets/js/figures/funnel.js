// Figure "funnel", placed in index.html as <figure data-rf="funnel"></figure>.
// Every written touch as a dot, then two zooms: into the replies, then into the people who wrote back.
// Data at the top, drawing below. See figures/README.md for how a figure is built.
(() => {
  const { fig, fmt } = Riso;

  // HQ, Nov 4: an automated sample of emails and form notes
  const SENT = 7103, REPLIED = 171, PEOPLE = 23, NOT_NO = 12;
  const C = { sent: "#c9c9c3", replied: "#8a8a84", people: "#8ec9f4", notNo: "#0387e7", paid: "#282828" };

  fig("funnel", {
    w: 600,
    h: 280,
    tight: true,
    alt: "Three panels. The first holds 7,103 dots, one per email or form note Peter sent; a small block of 171 in its corner got any reply. The second zooms into those 171: 23 were a person writing back. The third zooms into the 23: 12 didn't say no, 11 said no or asked to be removed, and one customer paid ($26).",
  }, (s) => {
    // n dots in rows of `cols`, from (x, y), g apart
    const grid = (n, cols, x, y, g) => Array.from({ length: n }, (_, i) => [x + (i % cols) * g, y + Math.floor(i / cols) * g]);
    // the first `n` dots that fall in the top-left block `w` wide
    const corner = (pts, cols, w, n) => pts.map((_, i) => i).filter((i) => i % cols < w).slice(0, n);
    // the box around some dots
    const box = (pts, pad) => {
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
      return [x0, y0, Math.max(...xs) + pad - x0, Math.max(...ys) + pad - y0];
    };
    const TOP = 26;
    // panel 1: all 7,103; the 171 replies are the 13-wide block in its corner
    const sent = grid(SENT, 84, 3, TOP + 2, 2.86);
    const rIdx = new Set(corner(sent, 84, 13, REPLIED));
    // panel 2: the 171; the 23 people are the 5-wide block in its corner
    const replies = grid(REPLIED, 13, 296, TOP + 6, 10.6);
    const pIdx = new Set(corner(replies, 13, 5, PEOPLE));
    // panel 3: the 23
    const people = grid(PEOPLE, 5, 474, TOP + 12, 26.2);
    s.paint(() => {
      // zoom bands first, so the dots sit on top
      const z1 = box(sent.filter((_, i) => rIdx.has(i)), 2.2), f2 = box(replies, 7);
      const z2 = box(replies.filter((_, i) => pIdx.has(i)), 6.5), f3 = box(people, 14);
      for (const [a, b] of [[z1, f2], [z2, f3]]) {
        s.area(`M${a[0] + a[2]},${a[1]}L${b[0]},${b[1]}L${b[0]},${b[1] + b[3]}L${a[0] + a[2]},${a[1] + a[3]}Z`, "#262323", 0.05);
        s.frame(a[0], a[1], a[2], a[3], "k");
        s.frame(b[0], b[1], b[2], b[3], "k");
      }
      s.marks(sent.filter((_, i) => !rIdx.has(i)).flat(), "k", { color: C.sent, dot: 1.9 });
      s.marks(sent.filter((_, i) => rIdx.has(i)).flat(), "k", { color: C.replied, dot: 1.9 });
      s.marks(replies.filter((_, i) => !pIdx.has(i)).flat(), "k", { color: C.replied, dot: 7.2 });
      s.marks(replies.filter((_, i) => pIdx.has(i)).flat(), "k", { color: C.people, dot: 7.2 });
      // the 12 who didn't say no first, the one who paid at the very front
      people.forEach(([x, y], i) => s.mark(0, x, y, 8.4, "b", { color: i === 0 ? C.paid : i < NOT_NO ? C.notNo : C.people }));
      // what each panel holds
      const head = (x, n, what) => { const t = s.label(x, 14, fmt(n), { cls: "strong" }); s.label(x + t.getComputedTextLength() + 6, 14, what, { cls: "dim" }); };
      head(0, SENT, "emails and forms sent");
      head(f2[0], REPLIED, "got any reply");
      head(f3[0], PEOPLE, "were a person");
      // key for the people, under the zooms
      const KY = f2[1] + f2[3] + 30;
      [[C.notNo, `${NOT_NO} didn't say no`], [C.people, `${PEOPLE - NOT_NO} said no or asked to be removed`], [C.paid, "one customer ($26)"]].forEach(([c, t], i) => {
        s.mark(0, f2[0] + 5, KY + i * 22 - 4, 5.5, "b", { color: c });
        s.label(f2[0] + 17, KY + i * 22, t, { cls: i === 2 ? "strong" : "dim" });
      });
    });
  });
})();
