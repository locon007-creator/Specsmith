# SpecSmith Global Prompt Authority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every SpecSmith app prompt use the approved authority hierarchy with automatic role resolution, automatic premium UI/UX rules, screen architecture, and screen-by-screen composition without weakening domain logic or contamination protection.

**Architecture:** Preserve `idea → domain match → fresh plan → contamination check → render`. Add one dependency-free `prompt-authority.js` helper that works in both browser and Node and owns role resolution, explicit workflow extraction, screen classification, design contract text, and canonical rendering. `app.js` keeps domain profiles, compilation, contamination fallback, persistence, history, and UI.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, browser `localStorage`, Node built-in `node:test`/`assert`, GitHub Actions, Vercel static hosting. No npm dependencies or framework.

**Spec:** `docs/superpowers/specs/2026-09-05-global-prompt-authority-design.md`

## Global Constraints
- Canonical order: Role → Product Mission / Objective → Idea Lock → Design & UX Standard → Target User → Primary Workflow → Screen Architecture → Screen-by-Screen Composition → Product Behavior & Calculations → Interaction & State Rules → Scope Lock / Forbidden Behavior → Implementation / Tool Guidance → Verification + Done When.
- Explicit Android/iOS/web/native intent wins over inference.
- Role framing must not change product purpose, workflow, requested features, exclusions, or requested build target.
- Unspecified platform keeps SpecSmith’s default self-contained Arena-friendly web target.
- Premium UI/UX and purposeful motion are automatic requirements.
- No frameworks, dependencies, AI APIs, external services, accounts, analytics, or parallel compiler.
- Preserve contamination detection and clean generic fallback.
- Default web output remains mobile-first 360–430 px portrait with no fake device frame.

## Execution Setup — run before Task 1
- [ ] Create branch `feature/global-prompt-authority` from current `main`.
- [ ] Confirm the approved spec and this v2 plan are present on the branch.
- [ ] Do all production/test work on this branch until PR merge.

---

### Task 1: Automatic Role Resolver + Explicit Workflow

**Files:**
- Create: `prompt-authority.js`
- Create: `tests/prompt-authority.test.cjs`
- Modify: `index.html`

**Interfaces:**
- `resolveRole(idea, plan?) -> { id, label, guidance, buildTarget }`
- `extractExplicitWorkflow(idea) -> string | null`
- Browser: `globalThis.SpecsmithPromptAuthority`
- Node: `module.exports`

- [ ] **Step 1: Write failing tests**

```js
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
```

- [ ] **Step 2: Verify RED**

Run `node --test tests/prompt-authority.test.cjs`.
Expected: FAIL because `prompt-authority.js` does not exist.

- [ ] **Step 3: Implement the pure helper**

Use this wrapper and behavior:

```js
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
```

- [ ] **Step 4: Load helper before app**

At the end of `index.html`:

```html
<script src="prompt-authority.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 5: Verify GREEN**
Run `node --test tests/prompt-authority.test.cjs`.
Expected: all tests PASS.

- [ ] **Step 6: Commit**
Commit message: `feat: add automatic SpecSmith prompt role authority`.

---

### Task 2: Canonical Renderer + Screen Architecture

**Files:**
- Modify: `prompt-authority.js`
- Modify: `tests/prompt-authority.test.cjs`

**Interfaces:**
- `classifyScreens(screens) -> { primary, supporting, settings }`
- `renderCanonicalPrompt(plan, { role, interactionRules, defaultBuildGuidance }) -> string`

- [ ] **Step 1: Add failing canonical-order tests**

```js
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
```

- [ ] **Step 2: Verify RED**
Run `node --test tests/prompt-authority.test.cjs`.
Expected: FAIL because `classifyScreens` and `renderCanonicalPrompt` are missing.

- [ ] **Step 3: Implement screen classification**
Classify Settings/Preferences/Configuration as `settings`; History/Calendar/Reports/Saved/Archive/Results/Detail as `supporting`; all remaining screens as `primary`. Preserve source order and descriptions.

- [ ] **Step 4: Implement literal Design & UX Standard**
Renderer must include these requirements:

```text
Design & UX Standard:
- Treat production-ready visual hierarchy as a requirement, not decoration. Use intentional spacing, typography, density, grouping, and coherent component hierarchy.
- Make one next primary action unmistakable on workflow screens. Use navigation and controls appropriate to the resolved role and build target.
- Design polished empty, active, loading, completed, saved, edited, disabled, and error states only where relevant.
- Use one consistent component language; avoid unrelated cards, default generated UI, and visual clutter.
- Add purposeful micro-interactions and restrained animation for navigation, state changes, sheets/dialogs, button feedback, progress, and completion. Respect reduced-motion behavior when supported.
- Avoid random motion, forced confetti, excessive glass, neon, gradients, or effects that slow the task.
- A functional prototype is not complete. The first main screen must look like a finished premium product. If the result resembles a generic prototype, dashboard, stack of cards, default generated UI, or placeholder composition, redesign it before presenting the build.
```

- [ ] **Step 5: Implement canonical prompt rendering**
The renderer must output all 13 headings in the approved order. `Screen Architecture` lists primary/supporting/settings groups. `Screen-by-Screen Composition` emits every domain screen in original order and appends: `Keep the dominant status/content and primary action visually obvious; subordinate secondary controls and configuration.` `Product Behavior & Calculations` combines features, logic, persistence, and `Use one source of truth for shared saved data so screens cannot disagree.`

`Scope Lock / Forbidden Behavior` must include:

```text
- Do not invent unrelated pages, fields, metrics, dashboards, services, accounts, analytics, backend, teams, or automation.
- Do not import features from a previous generated app.
- Do not let domain defaults override explicit exclusions.
- Do not silently switch the requested implementation platform.
```

`Verification + Done When` must include end-to-end workflow, requested supporting screens/settings, calculations/persistence/state, design quality gate, no placeholder interactions, and concrete verification evidence.

- [ ] **Step 6: Verify GREEN**
Run `node --test tests/prompt-authority.test.cjs`.
Expected: all tests PASS.

- [ ] **Step 7: Commit**
Commit message: `feat: add canonical SpecSmith app prompt hierarchy`.

---

### Task 3: Integrate Authority into Existing Compiler

**Files:**
- Modify: `app.js`
- Create: `tests/source-integration.test.cjs`

**Interfaces:**
- Keep `compilePlan(idea, profile)` plan shape unchanged.
- `renderPlan(plan)` delegates to `SpecsmithPromptAuthority.renderCanonicalPrompt`.
- Keep `contaminationReport` and generic fallback unchanged.

- [ ] **Step 1: Write failing source-integration tests**

```js
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
```

- [ ] **Step 2: Verify RED**
Run `node --test tests/*.test.cjs`.
Expected: source-integration tests FAIL.

- [ ] **Step 3: Preserve explicit workflow**
Replace `plan.workflow = profile.workflow;` with:

```js
plan.workflow = SpecsmithPromptAuthority.extractExplicitWorkflow(idea) || profile.workflow;
```

- [ ] **Step 4: Delegate global rendering**
Replace the old `renderPlan` body with:

```js
function renderPlan(plan) {
  const role = SpecsmithPromptAuthority.resolveRole(plan.idea, plan);
  return SpecsmithPromptAuthority.renderCanonicalPrompt(plan, {
    role,
    interactionRules: INTERACTION,
    defaultBuildGuidance: BUILD,
  });
}
```

- [ ] **Step 5: Remove contradictory global decoration rules**
The old `VISUAL` block must no longer be rendered or treated as authority because it globally forces frosted glass, card radii, shadows, and Apple styling. Remove it if now unused. Update `INTERACTION` so it keeps immediate feedback and purposeful transitions but does not globally require confetti or celebration.

- [ ] **Step 6: Verify GREEN**
Run `node --test tests/*.test.cjs`.
Expected: all tests PASS.

- [ ] **Step 7: Commit**
Commit message: `feat: route SpecSmith through global prompt authority`.

---

### Task 4: Regression Coverage + CI + Documentation

**Files:**
- Modify: `tests/prompt-authority.test.cjs`
- Create: `.github/workflows/test.yml`
- Modify: `README.md`

- [ ] **Step 1: Add domain-preservation regression tests**
Add representative timesheet, finance, and generic plan fixtures. Assert timesheet output retains time-tracking terms; finance output does not contain time-tracking/trucking terms; generic output does not import specialized-domain features. Assert Settings remains secondary and unspecified platform remains web-targeted.

- [ ] **Step 2: Run full tests**
Run `node --test tests/*.test.cjs`.
Expected: zero failures.

- [ ] **Step 3: Add CI**
Create:

```yaml
name: SpecSmith Tests
on:
  push:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: node --test tests/*.test.cjs
```

- [ ] **Step 4: Update README**
Document the new generation order exactly and state: automatic role inference; explicit platform/product requirements always win; premium UI/UX and purposeful motion are automatic; output remains local/private/deterministic.

- [ ] **Step 5: Final branch verification**
Run `node --test tests/*.test.cjs`.
Expected: zero failures.

- [ ] **Step 6: Commit**
Commit message: `test: verify SpecSmith global prompt authority`.

---

### Task 5: PR, Merge, and Deployment Verification

**Files:** No expected production changes unless verification reveals a defect.

- [ ] **Step 1: Open PR from `feature/global-prompt-authority` to `main`**
PR summary must mention automatic role resolution, canonical hierarchy, screen architecture/composition, preserved contamination protection, and no dependencies.

- [ ] **Step 2: Confirm feature-branch CI is green**
Do not merge while tests are pending or failing.

- [ ] **Step 3: Inspect PR changed files**
Expected production/config scope: `prompt-authority.js`, `app.js`, `index.html`, `README.md`, `.github/workflows/test.yml`, `tests/*.test.cjs`.

- [ ] **Step 4: Merge and record exact merged SHA**
Use squash or normal merge supported by the repo.

- [ ] **Step 5: Verify `main` CI on exact merged SHA**
`SpecSmith Tests` must complete successfully.

- [ ] **Step 6: Verify Vercel delivery**
Find the linked SpecSmith deployment for the exact merged SHA. If Vercel is rate-limited, report `main` as merged/CI-green but not production-live. Do not claim live completion until the exact SHA is READY and production serves it.

- [ ] **Step 7: Live smoke test when deployment is available**
Generate a personal timesheet, a generic habit/productivity app, and an explicit Android app. Confirm output starts with Role; Design & UX appears before workflow/layout construction; Screen Architecture and Screen-by-Screen Composition are present; domain behavior survives; and the first-screen premium quality gate appears.
