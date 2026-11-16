// reading.js - "Continue reading" for Seven Gigs.
// Remembers which posts a visitor has read and suggests posts they have not read yet,
// favoring the categories they read most recently.
// Everything stays in the visitor's own browser (localStorage). Nothing is sent to any server.
//
// It needs:
//   - an empty <div id="continue"></div> on the page (home page and every post page)
//   - /posts/index.json (built by scripts/build-posts.mjs)
(function () {
  var KEY = "sg_read_v1";      // localStorage key
  var MAX_HISTORY = 50;        // how many read posts to remember
  var MIN_SECONDS = 10;        // a post counts as "read" after this many seconds on the page
  var SHOW = 3;                // how many suggestions to show

  var box = document.getElementById("continue");
  var m = location.pathname.match(/\/posts\/([^\/]+?)(?:\.html)?$/);
  var current = m ? decodeURIComponent(m[1]) : null;
  if (!box && !current) return;

  function loadHistory() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(v) ? v.filter(function (s) { return typeof s === "string"; }) : [];
    } catch (e) { return []; }
  }

  function saveHistory(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_HISTORY))); } catch (e) { /* storage blocked: ignore */ }
  }

  function markRead(slug) {
    var list = loadHistory().filter(function (s) { return s !== slug; });
    list.unshift(slug);
    saveHistory(list);
  }

  // Pick unread posts, favoring categories the visitor read recently
  function suggest(all, history, currentSlug) {
    var bySlug = {};
    all.forEach(function (p) { bySlug[p.slug] = p; });

    var seen = {};
    history.forEach(function (s) { seen[s] = true; });
    if (currentSlug) seen[currentSlug] = true;

    var recent = history.filter(function (s) { return s !== currentSlug; }).slice(0, 6);
    if (currentSlug) recent.unshift(currentSlug);

    var weight = {};
    recent.forEach(function (s, i) {
      var p = bySlug[s];
      if (p) weight[p.category] = (weight[p.category] || 0) + Math.max(1, 7 - i);
    });

    var now = Date.now();
    var scored = all
      .filter(function (p) { return !seen[p.slug]; })
      .map(function (p) {
        var days = Math.max(0, (now - new Date(p.created_at).getTime()) / 86400000);
        return { post: p, score: (weight[p.category] || 0) + 2 / (1 + days / 30) };
      })
      .sort(function (a, b) {
        return b.score - a.score || new Date(b.post.created_at) - new Date(a.post.created_at);
      });

    // at most 2 from the same category, so the list is not one-sided
    var picked = [], perCat = {};
    scored.forEach(function (x) {
      if (picked.length >= SHOW) return;
      var c = x.post.category;
      if ((perCat[c] || 0) >= 2) return;
      perCat[c] = (perCat[c] || 0) + 1;
      picked.push(x.post);
    });
    scored.forEach(function (x) {
      if (picked.length < SHOW && picked.indexOf(x.post) === -1) picked.push(x.post);
    });
    return picked;
  }

  function addStyles() {
    var css =
      ".cr{margin:2rem 0;padding:1.1rem 1.25rem;border:2px solid var(--ink,#0f1b2d);background:var(--paper,#fff);color:inherit}" +
      ".cr h2{margin:0 0 .6rem;font-size:1.15rem;letter-spacing:-.01em}" +
      ".cr-last{margin:0 0 .75rem;font-size:.95rem}" +
      ".cr-last a{color:var(--blue,#2b59ff)}" +
      ".cr-item{display:flex;gap:.75rem;align-items:baseline;padding:.55rem 0;border-top:1px solid var(--line,#ddd);text-decoration:none;color:inherit}" +
      ".cr-item:hover .cr-title{text-decoration:underline}" +
      ".cr-tag{flex:0 0 auto;font-size:.75rem;font-weight:700;padding:0 .4rem;border:2px solid var(--ink,#0f1b2d);background:var(--sun,#ffd43b);color:var(--ink,#0f1b2d)}" +
      ".cr-title{font-weight:600}";
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  }

  function render(items, lastPost) {
    box.textContent = "";
    if (!items.length) return;
    addStyles();

    var wrap = document.createElement("section");
    wrap.className = "cr";
    wrap.setAttribute("aria-label", "Continue reading");

    var h = document.createElement("h2");
    h.textContent = "Continue reading";
    wrap.appendChild(h);

    if (lastPost) {
      var p = document.createElement("p");
      p.className = "cr-last";
      p.appendChild(document.createTextNode("You last read: "));
      var a0 = document.createElement("a");
      a0.href = "/posts/" + encodeURIComponent(lastPost.slug) + ".html";
      a0.textContent = lastPost.title;
      p.appendChild(a0);
      wrap.appendChild(p);
    }

    items.forEach(function (post) {
      var a = document.createElement("a");
      a.className = "cr-item";
      a.href = "/posts/" + encodeURIComponent(post.slug) + ".html";
      var tag = document.createElement("span");
      tag.className = "cr-tag";
      tag.textContent = post.category;
      var title = document.createElement("span");
      title.className = "cr-title";
      title.textContent = post.title;
      a.appendChild(tag);
      a.appendChild(title);
      wrap.appendChild(a);
    });

    box.appendChild(wrap);
  }

  fetch("/posts/index.json")
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (all) {
      if (!Array.isArray(all) || !all.length) return;
      var history = loadHistory();

      if (box) {
        if (current) {
          // on a post page: suggest what to read next
          render(suggest(all, history, current), null);
        } else if (history.length) {
          // on the home page: only show if the visitor has read something before
          var bySlug = {};
          all.forEach(function (p) { bySlug[p.slug] = p; });
          var last = null;
          for (var i = 0; i < history.length; i++) { if (bySlug[history[i]]) { last = bySlug[history[i]]; break; } }
          render(suggest(all, history, null), last);
        }
      }

      if (current) {
        setTimeout(function () { markRead(current); }, MIN_SECONDS * 1000);
      }
    })
    .catch(function () { /* no index yet: the feature stays hidden */ });
})();
