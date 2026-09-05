const test = require('node:test');
const assert = require('node:assert/strict');
const authority = require('../prompt-authority.js');

test('explicit platform wins', () => {
  assert.equal(authority.resolveRole('Build an Android mileage tracker').id, 'android');
  assert.equal(authority.resolveRole('Build an iPhone meal planner').id, 'ios');
  assert.equal(authority.resolveRole('Build a responsive web recipe app').id, 'web');
});

test('backend-heavy web product resolves full-stack', () => {
  const role = authority.resolveRole('Build a loan tracker with database sync and accounts');
  assert.equal(role.id, 'full-stack');
  assert.equal(role.buildTarget, 'web');
});

test('unspecified platform keeps web build target', () => {
  const role = authority.resolveRole('Build a personal habit tracker with streaks');
  assert.equal(role.id, 'product-ui');
  assert.equal(role.buildTarget, 'web');
});

test('explicit workflow is preserved', () => {
  assert.equal(authority.extractExplicitWorkflow('Main flow: Home → Punch In → Active Shift → Punch Out → Saved Day.'), 'Home → Punch In → Active Shift → Punch Out → Saved Day');
});
