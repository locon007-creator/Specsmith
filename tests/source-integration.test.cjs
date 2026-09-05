const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

test('app delegates global rendering to prompt authority', () => assert.match(source, /SpecsmithPromptAuthority\.renderCanonicalPrompt/));
test('contamination fallback remains active', () => {
  assert.match(source, /contaminationReport\(plan, idea, previous/);
  assert.match(source, /compilePlan\(idea, GENERIC\)/);
});
test('compilePlan honors explicit workflow', () => assert.match(source, /SpecsmithPromptAuthority\.extractExplicitWorkflow/));
