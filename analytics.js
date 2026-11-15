// Google Analytics 4 for Seven Gigs.
// To change the Measurement ID later, edit only the line with GA_ID below.
(function () {
  var GA_ID = "G-YWQ17LYCNY";

  // Do not count the admin page or local testing as visitors
  var path = location.pathname;
  if (/admin(\.html)?$/.test(path)) return;
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:") return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
  document.head.appendChild(s);
})();
