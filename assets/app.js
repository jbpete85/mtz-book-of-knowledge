(() => {
  const KB = window.KB, CATS = window.CATEGORIES, TRAINING = window.TRAINING;
  const byId = Object.fromEntries(KB.map(a => [a.id, a]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ── Per-device storage (never required for the page to work) ──
  const store = {
    get(k, d) { try { const v = localStorage.getItem("bok." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("bok." + k, JSON.stringify(v)); } catch {} }
  };

  const toastEl = $("#toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-on"), 1800);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast("Copied"); }
    catch { toast("Select the text to copy it"); }
  }

  // ── Trust layer: verification, views, votes, Enrique's inbox (per device in the prototype) ──
  const DAY_MS = 864e5, REVIEW_DAYS = 90;
  const fmtShort = t => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  function ago(t) {
    const m = Math.round((Date.now() - t) / 6e4);
    if (m < 1) return "just now"; if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60); if (h < 24) return `${h} hr ago`;
    return fmtShort(t);
  }
  function vstatus(a) {
    const v = store.get("verified", {})[a.id];
    if (v && Date.now() > v.due) return { k: "due", icon: "ph-clock-countdown", label: "Needs review", detail: `Verified ${fmtShort(v.at)} · review was due ${fmtShort(v.due)}` };
    if (v) return { k: "ok", icon: "ph-seal-check", label: "Verified by Enrique", detail: `${fmtShort(v.at)} · next review ${fmtShort(v.due)}` };
    if (/call/i.test(a.src)) return { k: "unconfirmed", icon: "ph-question", label: "Unconfirmed", detail: "From the 10/19 call · Enrique to confirm" };
    if (a.gap) return { k: "partial", icon: "ph-warning-circle", label: "Missing pieces", detail: "Part of the answer isn't in the manual yet" };
    return { k: "source", icon: "ph-book-open", label: "From the manual", detail: "Not reviewed by Enrique yet" };
  }
  const STATUS_ORDER = { due: 0, unconfirmed: 1, partial: 2, source: 3, ok: 4 };
  function vbadge(a) {
    const s = vstatus(a);
    return `<div class="vbadge vb-${s.k}"><i class="ph-fill ${s.icon}"></i><b>${esc(s.label)}</b><span>${esc(s.detail)}</span></div>`;
  }
  const vchip = a => { const s = vstatus(a); return `<span class="vb vb-${s.k}" title="${esc(s.detail)}"><i class="ph-fill ${s.icon}"></i>${esc(s.label)}</span>`; };
  function setVerified(id, on) {
    const v = store.get("verified", {});
    if (on) v[id] = { at: Date.now(), due: Date.now() + REVIEW_DAYS * DAY_MS }; else delete v[id];
    store.set("verified", v);
  }
  function addView(id) { const v = store.get("views", {}); v[id] = (v[id] || 0) + 1; store.set("views", v); }
  function addVote(id, dir) { const v = store.get("votes", {}); v[id] = v[id] || { up: 0, down: 0 }; v[id][dir]++; store.set("votes", v); }
  const inbox = () => store.get("inbox", []);
  function addInbox(item) {
    const l = inbox(); l.unshift({ ...item, key: Date.now().toString(36), at: Date.now() });
    store.set("inbox", l); updateCounts();
  }
  function updateCounts() {
    const n = inbox().length;
    $$("[data-review-count]").forEach(el => { el.textContent = n; el.hidden = !n; });
  }
  // Earlier prototype stored plain strings under "logged"; fold them into the inbox once.
  (function migrate() {
    const old = store.get("logged", []);
    if (old.length) { const l = inbox(); old.forEach(q => l.push({ type: "question", text: q, key: q, at: Date.now() })); store.set("inbox", l); store.set("logged", []); }
  })();

  // ── Store toggle ──
  let myStore = store.get("store", "plant");
  const storeName = s => (s === "plant" ? "Plant" : "Target");
  function setStore(s) {
    myStore = s; store.set("store", s);
    $$(".seg-store button").forEach(b => b.setAttribute("aria-checked", String(b.dataset.store === s)));
    $$(".store-note").forEach(n => n.classList.toggle("is-mine", n.dataset.store === s));
    $("#store-chip span").textContent = storeName(s);
  }
  $$(".seg-store button").forEach(b => b.addEventListener("click", () => setStore(b.dataset.store)));
  $("#store-chip").addEventListener("click", () => {
    setStore(myStore === "plant" ? "target" : "plant");
    toast(`Showing ${storeName(myStore)} store notes`);
  });

  // ── Search ──
  const STOP = new Set("a an the and or but to of in on at for is are was were be been it its this that i im i'm my me we our you your they their he she him her them can could do does did how what when where which who why will would should just get got have has had with from as about if so not no yes customer customers please there here want wants need needs say tell".split(" "));
  const SYN = {
    receipt: ["qr", "ticket"], ticket: ["qr", "receipt"], lost: ["missing"], missing: ["lost"], wifi: ["internet"],
    card: ["merchant", "credit"], credit: ["card"], pay: ["payment", "card"], cost: ["price"], much: ["price"], expensive: ["price"],
    deliver: ["delivery", "route"], delivered: ["delivery", "route"], delivery: ["route"], route: ["delivery"],
    smell: ["odor"], smells: ["odor"], stink: ["odor"], pee: ["urine", "odor", "enzyme"], peed: ["urine", "odor", "enzyme"], dog: ["pet", "urine"],
    blanket: ["household", "wash"], angry: ["upset", "complaint"], mad: ["upset", "complaint"],
    ready: ["promise"], rush: ["sooner"], hurry: ["sooner"], jacket: ["leather", "blazer"], coat: ["leather"],
    suit: ["blazer"], bride: ["wedding"], fix: ["repair", "alteration"], shorten: ["hem", "alteration"],
    broke: ["down"], broken: ["down", "button"], working: ["down"], pos: ["spot"], register: ["spot"]
  };
  const norm = s => s.toLowerCase().replace(/[“”"’']/g, "").replace(/[^a-z0-9& ]+/g, " ").replace(/\s+/g, " ").trim();
  function stem(w) {
    if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
    if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
    if (w.endsWith("sses")) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
    if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
    return w;
  }
  const toks = s => norm(s).split(" ").filter(w => w && !STOP.has(w)).map(stem);

  const index = KB.map(a => {
    const w = new Map();
    const add = (text, wt) => toks(text).forEach(t => w.set(t, (w.get(t) || 0) + wt));
    add(a.title, 4);
    a.q.forEach(p => add(p, 3));
    add(CATS[a.cat].label, 1);
    [a.say, ...(a.do || []), ...(a.table || []).flat()].filter(Boolean).forEach(t => add(t, 0.6));
    return { a, w, phrases: a.q.map(norm) };
  });

  function search(query) {
    const nq = norm(query);
    const qt = [...new Set(toks(query))];
    const exp = [];
    nq.split(" ").forEach(w => (SYN[w] || []).forEach(s => exp.push(stem(s))));
    return index.map(({ a, w, phrases }) => {
      let s = 0;
      qt.forEach(t => { s += Math.min(w.get(t) || 0, 8); });
      [...new Set(exp)].forEach(t => { if (!qt.includes(t)) s += Math.min(w.get(t) || 0, 8) * 0.6; });
      phrases.forEach(p => { if (p.length > 3 && (nq.includes(p) || (nq.length > 4 && p.includes(nq)))) s += 8; });
      return { a, s };
    }).filter(r => r.s > 0).sort((x, y) => y.s - x.s);
  }

  // ── Rendering an entry ──
  function catVar(a) { return `--cat:${CATS[a.cat].color}`; }
  function flag(a) { return `<span class="flag">${esc(CATS[a.cat].label)}</span>`; }

  function articleHTML(a, fb = "") {
    let h = `<article class="ticket" style="${catVar(a)}">
      <div class="ticket-top">${flag(a)}</div>
      <h2>${esc(a.title)}</h2>${vbadge(a)}`;
    if (a.say) h += `<div class="section-label">Say this</div><blockquote class="say">${esc(a.say)}</blockquote>`;
    if (a.do) h += `<div class="section-label">${a.say ? "Then" : "Do this"}${a.do.length > 1 ? `<span class="label-hint">Tap a step to check it off</span>` : ""}</div>
      <ol class="steps">${a.do.map(d => `<li role="checkbox" aria-checked="false" tabindex="0">${esc(d)}</li>`).join("")}</ol>`;
    if (a.table) {
      const [k, v] = a.tableHead || ["", ""];
      h += `<table class="kv">${a.tableHead ? `<tr><th>${esc(k)}</th><th>${esc(v)}</th></tr>` : ""}${a.table.map(([x, y]) => `<tr><td>${esc(x)}</td><td>${esc(y)}</td></tr>`).join("")}</table>`;
    }
    if (a.stores) {
      h += `<div class="section-label">At your store</div><div class="store-notes">${["plant", "target"].map(s =>
        `<div class="store-note${s === myStore ? " is-mine" : ""}" data-store="${s}"><b>${s === "plant" ? "Plant" : "Target"}</b>${esc(a.stores[s] || "Same as the other store.")}</div>`).join("")}</div>`;
    }
    if (a.gap) h += `<div class="gapnote"><b>Not in the book yet · for Enrique</b>${esc(a.gap)}</div>`;
    const toolLink = { ready: ["#ready", "Open promise dates"], routes: ["#routes", "Open delivery routes"], outage: ["#outage/" + a.id, "Open the procedure"] }[a.tool];
    h += `<div class="ticket-foot"><div class="tf-row"><span class="src">Source · ${esc(a.src)}</span>${toolLink ? `<a class="btn btn-sm" href="${toolLink[0]}">${toolLink[1]}<i class="ph ph-arrow-right"></i></a>` : ""}</div>${fb}</div></article>`;
    return h;
  }

  // ── ASK ──
  const askInput = $("#ask-input"), answer = $("#answer"), home = $("#home");
  $("#ask-form").addEventListener("submit", e => { e.preventDefault(); const q = askInput.value.trim(); if (q) { askInput.blur(); go("#ask/" + encodeURIComponent(q)); } });
  const topSearch = $("#top-search");
  topSearch.addEventListener("submit", e => {
    e.preventDefault(); const inp = topSearch.querySelector("input"); const q = inp.value.trim();
    if (q) { inp.value = ""; inp.blur(); go("#ask/" + encodeURIComponent(q)); }
  });

  // ── Typeahead: matching pages (and tools) appear as you type ──
  const TOOLS = [
    { href: "#ready", label: "Promise dates", icon: "ph-calendar-check", kw: ["ready", "promise", "when", "done", "turnaround"] },
    { href: "#routes", label: "Delivery routes", icon: "ph-truck", kw: ["route", "delivery", "deliver", "driver"] },
    { href: "#outage", label: "Outages", icon: "ph-wifi-slash", kw: ["down", "broke", "internet", "wifi", "spot", "card", "machine", "outage", "offline", "frozen"] },
    { href: "#scripts", label: "Scripts", icon: "ph-chat-text", kw: ["say", "script", "words", "greeting"] },
    { href: "#training", label: "Training", icon: "ph-graduation-cap", kw: ["train", "quiz", "trainee"] }
  ];
  function taPages(q) {
    const scores = new Map(search(q).map(r => [r.a.id, r.s]));
    // The word still being typed matches the start of indexed words ("leath" → leather)
    const last = stem(norm(q).split(" ").pop() || "");
    if (last.length >= 3) index.forEach(({ a, w }) => {
      for (const [t, wt] of w) if (t !== last && t.startsWith(last)) { scores.set(a.id, (scores.get(a.id) || 0) + Math.min(wt, 4)); break; }
    });
    return [...scores].filter(([, s]) => s >= 2).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([id]) => byId[id]);
  }
  function taItems(q) {
    const words = norm(q).split(" ").filter(w => w.length >= 3);
    const tools = TOOLS.filter(t => t.kw.some(k => words.some(w => k.startsWith(w) || w.startsWith(k)))).slice(0, 2);
    return [
      ...taPages(q).map(a => ({ href: `#a/${a.id}`, label: a.title, sub: CATS[a.cat].label, icon: "ph-file-text" })),
      ...tools.map(t => ({ href: t.href, label: t.label, sub: "Tool", icon: t.icon }))
    ];
  }
  function attachTypeahead(input, list) {
    let items = [], active = -1;
    const setActive = i => {
      active = i;
      [...list.children].forEach((li, n) => li.setAttribute("aria-selected", String(n === i)));
      if (i >= 0) input.setAttribute("aria-activedescendant", `${list.id}-${i}`); else input.removeAttribute("aria-activedescendant");
    };
    const close = () => { list.hidden = true; input.setAttribute("aria-expanded", "false"); setActive(-1); };
    const pick = i => { const it = items[i]; if (!it) return; close(); if (input !== askInput) input.value = ""; input.blur(); go(it.href); };
    function render() {
      const q = input.value.trim();
      if (q.length < 2) { close(); return; }
      items = taItems(q);
      list.innerHTML = items.length
        ? items.map((it, i) => `<li role="option" id="${list.id}-${i}" aria-selected="false" data-i="${i}"><i class="ph ${it.icon}" aria-hidden="true"></i><span class="ta-text">${esc(it.label)}<small>${esc(it.sub)}</small></span></li>`).join("")
        : `<li class="ta-empty">No page matches yet. Press Enter to see options.</li>`;
      list.hidden = false; input.setAttribute("aria-expanded", "true"); setActive(-1);
    }
    input.addEventListener("input", render);
    input.addEventListener("focus", () => { if (input.value.trim().length >= 2) render(); });
    input.addEventListener("blur", () => setTimeout(close, 120));
    input.addEventListener("keydown", e => {
      if (list.hidden || !items.length) { if (e.key === "Escape") close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((active + 1) % items.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active <= 0 ? items.length - 1 : active - 1); }
      else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(active); }
      else if (e.key === "Escape") close();
    });
    list.addEventListener("mousedown", e => e.preventDefault());
    list.addEventListener("click", e => { const li = e.target.closest("[data-i]"); if (li) pick(+li.dataset.i); });
    return close;
  }
  const closeAskTA = attachTypeahead(askInput, $("#ask-ta"));
  const closeTopTA = attachTypeahead(topSearch.querySelector("input"), $("#top-ta"));

  const gapCount = KB.filter(a => a.gap).length;
  $$("[data-gap-count]").forEach(el => el.textContent = gapCount);

  // Rows: related pages, recents, common questions
  const rowLink = (href, icon, text, sub = "") =>
    `<li><a href="${href}"><i class="ph ${icon}"></i><span class="row-text">${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ""}</span><i class="ph ph-caret-right chev"></i></a></li>`;
  const relatedHTML = (label, items) => items.length
    ? `<div class="related"><div class="list-head"><span>${label}</span></div><ul class="rows">${items.map(r => rowLink(`#a/${r.id}`, "ph-file-text", r.title, CATS[r.cat].label)).join("")}</ul></div>` : "";

  $("#common").innerHTML = window.SUGGESTIONS.map(s => rowLink("#ask/" + encodeURIComponent(s), "ph-chat-circle-dots", s)).join("");

  function pushRecent(item) {
    const list = store.get("recent", []).filter(r => r.id !== item.id);
    list.unshift(item);
    store.set("recent", list.slice(0, 5));
  }
  function renderRecent() {
    const list = store.get("recent", []).filter(r => byId[r.id]);
    $("#recent-block").hidden = !list.length;
    $("#recent").innerHTML = list.map(r => rowLink(`#a/${r.id}`, "ph-clock-counter-clockwise", byId[r.id].title, r.q ? `Asked: “${r.q}”` : "")).join("");
  }
  $("#clear-recent").addEventListener("click", () => { store.set("recent", []); renderRecent(); });

  const backRow = `<div class="back-row"><a href="#ask" data-back><i class="ph ph-arrow-left"></i>Back</a></div>`;
  // "Back" returns to wherever the user came from (Articles, search, a tool), Home as a fallback
  answer.addEventListener("click", e => {
    const b = e.target.closest("[data-back]"); if (!b) return;
    if (sessionNav > 1) { e.preventDefault(); history.back(); }
  });
  const searchcard = $("#ask-form");
  // On an answer, the search shrinks to a slim bar so the answer starts near the top
  function setAnswer(html) { home.hidden = true; searchcard.classList.add("is-compact"); answer.innerHTML = backRow + html; }

  function renderAskEmpty() {
    searchcard.classList.remove("is-compact");
    askInput.value = "";
    answer.innerHTML = "";
    home.hidden = false;
    renderRecent();
  }
  function renderAsk(q) {
    askInput.value = q;
    const res = search(q);
    if (!res.length || res[0].s < 3) {
      const near = res.slice(0, 3).map(r => r.a);
      setAnswer(`<article class="ticket nomatch" style="--cat:var(--gap)">
        <div class="ticket-top"><span class="flag flag-gap">No page for this yet</span></div>
        <h2>The book doesn't cover “${esc(q)}”</h2>
        <p class="muted">Tell the customer you'll find out, then check with the manager on duty. Log it so Enrique can add the answer.</p>
        <button class="btn btn-primary" id="log-it"><i class="ph ph-paper-plane-tilt"></i>Send to Enrique</button>
      </article>${relatedHTML("Closest pages", near)}`);
      const logged = inbox().some(i => i.type === "question" && i.text === q);
      const b = $("#log-it");
      if (logged) { b.disabled = true; b.innerHTML = '<i class="ph ph-check"></i>Already in Enrique\'s queue'; }
      b.addEventListener("click", () => {
        addInbox({ type: "question", text: q });
        b.disabled = true; b.innerHTML = '<i class="ph ph-check"></i>In Enrique\'s review queue';
      });
      return;
    }
    const top = res[0].a;
    const related = res.slice(1, 4).filter(r => r.s >= 2.5).map(r => r.a);
    pushRecent({ id: top.id, q });
    addView(top.id);
    setAnswer(articleHTML(top, feedbackHTML(top, q)) + relatedHTML("Also in the book", related));
  }
  function renderArticle(id) {
    const a = byId[id];
    if (!a) return renderAskEmpty();
    askInput.value = "";
    pushRecent({ id });
    addView(id);
    const sameCat = KB.filter(x => x.cat === a.cat && x !== a).slice(0, 4);
    setAnswer(articleHTML(a, feedbackHTML(a)) + relatedHTML(`More in ${CATS[a.cat].label}`, sameCat));
  }

  // ── "Was this right?" under every answer ──
  function feedbackHTML(a, q = "") {
    return `<div class="feedback" data-page="${a.id}" data-q="${esc(q)}">
      <div class="fb-row">
        <span class="fb-label">Was this right?</span>
        <div class="fb-btns">
          <button type="button" class="btn btn-sm" data-fb="up"><i class="ph ph-thumbs-up"></i>Yes</button>
          <button type="button" class="btn btn-sm" data-fb="down"><i class="ph ph-thumbs-down"></i>Not quite</button>
          <button type="button" class="btn btn-sm" data-fb="ask"><i class="ph ph-chat-circle-text"></i>Ask Enrique</button>
        </div>
      </div>
      <form class="fb-form" hidden>
        <label class="fb-q" for="fb-text"></label>
        <textarea id="fb-text" rows="3" required></textarea>
        <div class="fb-actions">
          <button class="btn btn-primary btn-sm" type="submit"><i class="ph ph-paper-plane-tilt"></i>Send to Enrique</button>
          <button class="btn btn-sm btn-ghost" type="button" data-fb="cancel">Cancel</button>
        </div>
      </form>
    </div>`;
  }
  function fbDone(box, html) { box.innerHTML = `<div class="fb-done">${html}</div>`; }
  answer.addEventListener("click", e => {
    const b = e.target.closest("[data-fb]");
    if (!b) return;
    const box = b.closest(".feedback"), form = box.querySelector(".fb-form"), ta = form.querySelector("textarea");
    const kind = b.dataset.fb;
    if (kind === "up") { addVote(box.dataset.page, "up"); fbDone(box, '<i class="ph-fill ph-check-circle"></i>Thanks. Marked as helpful.'); return; }
    if (kind === "cancel") { form.hidden = true; return; }
    form.dataset.type = kind === "down" ? "flag" : "question";
    form.querySelector(".fb-q").textContent = kind === "down" ? "What was wrong or missing?" : "What do you need to know?";
    ta.value = kind === "ask" ? box.dataset.q : "";
    ta.placeholder = kind === "down" ? "e.g. We stopped doing this in September" : "Type the customer's question";
    form.hidden = false; ta.focus();
  });
  answer.addEventListener("submit", e => {
    const form = e.target.closest(".fb-form"); if (!form) return;
    e.preventDefault();
    const box = form.closest(".feedback"), text = form.querySelector("textarea").value.trim();
    if (!text) return;
    const type = form.dataset.type;
    if (type === "flag") addVote(box.dataset.page, "down");
    addInbox({ type, text, page: box.dataset.page, q: box.dataset.q || "" });
    fbDone(box, '<i class="ph-fill ph-paper-plane-tilt"></i>Sent to Enrique\'s review queue.');
  });

  // ── Tappable steps: check off as you go, current step stays highlighted ──
  function toggleStep(li) {
    li.setAttribute("aria-checked", String(li.getAttribute("aria-checked") !== "true"));
    const items = [...li.parentElement.children];
    items.forEach(x => x.classList.remove("is-current"));
    if (items.some(x => x.getAttribute("aria-checked") === "true")) {
      const next = items.find(x => x.getAttribute("aria-checked") !== "true");
      if (next) next.classList.add("is-current");
    }
  }
  answer.addEventListener("click", e => { const li = e.target.closest(".steps li"); if (li) toggleStep(li); });
  answer.addEventListener("keydown", e => {
    const li = e.target.closest(".steps li");
    if (li && (e.key === " " || e.key === "Enter")) { e.preventDefault(); toggleStep(li); }
  });

  // ── Dates ──
  const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fmtLong = d => d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const isBiz = d => d.getDay() >= 1 && d.getDay() <= 5;
  function nextBiz(d) { let x = addDays(d, 1); while (!isBiz(x)) x = addDays(x, 1); return x; }
  function at6(d) { const x = new Date(d); x.setHours(18, 0, 0, 0); return x; }
  const pad = n => String(n).padStart(2, "0");
  function nowParts() { const n = new Date(); return { date: `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`, time: `${pad(n.getHours())}:${pad(n.getMinutes())}` }; }
  function parseDT(date, time) {
    const [y, m, d] = date.split("-").map(Number), [hh, mm] = (time || "12:00").split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }
  function storeOpen(dt) {
    const day = dt.getDay(), mins = dt.getHours() * 60 + dt.getMinutes();
    if (day === 0) return false;
    if (day === 6) return mins >= 540 && mins < 900;
    return mins >= 420 && mins < 1140;
  }
  // CSR Manual · Day 5 · Promise Times
  function standardReady(dt) {
    const day = dt.getDay(), mins = dt.getHours() * 60 + dt.getMinutes();
    if (day >= 1 && day <= 5 && mins < 540) return at6(dt);
    if (day >= 1 && day <= 4) return at6(addDays(dt, 1));
    let x = addDays(dt, 1); while (x.getDay() !== 1) x = addDays(x, 1);
    return at6(x);
  }
  function relDay(target, from) {
    if (sameDay(target, from)) return "today";
    if (sameDay(target, addDays(from, 1))) return `tomorrow, ${DAY[target.getDay()]},`;
    return DAY[target.getDay()];
  }

  // ── READY BY ──
  const SERVICES = [
    { id: "std", label: "Dry cleaning or laundry", tag: "standard" },
    { id: "wf", label: "Wash & Fold", tag: "next biz day" },
    { id: "enz", label: "Enzyme treatment (odor)", tag: "+1 biz day" },
    { id: "leather", label: "Leather or suede", tag: "sent out" },
    { id: "wedding", label: "Wedding dress", tag: "6 weeks" },
    { id: "house", label: "Drapes / household", tag: "extended" }
  ];
  const rf = $("#ready-form");
  $("#svc-options").insertAdjacentHTML("beforeend", SERVICES.map((s, i) =>
    `<label class="opt"><input type="radio" name="svc" value="${s.id}"${i ? "" : " checked"}> ${esc(s.label)}<small>${s.tag}</small></label>`).join(""));
  const np = nowParts(); rf.date.value = np.date; rf.time.value = np.time;
  rf.addEventListener("input", renderReady);

  function claim({ head, day, time, say, notes = [], foot = "" }) {
    return `<div class="claim"><div class="claim-head"><span>${esc(head)}</span><span>Promise</span></div>
      <div class="claim-body"><div class="claim-day">${esc(day)}</div>${time ? `<div class="claim-time">${esc(time)}</div>` : ""}
      ${say ? `<blockquote class="say">${esc(say)}<button type="button" class="btn btn-sm copy" data-copy="${esc(say)}">Copy</button></blockquote>` : ""}
      ${notes.length ? `<ul class="claim-notes">${notes.map(n => `<li>${n}</li>`).join("")}</ul>` : ""}</div>
      ${foot ? `<div class="claim-perf"></div><div class="claim-foot">${foot}</div>` : ""}</div>`;
  }
  function renderReady() {
    const out = $("#ready-out");
    if (!rf.date.value) { out.innerHTML = ""; return; }
    const dt = parseDT(rf.date.value, rf.time.value);
    const svc = rf.svc.value, name = rf.name.value.trim();
    const who = name ? `${name}, your` : "Your";
    const src = `<span class="src">Source · CSR Manual · Day 5 · Promise Times</span>`;
    const notes = [];
    if (dt.getDay() === 0) {
      out.innerHTML = claim({ head: "Sunday", day: "Closed", say: "We're closed Sundays. We open Monday at 7 AM.", foot: src });
      return;
    }
    if (!storeOpen(dt)) notes.push("The store is closed at that time. Hours: Mon–Fri 7–7, Sat 9–3.");

    if (svc === "std" || svc === "enz") {
      let r = standardReady(dt);
      if (svc === "enz") { r = at6(nextBiz(r)); notes.push("Enzyme adds one business day and an extra charge. Washable items only. No odor guarantee."); }
      if (rf.holdout.checked) notes.push(`If it's held back for another pass on the stain: ${fmtLong(at6(nextBiz(r)))} after 6 PM.`);
      if (r.getDay() === 1 && (dt.getDay() === 5 || dt.getDay() === 6)) notes.push("Friday after 9 AM and all day Saturday roll to Monday.");
      out.innerHTML = claim({
        head: `Dropped off ${fmtLong(dt)}`, day: fmtLong(r).split(",")[0], time: `${fmtLong(r).split(", ")[1]} · after 6:00 PM`,
        say: `“${who} items will be ready ${relDay(r, dt)} after 6 PM.”`, notes, foot: src
      });
    } else if (svc === "wf") {
      const r = at6(nextBiz(dt));
      notes.push("Can't go through Wash & Fold: dry clean only, hand wash, or do not tumble dry.");
      out.innerHTML = claim({ head: "Wash & Fold", day: fmtLong(r).split(",")[0], time: `${fmtLong(r).split(", ")[1]} · by 6:00 PM`,
        say: `“${who} Wash & Fold will be ready ${relDay(r, dt)} by 6 PM.”`, notes, foot: `<span class="src">Source · CSR Manual · Day 5 · Up Selling</span>` });
    } else if (svc === "leather") {
      const r = addDays(dt, 28);
      out.innerHTML = claim({ head: "Leather / suede · Reaves", day: "3 wks – 1 mo", time: `Due date to enter: ${fmtLong(r)}`,
        say: "“Leather goes to our specialist. It takes three weeks to a month, and the price is set once they quote it.”",
        notes: ["Enter at $0.00 in Leather/Suede. Customer signs a release.", "No red tape on leather or suede."], foot: `<a href="#a/leather">Full leather steps →</a>` });
    } else if (svc === "wedding") {
      const r = addDays(dt, 42);
      out.innerHTML = claim({ head: "Wedding dress", day: fmtLong(r).split(",")[0], time: `${fmtLong(r).split(", ")[1]} · 6 weeks out`,
        say: "“Wedding dress cleaning takes about six weeks. Would you like it preserved in a storage chest?”",
        notes: ["Add “Fancy” for beading, “Lace” for lace, “Storage Chest” for preservation."], foot: `<a href="#a/wedding">Full wedding dress steps →</a>` });
    } else {
      out.innerHTML = claim({ head: "Household items", day: "Check sheet", say: "“Household items take a little longer. Let me confirm the exact date for you.”",
        notes: [`<span class="hl-gap">Not in the book yet:</span> the manual points to a “Turnaround Time Sheet” that isn't in the binder.`],
        foot: `<a href="#a/household">See the open question →</a>` });
    }
  }

  // ── ROUTES ──
  // Route pairs from Enrique on the 10/19 call: Mon↔Wed, Tue↔Thu, Friday flex.
  const ROUTES = { mw: { days: [1, 3], name: "Monday/Wednesday" }, tt: { days: [2, 4], name: "Tuesday/Thursday" } };
  let route = "mw", picked = 1;
  const deliverFor = d => ROUTES[route].days.find(x => x !== d);
  function renderWeek() {
    const R = ROUTES[route];
    $$("#route-seg button").forEach(b => b.setAttribute("aria-checked", String(b.dataset.route === route)));
    const del = deliverFor(picked);
    $("#week").innerHTML = [1, 2, 3, 4, 5].map(d => {
      const isRoute = R.days.includes(d), isFlex = d === 5;
      const cls = ["wday", isRoute && "is-route", isFlex && "is-flex", d === picked && "is-picked", d === del && "is-deliver"].filter(Boolean).join(" ");
      const r = d === picked ? "Bag out · pickup" : d === del ? "Comes back" : isFlex ? "Flex day" : isRoute ? "Route day" : "Other route";
      return `<button class="${cls}" data-d="${d}" ${isRoute ? "" : "disabled"}><span class="d">${DAY[d].slice(0, 3)}</span><span class="r">${r}</span></button>`;
    }).join("");
    const [a, b] = R.days.map(d => DAY[d]);
    $("#route-say").textContent = `“You're on our ${R.name} route. Leave your blue bag out ${a} and it's back ${b}. Leave it out ${b} and it's back ${a}.”`;
    renderInstore();
  }
  $("#route-seg").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; route = b.dataset.route; picked = ROUTES[route].days[0]; renderWeek(); });
  $("#week").addEventListener("click", e => { const b = e.target.closest(".wday"); if (!b || b.disabled) return; picked = +b.dataset.d; renderWeek(); });

  const isf = $("#instore-form");
  isf.date.value = np.date; isf.time.value = np.time;
  isf.addEventListener("input", renderInstore);
  function renderInstore() {
    const out = $("#instore-out");
    if (!isf.date.value) { out.innerHTML = ""; return; }
    const dt = parseDT(isf.date.value, isf.time.value);
    if (dt.getDay() === 0) { out.innerHTML = claim({ head: "Sunday", day: "Closed", say: "We're closed Sundays." }); return; }
    const ready = standardReady(dt);
    let del = addDays(ready, 1);
    while (!ROUTES[route].days.includes(del.getDay())) del = addDays(del, 1);
    const notes = [`Ready in store ${fmtLong(ready)} after 6 PM.`];
    let flexDay = null;
    for (let x = addDays(ready, 1); x < del; x = addDays(x, 1)) if (x.getDay() === 5) flexDay = x;
    if (flexDay) notes.push(`Need it before the weekend? Friday (${fmtLong(flexDay).split(", ")[1]}) is our flex day. Check with the manager before promising it.`);
    out.innerHTML = claim({
      head: `${ROUTES[route].name} route`, day: fmtLong(del).split(",")[0], time: `${fmtLong(del).split(", ")[1]} · delivered`,
      say: `“It'll be cleaned by ${DAY[ready.getDay()]}, and your driver brings it ${DAY[del.getDay()]}.”`, notes,
      foot: `<span class="src">Source · Enrique, discovery call 10/19 · to be confirmed</span>`
    });
  }

  // ── OUTAGE ──
  let timerH = null;
  function stopTimer() { clearInterval(timerH); timerH = null; }
  const CUSTOMER_LINE = byId.internet.say;
  const OUT = {
    internet() {
      return `<div class="ticket" style="--cat:var(--red)">
        <div class="ticket-top"><span class="flag">Internet / SPOT won't load</span></div>
        <h2>First: are the card machine and phone working?</h2>
        <div class="decision"><button class="btn" data-next="spotdown">Yes, they work</button><button class="btn btn-primary" data-next="internet2">No, they're down too</button></div>
        <div class="ticket-foot"><span class="src">Source · CSR Manual · Day 5 · Internet Down</span></div></div>`;
    },
    internet2() {
      return `<div class="ticket" style="--cat:var(--red)">
        <div class="ticket-top"><span class="flag">Internet is down</span></div>
        <h2>Tell the customer, then keep the counter moving</h2>
        <div class="section-label">Say this</div><blockquote class="say">${esc(CUSTOMER_LINE)}</blockquote>
        <div class="section-label">Then</div>
        <ul class="checklist">
          <li><input type="checkbox" id="c1"><label for="c1"><span><b>Picking up?</b> Ask if they can come back once the internet is back.</span></label></li>
          <li><input type="checkbox" id="c2"><label for="c2"><span><b>Dropping off?</b> On printer paper: name, item counts, today's date, ready date and time. Copy for them, copy for us.</span></label></li>
          <li><input type="checkbox" id="c3"><label for="c3"><span>Start the 15-minute clock. It usually comes back on its own.</span></label></li>
        </ul>
        <div class="timer" id="timer"><span class="timer-clock" id="clock">15:00</span><button class="btn btn-sm" id="start">Start clock</button><span class="muted" id="timer-msg">Still down at zero? Call the owner or manager.</span></div>
        <div class="ticket-foot"><span class="src">Source · CSR Manual · Day 5 · Internet Down</span></div></div>`;
    },
    spotdown() {
      return `<div class="ticket" style="--cat:var(--red)">
        <div class="ticket-top"><span class="flag">SPOT is down</span></div>
        <h2>Internet works, SPOT doesn't</h2>
        <div class="section-label">Say this</div><blockquote class="say">“I'm sorry, our system is having trouble pulling up orders. It should be back shortly.”</blockquote>
        <div class="section-label">Then</div>
        <ul class="checklist">
          <li><input type="checkbox" id="s1"><label for="s1"><span>Drop-offs: use the paper slip (name, counts, date, ready date). Copy for the customer.</span></label></li>
          <li><input type="checkbox" id="s2"><label for="s2"><span>Tell the owner or manager.</span></label></li>
        </ul>
        <div class="section-label">Enrique fills these in</div>
        <div class="blanks">
          <div class="blank"><span>SPOT support line</span><em>to add</em></div>
          <div class="blank"><span>Store account # (${myStore === "plant" ? "Plant" : "Target"})</span><em>to add</em></div>
          <div class="blank"><span>Can a CSR restart anything?</span><em>to add</em></div>
        </div>
        <div class="gapnote"><b>Not in the book yet · for Enrique</b>${esc(byId.spotdown.gap)}</div>
        <div class="ticket-foot"><span class="src">Source · Discovery call 10/19</span></div></div>`;
    },
    carddown() {
      return `<div class="ticket" style="--cat:var(--red)">
        <div class="ticket-top"><span class="flag">Card machine / merchant services</span></div>
        <h2>We're cashless, so this one stops pickups cold</h2>
        <div class="section-label">Right now</div>
        <ul class="checklist">
          <li><input type="checkbox" id="m1"><label for="m1"><span>Check whether the internet is up. If not, follow the Internet Down steps.</span></label></li>
          <li><input type="checkbox" id="m2"><label for="m2"><span>Tell the owner or manager.</span></label></li>
        </ul>
        <div class="section-label">Enrique fills these in</div>
        <div class="blanks">
          <div class="blank"><span>Merchant services help desk</span><em>to add</em></div>
          <div class="blank"><span>Merchant ID · Plant</span><em>to add</em></div>
          <div class="blank"><span>Merchant ID · Target</span><em>to add</em></div>
          <div class="blank"><span>Can a regular take their order and pay later?</span><em>to add</em></div>
        </div>
        <div class="gapnote"><b>Not in the book yet · for Enrique</b>${esc(byId.carddown.gap)}</div>
        <div class="ticket-foot"><span class="src">Source · Discovery call 10/19</span></div></div>`;
    }
  };
  function renderOutage(which) {
    stopTimer();
    const key = OUT[which] ? which : null;
    $$("#outage-pick button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.o === (which === "internet2" ? "internet" : key))));
    $("#outage-out").innerHTML = key ? OUT[key]() : "";
    const start = $("#start");
    if (start) start.addEventListener("click", () => {
      stopTimer();
      let left = 15 * 60; const clock = $("#clock"), t = $("#timer");
      t.classList.remove("is-up"); start.textContent = "Restart";
      const c3 = $("#c3"); if (c3) c3.checked = true;
      timerH = setInterval(() => {
        left--; clock.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
        if (left <= 0) { stopTimer(); t.classList.add("is-up"); clock.textContent = "0:00"; $("#timer-msg").innerHTML = "<b>15 minutes. Call the owner or manager now.</b>"; }
      }, 1000);
    });
  }
  $("#outage-pick").addEventListener("click", e => { const b = e.target.closest("button"); if (b) go("#outage/" + b.dataset.o); });
  $("#outage-out").addEventListener("click", e => { const b = e.target.closest("[data-next]"); if (b) go("#outage/" + b.dataset.next); });

  // ── SCRIPTS ──
  $("#scripts").innerHTML = KB.filter(a => a.say && a.say.startsWith("“")).map(a =>
    `<button class="script" data-copy="${esc(a.say)}" style="${catVar(a)}">${flag(a)}<h3>${esc(a.title)}</h3><q>${esc(a.say)}</q><span class="tap">Tap to copy · <span data-href="#a/${a.id}">full page</span></span></button>`).join("");
  $("#scripts").addEventListener("click", e => {
    const link = e.target.closest("[data-href]"); if (link) { go(link.dataset.href); return; }
    const s = e.target.closest(".script"); if (s) copy(s.dataset.copy);
  });
  document.addEventListener("click", e => { const b = e.target.closest(".say .copy"); if (b) copy(b.dataset.copy); });

  // ── TRAINING: trainees, daily sign-off, spaced check ──
  // Missed questions come back tomorrow; each correct answer pushes the next check further out.
  const INTERVALS = [1, 2, 4, 7, 14];
  const DAYS = window.DAYS;
  const startOfDay = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const trainees = () => store.get("trainees", {});
  const saveTrainees = t => store.set("trainees", t);
  let currentTrainee = store.get("trainee", "");
  let check = null; // { queue: [idx], i, revealed, got }

  function tData() { return trainees()[currentTrainee]; }
  function trainingDay(t) { for (const d of DAYS) if (!t.signed[d.day]) return d.day; return 6; }
  function dueQueue(t) {
    const upTo = Math.min(trainingDay(t), 5), eod = startOfDay() + DAY_MS - 1;
    return TRAINING.map((c, i) => ({ c, i, s: t.cards[i] }))
      .filter(x => x.c.day <= upTo && (!x.s || x.s.due <= eod))
      .sort((a, b) => (a.s ? a.s.due : 0) - (b.s ? b.s.due : 0) || a.c.day - b.c.day)
      .slice(0, 3).map(x => x.i);
  }
  function nextDue(t) {
    const upTo = Math.min(trainingDay(t), 5);
    const dues = TRAINING.map((c, i) => c.day <= upTo ? (t.cards[i] ? t.cards[i].due : 0) : Infinity);
    return Math.min(...dues);
  }

  function renderTraineeBar() {
    const all = Object.keys(trainees());
    const bar = $("#trainee-bar");
    if (!all.length || !tData()) {
      bar.innerHTML = `<form class="trainee-new" id="trainee-new">
        <label for="trainee-name"><b>Add a trainee</b><span class="muted">Training starts on Day 1.</span></label>
        <div class="searchfield"><i class="ph ph-user-plus" aria-hidden="true"></i><input id="trainee-name" placeholder="Trainee's first name" required><button class="btn btn-primary" type="submit">Start</button></div>
      </form>`;
      return;
    }
    const t = tData(), signed = DAYS.filter(d => t.signed[d.day]).length;
    bar.innerHTML = `<div class="trainee-row">
      <div class="avatar" aria-hidden="true">${esc(currentTrainee.slice(0, 1).toUpperCase())}</div>
      <div class="trainee-meta">
        <label class="sr" for="trainee-pick">Trainee</label>
        <select id="trainee-pick">${all.map(n => `<option value="${esc(n)}"${n === currentTrainee ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>
        <span class="muted">${signed === 5 ? "Training complete" : `Day ${trainingDay(t)} of 5`} · started ${fmtShort(t.start)}</span>
      </div>
      <div class="progress" aria-label="${signed} of 5 days signed off">${DAYS.map(d => `<span class="${t.signed[d.day] ? "on" : d.day === trainingDay(t) ? "now" : ""}"></span>`).join("")}</div>
      <button class="btn btn-sm btn-ghost" type="button" id="trainee-add"><i class="ph ph-user-plus"></i>New trainee</button>
    </div>`;
  }

  function renderCheck() {
    const t = tData();
    if (!check) check = { queue: dueQueue(t), i: 0, revealed: false, got: 0 };
    const { queue, i } = check;
    let body;
    if (!queue.length) {
      const nd = nextDue(t);
      body = `<div class="check-empty"><i class="ph-fill ph-check-circle"></i><b>All caught up.</b><span>Next check ${isFinite(nd) && nd > Date.now() ? fmtLong(new Date(nd)) : "tomorrow"}.</span></div>`;
    } else if (i >= queue.length) {
      body = `<div class="check-empty"><i class="ph-fill ph-check-circle"></i><b>${check.got} of ${queue.length} right.</b><span>${check.got === queue.length ? "Those come back in a few days to make them stick." : "The missed ones come back tomorrow."}</span></div>`;
    } else {
      const c = TRAINING[queue[i]];
      body = `<div class="check-q"><span class="check-n">Question ${i + 1} of ${queue.length} · Day ${c.day}</span><p>${esc(c.q)}</p></div>
        ${check.revealed
          ? `<div class="check-a"><p>${esc(c.a)}</p><a href="#a/${c.ref}" class="src">Open the page</a></div>
             <div class="decision"><button class="btn btn-primary" data-chk="got"><i class="ph ph-check"></i>Got it</button><button class="btn" data-chk="miss"><i class="ph ph-arrow-counter-clockwise"></i>Missed it</button></div>`
          : `<div class="decision"><button class="btn btn-primary" data-chk="reveal">Show answer</button></div>`}`;
    }
    return `<div class="panel check-card"><h2 class="panel-title"><i class="ph ph-list-checks"></i>Daily review</h2>${body}</div>`;
  }

  function renderDays() {
    const t = tData(), now = trainingDay(t), trainer = store.get("trainerName", "");
    return `<div class="panel"><h2 class="panel-title"><i class="ph ph-signature"></i>Training sign-off</h2><ol class="days">${DAYS.map(d => {
      const s = t.signed[d.day];
      const topics = d.topics.map(([label, id]) => id ? `<a class="topic" href="#a/${id}">${esc(label)}</a>` : `<span class="topic">${esc(label)}</span>`).join("");
      let foot;
      if (s) foot = `<div class="signed"><i class="ph-fill ph-seal-check"></i><span>Signed off ${fmtShort(s.at)} · Trainer: ${esc(s.trainer)} · Trainee: ${esc(currentTrainee)}</span><button class="link-btn" data-undo="${d.day}">Undo</button></div>`;
      else if (d.day === now) foot = `<form class="signoff" data-day="${d.day}">
          <label>Trainer<input name="trainer" value="${esc(trainer)}" placeholder="Trainer's name" required></label>
          <label class="check"><input type="checkbox" name="ok" required> ${esc(currentTrainee)} passed the Day ${d.day} assessment</label>
          <button class="btn btn-primary" type="submit"><i class="ph ph-signature"></i>Sign off Day ${d.day}</button>
        </form>`;
      else foot = `<div class="locked"><i class="ph ph-lock-simple"></i>Unlocks after Day ${d.day - 1} is signed off</div>`;
      return `<li class="day ${s ? "is-done" : d.day === now ? "is-now" : ""}">
        <div class="day-head"><span class="day-n">Day ${d.day}</span><b>${esc(d.theme)}</b></div>
        <div class="topics">${topics}</div>${foot}</li>`;
    }).join("")}</ol></div>`;
  }

  function renderTrainingBody() {
    renderTraineeBar();
    $("#training-body").innerHTML = tData() ? `<div class="split split-train">${renderCheck()}${renderDays()}</div>` : "";
  }

  $("#trainee-bar").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#trainee-name").value.trim().slice(0, 40); if (!name) return;
    const all = trainees();
    if (!all[name]) all[name] = { start: Date.now(), signed: {}, cards: {} };
    saveTrainees(all); currentTrainee = name; store.set("trainee", name); check = null;
    renderTrainingBody();
  });
  $("#trainee-bar").addEventListener("change", e => {
    if (e.target.id !== "trainee-pick") return;
    currentTrainee = e.target.value; store.set("trainee", currentTrainee); check = null; renderTrainingBody();
  });
  $("#trainee-bar").addEventListener("click", e => {
    if (!e.target.closest("#trainee-add")) return;
    currentTrainee = ""; store.set("trainee", ""); check = null; renderTrainingBody();
    const inp = $("#trainee-name"); if (inp) inp.focus();
  });
  $("#training-body").addEventListener("click", e => {
    const c = e.target.closest("[data-chk]");
    if (c) {
      const all = trainees(), t = all[currentTrainee], idx = check.queue[check.i];
      if (c.dataset.chk === "reveal") check.revealed = true;
      else {
        const prev = t.cards[idx], got = c.dataset.chk === "got";
        // First correct answer waits 2 days; each one after that waits longer. A miss comes back tomorrow.
        const box = got ? Math.min((prev ? prev.box : 0) + 1, INTERVALS.length - 1) : 0;
        t.cards[idx] = { box, due: startOfDay() + INTERVALS[box] * DAY_MS };
        saveTrainees(all);
        if (got) check.got++;
        check.i++; check.revealed = false;
      }
      renderTrainingBody(); return;
    }
    const u = e.target.closest("[data-undo]");
    if (u) { const all = trainees(); delete all[currentTrainee].signed[u.dataset.undo]; saveTrainees(all); check = null; renderTrainingBody(); }
  });
  $("#training-body").addEventListener("submit", e => {
    const f = e.target.closest(".signoff"); if (!f) return;
    e.preventDefault();
    const trainer = f.trainer.value.trim().slice(0, 40); if (!trainer || !f.ok.checked) return;
    const all = trainees();
    all[currentTrainee].signed[f.dataset.day] = { trainer, at: Date.now() };
    saveTrainees(all); store.set("trainerName", trainer);
    renderTrainingBody();
  });

  let day = 0;
  $("#day-seg").innerHTML = [0, 1, 2, 3, 4, 5].map(d => `<button role="radio" data-day="${d}" aria-checked="${d === 0}">${d ? "Day " + d : "All days"}</button>`).join("");
  $("#day-seg").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; day = +b.dataset.day; renderTraining(); });
  function renderTraining() {
    $$("#day-seg button").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.day === day)));
    $("#cards").innerHTML = TRAINING.filter(t => !day || t.day === day).map(t => `
      <button class="fcard" aria-label="Flip card">
        <div class="fcard-inner">
          <div class="fcard-face"><span class="fcard-day">Day ${t.day}</span><span class="fcard-q">${esc(t.q)}</span><span class="fcard-cta">Tap to flip</span></div>
          <div class="fcard-face fcard-back"><span class="fcard-day">Answer</span><span class="fcard-a">${esc(t.a)}</span><span data-href="#a/${t.ref}" class="src fcard-link">Open the page →</span></div>
        </div>
      </button>`).join("");
  }
  $("#cards").addEventListener("click", e => {
    const link = e.target.closest("[data-href]"); if (link) { go(link.dataset.href); return; }
    const c = e.target.closest(".fcard"); if (c) c.classList.toggle("is-flipped");
  });

  // ── BROWSE ──
  $("#browse-count").textContent = `${KB.length} pages. A green seal means Enrique verified it. A yellow dot means part of the answer is still missing.`;
  function renderBrowse() {
    $("#browse").innerHTML = Object.entries(CATS).map(([k, c]) => {
      const items = KB.filter(a => a.cat === k);
      return `<div class="bcat" style="--cat:${c.color}"><h2>${esc(c.label)}</h2><ul>${items.map(a => {
        const s = vstatus(a);
        const mark = s.k === "ok" ? `<i class="ph-fill ph-seal-check bmark-ok" title="${esc(s.detail)}"></i>` : a.gap ? '<span class="dot-gap" title="Has an open question"></span>' : "";
        return `<li><a href="#a/${a.id}"><span>${esc(a.title)}</span>${mark}</a></li>`;
      }).join("")}</ul></div>`;
    }).join("");
  }
  renderBrowse();

  // ── GAPS ──
  $("#gaps").innerHTML = KB.filter(a => a.gap).map(a =>
    `<li class="gap-item"><h3>${esc(a.title)}</h3><p>${esc(a.gap)}</p><a href="#a/${a.id}">Open the page →</a></li>`).join("");

  // ── REVIEW (owner) ──
  let reviewFilter = "attn";
  function renderReview() {
    const views = store.get("views", {}), votes = store.get("votes", {}), items = inbox();
    const sts = KB.map(a => ({ a, s: vstatus(a), v: views[a.id] || 0, down: (votes[a.id] || {}).down || 0, up: (votes[a.id] || {}).up || 0 }));
    const verified = sts.filter(x => x.s.k === "ok").length;
    const flags = items.filter(i => i.type === "flag").length, qs = items.length - flags;
    $("#review-stats").innerHTML = [
      ["ph-seal-check", `${verified}<small>/${KB.length}</small>`, "pages verified"],
      ["ph-clock-countdown", sts.filter(x => x.s.k === "due").length, "due for review"],
      ["ph-chat-circle-text", qs, "questions from the counter"],
      ["ph-thumbs-down", flags, "answers flagged"]
    ].map(([i, n, l]) => `<div class="stat"><i class="ph ${i}"></i><b>${n}</b><span>${l}</span></div>`).join("");

    $("#inbox").innerHTML = items.length ? items.map(it => {
      const page = it.page && byId[it.page];
      const meta = [page ? `On “${page.title}”` : "", it.q && it.type === "flag" ? `Searched “${it.q}”` : "", ago(it.at)].filter(Boolean).join(" · ");
      return `<li class="inbox-item">
        <i class="ph ${it.type === "flag" ? "ph-flag" : "ph-chat-circle-text"} ib-${it.type}"></i>
        <span class="row-text"><span class="ib-kind">${it.type === "flag" ? "Flagged answer" : "Question"}</span>${esc(it.text)}<small>${esc(meta)}</small></span>
        <span class="ib-actions">${page ? `<a class="btn btn-sm" href="#a/${page.id}">Open</a>` : ""}<button class="btn btn-sm" data-handled="${esc(it.key)}"><i class="ph ph-check"></i>Handled</button></span>
      </li>`;
    }).join("") : `<li class="inbox-empty"><i class="ph ph-tray"></i><span class="row-text">Nothing waiting.<small>“Ask Enrique” and “Not quite” from any answer land here.</small></span></li>`;

    $$("#review-seg button").forEach(b => b.setAttribute("aria-checked", String(b.dataset.f === reviewFilter)));
    const rows = sts.filter(x => reviewFilter === "all" || x.s.k !== "ok")
      .sort((x, y) => STATUS_ORDER[x.s.k] - STATUS_ORDER[y.s.k] || y.v - x.v || y.down - x.down || x.a.title.localeCompare(y.a.title));
    $("#review-list").innerHTML = rows.length ? rows.map(({ a, s, v, down, up }) => `
      <div class="rv-row">
        <div class="rv-main"><a href="#a/${a.id}">${esc(a.title)}</a>
          <div class="rv-meta">${vchip(a)}<span><i class="ph ph-eye"></i>${v}</span>${up ? `<span><i class="ph ph-thumbs-up"></i>${up}</span>` : ""}${down ? `<span class="rv-down"><i class="ph ph-thumbs-down"></i>${down}</span>` : ""}</div></div>
        ${s.k === "ok"
          ? `<button class="btn btn-sm btn-ghost" data-verify="${a.id}" data-on="0">Unverify</button>`
          : `<button class="btn btn-sm btn-primary" data-verify="${a.id}" data-on="1"><i class="ph ph-seal-check"></i>${s.k === "due" ? "Re-verify" : "Verify"}</button>`}
      </div>`).join("") : `<p class="muted">All articles are verified.</p>`;
  }
  $("#review-seg").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; reviewFilter = b.dataset.f; renderReview(); });
  $("#review-list").addEventListener("click", e => {
    const b = e.target.closest("[data-verify]"); if (!b) return;
    const on = b.dataset.on === "1"; setVerified(b.dataset.verify, on);
    toast(on ? `Verified · next review ${fmtShort(Date.now() + REVIEW_DAYS * DAY_MS)}` : "Marked unverified");
    renderReview(); renderBrowse();
  });
  $("#inbox").addEventListener("click", e => {
    const b = e.target.closest("[data-handled]"); if (!b) return;
    store.set("inbox", inbox().filter(i => i.key !== b.dataset.handled)); updateCounts(); renderReview();
  });

  // ── Router ──
  const TITLES = { ask: "Home", ready: "Promise dates", routes: "Delivery routes", outage: "Outages", scripts: "Scripts",
    training: "Training", browse: "Articles", gaps: "Content gaps", plan: "About this prototype", review: "Review queue" };
  const MORE = ["ready", "routes", "outage", "gaps", "plan", "review"];

  function go(hash) { if (location.hash === hash) route_(); else location.hash = hash; }
  function setIcon(el, on) {
    const i = el.querySelector("i"); if (!i) return;
    i.classList.toggle("ph", !on); i.classList.toggle("ph-fill", on);
  }
  function show(view, title) {
    $$("[data-view]").forEach(s => s.hidden = s.dataset.view !== view);
    $$(".side-nav a, .tabbar [data-tab]").forEach(a => {
      const on = a.dataset.tab === view || (a.dataset.tab === "more" && MORE.includes(view));
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      setIcon(a, on);
    });
    $("#view-title").textContent = title || TITLES[view];
    document.title = view === "ask" && !title ? "Book of Knowledge" : `${title || TITLES[view]} · Book of Knowledge`;
    $(".topbar").classList.toggle("on-ask", view === "ask");
    closeSheet(); closeAskTA(); closeTopTA();
  }
  function showAnswerIn(view) { $$("[data-view]").forEach(s => s.hidden = s.dataset.view !== view); $(".topbar").classList.remove("on-ask"); }
  function route_() {
    const h = decodeURIComponent(location.hash.slice(1));
    const [view, ...rest] = h.split("/");
    const arg = rest.join("/");
    if (view !== "outage") stopTimer();
    switch (view) {
      case "a": show("browse", "Articles"); showAnswerIn("ask"); renderArticle(arg); break;
      case "ready": show("ready"); renderReady(); break;
      case "routes": show("routes"); renderWeek(); break;
      case "outage": show("outage"); renderOutage(arg); break;
      case "scripts": case "browse": case "plan": show(view); break;
      case "training": show("training"); check = null; renderTrainingBody(); renderTraining(); break;
      case "gaps": show("gaps"); break;
      case "review": show("review"); renderReview(); break;
      case "ask": show("ask", arg ? "Search results" : null); arg ? renderAsk(arg) : renderAskEmpty(); break;
      default: show("ask"); renderAskEmpty();
    }
    if (view === "outage" && arg && window.innerWidth <= 760) requestAnimationFrame(() => $("#outage-out").scrollIntoView({ block: "start" }));
    else window.scrollTo({ top: 0 });
  }

  // ── More sheet (phone) ──
  const sheet = $("#more-sheet"), scrim = $("#sheet-scrim");
  function openSheet() { sheet.hidden = false; scrim.hidden = false; }
  function closeSheet() { sheet.hidden = true; scrim.hidden = true; }
  $("#more-btn").addEventListener("click", () => (sheet.hidden ? openSheet() : closeSheet()));
  scrim.addEventListener("click", closeSheet);
  sheet.addEventListener("click", e => { if (e.target.closest("a")) closeSheet(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSheet();
    // "/" jumps to search, like most desktop apps
    if (e.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      const top = topSearch.querySelector("input");
      (getComputedStyle(topSearch).display !== "none" && !$(".topbar").classList.contains("on-ask") ? top : askInput).focus();
    }
  });

  // ── Install as an app ──
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); installEvt = e;
    $$("[data-install]").forEach(b => b.hidden = false);
  });
  $$("[data-install]").forEach(b => b.addEventListener("click", async () => {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice.catch(() => {});
    installEvt = null; $$("[data-install]").forEach(x => x.hidden = true);
  }));
  window.addEventListener("appinstalled", () => { $$("[data-install]").forEach(x => x.hidden = true); toast("Installed"); });
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone) $("#ios-hint").hidden = false;

  // ── Offline: cache the app after first load ──
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  let sessionNav = 0;
  window.addEventListener("hashchange", () => { sessionNav++; route_(); });
  updateCounts();
  setStore(myStore);
  route_();
})();
