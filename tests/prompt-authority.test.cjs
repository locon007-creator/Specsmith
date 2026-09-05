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

const timesheetPlan = {
  name: 'Timesheet',
  idea: 'Build a premium personal timesheet for one worker. Main flow: Home → Punch In → Active Shift → Punch Out → Saved Day.',
  purpose: 'log working hours accurately with minimal effort',
  user: 'one worker',
  workflow: 'Home → Punch In → Active Shift → Punch Out → Saved Day',
  screens: [
    ['Today', "today's date, shift status, live elapsed timer, today’s hours, and one dominant Punch action"],
    ['Weekly', 'Sunday–Friday daily hours, total hours, gross, deductions, and estimated net pay'],
    ['History', 'saved day records'],
    ['Monthly Calendar', 'worked days and holidays'],
    ['Settings', 'hourly rate, deductions, holidays, time format, workweek, and theme']
  ],
  features: ['Punch In and Punch Out', 'Weekly pay estimates'],
  logic: ['Persist active shift from a timestamp', 'Compute totals from saved records'],
  persistence: 'Active shift and saved records in localStorage'
};

test('sections render in canonical authority order', () => {
  const text = authority.renderCanonicalPrompt(timesheetPlan, { role: authority.resolveRole(timesheetPlan.idea) });
  const headings = ['Role:', 'Product Mission / Objective:', 'Idea Lock:', 'Design & UX Standard:', 'Target User:', 'Primary Workflow:', 'Screen Architecture:', 'Screen-by-Screen Composition:', 'Product Behavior & Calculations:', 'Interaction & State Rules:', 'Scope Lock / Forbidden Behavior:', 'Implementation / Tool Guidance:', 'Verification + Done When:'];
  headings.slice(1).forEach((heading, i) => assert.ok(text.indexOf(headings[i]) < text.indexOf(heading)));
});

test('settings is secondary and domain screen content survives', () => {
  const architecture = authority.classifyScreens(timesheetPlan.screens);
  assert.deepEqual(architecture.settings.map(x => x[0]), ['Settings']);
  const text = authority.renderCanonicalPrompt(timesheetPlan, { role: authority.resolveRole(timesheetPlan.idea) });
  assert.match(text, /Settings\/configuration: secondary/i);
  assert.match(text, /Today.*live elapsed timer/i);
  assert.match(text, /Weekly.*gross.*deductions.*net pay/i);
});

test('premium first-screen gate is automatic', () => {
  const text = authority.renderCanonicalPrompt(timesheetPlan, { role: authority.resolveRole(timesheetPlan.idea) });
  assert.match(text, /functional prototype is not complete/i);
  assert.match(text, /first main screen.*finished premium product/i);
  assert.match(text, /purposeful micro-interactions/i);
  assert.match(text, /generic prototype|stack of cards/i);
});
