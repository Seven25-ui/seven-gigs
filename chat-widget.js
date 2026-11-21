// Seven AI draggable chat widget for sevengigs.online
// Add to every public page (not admin):  <script src="/chat-widget.js" defer></script>
(function () {
  var WORKER_URL = "https://sevengigs-ai.guardianagene6.workers.dev";

  if (document.getElementById("sg-chat-root")) return;

  var css = [
    "#sg-chat-root{--ink:#0f1a2e;--yellow:#fcc72b;--blue:#2b5fd9;--paper:#fafafd;--muted:#5b6578;font-family:inherit;color:var(--ink)}",
    "#sg-launch{position:fixed;right:18px;bottom:18px;height:50px;padding:0 18px;border:2px solid var(--ink);background:var(--yellow);color:var(--ink);font:inherit;font-weight:800;font-size:15px;cursor:pointer;z-index:99998;box-shadow:4px 4px 0 var(--ink)}",
    "#sg-launch:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 var(--ink)}",
    "#sg-launch:focus-visible,#sg-send:focus-visible,#sg-close:focus-visible,#sg-input:focus-visible{outline:3px solid var(--blue);outline-offset:2px}",
    "#sg-panel{position:fixed;right:18px;bottom:82px;width:350px;max-width:calc(100vw - 24px);height:480px;max-height:calc(100vh - 110px);background:var(--paper);border:2px solid var(--ink);display:none;flex-direction:column;overflow:hidden;z-index:99999;box-shadow:6px 6px 0 var(--ink)}",
    "#sg-panel.open{display:flex}",
    "#sg-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;background:var(--yellow);border-bottom:2px solid var(--ink);cursor:grab;touch-action:none;user-select:none}",
    "#sg-head.drag{cursor:grabbing}",
    "#sg-title{font-weight:800;font-size:16px;line-height:1.2}",
    "#sg-sub{font-size:12px;line-height:1.3}",
    "#sg-close{background:var(--paper);border:2px solid var(--ink);color:var(--ink);font:inherit;font-weight:800;font-size:16px;line-height:1;width:30px;height:30px;cursor:pointer;flex:none}",
    "#sg-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}",
    ".sg-msg{max-width:86%;padding:8px 11px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;border:2px solid var(--ink)}",
    ".sg-bot{align-self:flex-start;background:#fff}",
    ".sg-user{align-self:flex-end;background:var(--ink);color:#fff}",
    "#sg-form{display:flex;gap:8px;padding:10px;border-top:2px solid var(--ink);background:#fff}",
    "#sg-input{flex:1;min-width:0;padding:9px 10px;border:2px solid var(--ink);background:#fff;color:var(--ink);font:inherit;font-size:14px;border-radius:0}",
    "#sg-send{padding:0 16px;border:2px solid var(--ink);background:var(--blue);color:#fff;font:inherit;font-weight:800;font-size:14px;cursor:pointer;border-radius:0}",
    "#sg-send:disabled{opacity:.5;cursor:default}"
  ].join("\n");

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "sg-chat-root";
  root.innerHTML =
    '<button id="sg-launch" aria-label="Open Seven AI chat">Ask AI</button>' +
    '<div id="sg-panel" role="dialog" aria-label="Seven AI chat">' +
    '<div id="sg-head"><div><div id="sg-title">Seven AI</div><div id="sg-sub">Freelancing, Upwork and AI tools</div></div>' +
    '<button id="sg-close" aria-label="Close chat">\u00D7</button></div>' +
    '<div id="sg-log" aria-live="polite"></div>' +
    '<div id="sg-form"><input id="sg-input" type="text" maxlength="600" placeholder="Type your question" autocomplete="off">' +
    '<button id="sg-send">Send</button></div></div>';
  document.body.appendChild(root);

  var launch = document.getElementById("sg-launch");
  var panel = document.getElementById("sg-panel");
  var head = document.getElementById("sg-head");
  var closeBtn = document.getElementById("sg-close");
  var log = document.getElementById("sg-log");
  var input = document.getElementById("sg-input");
  var send = document.getElementById("sg-send");

  var history = [];
  try {
    history = JSON.parse(sessionStorage.getItem("sg-history") || "[]");
  } catch (e) {}

  function save() {
    try {
      sessionStorage.setItem("sg-history", JSON.stringify(history.slice(-20)));
    } catch (e) {}
  }

  function add(role, text) {
    var d = document.createElement("div");
    d.className = "sg-msg " + (role === "user" ? "sg-user" : "sg-bot");
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  if (history.length) {
    history.forEach(function (m) { add(m.role, m.content); });
  } else {
    add("assistant", "Hi, I'm Seven AI. Ask me about freelancing, Upwork, AI tools or the store.");
  }

  function toggle(open) {
    panel.classList.toggle("open", open);
    if (open) { input.focus(); log.scrollTop = log.scrollHeight; }
  }
  launch.addEventListener("click", function () { toggle(!panel.classList.contains("open")); });
  closeBtn.addEventListener("click", function () { toggle(false); });

  // Dragging (mouse + touch via pointer events)
  var drag = null;
  head.addEventListener("pointerdown", function (e) {
    if (e.target === closeBtn) return;
    var r = panel.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    head.classList.add("drag");
    head.setPointerCapture(e.pointerId);
  });
  head.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var w = panel.offsetWidth, h = panel.offsetHeight;
    var x = Math.min(Math.max(0, e.clientX - drag.dx), window.innerWidth - w);
    var y = Math.min(Math.max(0, e.clientY - drag.dy), window.innerHeight - h);
    panel.style.left = x + "px";
    panel.style.top = y + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  });
  function endDrag() { drag = null; head.classList.remove("drag"); }
  head.addEventListener("pointerup", endDrag);
  head.addEventListener("pointercancel", endDrag);

  var busy = false;
  async function ask() {
    var text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    send.disabled = true;
    input.value = "";
    add("user", text);
    history.push({ role: "user", content: text });
    var wait = add("assistant", "...");
    try {
      var res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10) })
      });
      var data = await res.json();
      var reply = data.reply || "Sorry, something went wrong. Please try again.";
      wait.textContent = reply;
      history.push({ role: "assistant", content: reply });
    } catch (e) {
      wait.textContent = "Can't reach the chat right now. Please try again.";
      history.pop();
    }
    save();
    busy = false;
    send.disabled = false;
    log.scrollTop = log.scrollHeight;
    input.focus();
  }
  send.addEventListener("click", ask);
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") ask(); });
})();
