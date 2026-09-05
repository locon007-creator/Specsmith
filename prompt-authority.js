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

  return { resolveRole, extractExplicitWorkflow };
});
