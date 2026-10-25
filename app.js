// ====== PAGBALHIN ANI (copy from Supabase: Project Settings -> API) ======
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_KEY_HERE";
// =========================================================================

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const CATEGORIES = ["Freelancing", "AI Tools", "Tutorials"];

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Plain text -> safe HTML. Blank line = new paragraph. "## " at the start = heading.
function renderContent(text) {
  return String(text ?? "").split(/\n{2,}/).map(block => {
    const b = block.trim();
    if (!b) return "";
    if (b.startsWith("## ")) return "<h2>" + esc(b.slice(3)) + "</h2>";
    return "<p>" + esc(b).replace(/\n/g, "<br>") + "</p>";
  }).join("");
}
