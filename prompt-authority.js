(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpecsmithPromptAuthority = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const MIN_LINES = 4;
  const MAX_LINES = 7;

  function resolveRole(idea) {
    const text = String(idea || '').toLowerCase();
    if (/\bandroid\b|\bapk\b/.test(text)) return { id:'android', label:'Senior Android Product Engineer + Mobile UI/UX Specialist', guidance:'Use Android-appropriate navigation, thumb-friendly controls, app bars, bottom sheets/dialogs, responsive portrait layouts, clear feedback, and purposeful motion.', buildTarget:'android' };
    if (/\bios\b|\biphone\b|\bipad\b/.test(text)) return { id:'ios', label:'Senior iOS Product Engineer + Mobile UI/UX Specialist', guidance:'Use iOS-appropriate hierarchy, navigation, sheets, spacing, feedback, and restrained motion without copying proprietary assets.', buildTarget:'ios' };
    if (/\bweb(?:site| app)?\b|\bbrowser\b|\bhtml\b/.test(text)) return { id:'web', label:'Senior Web Product Engineer + UI/UX Specialist', guidance:'Use responsive web behavior, accessible controls, browser-safe interaction, and coherent state-driven navigation.', buildTarget:'web' };
    if (/\bbackend\b|\bdatabase\b|\bapi\b|\bauth\b|\baccount(?:s)?\b|\bsync\b/.test(text)) return { id:'full-stack', label:'Senior Full-Stack Product Engineer', guidance:'Balance product architecture, frontend behavior, state/data correctness, persistence, and implementation constraints.', buildTarget:'web' };
    return { id:'product-ui', label:'Senior Product Engineer + UI/UX Specialist', guidance:'Prioritize product clarity, screen composition, interaction hierarchy, state design, visual coherence, and implementation quality.', buildTarget:'web' };
  }

  function extractExplicitWorkflow(idea) {
    const text = String(idea || '');
    let match = text.match(/(?:main workflow|primary workflow|main flow|workflow)\s*:\s*([^\n.]+)/i);
    if (match) return match[1].trim();
    match = text.match(/(?:main workflow|primary workflow|main flow|workflow)\s*\r?\n\s*([^\n]+(?:→[^\n]+)+)/i);
    if (match) return match[1].trim().replace(/[.\s]+$/, '');
    match = text.match(/([^\n.]+(?:→[^\n.]+){2,})/);
    return match ? match[1].trim().replace(/[.\s]+$/, '') : null;
  }

  function classifyScreens(screens) {
    const result = { primary: [], supporting: [], settings: [] };
    (screens || []).forEach((screen) => {
      const name = String(screen && screen[0] || '');
      if (/\b(settings?|preferences?|configuration)\b/i.test(name)) result.settings.push(screen);
      else if (/\b(history|calendar|reports?|saved|archive|results?|detail)\b/i.test(name)) result.supporting.push(screen);
      else result.primary.push(screen);
    });
    return result;
  }

  function listNames(items) {
    return items.length ? items.map((x) => x[0]).join(' · ') : 'None required by this product.';
  }

  function targetGuidance(role, fallback) {
    if (role.buildTarget === 'android') return 'Build for Android using platform-appropriate Android conventions and the simplest technically appropriate stack. Do not convert the request into a web-only implementation.';
    if (role.buildTarget === 'ios') return 'Build for iOS using platform-appropriate iOS conventions and the simplest technically appropriate stack. Do not convert the request into a web-only implementation.';
    return fallback || 'Deliver one self-contained index.html with inline HTML, CSS, and JavaScript. Use state-driven multi-screen navigation, no unnecessary frameworks or external services, mobile-first 360–430 px portrait, and no fake device frame.';
  }

  function compactLines(lines, fillers) {
    const clean = (lines || []).filter(Boolean).map((line) => String(line).trim()).filter(Boolean);
    const limited = clean.slice(0, MAX_LINES);
    const fallback = (fillers || []).filter(Boolean);
    let i = 0;
    while (limited.length < MIN_LINES && i < fallback.length) limited.push(fallback[i++]);
    while (limited.length < MIN_LINES) limited.push('- Keep this category specific to the current app idea and primary workflow.');
    return limited.slice(0, MAX_LINES);
  }

  function addSection(out, heading, lines, fillers) {
    out.push(heading + ':');
    compactLines(lines, fillers).forEach((line) => out.push(line));
    out.push('');
  }

  function screenLines(screens) {
    const all = (screens || []).map((screen, i) =>
      (i + 1) + '. ' + screen[0] + ' — ' + screen[1] + '. Keep its dominant content and primary action immediately obvious.'
    );
    if (all.length <= MAX_LINES) return all;
    const visible = all.slice(0, MAX_LINES - 1);
    const rest = screens.slice(MAX_LINES - 1).map((screen) => screen[0]).join(' · ');
    visible.push((MAX_LINES) + '. Remaining required screens — ' + rest + '. Preserve their app-specific content without adding filler.');
    return visible;
  }

  function behaviorLines(plan) {
    const lines = [];
    (plan.features || []).forEach((x) => lines.push('- Feature: ' + x));
    (plan.logic || []).forEach((x) => lines.push('- Logic: ' + x));
    lines.push('- Persistence: ' + plan.persistence + '.');
    lines.push('- Use one source of truth so shared saved data and calculations cannot disagree across screens.');
    return lines;
  }

  function cleanLine(line) {
    return String(line || '').replace(/^\s*[-*•]+\s*/, '').replace(/\s+/g, ' ').trim();
  }

  function isDetailedIdea(idea) {
    const text = String(idea || '');
    const headingHits = (text.match(/(?:^|\n)\s*(?:product brief|target user|main workflow|primary workflow|home|day setup|create route|work mode|settings|persistence|fields|show|menu|search behavior|end of day)\s*:?[ \t]*(?:\n|$)/gi) || []).length;
    return text.length >= 500 && (headingHits >= 2 || /→/.test(text));
  }

  function extractIdeaName(idea, fallbackName) {
    const text = String(idea || '');
    let m = text.match(/(?:build|create)\s+[“"']([^”"']{2,50})[”"']/i);
    if (m) return cleanLine(m[1]);
    m = text.match(/[“"']([^”"']{2,50})[”"']/);
    if (m) return cleanLine(m[1]);
    const first = text.split(/\r?\n/).map(cleanLine).find(Boolean);
    if (first && first.length <= 60 && !/:$/.test(first) && !/^(role|product brief|idea lock|target user|main workflow)$/i.test(first)) return first;
    return fallbackName || 'App';
  }

  function extractPurpose(idea) {
    const text = String(idea || '');
    let m = text.match(/(?:^|\n)\s*(?:its\s+)?purpose\s*(?:is|:)\s*([^\n.]+(?:\.[^\n.]*)?)/i);
    if (m) return cleanLine(m[1]).replace(/[.\s]+$/, '');
    m = text.match(/(?:product brief\s*:?[ \t]*\r?\n)([^\n]+)/i);
    if (m && !/^its purpose/i.test(cleanLine(m[1]))) return cleanLine(m[1]).replace(/[.\s]+$/, '');
    return null;
  }

  function extractTargetUser(idea) {
    const text = String(idea || '');
    let m = text.match(/(?:^|\n)\s*target user\s*:?[ \t]*\r?\n\s*([^\n]+)/i);
    if (m) return cleanLine(m[1]).replace(/[.\s]+$/, '');
    m = text.match(/(?:^|\n)\s*target user\s*:\s*([^\n]+)/i);
    if (m) return cleanLine(m[1]).replace(/[.\s]+$/, '');
    m = text.match(/\bfor\s+(one|a|an)\s+([^\n.]{3,90})/i);
    return m ? cleanLine(m[1] + ' ' + m[2]).replace(/[.\s]+$/, '') : null;
  }

  const META_HEADINGS = new Set([
    'product brief','idea lock','target user','main workflow','primary workflow','main flow','workflow','constraints','scope lock',
    'search behavior','search memory','fields','show','menu','automatically','do not show','below the address','top-left','top-right',
    'primary action','button','design & ux standard','interaction rules','implementation','verification','done when','core principle'
  ]);

  function looksLikeHeading(line) {
    const s = cleanLine(line).replace(/:$/, '').trim();
    if (!s || s.length > 42 || META_HEADINGS.has(s.toLowerCase())) return false;
    if (/^(?:[-+]|\d+[.)])/.test(s)) return false;
    if (/→|[.!?]$/.test(s)) return false;
    const words = s.split(/\s+/);
    if (words.length > 6) return false;
    return words.every((w) => /^(?:[A-Z0-9&/+]|Drop$|Hook$|of$|and$|the$|My$|Day$)/.test(w) || /^[A-Z][A-Za-z0-9&/+-]*$/.test(w));
  }

  function deriveScreens(idea) {
    const lines = String(idea || '').split(/\r?\n/);
    const screens = [];
    const seen = new Set();
    for (let i = 0; i < lines.length; i++) {
      const name = cleanLine(lines[i]).replace(/:$/, '');
      if (!looksLikeHeading(lines[i])) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      let detail = '';
      for (let j = i + 1; j < Math.min(lines.length, i + 7); j++) {
        const next = cleanLine(lines[j]);
        if (!next) continue;
        if (looksLikeHeading(lines[j])) break;
        if (/^(show|fields|menu|collect only|primary action|button|do not show):?$/i.test(next)) continue;
        detail = next.replace(/[.\s]+$/, '');
        break;
      }
      seen.add(key);
      screens.push([name, detail || 'the product-specific content and actions explicitly described for this view']);
    }
    return screens.slice(0, 12);
  }

  function deriveFeatureLines(idea) {
    const lines = String(idea || '').split(/\r?\n/);
    const out = [];
    const seen = new Set();
    for (const raw of lines) {
      if (!/^\s*[-*•+]\s+/.test(raw)) continue;
      const line = cleanLine(raw);
      if (!line || line.length < 4 || line.length > 150) continue;
      if (/^(preserve|keep the instruction|prefer simple|do not invent)/i.test(line)) continue;
      const key = line.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(line); }
      if (out.length >= 8) break;
    }
    return out;
  }

  function deriveLogicLines(idea) {
    const text = String(idea || '').replace(/\r/g, '');
    const candidates = text.split(/\n|(?<=[.!?])\s+/).map(cleanLine).filter(Boolean);
    const out = [];
    const seen = new Set();
    for (const line of candidates) {
      if (line.length < 12 || line.length > 220) continue;
      if (!/\b(when|after|if|automatically|remember|persist|never|only|becomes?|record|save|update|enable|disable|carry|move|open|change)\b/i.test(line)) continue;
      if (/^(preserve|keep the instruction|prefer simple|do not invent)/i.test(line)) continue;
      const key = line.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(line.replace(/[.\s]+$/, '')); }
      if (out.length >= 8) break;
    }
    return out;
  }

  function derivePersistence(idea) {
    const lines = String(idea || '').split(/\r?\n/).map(cleanLine).filter(Boolean);
    const explicit = lines.find((line) => /\b(localStorage|persist|persistence|refresh|reopen|remember.*locally|saved.*locally)\b/i.test(line));
    return explicit ? explicit.replace(/^persistence\s*:?\s*/i, '').replace(/[.\s]+$/, '') : 'Persist every explicitly required active and saved record locally so normal navigation, refresh, close, or reopen does not lose required state';
  }

  function compileIdeaPlan(idea, fallbackProfile) {
    const text = String(idea || '').trim();
    const profile = fallbackProfile || {};
    if (!isDetailedIdea(text)) {
      return {
        idea: text.replace(/\s+/g, ' ').trim().replace(/[.\s]+$/, '') + (text ? '.' : ''),
        profileId: profile.id || 'generic',
        name: profile.name || extractIdeaName(text, null),
        purpose: profile.purpose || 'realize the current idea as a focused single-purpose product',
        user: profile.user || extractTargetUser(text) || 'the user described in the source idea',
        workflow: extractExplicitWorkflow(text) || profile.workflow || 'open → complete the primary task → review the result',
        screens: (profile.screens || []).map((s) => [s[0], s[1]]),
        features: (profile.features || []).slice(),
        logic: (profile.logic || []).slice(),
        persistence: profile.persistence || derivePersistence(text),
      };
    }

    const screens = deriveScreens(text);
    const features = deriveFeatureLines(text);
    const logic = deriveLogicLines(text);
    return {
      idea: text.replace(/\s+/g, ' ').trim().replace(/[.\s]+$/, '') + '.',
      profileId: 'idea-first',
      name: extractIdeaName(text, null),
      purpose: extractPurpose(text) || 'realize the source idea exactly as described while keeping its primary job obvious and low-friction',
      user: extractTargetUser(text) || 'the user explicitly described in the source idea',
      workflow: extractExplicitWorkflow(text) || 'follow the explicit start-to-finish actions in the source idea in their stated order',
      screens: screens.length ? screens : [['Primary workflow', 'the explicit workflow, information, and controls described in the source idea']],
      features: features.length ? features : ['Implement every explicitly requested product feature from the source idea'],
      logic: logic.length ? logic : ['Preserve every stated state transition, prerequisite, and automatic behavior from the source idea'],
      persistence: derivePersistence(text),
    };
  }

  function renderCanonicalPrompt(plan, options) {
    options = options || {};
    const role = options.role || resolveRole(plan.idea, plan);
    const architecture = classifyScreens(plan.screens || []);
    const interactionRules = options.interactionRules && options.interactionRules.length ? options.interactionRules : [
      'Every visible control performs its stated action and gives immediate feedback.',
      'Use purposeful restrained transitions for navigation and state changes; avoid decorative motion that slows the task.',
      'Preserve user-entered and active state through normal navigation where the product requires it.',
      'Use empty, loading, completed, saved, edited, disabled, and error states only where relevant.'
    ];
    const L = [];

    addSection(L, 'Role', [
      '- Act as ' + role.label + '.',
      '- ' + role.guidance,
      '- Make product logic and usability decisions that support the current app idea only.',
      '- Prefer simple, production-ready implementation choices over unnecessary complexity.'
    ]);

    addSection(L, 'Product Mission / Objective', [
      '- Build “' + plan.name + '” to ' + plan.purpose + '.',
      '- Design specifically for ' + plan.user + '.',
      '- Keep the product centered on one clear job and one obvious next action.',
      '- Every screen and feature must directly support that mission.'
    ]);

    addSection(L, 'Idea Lock', [
      '- Source idea: ' + plan.idea,
      '- Preserve all explicitly stated workflow, features, exclusions, platform requirements, and terminology.',
      '- Domain defaults may improve execution but must not broaden or contradict the idea.',
      '- Never import behavior, fields, or screens from a previous generated app.'
    ]);

    addSection(L, 'Design & UX Standard', [
      '- Use production-ready visual hierarchy with intentional spacing, typography, density, grouping, and coherent components.',
      '- Make one next primary action unmistakable on workflow screens; keep secondary controls visually subordinate.',
      '- Add purposeful micro-interactions and restrained animation for navigation, sheets/dialogs, state changes, and feedback.',
      '- Design polished empty, active, loading, completed, saved, edited, disabled, and error states only where relevant.',
      '- Keep one consistent component language; avoid unrelated cards, visual clutter, excessive glass, neon, gradients, and gimmicks.',
      '- A functional prototype is not complete; the first main screen must look like a finished premium product.',
      '- If it resembles a generic prototype, dashboard, stack of cards, default generated UI, or placeholder composition, redesign it before presenting.'
    ]);

    addSection(L, 'Target User', [
      '- Primary user: ' + plan.user + '.',
      '- Optimize the language, controls, density, and workflow for that user instead of a generic audience.',
      '- Minimize unnecessary setup, decisions, and repeated input.',
      '- Keep advanced or administrative behavior secondary unless explicitly required.'
    ]);

    addSection(L, 'Primary Workflow', [
      '- Required flow: ' + plan.workflow + '.',
      '- Preserve this order unless the idea explicitly allows branching.',
      '- Each step should naturally expose the next required action with no dead-end screens.',
      '- Keep setup and Settings outside the main path unless they are required to complete the job.'
    ]);

    addSection(L, 'Screen Architecture', [
      '- Primary screens: ' + listNames(architecture.primary),
      '- Supporting screens: ' + listNames(architecture.supporting),
      '- Settings/configuration: secondary — ' + listNames(architecture.settings),
      '- Keep primary workflow screens dominant and supporting/configuration views subordinate.'
    ]);

    addSection(L, 'Screen-by-Screen Composition', screenLines(plan.screens || []), [
      '- Every required screen must have a clear purpose and primary action.',
      '- Preserve app-specific screen content instead of replacing it with generic layout filler.',
      '- Keep screen density appropriate for 360–430 px portrait use.',
      '- Do not create extra screens unless they are necessary to complete the stated workflow.'
    ]);

    addSection(L, 'Product Behavior & Calculations', behaviorLines(plan), [
      '- Keep calculations deterministic and derived from the saved source data.',
      '- Update dependent values immediately after user actions.',
      '- Prevent conflicting duplicate state across screens.',
      '- Preserve saved state through normal navigation and reload where required.'
    ]);

    addSection(L, 'Interaction & State Rules', interactionRules.map((x) => '- ' + x), [
      '- Disable actions only when their prerequisites are genuinely incomplete.',
      '- Keep visible status and timestamps synchronized with state changes.',
      '- Confirm destructive actions when accidental loss would matter.',
      '- Return users to the correct active state after normal navigation.'
    ]);

    addSection(L, 'Scope Lock / Forbidden Behavior', [
      '- Do not invent unrelated pages, fields, metrics, dashboards, services, accounts, analytics, backend, teams, or automation.',
      '- Do not import features from a previous generated app.',
      '- Do not let domain defaults override explicit exclusions or the stated one-job focus.',
      '- Do not silently switch the requested implementation platform.',
      '- Do not add decorative complexity that competes with the primary workflow.'
    ]);

    addSection(L, 'Implementation / Tool Guidance', [
      '- ' + targetGuidance(role, options.defaultBuildGuidance),
      '- Use the simplest stack that can fully deliver the requested workflow and polish.',
      '- Keep navigation and state behavior deterministic and easy for Arena-style agents to complete.',
      '- Avoid dependencies, APIs, services, or extra files unless the idea technically requires them.'
    ]);

    addSection(L, 'Verification + Done When', [
      '- The complete primary workflow works end to end with no dead controls.',
      '- Every explicitly requested supporting screen and setting is usable.',
      '- Required calculations, persistence, and state transitions are correct and consistent across views.',
      '- The visual result passes the Design & UX Standard and first-screen quality gate.',
      '- No unrelated features, placeholder interactions, or previous-app contamination remain.',
      '- Provide concrete test/build/tool evidence that supports completion.'
    ]);

    return L.join('\n').trim();
  }

  return { resolveRole, extractExplicitWorkflow, classifyScreens, renderCanonicalPrompt, compactLines, compileIdeaPlan, isDetailedIdea };
});
