// The Book of Knowledge — content layer.
// Every entry is sourced from the CSR Training Manual (vf), the Employee Handbook (rev. June 2026),
// or Enrique's discovery call (10/19). `gap` marks something the source material doesn't answer yet.

window.CATEGORIES = {
  dropoff:  { label: "Drop-off",          color: "var(--green)" },
  garments: { label: "Garments & tags",   color: "var(--orange)" },
  pickup:   { label: "Pickup",            color: "var(--blue)" },
  special:  { label: "Special items",     color: "var(--plum)" },
  recovery: { label: "Service recovery",  color: "var(--red)" },
  services: { label: "Services & routes", color: "var(--blue)" },
  outage:   { label: "When things break", color: "var(--red)" },
  phone:    { label: "Phone & words",     color: "var(--green)" },
  team:     { label: "Team policies",     color: "var(--ink-2)" }
};

window.KB = [
  // ───────── DROP-OFF ─────────
  {
    id: "promise", cat: "dropoff", title: "When will my order be ready?",
    q: ["when will it be ready", "promise time", "ready date", "how long does it take", "turnaround", "same day service", "next day"],
    say: "“Mr. Jones, your items will be ready Tuesday after 6 PM.” Always give the day and the time.",
    do: [
      "Monday–Friday, dropped off before 9:00 AM → ready the same day after 6:00 PM.",
      "Monday–Thursday, after 9:00 AM → ready the next day after 6:00 PM.",
      "Friday after 9:00 AM, or any time Saturday → ready Monday after 6:00 PM.",
      "These times cover normal dry cleaning and laundry only. Household items, wedding dresses, leather and Wash & Fold take longer."
    ],
    tool: "ready",
    src: "CSR Manual · Day 5 · Promise Times"
  },
  {
    id: "sooner", cat: "dropoff", title: "Customer needs it sooner than the promise time",
    q: ["need it sooner", "rush", "need it today", "need it tomorrow", "urgent", "faster", "before the weekend", "expedite"],
    do: ["Don't promise an earlier time yourself. Check with the manager on duty before you commit."],
    gap: "The Day 5 assessment asks “If a customer needs something back sooner than a promise time, what do you do?” but the manual never answers it. On the call, Enrique said the team will sometimes try for Thursday evening. Is there a rush fee? A cutoff? Who can approve it?",
    src: "CSR Manual · Day 5 · Assessment"
  },
  {
    id: "qr", cat: "dropoff", title: "Taking a drop-off (Quick Receipt)",
    q: ["drop off", "dropping off clothes", "quick receipt", "qr", "new order", "take in an order", "create a ticket"],
    do: [
      "Press “Quick” (top left) or 1 on the number pad, enter your PIN, then find the customer.",
      "Pick the department first (dry clean, laundry), then the piece count. Add each department the customer brought.",
      "Check the name, address, phone, email, the promised date, and the piece count.",
      "Hit Finish (F12), then choose “Printed” so the customer gets a copy.",
      "Customer copy prints first, then one QR per department. Put the QR(s) in a front-counter bag, then the clothes. Tie it off and set it in the basket by the tag-in station.",
      "Keep only one customer's order on the counter at a time."
    ],
    src: "CSR Manual · Day 1 · Quick Receipts"
  },
  {
    id: "count", cat: "dropoff", title: "Who counts the pieces?",
    q: ["how many pieces", "count the pieces", "piece count", "customer says how many items"],
    say: "You count. Never ask the customer how many pieces they brought.",
    do: ["Count every garment yourself and enter that number on the Quick Receipt."],
    src: "CSR Manual · Day 1 · Quick Receipts"
  },
  {
    id: "lookup", cat: "dropoff", title: "Finding or adding a customer in SPOT",
    q: ["find customer", "look up customer", "search customer", "new customer", "add customer", "customer not in system"],
    do: [
      "Search by last name then first name, by phone (just the 7 digits: no area code, no dashes), by street address, or by email.",
      "For new customers, capture full contact info, address, store number, and starch preference.",
      "Training mock customers: never save them."
    ],
    src: "CSR Manual · Day 1 · Customer Lookup"
  },
  {
    id: "detail", cat: "dropoff", title: "Before you finish a detail",
    q: ["detailing", "detail an order", "finish the ticket", "before finishing"],
    do: [
      "Heat seal label is in the right spot for that garment.",
      "Coupons are added now, at drop-off, when the ticket is created.",
      "The return date is correct.",
      "Verify the customer's phone, address and email so we can reach them. Add special instructions and promise dates to the QR."
    ],
    src: "CSR Manual · Day 3 · Detailing"
  },
  {
    id: "holdout", cat: "dropoff", title: "Stained items: ask about holdouts",
    q: ["holdout", "hold back", "stained items drop off", "no holdouts", "extra day for stains"],
    say: "“Is it okay if we hold this back an extra day if the stain needs another pass?”",
    do: [
      "Ask every customer who drops off stained items.",
      "If they say no, mark “No Holdouts” in their account preferences and on the invoice during detailing.",
      "If a customer is unhappy at pickup because items were held back: apologize, update their account, and tell them we won't hold their items in the future."
    ],
    src: "CSR Manual · Day 4 · Guarantees"
  },

  // ───────── GARMENTS & TAGS ─────────
  {
    id: "carelabel", cat: "garments", title: "No care label, or not sure how to clean it",
    q: ["care label", "no care label", "missing label", "dry clean or laundry", "how should this be cleaned", "symbols"],
    do: [
      "Follow the care label. Use the symbol cheat sheet on the wall.",
      "No care label? Dry cleaning is generally the method.",
      "Still unsure? Ask a teammate or manager."
    ],
    src: "CSR Manual · Day 2 · Care Labels"
  },
  {
    id: "fabrics", cat: "garments", title: "Dry clean only fabrics",
    q: ["silk", "linen", "rayon", "wool", "cotton", "can this be washed", "fabric"],
    do: [
      "Silk, linen, rayon and wool: dry clean only. Laundering can damage them.",
      "Cotton can usually be washed, but not always. The care label decides."
    ],
    src: "CSR Manual · Day 2 · Fabrics"
  },
  {
    id: "hsl", cat: "garments", title: "Where does the heat seal label go?",
    q: ["heat seal", "hsl", "label placement", "where to put the label", "tag placement"],
    table: [
      ["Blazer / sport jacket", "Fabric tag with the brand name"],
      ["Pants", "Back left pocket lining, below the waistband (waistband if no pockets)"],
      ["Shorts", "Back left pocket lining, or waistband if no pockets"],
      ["Dress / skirt", "Brand tag in the neck / care label inside skirt"],
      ["Formal / wedding dress", "On a blank flyer, attached to the brand tag in the neck. Never directly on the dress."],
      ["Blouse", "Brand tag in neck / care label on inside seam"],
      ["Shirt", "Bottom inside of the placket without buttons / brand tag in neck"],
      ["Sweater", "Brand tag in neck / care label"],
      ["Pullover", "Inside of the hem, rear left side"],
      ["Tie", "Brand tag on back of tie (trim to size)"],
      ["Lab coat", "Inside left placket / in neck"]
    ],
    src: "CSR Manual · Day 2 · Heat Seal Labels"
  },
  {
    id: "prespot", cat: "garments", title: "Marking a stain (red pre-spot tape)",
    q: ["red tape", "pre spot", "prespot", "mark a stain", "stain tape"],
    do: [
      "Tear a few inches of red tape and place it next to the stain, not on it.",
      "Never use red tape on leather or suede. It leaves marks that won't come out."
    ],
    stores: {
      plant: "Hang the item over the side of the basket.",
      target: "Put the item in a green stain bag."
    },
    src: "CSR Manual · Day 2 · Flag Tags"
  },
  {
    id: "flagtags", cat: "garments", title: "Flag tags: which one for what",
    q: ["flag tag", "which tag", "crease", "no crease", "fold", "sleeves crease", "special instructions", "blank tag"],
    table: [
      ["Red pre-spot tape", "Stain needs extra attention (next to the stain)"],
      ["Orange “Press-Only”", "Customer wants pressing without cleaning"],
      ["White “Crease”", "Crease pants, jeans or shorts. Pin on the innermost part of the fly."],
      ["White “Crease Sleeves”", "We never crease shirt sleeves unless this is attached"],
      ["White “Fold”", "Fold and package in a paper bag (laundry), or fold over the hanger (sweaters, pullovers)"],
      ["Red “Replace Button”", "Loop through the empty buttonhole, staple the ends"],
      ["“Hand Finish”", "Laundered item pressed by hand (custom buttons, embroidery). Charge the higher price."],
      ["“Hand Clean”", "Delicate, handmade, beaded garments"],
      ["Blank tag", "Any other request. Write it with an approved black ballpoint pen."]
    ],
    do: ["Fold the tag a little so you pin through multiple layers, and leave it sticking out where it's visible."],
    src: "CSR Manual · Day 2 · Flag Tags"
  },
  {
    id: "pressonly", cat: "garments", title: "Customer wants press only",
    q: ["press only", "just pressing", "only press", "iron only", "no cleaning just press"],
    say: "“Press-only is the same price as cleaning and pressing, and a cleaned garment holds the press better. Would you like us to clean it too?”",
    do: ["If they still want press-only, attach the orange “Press-Only” flag tag."],
    stores: {
      plant: "Place on the counter by the presses after detailing.",
      target: "Place in the red “Press-Only” bag after detailing."
    },
    src: "CSR Manual · Day 2 · Flag Tags"
  },
  {
    id: "starch", cat: "garments", title: "Starch and sizing",
    q: ["starch", "sizing", "light starch", "heavy starch", "starch dry clean"],
    do: [
      "Laundry: starch goes in during the rinse cycle, based on the customer's preference in their account.",
      "Dry cleaning uses no water, so no starch. Customers can request “Sizing” instead, sprayed on before pressing."
    ],
    src: "CSR Manual · Day 2 · Sizing"
  },
  {
    id: "bleach", cat: "garments", title: "Do we use bleach?",
    q: ["bleach", "whiten", "white shirts", "yellow shirts"],
    say: "“We don't use bleach in our cleaning process. For laundered dress shirts we can use a non-chlorine whitener if you'd like.”",
    src: "CSR Manual · Day 1 · Cleaning Methods"
  },
  {
    id: "green", cat: "garments", title: "What does “We're GREEN” mean?",
    q: ["green", "greenearth", "environmentally friendly", "chemicals", "toxic", "eco", "safe"],
    say: "“We clean with GreenEarth, a silicone-based fluid that's non-toxic and gentle on fabric. It's filtered with activated clay and doesn't produce hazardous waste.”",
    src: "CSR Manual · Day 1 · Green Earth"
  },
  {
    id: "stain", cat: "garments", title: "“Can you get this stain out?”",
    q: ["stain", "get the stain out", "remove stain", "stain removal", "will this come out", "wine", "coffee", "ink", "grease"],
    say: "“We can't guarantee removal of stains, but if anyone can do it, we can. We have a specialist who hand-works on every stain.”",
    do: [
      "Never promise removal.",
      "Sugary drinks can leave invisible stains that turn brown later. Coffee, tea, egg and milk can reappear.",
      "Some ink, dried paint and dye stains are permanent.",
      "If more work on a stain could damage the garment, we stop."
    ],
    src: "CSR Manual · Day 2 · Stain Types / Day 5 · Review"
  },
  {
    id: "pockets", cat: "garments", title: "Found something in a pocket",
    q: ["pocket", "found money", "found in pocket", "look what we found", "keep money", "cash in pocket"],
    say: "No, you can't keep it. Anything found goes back to the customer.",
    do: ["Check every pocket while breaking down bags. Found items go in a “Look What We Found” bag tied to the order."],
    gap: "The manual names the Look What We Found bag and asks about found cash in the Day 5 assessment, but never spells out the steps (where the bag goes, how it's logged, how the customer is told).",
    src: "CSR Manual · Day 2 · Breaking Down the Bags"
  },
  {
    id: "damaged-in", cat: "garments", title: "Garment arrives already damaged",
    q: ["already damaged", "hole", "burn", "missing button", "broken zipper", "torn", "received damaged", "release of liability"],
    do: [
      "Tell the customer right away, in person or by phone.",
      "If they want it cleaned anyway, explain the damage may get worse, and have them sign a Release of Liability first.",
      "If it can't be cleaned, hang it on the Z-rail for pickup.",
      "Watch for: holes, burns, missing beads, missing or cracked buttons, torn lining, loose hems, torn belt loops, broken zippers, missing lace/string/belt."
    ],
    src: "CSR Manual · Day 2 & Day 4"
  },

  // ───────── PICKUP ─────────
  {
    id: "pickup", cat: "pickup", title: "Doing a pickup",
    q: ["pickup", "pick up", "customer picking up", "checkout", "take payment"],
    do: [
      "Scan the QR, or press 4 Pick Up and enter last name then first name.",
      "Pull every order for that customer and check piece counts so nothing is left or mixed up.",
      "Every invoice must show “Pick Up” in green before you take payment.",
      "Check that coupons and discounts were applied, tell the customer the total and the discount.",
      "Count the hangers in front of the customer.",
      "Take payment and thank them."
    ],
    src: "CSR Manual · Day 3 · Pickup"
  },
  {
    id: "noqr", cat: "pickup", title: "Customer lost their receipt",
    q: ["lost receipt", "no receipt", "forgot ticket", "don't have my ticket", "no qr"],
    say: "“No problem, I just need your name or phone number.”",
    src: "CSR Manual · Day 1 · Quick Receipts"
  },
  {
    id: "notready", cat: "pickup", title: "Order isn't ready, or I can't find it",
    q: ["can't find order", "cannot find", "order not ready", "says detailed", "not on conveyor", "not on the conveyor", "where is my order", "order missing"],
    do: [
      "If an invoice doesn't show “Pick Up,” check its status. “Detailed” instead of “Ready” means it's still in assembly or cleaning.",
      "Check the account and invoice for reminders."
    ],
    gap: "Day 5 asks “What do you do if you cannot find an order?” The manual covers the status check but not the next step: who searches, what you tell the customer, and whether you offer delivery.",
    src: "CSR Manual · Day 3 · Pickup"
  },
  {
    id: "rack", cat: "pickup", title: "Racking orders",
    q: ["rack", "racking", "conveyor", "location barcode", "assign location"],
    do: [
      "Press Rack (3).",
      "Scan the ticket barcode first, then the location barcode. Listen for the chime.",
      "Error sound means wrong order of scans, wrong store, or a bad read. Delete and rescan.",
      "Match piece count to hanger count on every order.",
      "Close (F12) when done."
    ],
    stores: { target: "Keep the line alphabetized." },
    src: "CSR Manual · Day 3 · Racking Orders"
  },
  {
    id: "transfer", cat: "pickup", title: "Moving a barcode to another customer",
    q: ["transfer barcode", "wrong customer", "change customer", "move barcode", "wrong account"],
    do: [
      "Home → Menu → HSL (Heat Seal Labels) → View/Edit Definitions.",
      "Scan the barcode in the Scan Area, then “Change Customer.”",
      "Find the right customer, double-click, confirm Yes, then OK."
    ],
    src: "CSR Manual · Day 5 · Transferring Barcodes"
  },

  // ───────── SPECIAL ITEMS ─────────
  {
    id: "leather", cat: "special", title: "Leather or suede drop-off",
    q: ["leather", "suede", "leather jacket", "reaves", "fur"],
    say: "“Leather goes to our specialist, Reaves Leather. It takes three weeks to a month, and it costs more than items we clean in store. I'll just need you to sign a release.”",
    do: [
      "Enter it in the Leather/Suede department at $0.00. Price is set after Reaves quotes it.",
      "Add brand, color, pattern, and any damage or stains. Set the due date 4 weeks out.",
      "Heat seal on a blank label attached to the garment. No red tape, ever.",
      "Fill out the Reaves form. White copy on the hanger, yellow copy on the corkboard under “Current Leather Orders.” Hang on the Z-rail.",
      "When it returns, the manager adds 20% to Reaves' price."
    ],
    src: "CSR Manual · Day 4 · Leather and Suede"
  },
  {
    id: "wedding", cat: "special", title: "Wedding dress cleaning & preservation",
    q: ["wedding dress", "bridal", "gown", "preservation", "preserve dress", "storage chest", "veil"],
    say: "“Wedding dress cleaning takes about six weeks. Would you like it preserved in a storage chest afterward?”",
    do: [
      "Use the “Wedding Dress” category, not Dresses/Skirts. Add color, brand, pattern.",
      "Add “Fancy” for beading and “Lace” for lace.",
      "Preservation: add “Storage Chest” to the invoice.",
      "Due date 6 weeks out.",
      "Never press a heat seal onto the dress or accessories. Attach it on a flyer with the Dennison gun or a safety pin.",
      "Veil, cape, etc. get their own heat seals on the same invoice (Misc. $0.00 if no category fits).",
      "Fabric dress bag: make a Look What We Found invoice, comment “dress bag,” reprint twice, put both copies in the bag's sleeve."
    ],
    stores: { plant: "Hang it by Victor's station, on the rail next to the spotting counter. Rack the dress bag in the 500 section.", target: "Rack the dress bag in the 401 section." },
    src: "CSR Manual · Day 4 · Wedding Dress"
  },
  {
    id: "enzyme", cat: "special", title: "Odor, urine or smoke smell (enzyme treatment)",
    q: ["odor", "smell", "urine", "pet", "dog", "cat", "smoke", "fire", "enzyme", "blood", "vomit", "pet accident", "dog peed"],
    say: "“We can do an enzyme treatment for that. It adds a business day and there's an extra charge, and we can't guarantee the odor will be fully gone.”",
    do: [
      "Washable items only. Adds one business day.",
      "Recommended for pet urine and fire smoke.",
      "We do not clean anything with fecal matter or blood. It contaminates the solvent.",
      "Dry-clean-only item with urine: we can't dry clean it. Unless the customer gives verbal release to wash it, reject the item."
    ],
    src: "CSR Manual · Day 2 · Enzyme Treatment"
  },
  {
    id: "washfold", cat: "special", title: "Wash & Fold",
    q: ["wash and fold", "wash & fold", "laundry service", "sheets", "towels", "socks", "fluff and fold"],
    say: "“We wash, dry and fold everything, match your socks, and it's ready the next business day by 6 PM.”",
    do: [
      "Clothes, sheets, towels, small throw blankets. Personal items go in knit bags.",
      "Can't go through Wash & Fold, even with consent: “dry clean only,” “hand wash,” or “do not tumble dry.” Those can be dry cleaned or laundered separately for an extra per-item charge."
    ],
    src: "CSR Manual · Day 2 · Wash & Fold / Day 5 · Up Selling"
  },
  {
    id: "alteration", cat: "special", title: "Taking in an alteration",
    q: ["alteration", "hem", "tailor", "taper", "take in", "let out", "inseam", "cuff", "patch", "repair"],
    do: [
      "Write a blank flag tag in black pen. Be specific: “raise dress hem 3½ inches.”",
      "Heat seal already in SPOT: scan, click the item, Item View → Alterations. Not listed? Use “Describe.”",
      "New barcode: use the alterations button on the right while entering it.",
      "Choose alter-only or alter-and-clean. Alter-only removes the cleaning price automatically.",
      "Add comments in Order View, Finish, safety-pin the tag to the garment."
    ],
    stores: { plant: "Log it in the navy “Alterations” book on the counter." },
    src: "CSR Manual · Day 3 · Alterations"
  },
  {
    id: "household", cat: "special", title: "Drapes, comforters and household items",
    q: ["drapes", "curtains", "comforter", "duvet", "bedspread", "tablecloth", "household", "rug", "window treatments"],
    say: "“Yes, we clean drapes, comforters, duvet covers, bedspreads and table linens. They take longer than our regular turnaround.”",
    gap: "The manual says household items have extended processing times and points to a “Turnaround Time Sheet,” but the sheet isn't in the binder. How many days for each item? Do we take down drapes?",
    src: "CSR Manual · Day 2 · What We Provide / Day 5"
  },

  // ───────── SERVICE RECOVERY ─────────
  {
    id: "leap", cat: "recovery", title: "Customer is upset (L.E.A.P.)",
    q: ["complaint", "upset customer", "angry", "unhappy", "mad", "yelling", "leap"],
    say: "“That must have been frustrating. I'm sorry you had this problem. Here's what I'm going to do…”",
    do: [
      "L: Listen. Don't interrupt.",
      "E: Empathize. “I know this is important to you.”",
      "A: Apologize. “We are sorry for any inconvenience.”",
      "P: Provide a solution and keep them informed.",
      "Whoever hears the complaint owns resolving it."
    ],
    src: "CSR Manual · Day 4 · Handling Complaints"
  },
  {
    id: "redo", cat: "recovery", title: "Customer wants something redone",
    q: ["redo", "do over", "stain still there", "not clean", "reclean", "wrinkled", "pressing bad", "not pressed right"],
    do: [
      "Unhappy with pressing or cleaning at pickup? Redo it free.",
      "After they've left: they have 30 days, and it must come back on the hanger in the original packaging. Worn or unbagged items can't be redone free.",
      "A stained garment gets up to 2 more attempts. Stain removal is never guaranteed.",
      "Already paid: new invoice, Item View → Adjustments → Redo. Not paid yet: open the invoice, Order View → Redo.",
      "Attach a Redo tag plus a written tag saying WHY."
    ],
    stores: { plant: "Hang it over the side of the basket.", target: "Put it in the REDO bag." },
    src: "CSR Manual · Day 2 & Day 4 · Redo"
  },
  {
    id: "buttons", cat: "recovery", title: "Broken or missing button",
    q: ["button", "broken button", "cracked button", "missing button"],
    say: "“We'll replace that button and re-clean and press the shirt for free.”",
    src: "CSR Manual · Day 4 · Guarantees"
  },
  {
    id: "lost", cat: "recovery", title: "Customer says an item is missing",
    q: ["missing item", "lost item", "lost shirt", "missing shirt", "you lost my", "can't find my", "item missing"],
    say: "“I'm sorry. Let me get some details so we can look for it. Please give us a few days and we'll call you with an update.”",
    do: [
      "Get the garment description, HSL number if they have it, and when it went missing.",
      "Confirm their contact info.",
      "Email the owner/manager with everything you have."
    ],
    src: "CSR Manual · Day 4 · Lost Items"
  },
  {
    id: "damaged-us", cat: "recovery", title: "We damaged a garment",
    q: ["we damaged", "ruined", "damaged in cleaning", "shrunk", "tailor repair", "damage hook"],
    do: [
      "Call the customer.",
      "If it can be repaired, offer to send it to our tailor.",
      "Hang it on the Damage Hook in assembly.",
      "Email the owner/manager so it goes into the Issue Tracker."
    ],
    gap: "What if it can't be repaired? The manual doesn't cover reimbursement, the fair-claims approach, or who decides.",
    src: "CSR Manual · Day 4 · Damaged Items"
  },
  {
    id: "issue", cat: "recovery", title: "Logging it in the Issue Tracker",
    q: ["issue tracker", "log an issue", "track issue", "issues tab"],
    do: [
      "“Issues” is at the bottom center of the SPOT screen. Select New.",
      "Pick a category, set priority (Low / Normal / High).",
      "Add HSL#, department, color, pattern, fabric, brand, size.",
      "Log every customer call and the time."
    ],
    src: "CSR Manual · Day 4 · Issue Tracker"
  },
  {
    id: "coupons", cat: "recovery", title: "Coupons and price changes",
    q: ["coupon", "discount", "promo", "promotion", "competitor coupon", "price match", "deal", "can you do better"],
    do: [
      "Accept coupons that aren't expired, at drop-off or pickup.",
      "Never make the customer feel like they're taking advantage of us.",
      "Only store managers or upper management can change a price or negotiate.",
      "Up-sell the current promotion."
    ],
    gap: "Day 4 asks “Do we honor competitor coupons?” The manual doesn't say.",
    src: "CSR Manual · Day 4 · Coupons & Promotions"
  },
  {
    id: "pricing", cat: "recovery", title: "“How much does it cost?”",
    q: ["price", "how much", "cost", "expensive", "price list", "why so expensive", "shirt price", "suit price"],
    say: "Share the price, and mention any current promotion.",
    gap: "There's no price list in the manual. On the call, Enrique noted price questions are a friction point (sport coat: $10.59). Should CSRs have a full list, “starting at” prices, or a short explanation of the hand labor behind the price?",
    src: "CSR Manual · Day 3 · Phone Procedures"
  },

  // ───────── SERVICES & ROUTES ─────────
  {
    id: "pnd", cat: "services", title: "Home pickup & delivery",
    q: ["pickup and delivery", "delivery", "home delivery", "route", "pick up from my house", "vip bag", "blue bag", "get on a route", "sign up for delivery"],
    say: "“We have free home pickup and delivery. A driver comes two scheduled days a week. You just leave your blue bag out.”",
    do: [
      "Refer them to the office: 972-537-5005, or Martinizing.com to sign up.",
      "Every route customer gets a blue VIP bag with a clearly written tag (name and phone). The tag links to their name in SPOT."
    ],
    tool: "routes",
    src: "CSR Manual · Day 5 · Available Services"
  },
  {
    id: "routes", cat: "services", title: "What day is my delivery?",
    q: ["what day", "route day", "which day", "delivery day", "when do you deliver", "when will it be delivered", "monday", "wednesday", "tuesday", "thursday", "friday"],
    say: "“You're on our Monday/Wednesday route. What we pick up Monday comes back Wednesday, and Wednesday's pickup comes back Monday.”",
    do: [
      "Routes run in pairs: Monday ↔ Wednesday, Tuesday ↔ Thursday.",
      "Friday is the flex day, for customers who need it before the weekend.",
      "Example from Enrique: dropped off in store Wednesday → cleaned Thursday → Friday delivery is possible if they need it; otherwise Monday."
    ],
    tool: "routes",
    gap: "The route pairs come from the 10/19 call, not a written SOP. Which neighborhoods are on which pair? How does a CSR request a Friday flex delivery?",
    src: "Enrique · Discovery call 10/19"
  },
  {
    id: "drivethru", cat: "services", title: "Drive-thru customers",
    q: ["drive thru", "drive through", "car", "carry to car"],
    do: ["Both stores have a covered drive-thru. Serve the customer from their vehicle, same standards as the counter."],
    src: "CSR Manual · Day 5 · Available Services"
  },
  {
    id: "upsell", cat: "services", title: "Up-selling without being pushy",
    q: ["upsell", "up sell", "sell more", "recommend", "big order"],
    do: [
      "Bridge from what they ordered to what you're offering.",
      "Describe the benefit (value, ease, savings).",
      "Ask."
    ],
    say: "Big order, hands full? “You could leave these out twice a week and our driver picks them up and brings them back, free. Want me to check if you're in a route area?”",
    src: "CSR Manual · Day 5 · Up Selling"
  },
  {
    id: "services-list", cat: "services", title: "What services do we offer?",
    q: ["services", "what do you clean", "do you clean", "what do you offer"],
    do: [
      "Full-service dry cleaning and laundry",
      "Same-day / next-day counter service",
      "Free home pickup & delivery",
      "Wash & Fold",
      "Wedding dress cleaning and preservation",
      "Leather, suede & fur (sent out)",
      "Drapes, curtains, household linens, comforters",
      "Alterations"
    ],
    src: "CSR Manual · Day 2 & Day 5"
  },

  // ───────── OUTAGES ─────────
  {
    id: "internet", cat: "outage", title: "Internet is down",
    q: ["internet down", "internet is down", "wifi", "no internet", "offline", "connection", "spot not loading"],
    say: "“I'm sorry, we're having an internet issue that's keeping me from pulling up orders. It should be back shortly.”",
    do: [
      "First check: are the card machine and phone working? If yes, the internet is fine and SPOT is the problem.",
      "Pickups: ask if they can come back once the internet returns.",
      "Drop-offs: write their name, item counts, today's date, and the ready date/time on printer paper. Make a copy for them.",
      "Usually back within 15 minutes. Still down after 15? Tell the owner or manager immediately."
    ],
    tool: "outage",
    src: "CSR Manual · Day 5 · Internet Down"
  },
  {
    id: "spotdown", cat: "outage", title: "SPOT is down (internet is fine)",
    q: ["spot down", "pos down", "system down", "spot frozen", "spot error", "computer down"],
    do: ["Use the paper drop-off slip from the Internet Down playbook.", "Tell the owner or manager."],
    gap: "Not in the manual. Who's the SPOT support number? Is there a store account ID to give them? Can CSRs restart anything themselves?",
    tool: "outage",
    src: "Enrique · Discovery call 10/19"
  },
  {
    id: "carddown", cat: "outage", title: "Card machine / merchant services down",
    q: ["card machine", "credit card", "card reader", "payment down", "merchant", "can't take card", "card declined everyone", "cashless"],
    do: ["Remember we're a cashless business, so there's no cash fallback.", "Tell the owner or manager."],
    gap: "Not in the manual, and Enrique flagged it on the call. What's the merchant services help desk number and merchant ID? Can a known customer take their order and pay later?",
    tool: "outage",
    src: "Enrique · Discovery call 10/19"
  },
  {
    id: "deposit", cat: "outage", title: "Opening the drawer (morning check-in)",
    q: ["open drawer", "morning deposit", "drawer checkin", "opening", "open the store", "cash drawer"],
    do: [
      "Monday–Saturday when opening: System (bottom left) → Drawer Checkin.",
      "Confirm $0.00 as the bank amount. We're cashless, so we always start at zero."
    ],
    src: "CSR Manual · Day 5 · Morning Deposit"
  },

  // ───────── PHONE & WORDS ─────────
  {
    id: "phone", cat: "phone", title: "Answering the phone",
    q: ["phone", "answer phone", "greeting", "phone greeting", "on hold", "hold", "call"],
    say: "“Thank you for calling Martinizing, this is [your name], how may I assist you?”",
    do: [
      "Repeat back their name and request.",
      "Give more than they asked: closing time plus the full week's hours. Price plus the current promotion.",
      "Customer in the store? Ask the caller if you can place them on hold. Red Hold button, hang up, press Line 1 to resume.",
      "Close with: “If you need anything, just ask for me, my name is ___. Have a great day!”"
    ],
    src: "CSR Manual · Day 3 · Phone Procedures"
  },
  {
    id: "hours", cat: "phone", title: "Store hours",
    q: ["hours", "what time", "close", "open", "sunday", "saturday", "when do you close"],
    say: "“We're open Monday through Friday 7 AM to 7 PM, Saturday 9 AM to 3 PM, and closed Sunday.”",
    src: "CSR Manual · Day 3 · Phone Procedures"
  },
  {
    id: "hospitality", cat: "phone", title: "Language of hospitality",
    q: ["what to say", "words", "hospitality", "greeting", "goodbye", "farewell", "polite"],
    table: [
      ["Hi / Hey / Next!", "Good morning. How may I help you?"],
      ["Okay / Yeah / Alright", "Certainly / Right away / My pleasure"],
      ["I don't know", "I'll find out"],
      ["My bad", "I'm sorry for the inconvenience"],
      ["Was everything okay?", "Was everything done to your satisfaction?"],
      ["Can I…?", "May I…?"],
      ["Bye / See ya", "Thank you for coming in. Have a wonderful day."]
    ],
    tableHead: ["Instead of", "Say"],
    src: "CSR Manual · Day 5 · Language of Hospitality"
  },
  {
    id: "firstfour", cat: "phone", title: "The First Four & S.M.I.L.E.",
    q: ["first four", "smile", "greet", "customer service basics", "eye contact"],
    do: [
      "Eye contact first.",
      "A real smile.",
      "Enthusiastic tone. Thank them for choosing us.",
      "Stay connected. Use their name, make small talk while you work.",
      "S.M.I.L.E.: Smile & greet · Make eye contact · Interaction is genuine · Look & listen · Exceed expectations."
    ],
    src: "CSR Manual · Day 2"
  },

  // ───────── TEAM POLICIES ─────────
  {
    id: "callout", cat: "team", title: "Calling out or running late",
    q: ["call out", "sick", "late", "can't come in", "absent", "miss shift", "call in"],
    do: [
      "Tell your manager at least 2 hours before your shift. Manager unavailable? Contact another member of management.",
      "Say how long you'll be out and when you'll be back.",
      "Two or more days without notice is treated as a voluntary resignation."
    ],
    src: "Employee Handbook · 3.8 Attendance"
  },
  {
    id: "clock", cat: "team", title: "Clocking in, missed punches, pay",
    q: ["clock in", "clock out", "missed punch", "forgot to clock", "time clock", "payday", "paycheck wrong", "pay"],
    do: [
      "Clock in and out in SPOT, no more than 5 minutes before you start or after you stop.",
      "Missed a punch or a break? Tell your manager right away.",
      "Pay is weekly. Payday is Friday.",
      "Paycheck looks wrong? Bring it to your manager."
    ],
    src: "Employee Handbook · 3.2–3.5 / CSR Manual · Day 1"
  },
  {
    id: "pin", cat: "team", title: "Your SPOT PIN",
    q: ["pin", "operator pin", "password", "someone knows my pin"],
    do: [
      "Your PIN is yours alone. It's also used for the security system.",
      "Using someone else's PIN can get you terminated.",
      "Think someone knows yours? Tell your manager and it gets changed."
    ],
    src: "CSR Manual · Day 1 · SPOT Operator PIN"
  },
  {
    id: "cell", cat: "team", title: "Cell phones on shift",
    q: ["cell phone", "my phone", "texting", "phone policy"],
    do: [
      "Silent and off the counter. Not on vibrate.",
      "Ask to step away if you need to text or call.",
      "Exception: text a photo to management when it'll prevent a miscommunication."
    ],
    src: "CSR Manual · Day 1 & Day 3 / Handbook · 6.2"
  },
  {
    id: "dress", cat: "team", title: "Dress code",
    q: ["dress code", "uniform", "what to wear", "shoes", "piercing", "jewelry"],
    do: [
      "Martinizing polo or t-shirt (provided; it stays at work and we clean it).",
      "Pants hemmed, no holes, stains or messages. Closed-toe, closed-heel shoes.",
      "Facial piercings: only earlobes and a small side-nostril stud.",
      "Fragrance in moderation."
    ],
    src: "CSR Manual · Day 1 / Handbook · 6.1"
  },
  {
    id: "injury", cat: "team", title: "Someone got hurt / safety issue",
    q: ["injury", "hurt", "accident", "safety", "chemical spill", "unsafe"],
    do: [
      "Tell your manager immediately, no matter how minor.",
      "Fill out an injury/accident report.",
      "Chemical spill, fire or evacuation: follow the posted instructions."
    ],
    src: "Employee Handbook · 7.1–7.3"
  },
  {
    id: "media", cat: "team", title: "Reporter, lawyer or police asks questions",
    q: ["reporter", "media", "news", "lawyer", "police", "subpoena", "inquiry"],
    say: "Don't answer on the company's behalf. Refer them to the owner.",
    src: "Employee Handbook · 6.6"
  },
  {
    id: "harass", cat: "team", title: "Reporting harassment or a workplace problem",
    q: ["harassment", "discrimination", "complaint about coworker", "problem with manager", "report"],
    do: [
      "Harassment, discrimination or retaliation: go to the owner or any member of management.",
      "Other workplace problems: your manager first, then the owner.",
      "Retaliation for reporting is prohibited."
    ],
    src: "Employee Handbook · 4.2 / 5.3"
  }
];

// Training checks, pulled from the end-of-day assessments in the CSR manual.
window.TRAINING = [
  { day: 1, q: "When taking a drop-off, who counts the pieces?", a: "You do. Never ask the customer.", ref: "count" },
  { day: 1, q: "What is a Quick Receipt for?", a: "It ties the clothes to the right customer, gives them a copy, and reminds them when to pick up.", ref: "qr" },
  { day: 1, q: "Do we use bleach?", a: "No. Non-chlorine whitener only, for laundered dress shirts on request.", ref: "bleach" },
  { day: 1, q: "Why keep your PIN confidential?", a: "It's tied to you and the security system. Using someone else's can mean termination.", ref: "pin" },
  { day: 2, q: "No care label. How do you clean it?", a: "Generally dry clean. Ask a teammate or manager if unsure.", ref: "carelabel" },
  { day: 2, q: "Where does red pre-spot tape go, and what never gets it?", a: "Next to the stain, not on it. Never on leather or suede.", ref: "prespot" },
  { day: 2, q: "Silk dress: dry clean or launder?", a: "Dry clean. Silk, linen, rayon and wool are dry clean only.", ref: "fabrics" },
  { day: 2, q: "Heat seal placement on pants?", a: "Back left pocket lining, below the waistband. Waistband if there are no pockets.", ref: "hsl" },
  { day: 3, q: "What must show next to every invoice before you take payment?", a: "“Pick Up” in green.", ref: "pickup" },
  { day: 3, q: "What's the phone greeting?", a: "“Thank you for calling Martinizing, this is [name], how may I assist you?”", ref: "phone" },
  { day: 3, q: "Do we automatically crease sleeves?", a: "No. Only with a white “Crease Sleeves” tag.", ref: "flagtags" },
  { day: 4, q: "What are the four steps of L.E.A.P.?", a: "Listen, Empathize, Apologize, Provide a solution.", ref: "leap" },
  { day: 4, q: "How long do leather and wedding dresses take?", a: "Leather: 3 weeks to a month (due date 4 weeks). Wedding dress: 6 weeks.", ref: "leather" },
  { day: 4, q: "What does the Redo button do to the price?", a: "Zeroes it out.", ref: "redo" },
  { day: 4, q: "Who can change a price?", a: "Only store managers or upper management.", ref: "coupons" },
  { day: 5, q: "Dropped off Monday at 11 AM. When is it ready?", a: "Tuesday after 6 PM.", ref: "promise" },
  { day: 5, q: "“Can you get this stain out?”", a: "“We can't guarantee removal of stains, but if anyone can do it, we can.”", ref: "stain" },
  { day: 5, q: "Internet seems down. What's the first check?", a: "Are the card machine and phone working? If so, it's SPOT, not the internet.", ref: "internet" },
  { day: 5, q: "Customer needs it sooner than the promise time. What do you do?", a: "The manual doesn't say yet. It's on Enrique's list.", ref: "sooner" }
];

window.SUGGESTIONS = [
  "Customer wants to get on a delivery route",
  "The internet is down",
  "Can you get this stain out?",
  "Leather jacket drop-off",
  "Customer says a shirt is missing",
  "Card machine isn't working",
  "Dog peed on a comforter"
];
