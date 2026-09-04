/* ─────────────────────────────────────────────────────────────
   Specsmith — app logic
   Builder state, live prompt assembly, quality coach,
   template gallery, local library (localStorage), import/export.
   ───────────────────────────────────────────────────────────── */

"use strict";

/* ── Constants ──────────────────────────────────────────── */

const LS_LIBRARY = "specsmith.library.v1";
const LS_DRAFT = "specsmith.draft.v1";
const LS_THEME = "specsmith.theme.v1";

const FIELD_KEYS = ["role", "context", "task", "steps", "constraints", "format", "tone", "examples", "notes"];

const TEMPLATES = [
  {
    id: "tpl-code-review", icon: "🧑‍💻", name: "Code reviewer", desc: "Rigorous PR review with severity-ranked findings.",
    fields: {
      role: "a principal software engineer who reviews code for correctness, security, performance, and maintainability",
      context: "You are reviewing a pull request in a production codebase. The author values direct, specific feedback.",
      task: "Review the code change I provide. Identify bugs, security issues, performance problems, and style concerns. For each finding, explain why it matters and show a corrected snippet.",
      steps: "Read the change end to end before judging.\nRank findings by severity: blocker, major, minor, nit.\nEnd with the single most important fix, fully written out.",
      constraints: "Be specific — reference file and line numbers where possible.\nDo not invent APIs that don't exist.\nKeep feedback actionable and respectful.",
      format: "Markdown report with sections: Summary, Findings (grouped by severity), Suggested Patch.",
      tone: "Technical, Concise",
      examples: "", notes: ""
    }
  },
  {
    id: "tpl-blog", icon: "✍️", name: "Blog writer", desc: "Publish-ready article with structure and voice.",
    fields: {
      role: "a senior content writer known for clear, engaging, zero-fluff articles",
      context: "The article is for a company blog read by busy professionals. Skimmability matters more than length.",
      task: "Write a complete blog post on the topic I provide. Open with a hook, develop 3–5 substantive sections with concrete examples, and close with a practical takeaway.",
      steps: "Draft three candidate headlines and pick the strongest.\nOutline the sections before writing.\nWrite the article, keeping paragraphs under 4 sentences.",
      constraints: "No clichés, no filler sentences, no fake statistics.\nUse active voice.\nIf you cite a number, it must be one I supplied.",
      format: "Markdown document with an H1 title, H2 section headings, and short paragraphs.",
      tone: "Friendly, Professional",
      examples: "", notes: ""
    }
  },
  {
    id: "tpl-analyst", icon: "📊", name: "Data analyst", desc: "Turn raw numbers into decisions.",
    fields: {
      role: "a senior data analyst who translates messy data into clear business insight",
      context: "I will provide a dataset or summary statistics. The audience is non-technical leadership.",
      task: "Analyze the data I provide. Surface the three most important patterns, explain what likely drives them, and recommend the next action for each.",
      steps: "State what the data can and cannot support.\nIdentify trends, outliers, and comparisons that matter.\nRank insights by business impact.",
      constraints: "Never overstate correlation as causation.\nFlag any data-quality concerns before conclusions.\nRound numbers sensibly; no false precision.",
      format: "A tight bullet list: each insight gets one line of finding, one line of driver, one line of recommended action.",
      tone: "Professional, Concise",
      examples: "", notes: ""
    }
  },
  {
    id: "tpl-tutor", icon: "🎓", name: "Patient tutor", desc: "Adaptive teaching with checks for understanding.",
    fields: {
      role: "a patient, encouraging tutor who adapts explanations to the learner's level",
      context: "I'm learning the topic named below and may have gaps in the fundamentals.",
      task: "Teach me the topic I provide. Start from first principles, build up step by step, and check my understanding with one short question before moving on.",
      steps: "Diagnose what I already know with one question.\nExplain the core idea with an analogy.\nGive a tiny exercise, then review my answer.",
      constraints: "Never skip ahead until I've answered correctly.\nKeep each explanation under 120 words.\nIf I'm wrong, explain why gently and retry.",
      format: "Plain prose, one idea per message.",
      tone: "Friendly",
      examples: "", notes: ""
    }
  },
  {
    id: "tpl-image", icon: "🖼️", name: "Image brief", desc: "Rich prompt for image-generation models.",
    fields: {
      role: "an art director writing prompts for a state-of-the-art image generation model",
      context: "The image will be used as described below. Aspect ratio and mood matter.",
      task: "Write three distinct image-generation prompts for the subject I provide. Vary composition and lighting across the three while keeping the subject consistent.",
      steps: "Lock the subject and mood first.\nChoose a camera angle and lens feel for each variant.\nAdd lighting, palette, and render style last.",
      constraints: "Each prompt under 60 words.\nNo text or lettering in the image.\nAvoid copyrighted artist names.",
      format: "A numbered list of three prompts, each on one line.",
      tone: "Concise",
      examples: "", notes: ""
    }
  },
  {
    id: "tpl-strategy", icon: "🧭", name: "Product strategist", desc: "Sharp analysis with a recommended bet.",
    fields: {
      role: "a product strategist who has shipped software at scale and thinks in trade-offs",
      context: "I'll describe a product decision. Assume a small team, limited runway, and high standards.",
      task: "Analyze the product decision I describe. Map the realistic options, the risks of each, and recommend one path with the reasoning laid bare.",
      steps: "Restate the decision in one sentence to confirm understanding.\nLay out 2–3 options with honest downsides.\nRecommend one and name the condition that would change your mind.",
      constraints: "No generic startup advice.\nEvery claim tied to the specifics I gave.\nBe decisive — pick one option.",
      format: "Markdown document with sections: Decision, Options, Recommendation, What would change my mind.",
      tone: "Professional, Concise",
      examples: "", notes: ""
    }
  },
  {
    id: "tpl-support", icon: "💬", name: "Support agent", desc: "Calm, structured customer replies.",
    fields: {
      role: "a senior customer support specialist who stays calm, warm, and precise under pressure",
      context: "Replies go directly to customers of a software product. Trust and clarity are the brand.",
      task: "Draft a reply to the customer message I paste. Acknowledge the issue, explain the next step clearly, and give an honest timeframe or escalation path.",
      steps: "Identify the customer's actual need behind the words.\nAnswer the question first, details second.\nClose with exactly one clear next step.",
      constraints: "Never blame the customer.\nNever promise a feature or date I haven't confirmed.\nUnder 140 words.",
      format: "Plain prose email, no headings.",
      tone: "Friendly, Professional",
      examples: "", notes: ""
    }
  },
  {
    id: "tpl-ux-copy", icon: "🪄", name: "UX copywriter", desc: "Interface microcopy with variants.",
    fields: {
      role: "a UX writer who crafts interface copy that is clear, human, and brief",
      context: "The copy is for a software interface. Space is tight and users are mid-task.",
      task: "Write UI copy for the element I describe (button, empty state, error, tooltip…). Provide three variants: safest, warmest, and boldest.",
      steps: "Identify the user's goal and emotional state.\nDraft the three variants.\nRecommend one with a one-line reason.",
      constraints: "Buttons max 3 words; labels max 8 words.\nNo jargon, no exclamation marks unless celebratory.\nError copy must include the fix, not just the problem.",
      format: "Markdown: three labeled variants, then a Recommendation line.",
      tone: "Concise, Friendly",
      examples: "", notes: ""
    }
  }
];

/* ── State ──────────────────────────────────────────────── */

let library = loadLibrary();
let state = blankFields();
let currentId = null;      // id of loaded library prompt, null = unsaved
let lastSavedSnapshot = "";
let searchQuery = "";

/* ── DOM refs ───────────────────────────────────────────── */

const $ = (sel) => document.querySelector(sel);

const el = {
  name: $("#f-name"),
  fields: Object.fromEntries(FIELD_KEYS.map((k) => [k, $("#f-" + k)])),
  output: $("#output"),
  emptyHero: $("#emptyHero"),
  scoreNum: $("#scoreNum"),
  scoreWord: $("#scoreWord"),
  scoreBlurb: $("#scoreBlurb"),
  ringFg: $("#ringFg"),
  statChars: $("#statChars"),
  statWords: $("#statWords"),
  statTokens: $("#statTokens"),
  tips: $("#tips"),
  tipCount: $("#tipCount"),
  templates: $("#templates"),
  library: $("#library"),
  libCount: $("#libCount"),
  search: $("#search"),
  dirtyDot: $("#dirtyDot"),
  toast: $("#toast"),
};

/* ── Utilities ──────────────────────────────────────────── */

function uid() {
  return (crypto.randomUUID)
    ? crypto.randomUUID()
    : "p-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function blankFields() {
  const f = {};
  FIELD_KEYS.forEach((k) => (f[k] = ""));
  return f;
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function loadLibrary() {
  try {
    const raw = localStorage.getItem(LS_LIBRARY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => p && p.id && p.fields) : [];
  } catch { return []; }
}

function persistLibrary() {
  try { localStorage.setItem(LS_LIBRARY, JSON.stringify(library)); } catch { /* storage full/blocked */ }
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function fmtDate(ts) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(ts);
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/* ── Prompt assembly ────────────────────────────────────── */

function assemblePrompt(f) {
  const parts = [];
  const role = f.role.trim();
  if (role) parts.push("You are " + role.replace(/\.+$/, "") + ".");

  const section = (title, body) => {
    const v = (body || "").trim();
    if (v) parts.push("## " + title + "\n" + v);
  };

  section("Context", f.context);
  section("Task", f.task);

  const steps = (f.steps || "").trim();
  if (steps) {
    const lines = steps.split("\n").map((s) => s.trim()).filter(Boolean);
    parts.push("## Steps\n" + lines.map((s, i) => (i + 1) + ". " + s.replace(/^\d+[.)]\s*/, "")).join("\n"));
  }

  const constraints = (f.constraints || "").trim();
  if (constraints) {
    const lines = constraints.split("\n").map((s) => s.trim()).filter(Boolean);
    parts.push("## Constraints\n" + lines.map((s) => "- " + s.replace(/^[-•*]\s*/, "")).join("\n"));
  }

  section("Output Format", f.format);
  section("Tone & Style", f.tone);
  section("Examples", f.examples);
  section("Additional Notes", f.notes);

  return parts.join("\n\n");
}

/* ── Quality coach ──────────────────────────────────────── */

const RING_C = 2 * Math.PI * 20;

function analyze(f) {
  const text = assemblePrompt(f);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;

  const has = (k, min = 1) => (f[k] || "").trim().length >= min;
  const stepLines = (f.steps || "").split("\n").filter((s) => s.trim()).length;
  const vague = /\b(stuff|things|etc\.?|and so on|and more)\b/i.test(
    [f.task, f.constraints, f.context].join(" ")
  );

  let earned = 0;
  const tips = [];
  const rule = (done, title, detail, weight) => {
    tips.push({ done, title, detail });
    if (done) earned += weight;
  };

  rule(has("task", 20), "Define a clear task",
    "The task is the heart of the prompt — state the action and the outcome in at least a full sentence.", 26);
  rule(has("context", 20), "Set the scene with context",
    "Audience, product, situation: give the model the world your request lives in.", 13);
  rule(has("role", 10), "Cast a role",
    "A specific persona focuses the model's judgment, tone, and vocabulary.", 9);
  rule(has("format", 5), "Specify the output format",
    "Tell it exactly what shape the answer should take — structure, length, medium.", 13);
  rule(has("constraints", 5), "Add guardrails",
    "Constraints prevent the failure modes you already know about.", 13);
  rule(has("tone", 3), "Choose a tone",
    "Tone keeps the voice consistent across long outputs.", 7);
  rule(stepLines >= 2, "Break work into steps",
    "Two or more numbered steps measurably improves consistency on complex tasks.", 6);
  rule(has("examples", 10), "Show an example",
    "One input → output pair beats a paragraph of description.", 5);
  rule(words > 0 && words <= 800, "Keep it focused",
    "Under ~800 words. Trim anything the model doesn't need to do the job well.", 4);
  rule(!vague, "Be measurable, not vague",
    "Swap words like “stuff”, “things”, “etc.” for concrete criteria.", 4);

  const score = Math.round(earned); // weights sum to 100

  let word = "Blank", blurb = "Fill the builder to see your score.";
  if (chars > 0) {
    if (score >= 85) { word = "Excellent"; blurb = "Production-grade. Ship it."; }
    else if (score >= 65) { word = "Strong"; blurb = "A little polish and it's excellent."; }
    else if (score >= 40) { word = "Shaping up"; blurb = "Good bones — the coach has suggestions."; }
    else { word = "Early draft"; blurb = "Add the essentials on the coach tab."; }
  }

  return { score, word, blurb, tips, chars, words, tokens: Math.ceil(chars / 4), empty: chars === 0 };
}

function renderCoach(a) {
  el.scoreNum.textContent = a.empty ? "–" : a.score;
  el.scoreWord.textContent = a.word;
  el.scoreBlurb.textContent = a.blurb;

  el.ringFg.classList.remove("s-ok", "s-mid", "s-bad");
  if (!a.empty) el.ringFg.classList.add(a.score >= 70 ? "s-ok" : a.score >= 40 ? "s-mid" : "s-bad");
  el.ringFg.style.strokeDashoffset = String(RING_C * (1 - (a.empty ? 0 : a.score) / 100));

  el.statChars.textContent = a.chars.toLocaleString();
  el.statWords.textContent = a.words.toLocaleString();
  el.statTokens.textContent = "~" + a.tokens.toLocaleString();

  const open = a.tips.filter((t) => !t.done).length;
  el.tipCount.textContent = open;

  el.tips.innerHTML = "";
  a.tips.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "tip " + (t.done ? "done" : "todo");
    li.style.animationDelay = (i * 22) + "ms";
    li.innerHTML =
      '<div class="tip-ic">' + (t.done ? "✓" : "!") + "</div>" +
      "<div><b>" + t.title + "</b><span>" + t.detail + "</span></div>";
    el.tips.appendChild(li);
  });
}

/* ── Rendering ──────────────────────────────────────────── */

function renderPreview() {
  const text = assemblePrompt(state);
  const a = analyze(state);

  if (a.empty) {
    el.emptyHero.hidden = false;
    el.output.hidden = true;
    el.output.textContent = "";
  } else {
    el.emptyHero.hidden = true;
    el.output.hidden = false;
    el.output.textContent = text;
  }
  renderCoach(a);
}

function renderTemplates() {
  el.templates.innerHTML = "";
  TEMPLATES.forEach((tpl) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tpl-card";
    b.innerHTML =
      '<span class="tpl-icon">' + tpl.icon + "</span>" +
      '<span class="tpl-name">' + tpl.name + "</span>" +
      '<span class="tpl-desc">' + tpl.desc + "</span>";
    b.addEventListener("click", () => {
      if (!confirmDiscard()) return;
      applyFields(clone(tpl.fields));
      currentId = null;
      el.name.value = tpl.name;
      markSavedSnapshot();
      renderAll();
      toast("Template loaded — make it yours");
    });
    el.templates.appendChild(b);
  });
}

function renderLibrary() {
  const q = searchQuery.toLowerCase();
  const items = library
    .filter((p) => {
      if (!q) return true;
      const hay = (p.name + " " + (p.fields.task || "") + " " + (p.fields.role || "")).toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  el.libCount.textContent = library.length;
  el.library.innerHTML = "";

  if (!items.length) {
    const div = document.createElement("div");
    div.className = "lib-empty";
    div.innerHTML = q
      ? "No matches for “" + escapeAttr(searchQuery) + "”."
      : "Nothing saved yet.<br>Build something great, then hit <b>Save</b>.";
    el.library.appendChild(div);
    return;
  }

  items.forEach((p, i) => {
    const item = document.createElement("div");
    item.className = "lib-item" + (p.id === currentId ? " active" : "");
    item.style.animationDelay = (i * 24) + "ms";
    item.innerHTML =
      '<div class="lib-name">' + escapeAttr(p.name || "Untitled") + "</div>" +
      '<div class="lib-snip">' + escapeAttr((p.fields.task || "").slice(0, 140) || "No task set") + "</div>" +
      '<div class="lib-meta">Edited ' + fmtDate(p.updatedAt) + "</div>" +
      '<div class="lib-actions">' +
        '<button type="button" class="dup" title="Duplicate" aria-label="Duplicate">' +
          '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 14.5H4.5A2.5 2.5 0 0 1 2 12V4.5A2.5 2.5 0 0 1 4.5 2H12a2.5 2.5 0 0 1 2.5 2.5V5"/></svg>' +
        "</button>" +
        '<button type="button" class="del" title="Delete" aria-label="Delete">' +
          '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>' +
        "</button>" +
      "</div>";

    item.addEventListener("click", () => {
      if (p.id === currentId) return;
      if (!confirmDiscard()) return;
      loadPrompt(p);
    });
    item.querySelector(".dup").addEventListener("click", (e) => {
      e.stopPropagation();
      duplicatePrompt(p);
    });
    item.querySelector(".del").addEventListener("click", (e) => {
      e.stopPropagation();
      deletePrompt(p.id);
    });
    el.library.appendChild(item);
  });
}

function renderDirty() {
  const snapshot = JSON.stringify({ name: el.name.value, fields: state });
  el.dirtyDot.hidden = snapshot === lastSavedSnapshot;
}

function markSavedSnapshot() {
  lastSavedSnapshot = JSON.stringify({ name: el.name.value, fields: state });
}

function renderAll() {
  renderPreview();
  renderLibrary();
  renderDirty();
}

/* ── State transitions ──────────────────────────────────── */

function applyFields(fields) {
  FIELD_KEYS.forEach((k) => {
    state[k] = fields[k] || "";
    el.fields[k].value = state[k];
  });
  syncToneChips();
}

function confirmDiscard() {
  const snapshot = JSON.stringify({ name: el.name.value, fields: state });
  if (snapshot === lastSavedSnapshot) return true;
  return confirm("You have unsaved changes. Discard them?");
}

function loadPrompt(p) {
  currentId = p.id;
  el.name.value = p.name || "";
  applyFields(clone(p.fields));
  markSavedSnapshot();
  renderAll();
}

function saveCurrent() {
  const name = el.name.value.trim() || "Untitled prompt";
  const now = Date.now();
  if (currentId) {
    const p = library.find((x) => x.id === currentId);
    if (p) {
      p.name = name;
      p.fields = clone(state);
      p.updatedAt = now;
    } else {
      currentId = uid();
      library.push({ id: currentId, name, fields: clone(state), createdAt: now, updatedAt: now });
    }
  } else {
    currentId = uid();
    library.push({ id: currentId, name, fields: clone(state), createdAt: now, updatedAt: now });
  }
  persistLibrary();
  markSavedSnapshot();
  renderAll();
  toast("Saved to library");
}

function duplicatePrompt(p) {
  const now = Date.now();
  const copy = { id: uid(), name: (p.name || "Untitled") + " copy", fields: clone(p.fields), createdAt: now, updatedAt: now };
  library.push(copy);
  persistLibrary();
  renderLibrary();
  toast("Duplicated");
}

function deletePrompt(id) {
  const p = library.find((x) => x.id === id);
  if (!p) return;
  if (!confirm("Delete “" + (p.name || "Untitled") + "” from your library?")) return;
  library = library.filter((x) => x.id !== id);
  persistLibrary();
  if (currentId === id) {
    currentId = null;
    markSavedSnapshot();
  }
  renderAll();
  toast("Deleted");
}

function newPrompt() {
  if (!confirmDiscard()) return;
  currentId = null;
  el.name.value = "";
  applyFields(blankFields());
  markSavedSnapshot();
  renderAll();
  el.fields.task.focus();
}

/* ── Copy / export / import ─────────────────────────────── */

async function copyPrompt() {
  const text = assemblePrompt(state);
  if (!text) { toast("Nothing to copy yet"); return; }
  try {
    await navigator.clipboard.writeText(text);
    toast("Prompt copied to clipboard");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Prompt copied to clipboard"); }
    catch { toast("Copy failed — select the preview text instead"); }
    ta.remove();
  }
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function slug(name) {
  return (name || "prompt").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "prompt";
}

function exportLibrary() {
  const payload = { app: "Specsmith", version: 1, exportedAt: new Date().toISOString(), prompts: library };
  download("specsmith-library.json", JSON.stringify(payload, null, 2), "application/json");
  toast("Library exported");
}

function importLibrary(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const incoming = Array.isArray(data) ? data : data.prompts;
      if (!Array.isArray(incoming)) throw new Error("bad shape");
      let added = 0;
      incoming.forEach((p) => {
        if (!p || typeof p !== "object" || !p.fields) return;
        const fields = blankFields();
        FIELD_KEYS.forEach((k) => { if (typeof p.fields[k] === "string") fields[k] = p.fields[k]; });
        const now = Date.now();
        library.push({
          id: uid(),
          name: typeof p.name === "string" && p.name.trim() ? p.name.trim() : "Imported prompt",
          fields,
          createdAt: now,
          updatedAt: now,
        });
        added++;
      });
      persistLibrary();
      renderLibrary();
      toast(added ? "Imported " + added + " prompt" + (added === 1 ? "" : "s") : "Nothing importable found");
    } catch {
      toast("Import failed — not a valid Specsmith file");
    }
  };
  reader.readAsText(file);
}

/* ── Toast ──────────────────────────────────────────────── */

let toastTimer = null;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.hidden = false;
  requestAnimationFrame(() => el.toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.classList.remove("show");
    setTimeout(() => { el.toast.hidden = true; }, 240);
  }, 2200);
}

/* ── Theme ──────────────────────────────────────────────── */

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  try { localStorage.setItem(LS_THEME, theme); } catch { /* ignore */ }
  const meta = document.querySelector('meta[name="theme-color"]:not([media])') ||
               document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0b0f" : "#f5f5f7");
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(LS_THEME); } catch { /* ignore */ }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

/* ── Tone chips ─────────────────────────────────────────── */

function syncToneChips() {
  const current = state.tone.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  document.querySelectorAll("#toneChips button").forEach((btn) => {
    btn.classList.toggle("on", current.includes(btn.dataset.tone.toLowerCase()));
  });
}

/* ── Draft persistence ──────────────────────────────────── */

const saveDraft = debounce(() => {
  try {
    localStorage.setItem(LS_DRAFT, JSON.stringify({ name: el.name.value, fields: state, currentId }));
  } catch { /* ignore */ }
}, 300);

function restoreDraft() {
  try {
    const raw = localStorage.getItem(LS_DRAFT);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!d || !d.fields) return false;
    el.name.value = d.name || "";
    applyFields(d.fields);
    currentId = d.currentId && library.some((p) => p.id === d.currentId) ? d.currentId : null;
    return true;
  } catch { return false; }
}

/* ── Wiring ─────────────────────────────────────────────── */

function wire() {
  // Field inputs → state → preview
  FIELD_KEYS.forEach((k) => {
    el.fields[k].addEventListener("input", () => {
      state[k] = el.fields[k].value;
      if (k === "tone") syncToneChips();
      renderPreview();
      renderDirty();
      saveDraft();
    });
  });
  el.name.addEventListener("input", () => { renderDirty(); saveDraft(); });

  // Format quick-chips
  document.querySelectorAll("#formatChips button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.format = btn.dataset.format;
      el.fields.format.value = state.format;
      renderPreview(); renderDirty(); saveDraft();
    });
  });

  // Tone chips (toggle in/out of the text field)
  document.querySelectorAll("#toneChips button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tone = btn.dataset.tone;
      const list = state.tone.split(",").map((s) => s.trim()).filter(Boolean);
      const idx = list.findIndex((s) => s.toLowerCase() === tone.toLowerCase());
      if (idx >= 0) list.splice(idx, 1); else list.push(tone);
      state.tone = list.join(", ");
      el.fields.tone.value = state.tone;
      syncToneChips();
      renderPreview(); renderDirty(); saveDraft();
    });
  });

  // Actions
  $("#newPrompt").addEventListener("click", newPrompt);
  $("#saveBtn").addEventListener("click", saveCurrent);
  $("#dupeBtn").addEventListener("click", () => {
    const snapshot = { id: currentId, name: el.name.value.trim() || "Untitled", fields: clone(state) };
    duplicatePrompt(snapshot);
  });
  $("#deleteBtn").addEventListener("click", () => {
    if (currentId) deletePrompt(currentId);
    else toast("This prompt isn't in the library yet");
  });
  $("#copyTop").addEventListener("click", copyPrompt);

  // Search
  el.search.addEventListener("input", () => {
    searchQuery = el.search.value.trim();
    renderLibrary();
  });

  // Tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      $("#tab-preview").hidden = tab.dataset.tab !== "preview";
      $("#tab-tips").hidden = tab.dataset.tab !== "tips";
    });
  });

  // Theme toggle
  $("#themeToggle").addEventListener("click", () => {
    applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
  });

  // Export menu
  const menu = $("#exportMenu");
  const exportBtn = $("#exportBtn");
  exportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle("open");
    exportBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) {
      menu.classList.remove("open");
      exportBtn.setAttribute("aria-expanded", "false");
    }
  });
  menu.querySelector(".menu-panel").addEventListener("click", (e) => {
    const action = e.target.closest("button")?.dataset.action;
    if (!action) return;
    menu.classList.remove("open");
    if (action === "download-md") {
      const t = assemblePrompt(state);
      if (!t) return toast("Nothing to download yet");
      download(slug(el.name.value) + ".md", t, "text/markdown");
    } else if (action === "download-txt") {
      const t = assemblePrompt(state);
      if (!t) return toast("Nothing to download yet");
      download(slug(el.name.value) + ".txt", t, "text/plain");
    } else if (action === "export-library") {
      if (!library.length) return toast("Library is empty");
      exportLibrary();
    } else if (action === "import-library") {
      $("#importFile").click();
    }
  });
  $("#importFile").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importLibrary(file);
    e.target.value = "";
  });

  // Keyboard: ⌘/Ctrl+S saves
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveCurrent();
    }
  });
}

/* ── Boot ───────────────────────────────────────────────── */

initTheme();
renderTemplates();
const hadDraft = restoreDraft();
markSavedSnapshot();
wire();
renderAll();

if (!hadDraft && !library.length) {
  // First visit: leave a clean slate, preview hero guides the user.
  el.fields.task.focus();
}
