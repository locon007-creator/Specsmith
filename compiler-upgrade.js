/* Specsmith compiler bridge: detailed ideas are compiled from their own source content first. */
(function () {
  'use strict';
  if (!globalThis.SpecsmithPromptAuthority || typeof globalThis.SpecsmithPromptAuthority.compileIdeaPlan !== 'function') {
    throw new Error('Specsmith idea-first compiler is unavailable.');
  }

  // app.js owns the UI and domain catalog. Replace only its compiler step so
  // detailed briefs cannot inherit purpose/screens/features from a preset.
  compilePlan = function compilePlanIdeaFirst(idea, profile) {
    return globalThis.SpecsmithPromptAuthority.compileIdeaPlan(idea, profile);
  };
})();
