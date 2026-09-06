(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpecsmithPromptPurifier = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = '1.0.0';
  const SEALED = true;

  const DOMAIN_SIGNATURES = Object.freeze([
    { id: 'trucking', re: /\b(?:drop\s*&\s*hook|drop trailer|hook trailer|trailer number|truck number|unit number|starting mileage|ending mileage|saved stops?|saved routes?|route\s*&\s*equipment|equipment edit|facility search)\b/i },
    { id: 'timesheet', re: /\b(?:punch in|punch out|clock in|clock out|active shift|timesheet|hourly rate|gross pay|overtime|worked hours)\b/i },
    { id: 'prompting', re: /\b(?:prompt generator|prompt compiler|prompt station|copy prompt|arena ai|openrouter|model selector|prompt strategies)\b/i },
    { id: 'finance', re: /\b(?:available balance|remaining budget|monthly income|budget categories?|savings goals?|recurring bills?|income transaction|expense transaction|merchant\/description)\b/i },
    { id: 'loan', re: /\b(?:borrower|loan balance|payment arrangement|mark(?:ed)? paid|repayment schedule)\b/i },
    { id: 'fitness', re: /\b(?:workout|exercise log|sets and reps|rest timer|personal record)\b/i },
    { id: 'habits', re: /\b(?:habit tracker|daily habits?|streaks?|tap-to-complete|weekly target)\b/i },
    { id: 'flashcards', re: /\b(?:flashcards?|study deck|self-grade|hard\s*\/\s*good\s*\/\s*easy|mastery meter)\b/i },
    { id: 'recipes', re: /\b(?:recipe app|ingredients?|start cooking|cooking mode|meal plan)\b/i }
  ]);

  const CANONICAL_HEADINGS = new Set([
    'Role:', 'Product Mission:', 'Idea Lock:', 'Design & UX Standard:', 'Target User:',
    'Main Workflow:', 'Screen Architecture:', 'Required Product Behavior:', 'Constraints / Scope Lock:',
    'Interaction Rules:', 'Tool Guidance:', 'Allowed Actions:', 'Forbidden Actions:', 'Stop Conditions:',
    'Verification:', 'Done When:'
  ]);

  function normalize(text) {
    return String(text || '').replace(/\r\n?/g, '\n');
  }

  function activeDomains(sourceIdea) {
    const source = normalize(sourceIdea);
    const active = new Set();
    DOMAIN_SIGNATURES.forEach((sig) => {
      sig.re.lastIndex = 0;
      if (sig.re.test(source)) active.add(sig.id);
    });
    return active;
  }

  function foreignDomainForLine(line, allowedDomains) {
    for (const sig of DOMAIN_SIGNATURES) {
      sig.re.lastIndex = 0;
      if (!allowedDomains.has(sig.id) && sig.re.test(line)) return sig.id;
    }
    return null;
  }

  function isSameLevelBullet(lineA, lineB) {
    const a = String(lineA || '').match(/^(\s*)[-*•]\s+/);
    const b = String(lineB || '').match(/^(\s*)[-*•]\s+/);
    return !!(a && b && b[1].length <= a[1].length);
  }

  function removeOrphanLeadIns(lines) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (/^[-*•]\s+.+:\s*$/.test(trimmed)) {
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        const next = j < lines.length ? lines[j] : '';
        if (!next || CANONICAL_HEADINGS.has(next.trim()) || isSameLevelBullet(line, next)) continue;
      }
      out.push(line);
    }
    return out;
  }

  function removeExactDuplicates(lines) {
    const seen = new Set();
    return lines.filter((line) => {
      const trimmed = line.trim();
      if (!trimmed || CANONICAL_HEADINGS.has(trimmed)) return true;
      const key = trimmed.toLowerCase().replace(/\s+/g, ' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function compactBlankLines(lines) {
    const out = [];
    for (const line of lines) {
      if (!line.trim() && (!out.length || !out[out.length - 1].trim())) continue;
      out.push(line.replace(/[ \t]+$/g, ''));
    }
    while (out.length && !out[out.length - 1].trim()) out.pop();
    return out;
  }

  function assertClean(output, sourceIdea) {
    const allowed = activeDomains(sourceIdea);
    const leaked = [];
    normalize(output).split('\n').forEach((line) => {
      const foreign = foreignDomainForLine(line, allowed);
      if (foreign) leaked.push({ domain: foreign, line: line.trim() });
    });
    if (leaked.length) {
      throw new Error('Specsmith purifier blocked cross-domain contamination: ' + leaked.map((x) => x.domain).join(', '));
    }
    if (/^[-*•]\s+.+:\s*$/m.test(normalize(output))) {
      const lines = normalize(output).split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (!/^\s*[-*•]\s+.+:\s*$/.test(lines[i])) continue;
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j >= lines.length || CANONICAL_HEADINGS.has(lines[j].trim()) || isSameLevelBullet(lines[i], lines[j])) {
          throw new Error('Specsmith purifier blocked an orphaned requirement lead-in.');
        }
      }
    }
    return true;
  }

  function purify(output, sourceIdea) {
    const allowed = activeDomains(sourceIdea);
    let lines = normalize(output).split('\n');

    lines = lines.filter((line) => {
      if (CANONICAL_HEADINGS.has(line.trim())) return true;
      return !foreignDomainForLine(line, allowed);
    });

    lines = removeOrphanLeadIns(lines);
    lines = removeExactDuplicates(lines);
    lines = compactBlankLines(lines);

    const cleaned = lines.join('\n').trim();
    assertClean(cleaned, sourceIdea);
    return cleaned;
  }

  return Object.freeze({ VERSION, SEALED, purify, assertClean, activeDomains });
});
