// The page around the figures: contents outline, tick rail, side notes, mobile drawer.
(() => {
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const col = document.querySelector(".col");

  function contents() {
    const heads = [...col.querySelectorAll("h2, h3")];
    heads.forEach((h, i) => { h.id = h.id || (h.textContent === "Appendix" ? "appendix" : `s-${i}`); });
    const nav = document.querySelector(".toc");
    const list = nav.querySelector(".toc-list");
    const rail = document.querySelector(".rail");
    // Chapters (h2) with their sections (h3) folded underneath; a chevron on hover opens them.
    let sub = null, parent = null;
    const parents = [];
    const links = heads.map((h, i) => {
      const li = document.createElement("li");
      li.className = "toc-item";
      const a = document.createElement("a");
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      li.append(a);
      if (h.tagName === "H2" || !sub) {
        list.append(li);
        parent = li; sub = null;
        parents[i] = li;
        if (heads[i + 1] && heads[i + 1].tagName === "H3") {
          sub = document.createElement("ul");
          sub.className = "toc-list toc-sub";
          sub.id = `toc-sub-${i}`;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "toc-exp";
          btn.setAttribute("aria-controls", sub.id);
          btn.innerHTML = '<span aria-hidden="true">\u203A</span>';
          li.classList.add("has-kids");
          li.prepend(btn);
          li.append(sub);
          setOpen(li, h.id !== "appendix");
          btn.addEventListener("click", () => { setOpen(li, !li.classList.contains("open")); sync(); });
        }
      } else {
        sub.append(li);
        parents[i] = parent;
      }
      return a;
    });
    function setOpen(li, v) {
      const ul = li.querySelector(".toc-sub"), btn = li.querySelector(".toc-exp");
      // measured while hidden (the phone drawer) it reads 0, so fall back to plenty
      ul.style.setProperty("--h", ul.scrollHeight ? `${ul.scrollHeight}px` : "100rem");
      li.classList.toggle("open", v);
      ul.setAttribute("aria-hidden", !v);
      ul.querySelectorAll("a").forEach((a) => (v ? a.removeAttribute("tabindex") : a.setAttribute("tabindex", "-1")));
      btn.setAttribute("aria-expanded", v);
      btn.setAttribute("aria-label", `${v ? "Collapse" : "Expand"} ${li.querySelector("a").textContent}`);
    }
    const marker = document.createElement("span");
    marker.className = "toc-marker";
    marker.setAttribute("aria-hidden", "true");
    nav.append(marker);
    // the marker moves when a list opens or closes
    list.addEventListener("transitionend", (e) => { if (e.target.classList.contains("toc-sub")) sync(); });
    const ticks = heads.map((h) => {
      const a = document.createElement("a");
      a.href = `#${h.id}`;
      a.className = h.tagName === "H2" ? "tick major" : "tick";
      a.setAttribute("aria-label", h.textContent);
      a.dataset.t = h.textContent;
      rail.append(a);
      return a;
    });
    let raf = 0;
    function sync() {
      raf = 0;
      const line = innerHeight * 0.3;
      let cur = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) cur = i; });
      links.forEach((a, i) => a.classList.toggle("on", i === cur));
      document.querySelectorAll(".toc-item.has-on").forEach((li) => li.classList.remove("has-on"));
      // the dot sits on the current entry, or on its chapter when the chapter is folded
      let target = links[cur];
      if (target) {
        const p = parents[cur];
        if (p.querySelector("a") !== target) {
          p.classList.add("has-on");
          if (!p.classList.contains("open")) target = p.querySelector("a");
        }
        const r = target.getBoundingClientRect(), nr = nav.getBoundingClientRect();
        marker.style.setProperty("--y", `${r.top - nr.top + nav.scrollTop + Math.min(r.height, 19) / 2}px`);
      }
      nav.classList.toggle("has-marker", !!target);
      links.forEach((a) => a.classList.toggle("dot", a === target));
      ticks.forEach((a, i) => { a.classList.toggle("on", i === cur); a.classList.toggle("near", Math.abs(i - cur) === 1); });
      // keep the current entry in view inside the chapter list
      const box = nav, cl = target;
      if (cl && getComputedStyle(box).position !== "static") {
        const a = cl.getBoundingClientRect(), b = box.getBoundingClientRect();
        if (a.top < b.top + 40 || a.bottom > b.bottom - 40) box.scrollTop += a.top - b.top - b.height / 3;
      }
    }
    addEventListener("scroll", () => { raf = raf || requestAnimationFrame(sync); }, { passive: true });
    addEventListener("resize", () => { list.querySelectorAll(".toc-sub").forEach((ul) => ul.style.setProperty("--h", ul.scrollHeight ? `${ul.scrollHeight}px` : "100rem")); sync(); });
    sync();
    // the drawer on small screens
    const btn = document.querySelector(".menu");
    const side = document.querySelector(".side");
    const setDrawer = (v) => { side.classList.toggle("open", v); btn.setAttribute("aria-expanded", v); };
    btn.addEventListener("click", () => setDrawer(!side.classList.contains("open")));
    side.addEventListener("click", (e) => { if (e.target.closest("a")) setDrawer(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); });
    sync();
  }

  // On wide screens each note sits in the right margin beside its marker, pushed
  // down if it would hit the note above or a wide figure. Narrower, a marker opens
  // its note under the paragraph.
  function sideNotes() {
    const notes = [...col.querySelectorAll(".sn")];
    const wide = matchMedia("(min-width: 1240px)");
    function place() {
      if (!wide.matches) { notes.forEach((n) => { n.style.top = ""; }); return; }
      const top0 = col.getBoundingClientRect().top;
      const blocks = [...col.querySelectorAll("figure.rf-wide")].map((f) => {
        const r = f.getBoundingClientRect();
        return [r.top - top0, r.bottom - top0];
      });
      let floor = 0;
      for (const n of notes) {
        const ref = document.getElementById(n.id.replace("fn-", "fnref-"));
        const h = n.offsetHeight;
        let y = Math.max(ref.getBoundingClientRect().top - top0 - 4, floor);
        for (const [a, b] of blocks) if (y < b + 12 && y + h > a - 12) y = b + 16;
        // a note inside a list item is positioned against that item, not the column
        const box = n.offsetParent && n.offsetParent !== col ? n.offsetParent.getBoundingClientRect().top - top0 : 0;
        n.style.top = `${Math.round(y - box)}px`;
        floor = y + h + 16;
      }
    }
    col.addEventListener("click", (e) => {
      const a = e.target.closest("a.fn");
      if (!a) return;
      e.preventDefault();
      const n = document.getElementById(a.getAttribute("href").slice(1));
      if (wide.matches) {
        n.classList.remove("flash"); void n.offsetWidth; n.classList.add("flash");
        const r = n.getBoundingClientRect();
        if (r.top < 90 || r.bottom > innerHeight) n.scrollIntoView({ block: "center" });
      } else {
        const open = n.classList.toggle("open");
        a.setAttribute("aria-expanded", open);
      }
    });
    for (const n of notes) {
      const ref = document.getElementById(n.id.replace("fn-", "fnref-"));
      const on = (v) => () => { n.classList.toggle("lit", v); ref.classList.toggle("lit", v); };
      for (const el of [n, ref]) { el.addEventListener("pointerenter", on(true)); el.addEventListener("pointerleave", on(false)); }
    }
    let t = 0;
    const later = () => { clearTimeout(t); t = setTimeout(place, 60); };
    new ResizeObserver(later).observe(col);
    wide.addEventListener("change", later);
    place();
  }

  // A phrase with a picture behind it (.peek). The picture shows only while the pointer
  // is on the phrase, the keyboard focus is on it, or a finger has tapped it; never otherwise.
  // Nothing is fetched until the first time it shows, and the first source in data-src that
  // loads is the one used.
  function peeks() {
    for (const el of document.querySelectorAll(".peek[data-src]")) {
      let pop = null, img = null, open = false;
      const build = () => {
        pop = document.createElement("span");
        pop.className = "peek-pop";
        pop.setAttribute("aria-hidden", "true");
        img = document.createElement("img");
        img.alt = el.dataset.alt || "";
        img.decoding = "async";
        const srcs = el.dataset.src.trim().split(/\s+/);
        let k = 0;
        img.addEventListener("error", () => { if (++k < srcs.length) img.src = srcs[k]; });
        img.addEventListener("load", () => { pop.classList.add("ready"); place(); });
        img.src = srcs[0];
        pop.append(img);
        document.body.append(pop);
      };
      // above the phrase when there is room under the top bar, else below; never off the sides
      const place = () => {
        if (!open) return;
        const r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
        const bar = document.querySelector(".top").getBoundingClientRect().bottom;
        let y = r.top - h - 10;
        if (y < bar + 8) y = r.bottom + 10;
        const x = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
        pop.style.left = `${Math.round(x)}px`;
        pop.style.top = `${Math.round(y)}px`;
      };
      const show = (v) => {
        open = v;
        if (v && !pop) build();
        if (!pop) return;
        pop.classList.toggle("on", v);
        el.classList.toggle("lit", v);
        place();
      };
      el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") show(true); });
      el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !el.matches(":focus-visible")) show(false); });
      el.addEventListener("focus", () => { if (el.matches(":focus-visible")) show(true); });
      el.addEventListener("blur", () => show(false));
      // a finger has no hover: a tap opens it, another tap (or a tap anywhere else) closes it
      el.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") show(!open); });
      document.addEventListener("pointerdown", (e) => { if (open && e.pointerType !== "mouse" && !el.contains(e.target)) show(false); });
      el.addEventListener("keydown", (e) => { if (e.key === "Escape") show(false); });
      addEventListener("scroll", place, { passive: true });
      addEventListener("resize", place);
    }
  }

  // A footnote can link to a chart in the appendix. The jump keeps a button on screen that returns
  // the reader to the same spot, however far they wander in between.
  function backButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn back-float";
    btn.textContent = "↑ Back to where you were";
    btn.hidden = true;
    document.body.append(btn);
    let from = null, top = 0, left = false;
    const hide = () => { btn.hidden = true; from = null; };
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#fig-"]');
      if (!a) return;
      // a second jump from the appendix still goes back to the first place in the article
      if (!from) { from = a; top = a.getBoundingClientRect().top; left = false; }
      btn.hidden = false;
    });
    btn.addEventListener("click", () => {
      scrollBy({ top: from.getBoundingClientRect().top - top });
      history.replaceState(null, "", location.pathname + location.search);
      hide();
    });
    // scrolling back to the spot by hand makes the button pointless
    addEventListener("scroll", () => {
      if (!from) return;
      const near = Math.abs(from.getBoundingClientRect().top - top) < innerHeight / 3;
      if (!near) left = true;
      else if (left) hide();
    }, { passive: true });
    addEventListener("popstate", () => { if (from && !location.hash) hide(); });
  }

  document.addEventListener("press:ready", () => { contents(); sideNotes(); peeks(); backButton(); });
})();
