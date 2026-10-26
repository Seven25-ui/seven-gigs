// ====== PAGBALHIN ANI (copy from Supabase: Project Settings -> API) ======
const SUPABASE_URL = "https://sshdwibenypcekgczpgc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGR3aWJlbnlwY2VrZ2N6cGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NjE2MjAsImV4cCI6MjA4NTAzNzYyMH0.URDJTCvM4a5DBfgrp3me7vlMxlP9m8uo5oxXpbP60Zg";
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

// Plain text -> safe HTML.
// Blank line = new paragraph. "## " at the start = heading.
// Text between ``` fences = code block (keeps spacing and indentation).
function renderContent(text) {
  return String(text ?? "").replace(/\r\n?/g, "\n").split("```").map((part, i) => {
    if (i % 2 === 1) {
      const code = part
        .replace(/^[ \t]*(?:python|powershell|bash|shell|js|javascript|html|css|json|text|sql)?[ \t]*\r?\n/i, "")
        .replace(/\s+$/, "");
      return "<pre><code>" + esc(code) + "</code></pre>";
    }
    return part.split(/\n{2,}/).map(block => {
      const b = block.trim();
      if (!b) return "";
      if (b.startsWith("## ")) return "<h2>" + esc(b.slice(3)) + "</h2>";
      return "<p>" + esc(b).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }).join("");
}
