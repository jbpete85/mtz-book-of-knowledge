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

  function articleHTML(a) {
    let h = `<article class="ticket" style="${catVar(a)}">
      <div class="ticket-top">${flag(a)}<span class="ticket-id">No. ${String(KB.indexOf(a) + 1).padStart(3, "0")}</span></div>
      <h2>${esc(a.title)}</h2>`;
    if (a.say) h += `<div class="section-label">Say this</div><blockquote class="say">${esc(a.say)}</blockquote>`;
    if (a.do) h += `<div class="section-label">${a.say ? "Then" : "Do this"}</div><ol class="steps">${a.do.map(d => `<li>${esc(d)}</li>`).join("")}</ol>`;
    if (a.table) {
      const [k, v] = a.tableHead || ["", ""];
      h += `<table class="kv">${a.tableHead ? `<tr><th>${esc(k)}</th><th>${esc(v)}</th></tr>` : ""}${a.table.map(([x, y]) => `<tr><td>${esc(x)}</td><td>${esc(y)}</td></tr>`).join("")}</table>`;
    }
    if (a.stores) {
      h += `<div class="section-label">At your store</div><div class="store-notes">${["plant", "target"].map(s =>
        `<div class="store-note${s === myStore ? " is-mine" : ""}" data-store="${s}"><b>${s === "plant" ? "Plant" : "Target"}</b>${esc(a.stores[s] || "Same as the other store.")}</div>`).join("")}</div>`;
    }
    if (a.gap) h += `<div class="gapnote"><b>Not in the book yet · for Enrique</b>${esc(a.gap)}</div>`;
    const toolLink = { ready: ["#ready", "Open the ready-by calculator"], routes: ["#routes", "Open the route days"], outage: ["#outage/" + a.id, "Walk through it step by step"] }[a.tool];
    h += `<div class="ticket-foot"><span class="src">Source · ${esc(a.src)}</span>${toolLink ? `<a class="btn btn-sm" href="${toolLink[0]}">${toolLink[1]}<i class="ph ph-arrow-right"></i></a>` : ""}</div></article>`;
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

  const backRow = `<div class="back-row"><a href="#ask"><i class="ph ph-arrow-left"></i>Home</a></div>`;
  function setAnswer(html) { home.hidden = true; answer.innerHTML = backRow + html; }

  function renderAskEmpty() {
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
        <div class="ticket-top"><span class="flag" style="color:var(--gap-ink)">No page for this yet</span></div>
        <h2>The book doesn't cover “${esc(q)}”</h2>
        <p class="muted">Tell the customer you'll find out, then check with the manager on duty. Log it so Enrique can add the answer.</p>
        <button class="btn btn-primary" id="log-it"><i class="ph ph-paper-plane-tilt"></i>Add to Enrique's list</button>
      </article>${relatedHTML("Closest pages", near)}`);
      $("#log-it").addEventListener("click", e => {
        const list = store.get("logged", []);
        if (!list.includes(q)) list.push(q);
        store.set("logged", list);
        const b = e.currentTarget; b.disabled = true; b.innerHTML = '<i class="ph ph-check"></i>Logged';
        toast("Added to Enrique's list");
      });
      return;
    }
    const top = res[0].a;
    const related = res.slice(1, 4).filter(r => r.s >= 2.5).map(r => r.a);
    pushRecent({ id: top.id, q });
    setAnswer(articleHTML(top) + relatedHTML("Also in the book", related));
  }
  function renderArticle(id) {
    const a = byId[id];
    if (!a) return renderAskEmpty();
    askInput.value = "";
    pushRecent({ id });
    const sameCat = KB.filter(x => x.cat === a.cat && x !== a).slice(0, 4);
    setAnswer(articleHTML(a) + relatedHTML(`More in ${CATS[a.cat].label}`, sameCat));
  }

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
        notes: [`<span style="background:var(--gap-wash);padding:0 4px">Not in the book yet:</span> the manual points to a “Turnaround Time Sheet” that isn't in the binder.`],
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

  // ── TRAINING ──
  let day = 0;
  $("#day-seg").innerHTML = [0, 1, 2, 3, 4, 5].map(d => `<button role="radio" data-day="${d}" aria-checked="${d === 0}">${d ? "Day " + d : "All days"}</button>`).join("");
  $("#day-seg").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; day = +b.dataset.day; renderTraining(); });
  function renderTraining() {
    $$("#day-seg button").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.day === day)));
    $("#cards").innerHTML = TRAINING.filter(t => !day || t.day === day).map(t => `
      <button class="fcard" aria-label="Flip card">
        <div class="fcard-inner">
          <div class="fcard-face"><span class="fcard-day">Day ${t.day}</span><span class="fcard-q">${esc(t.q)}</span><span class="fcard-cta">Tap to flip</span></div>
          <div class="fcard-face fcard-back"><span class="fcard-day">Answer</span><span class="fcard-a">${esc(t.a)}</span><span data-href="#a/${t.ref}" class="src" style="margin-top:auto;text-decoration:underline">Open the page →</span></div>
        </div>
      </button>`).join("");
  }
  $("#cards").addEventListener("click", e => {
    const link = e.target.closest("[data-href]"); if (link) { go(link.dataset.href); return; }
    const c = e.target.closest(".fcard"); if (c) c.classList.toggle("is-flipped");
  });

  // ── BROWSE ──
  $("#browse-count").textContent = `${KB.length} pages. A yellow dot means part of the answer is still missing.`;
  $("#browse").innerHTML = Object.entries(CATS).map(([k, c]) => {
    const items = KB.filter(a => a.cat === k);
    return `<div class="bcat" style="--cat:${c.color}"><h2>${esc(c.label)}</h2><ul>${items.map(a =>
      `<li><a href="#a/${a.id}"><span>${esc(a.title)}</span>${a.gap ? '<span class="dot-gap" title="Has an open question"></span>' : ""}</a></li>`).join("")}</ul></div>`;
  }).join("");

  // ── GAPS ──
  $("#gaps").innerHTML = KB.filter(a => a.gap).map(a =>
    `<li class="gap-item"><h3>${esc(a.title)}</h3><p>${esc(a.gap)}</p><a href="#a/${a.id}">Open the page →</a></li>`).join("");
  function renderLogged() {
    const list = store.get("logged", []);
    $("#logged-wrap").hidden = !list.length;
    $("#logged").innerHTML = list.map(q => `<li>${esc(q)}</li>`).join("");
  }

  // ── Router ──
  const TITLES = { ask: "Ask", ready: "Ready by", routes: "Route days", outage: "Something broke", scripts: "What to say",
    training: "Training", browse: "Browse the book", gaps: "Gaps for Enrique", plan: "The plan" };
  const MORE = ["scripts", "training", "browse", "gaps", "plan"];

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
    closeSheet();
  }
  function route_() {
    const h = decodeURIComponent(location.hash.slice(1));
    const [view, ...rest] = h.split("/");
    const arg = rest.join("/");
    if (view !== "outage") stopTimer();
    switch (view) {
      case "a": show("ask", byId[arg] ? CATS[byId[arg].cat].label : null); renderArticle(arg); break;
      case "ready": show("ready"); renderReady(); break;
      case "routes": show("routes"); renderWeek(); break;
      case "outage": show("outage"); renderOutage(arg); break;
      case "scripts": case "browse": case "plan": show(view); break;
      case "training": show("training"); renderTraining(); break;
      case "gaps": show("gaps"); renderLogged(); break;
      case "ask": show("ask", arg ? "Answer" : null); arg ? renderAsk(arg) : renderAskEmpty(); break;
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

  window.addEventListener("hashchange", route_);
  setStore(myStore);
  route_();
})();
