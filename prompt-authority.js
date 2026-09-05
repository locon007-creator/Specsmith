(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpecsmithPromptAuthority = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
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

  const DESIGN_STANDARD = [
    'Design & UX Standard:',
    '- Treat production-ready visual hierarchy as a requirement, not decoration. Use intentional spacing, typography, density, grouping, and coherent component hierarchy.',
    '- Make one next primary action unmistakable on workflow screens. Use navigation and controls appropriate to the resolved role and build target.',
    '- Design polished empty, active, loading, completed, saved, edited, disabled, and error states only where relevant.',
    '- Use one consistent component language; avoid unrelated cards, default generated UI, and visual clutter.',
    '- Add purposeful micro-interactions and restrained animation for navigation, state changes, sheets/dialogs, button feedback, progress, and completion. Respect reduced-motion behavior when supported.',
    '- Avoid random motion, forced confetti, excessive glass, neon, gradients, or effects that slow the task.',
    '- A functional prototype is not complete. The first main screen must look like a finished premium product. If the result resembles a generic prototype, dashboard, stack of cards, default generated UI, or placeholder composition, redesign it before presenting the build.'
  ].join('\n');

  function listNames(items) {
    return items.length ? items.map((x) => x[0]).join(' · ') : 'None required by this product.';
  }

  function targetGuidance(role, fallback) {
    if (role.buildTarget === 'android') return 'Build for Android using platform-appropriate Android conventions and the simplest technically appropriate stack. Do not convert the request into a web-only implementation.';
    if (role.buildTarget === 'ios') return 'Build for iOS using platform-appropriate iOS conventions and the simplest technically appropriate stack. Do not convert the request into a web-only implementation.';
    return fallback || 'Deliver one self-contained index.html with inline HTML, CSS, and JavaScript. Use state-driven multi-screen navigation, no unnecessary frameworks or external services, mobile-first 360–430 px portrait, and no fake device frame.';
  }

  function renderCanonicalPrompt(plan, options) {
    options = options || {};
    const role = options.role || resolveRole(plan.idea, plan);
    const architecture = classifyScreens(plan.screens || []);
    const interactionRules = (options.interactionRules && options.interactionRules.length ? options.interactionRules : [
      'Every visible control performs its stated action and gives immediate feedback.',
      'Use purposeful restrained transitions for navigation and state changes; avoid decorative motion that slows the task.',
      'Preserve user-entered and active state through normal navigation where the product requires it.',
      'Use empty, loading, completed, saved, edited, disabled, and error states only where relevant.'
    ]);
    const L = [];

    L.push('Role:');
    L.push(role.label);
    L.push(role.guidance);
    L.push('');
    L.push('Product Mission / Objective:');
    L.push('Build “' + plan.name + '” to ' + plan.purpose + ' for ' + plan.user + '.');
    L.push('');
    L.push('Idea Lock:');
    L.push(plan.idea);
    L.push('Preserve the stated product, workflow, required features, exclusions, and one-job focus. Domain defaults may improve execution but must not broaden or contradict the idea.');
    L.push('');
    L.push(DESIGN_STANDARD);
    L.push('');
    L.push('Target User:');
    L.push(plan.user);
    L.push('');
    L.push('Primary Workflow:');
    L.push(plan.workflow);
    L.push('');
    L.push('Screen Architecture:');
    L.push('Primary screens: ' + listNames(architecture.primary));
    L.push('Supporting screens: ' + listNames(architecture.supporting));
    L.push('Settings/configuration: secondary — ' + listNames(architecture.settings) + ' Keep configuration subordinate to the main workflow.');
    L.push('');
    L.push('Screen-by-Screen Composition:');
    (plan.screens || []).forEach((screen, i) => {
      L.push((i + 1) + '. ' + screen[0] + ' — ' + screen[1] + '. Keep the dominant status/content and primary action visually obvious; subordinate secondary controls and configuration.');
    });
    L.push('');
    L.push('Product Behavior & Calculations:');
    (plan.features || []).forEach((x) => L.push('- ' + x));
    (plan.logic || []).forEach((x) => L.push('- ' + x));
    L.push('- Persistence: ' + plan.persistence + '.');
    L.push('- Use one source of truth for shared saved data so screens cannot disagree.');
    L.push('');
    L.push('Interaction & State Rules:');
    interactionRules.forEach((x) => L.push('- ' + x));
    L.push('');
    L.push('Scope Lock / Forbidden Behavior:');
    L.push('- Do not invent unrelated pages, fields, metrics, dashboards, services, accounts, analytics, backend, teams, or automation.');
    L.push('- Do not import features from a previous generated app.');
    L.push('- Do not let domain defaults override explicit exclusions.');
    L.push('- Do not silently switch the requested implementation platform.');
    L.push('');
    L.push('Implementation / Tool Guidance:');
    L.push(targetGuidance(role, options.defaultBuildGuidance));
    L.push('');
    L.push('Verification + Done When:');
    L.push('- The complete primary workflow works end to end.');
    L.push('- Every explicitly requested supporting screen and setting is usable.');
    L.push('- Required calculations, persistence, and state transitions are correct and consistent across views.');
    L.push('- The visual result passes the Design & UX Standard and first-screen quality gate.');
    L.push('- No unrelated features, dead controls, or placeholder interactions remain.');
    L.push('- Provide concrete test/build/tool evidence that supports completion.');
    return L.join('\n');
  }

  return { resolveRole, extractExplicitWorkflow, classifyScreens, renderCanonicalPrompt };
});
