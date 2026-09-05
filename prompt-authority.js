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
    const match = String(idea || '').match(/(?:main workflow|primary workflow|main flow|workflow)\s*:\s*([^\n.]+)/i);
    return match ? match[1].trim() : null;
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
    while (limited.length < MIN_LINES && i < fallback.length) {
      limited.push(fallback[i++]);
    }
    while (limited.length < MIN_LINES) {
      limited.push('- Keep this category specific to the current app idea and primary workflow.');
    }
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

  return { resolveRole, extractExplicitWorkflow, classifyScreens, renderCanonicalPrompt, compactLines };
});
