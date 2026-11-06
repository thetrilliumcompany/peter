// Edit mode: click Edit in the top bar, then click into any heading, paragraph, list item,
// table cell or side note and type. Changes save into index.html as you go.
// It only switches on when the page is served by tools/edit-server.py on this machine, so the
// published site never shows the button.
(() => {
  if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  // keep in step with UNITS in tools/edit-server.py
  const UNITS = new Set(["H1", "H2", "H3", "H4", "P", "LI", "TD", "TH", "ASIDE", "BLOCKQUOTE"]);
  const KEY = "peter-edit";

  // The text blocks, in source order: inside <main>, outside any figure, not inside another block.
  function blocks() {
    const main = document.querySelector("main"), out = [];
    const walk = (el) => {
      for (const c of el.children) {
        if (c.tagName === "FIGURE") continue;
        if (UNITS.has(c.tagName)) out.push(c);
        else walk(c);
      }
    };
    walk(main);
    return out;
  }

  // What a block's HTML should look like in the file: without the page's own hover and
  // layout state, and without the stray markup contenteditable leaves behind.
  function clean(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll("[style]").forEach((n) => n.removeAttribute("style"));
    c.querySelectorAll(".lit, .flash, .open").forEach((n) => n.classList.remove("lit", "flash", "open"));
    c.querySelectorAll("[class=''], [class]").forEach((n) => { if (!n.className.trim()) n.removeAttribute("class"); });
    c.querySelectorAll("a.fn[aria-expanded]").forEach((n) => n.removeAttribute("aria-expanded"));
    c.querySelectorAll("span:not([class]):not([id])").forEach((n) => n.replaceWith(...n.childNodes));
    c.querySelectorAll("font").forEach((n) => n.replaceWith(...n.childNodes));
    c.querySelectorAll("strong").forEach((n) => { const b = document.createElement("b"); b.append(...n.childNodes); n.replaceWith(b); });
    c.querySelectorAll("em").forEach((n) => { const i = document.createElement("i"); i.append(...n.childNodes); n.replaceWith(i); });
    while (c.lastChild && c.lastChild.nodeName === "BR") c.lastChild.remove();
    return c.innerHTML.replace(/ /g, " ");
  }

  let list = [], dirty = new Set(), timer = 0, bar = null, state = null, on = false, saving = Promise.resolve();

  const status = (t, bad) => { state.textContent = t; state.classList.toggle("bad", !!bad); };

  function save() {
    clearTimeout(timer);
    if (!dirty.size) return saving;
    const units = [...dirty].map((i) => ({ i, html: clean(list[i]) }));
    dirty = new Set();
    status("saving…");
    saving = saving.then(() => fetch("/__edit/save", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Edit": "1" },
      body: JSON.stringify({ count: list.length, units }),
    }).then(async (r) => {
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || r.statusText);
      status("saved");
    }).catch((e) => {
      units.forEach((u) => dirty.add(u.i));
      status(`not saved: ${e.message}`, true);
    }));
    return saving;
  }

  function start() {
    on = true;
    sessionStorage.setItem(KEY, "1");
    list = blocks();
    list.forEach((el, i) => {
      el.contentEditable = "true";
      el.spellcheck = true;
      el.dataset.editI = i;
    });
    document.body.classList.add("editing");
    bar.hidden = false;
    btn.textContent = "Done";
    status("saved");
  }

  async function stop() {
    await save();
    on = false;
    sessionStorage.removeItem(KEY);
    list.forEach((el) => { el.removeAttribute("contenteditable"); delete el.dataset.editI; });
    document.body.classList.remove("editing");
    bar.hidden = true;
    btn.textContent = "Edit";
  }

  // the Edit button, and the line under the top bar while editing
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "edit-btn";
  btn.textContent = "Edit";
  btn.hidden = true;
  btn.addEventListener("click", () => (on ? stop() : start()));
  bar = document.createElement("div");
  bar.className = "edit-bar";
  bar.hidden = true;
  bar.innerHTML = '<span>Editing. Click any text to change it; it saves as you type.</span><span class="edit-state"></span>';
  state = bar.querySelector(".edit-state");

  // typing marks the block to save, a moment after you stop
  document.addEventListener("input", (e) => {
    const el = on && e.target.closest && e.target.closest("[data-edit-i]");
    if (!el) return;
    dirty.add(+el.dataset.editI);
    status("editing…");
    clearTimeout(timer);
    timer = setTimeout(save, 700);
  });
  // one block stays one block: Enter doesn't split it
  document.addEventListener("keydown", (e) => {
    if (!on || !e.target.closest || !e.target.closest("[data-edit-i]")) return;
    if (e.key === "Enter") e.preventDefault();
    if (e.key === "Escape") e.target.blur();
    if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(); }
  });
  // paste brings in the words, never another page's formatting
  document.addEventListener("paste", (e) => {
    if (!on || !e.target.closest || !e.target.closest("[data-edit-i]")) return;
    e.preventDefault();
    document.execCommand("insertText", false, (e.clipboardData.getData("text/plain") || "").replace(/\s*\n\s*/g, " "));
  });
  // links don't navigate while you're editing their text
  document.addEventListener("click", (e) => {
    if (on && e.target.closest("[data-edit-i] a:not(.fn)")) e.preventDefault();
  }, true);
  addEventListener("beforeunload", (e) => { if (dirty.size) { save(); e.preventDefault(); } });

  // show the button only if the edit server is the one serving the page
  fetch("/__edit", { cache: "no-store" }).then((r) => r.ok && r.json()).then((j) => {
    if (!j || !j.ok) return;
    const top = document.querySelector(".top");
    top.insertBefore(btn, top.querySelector(".menu"));
    top.after(bar);
    btn.hidden = false;
    if (sessionStorage.getItem(KEY)) start();
  }).catch(() => {});
})();
