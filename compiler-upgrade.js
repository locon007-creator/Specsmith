/* Specsmith compiler bridge: idea-first compilation + sealed final-output purification. */
(function () {
  'use strict';

  if (!globalThis.SpecsmithPromptAuthority || typeof globalThis.SpecsmithPromptAuthority.compileIdeaPlan !== 'function') {
    throw new Error('Specsmith idea-first compiler is unavailable.');
  }
  if (!globalThis.SpecsmithPromptPurifier || globalThis.SpecsmithPromptPurifier.SEALED !== true || typeof globalThis.SpecsmithPromptPurifier.purify !== 'function') {
    throw new Error('Specsmith sealed prompt purifier is unavailable. Generation is blocked.');
  }

  // app.js owns the UI and domain catalog. Replace only its compiler step so
  // detailed briefs cannot inherit purpose/screens/features from a preset.
  compilePlan = function compilePlanIdeaFirst(idea, profile) {
    return globalThis.SpecsmithPromptAuthority.compileIdeaPlan(idea, profile);
  };

  // Final mandatory boundary: every rendered prompt is purified against its
  // own source idea. This is fail-closed and cannot silently fall back.
  renderPlan = function renderPlanPurified(plan) {
    const role = globalThis.SpecsmithPromptAuthority.resolveRole(plan.idea, plan);
    const rendered = globalThis.SpecsmithPromptAuthority.renderCanonicalPrompt(plan, {
      role,
      interactionRules: typeof INTERACTION !== 'undefined' ? INTERACTION : undefined,
      defaultBuildGuidance: typeof BUILD !== 'undefined' ? BUILD : undefined,
    });
    return globalThis.SpecsmithPromptPurifier.purify(rendered, plan.idea);
  };
})();
