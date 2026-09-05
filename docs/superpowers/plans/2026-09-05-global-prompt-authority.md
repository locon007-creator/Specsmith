# SpecSmith Global Prompt Authority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every SpecSmith-generated app prompt use the approved global authority order with automatic role resolution, automatic premium UI/UX quality rules, explicit screen architecture, and screen-by-screen composition while preserving domain logic and contamination protection.

**Architecture:** Keep SpecSmith’s existing deterministic `idea → domain match → fresh plan → contamination check → render` pipeline and static browser-only UI. Add one pure `prompt-authority.js` helper using a browser/Node-compatible UMD wrapper; it owns role resolution, explicit workflow extraction, screen classification/composition, and canonical prompt rendering. `app.js` continues to own domain profiles, plan compilation, contamination checks, history, reset behavior, and UI orchestration, but delegates global prompt authority to the helper.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, browser `localStorage`, Node built-in `node:test` + `assert`, GitHub Actions, Vercel static hosting. No npm dependencies or framework.

**Spec:** `docs/superpowers/specs/2026-09-05-global-prompt-authority-design.md`

## Global Constraints

- Preserve the current deterministic domain-profile architecture, isolated fresh-plan compilation, and contamination protection.
- Canonical order: Role → Product Mission / Objective → Idea Lock → Design & UX Standard → Target User → Primary Workflow → Screen Architecture → Screen-by-Screen Composition → Product Behavior & Calculations → Interaction & State Rules → Scope Lock / Forbidden Behavior → Implementation / Tool Guidance → Verification + Done When.
- Explicit platform intent always wins over inference.
- The role must never silently change the user’s requested platform, product purpose, workflow, features, exclusions, or build target.
- Default SpecSmith implementation remains a self-contained Arena-friendly web app when the user does not explicitly request a native target.
- Premium UI/UX and purposeful motion are automatic requirements, not optional style choices.
- Do not add frameworks, external services, AI APIs, dependencies, accounts, analytics, or a parallel compiler.
- Preserve the current mobile-first 360–430 px portrait target and no fake device frame for the default web path.

---

### Task 1: Add a pure automatic role/workflow authority helper

**Files:**
- Create: `prompt-authority.js`
- Create: `tests/prompt-authority.test.cjs`
- Modify: `index.html` (load `prompt-authority.js` before `app.js`)

**Interfaces:**
- Consumes: current idea string and optional compiled plan metadata.
- Produces: `SpecsmithPromptAuthority.resolveRole(idea, plan) -> { id, label, guidance, buildTarget }`
- Produces: `SpecsmithPromptAuthority.extractExplicitWorkflow(idea) -> string | null`
- Browser export: `globalThis.SpecsmithPromptAuthority`
- Node export: `module.exports = api`

- [ ] **Step 1: Write failing role-resolution tests**

Create `tests/prompt-authority.test.cjs` with tests equivalent to:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const authority = require('../prompt-authority.js');

test('explicit Android, iOS, and web wording wins', () => {
  assert.equal(authority.resolveRole('Build an Android mileage tracker').id, 'android');
  assert.equal(authority.resolveRole('Build an iPhone meal planner').id, 'ios');
  assert.equal(authority.resolveRole('Build a responsive web recipe app').id, 'web');
});

test('backend-heavy requirements resolve full-stack without inventing a native platform', () => {
  const role = authority.resolveRole('Build a loan tracker with account sync and a database');
  assert.equal(role.id, 'full-stack');
  assert.equal(role.buildTarget, 'web');
});

test('unspecified platform stays on SpecSmith default web build target', () => {
  const role = authority.resolveRole('Build a personal habit tracker with streaks');
  assert.equal(role.id, 'product-ui');
  assert.equal(role.buildTarget, 'web');
});

test('explicit workflow text is preserved', () => {
  assert.equal(
    authority.extractExplicitWorkflow('Main flow: Home → Punch In → Active Shift → Punch Out → Saved Day.'),
    'Home → Punch In → Active Shift → Punch Out → Saved Day'
  );
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
node --test tests/prompt-authority.test.cjs
```

Expected: FAIL because `prompt-authority.js` does not exist.

- [ ] **Step 3: Implement the minimal pure helper**

Create `prompt-authority.js` using a dependency-free UMD wrapper:

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpecsmithPromptAuthority = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function resolveRole(idea, plan) {
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

- [ ] **Step 4: Load the helper before `app.js`**

Change the end of `index.html` from:

```html
<script src="app.js"></script>
```

to:

```html
<script src="prompt-authority.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
node --test tests/prompt-authority.test.cjs
```

Expected: all role/workflow tests PASS.

- [ ] **Step 6: Commit**

```bash
git add prompt-authority.js tests/prompt-authority.test.cjs index.html
git commit -m "feat: add automatic SpecSmith prompt role authority"
```

---

### Task 2: Add canonical screen architecture, composition, and design contract rendering

**Files:**
- Modify: `prompt-authority.js`
- Modify: `tests/prompt-authority.test.cjs`

**Interfaces:**
- Produces: `classifyScreens(screens) -> { primary, supporting, settings }`
- Produces: `renderCanonicalPrompt(plan, options) -> string`
- `options` shape: `{ role, interactionRules, defaultBuildGuidance }`

- [ ] **Step 1: Add failing canonical-order and screen tests**

Add tests that build a representative timesheet plan:

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

test('canonical app prompt sections appear in authority order', () => {
  const text = authority.renderCanonicalPrompt(timesheetPlan, { role: authority.resolveRole(timesheetPlan.idea) });
  const headings = ['Role:', 'Product Mission / Objective:', 'Idea Lock:', 'Design & UX Standard:', 'Target User:', 'Primary Workflow:', 'Screen Architecture:', 'Screen-by-Screen Composition:', 'Product Behavior & Calculations:', 'Interaction & State Rules:', 'Scope Lock / Forbidden Behavior:', 'Implementation / Tool Guidance:', 'Verification + Done When:'];
  for (let i = 1; i < headings.length; i++) assert.ok(text.indexOf(headings[i - 1]) < text.indexOf(headings[i]));
});

test('settings is secondary and screen composition preserves domain content', () => {
  const architecture = authority.classifyScreens(timesheetPlan.screens);
  assert.deepEqual(architecture.settings.map(x => x[0]), ['Settings']);
  const text = authority.renderCanonicalPrompt(timesheetPlan, { role: authority.resolveRole(timesheetPlan.idea) });
  assert.match(text, /Primary screens:/i);
  assert.match(text, /Supporting screens:/i);
  assert.match(text, /Settings.*secondary/i);
  assert.match(text, /Today.*live elapsed timer/i);
  assert.match(text, /Weekly.*gross.*deductions.*net pay/i);
});

test('premium quality gate is automatic', () => {
  const text = authority.renderCanonicalPrompt(timesheetPlan, { role: authority.resolveRole(timesheetPlan.idea) });
  assert.match(text, /functional prototype is not complete/i);
  assert.match(text, /first main screen.*finished premium product/i);
  assert.match(text, /purposeful micro-interactions/i);
  assert.match(text, /generic prototype|stack of cards/i);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
node --test tests/prompt-authority.test.cjs
```

Expected: FAIL because screen classification and canonical rendering are not implemented.

- [ ] **Step 3: Implement screen classification**

Add `classifyScreens(screens)` with these rules:
- screen named Settings/Preferences/Configuration → `settings`
- History/Calendar/Reports/Saved/Archive/Results/Detail screens → `supporting` unless first in the explicit workflow
- remaining screens → `primary`
- preserve original screen order and descriptions

- [ ] **Step 4: Implement canonical renderer**

`renderCanonicalPrompt(plan, options)` must render exactly the approved logical hierarchy and include:

```text
Role:
<resolved role label>
<resolved guidance>

Product Mission / Objective:
Build “<name>” to <purpose> for <target user>.

Idea Lock:
<normalized current idea>
Preserve the stated product, workflow, required features, exclusions, and one-job focus. Domain defaults may improve execution but must not broaden or contradict the idea.

Design & UX Standard:
...automatic premium contract...

Target User:
<plan.user>

Primary Workflow:
<plan.workflow>

Screen Architecture:
Primary screens: ...
Supporting screens: ...
Settings/configuration: secondary...

Screen-by-Screen Composition:
1. <screen> — <existing domain description>. Arrange this screen so its dominant status/content and primary action are visually obvious; keep secondary controls subordinate.
...

Product Behavior & Calculations:
- <features>
- <logic>
- Persistence: <plan.persistence>
- Use one source of truth for shared saved data so screens cannot disagree.

Interaction & State Rules:
...working controls, immediate feedback, purposeful restrained transitions, relevant states only...

Scope Lock / Forbidden Behavior:
...no unrelated pages/fields/dashboards/services/teams/backend unless required; no previous-app carryover; no silent platform switch...

Implementation / Tool Guidance:
<target-appropriate guidance>

Verification + Done When:
...end-to-end workflow, requested screens/settings, calculations/persistence, visual quality gate, no placeholders, verification evidence...
```

Do not globally require confetti, frosted glass, gradients, or a particular card radius. Animation must be purposeful rather than decorative.

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
node --test tests/prompt-authority.test.cjs
```

Expected: all canonical rendering tests PASS.

- [ ] **Step 6: Commit**

```bash
git add prompt-authority.js tests/prompt-authority.test.cjs
git commit -m "feat: add canonical SpecSmith app prompt hierarchy"
```

---

### Task 3: Integrate the canonical authority into SpecSmith compilation without weakening contamination protection

**Files:**
- Modify: `app.js` around `compilePlan()` and `renderPlan()`
- Modify: `tests/prompt-authority.test.cjs`
- Create: `tests/source-integration.test.cjs`

**Interfaces:**
- `compilePlan(idea, profile)` continues returning the existing plan shape.
- `renderPlan(plan)` becomes a thin adapter to `SpecsmithPromptAuthority.renderCanonicalPrompt(...)`.
- `contaminationReport(...)` and `buildPrompt(...)` remain the sole existing contamination/fallback path.

- [ ] **Step 1: Add failing source-integration tests**

Create `tests/source-integration.test.cjs` using only Node built-ins:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

test('app.js delegates global prompt rendering to prompt authority', () => {
  assert.match(source, /SpecsmithPromptAuthority\.renderCanonicalPrompt/);
});

test('contamination protection remains in the generation path', () => {
  assert.match(source, /contaminationReport\(plan, idea, previous/);
  assert.match(source, /compilePlan\(idea, GENERIC\)/);
});

test('explicit workflow can override profile workflow', () => {
  assert.match(source, /extractExplicitWorkflow/);
});
```

- [ ] **Step 2: Run both test files to verify RED**

Run:

```bash
node --test tests/*.test.cjs
```

Expected: source-integration test FAIL because `app.js` has not been wired to the helper.

- [ ] **Step 3: Preserve explicit workflow in `compilePlan`**

Change:

```js
plan.workflow = profile.workflow;
```

to:

```js
plan.workflow = SpecsmithPromptAuthority.extractExplicitWorkflow(idea) || profile.workflow;
```

Do not change domain matching or contamination logic.

- [ ] **Step 4: Replace old global rendering with the canonical renderer**

Replace the current `renderPlan(plan)` body with a thin adapter:

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

Keep `buildPrompt()` unchanged except for consuming the new `renderPlan()` result. Do not merge previous output or previous plan data into rendering.

- [ ] **Step 5: Remove global visual rules that contradict the new quality standard**

Stop rendering the old `VISUAL` string as authoritative global output. It currently hard-codes Apple-level styling, frosted glass, rounded cards, and shadows; those specifics must no longer force every product into one look. Either remove the constant if unused or leave it unused only if removing it would create unrelated churn. The canonical Design & UX Standard is now the global visual authority.

Update `INTERACTION` so it no longer globally mandates confetti. Keep immediate response, purposeful 150–250 ms transitions where appropriate, press feedback, and designed relevant states.

- [ ] **Step 6: Run all tests to verify GREEN**

Run:

```bash
node --test tests/*.test.cjs
```

Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add app.js tests/source-integration.test.cjs tests/prompt-authority.test.cjs
git commit -m "feat: route SpecSmith generation through global prompt authority"
```

---

### Task 4: Add regression coverage, documentation, and CI verification

**Files:**
- Modify: `tests/prompt-authority.test.cjs`
- Modify: `README.md`
- Create: `.github/workflows/test.yml`

**Interfaces:**
- CI runs `node --test tests/*.test.cjs` on push and pull request.

- [ ] **Step 1: Add regression tests for domain preservation and no feature invention**

Add representative plans/tests for:
- timesheet: preserve Punch In/Punch Out, Weekly, History, Calendar, persistence
- finance/budget: preserve its own domain features without timesheet/trucking terms
- generic: preserve generic content without importing a specialized profile
- platform: Android idea gets Android role and build target; unspecified idea keeps default web target
- settings: remains secondary

Example assertion pattern:

```js
assert.match(timesheetText, /Punch In|clock in/i);
assert.doesNotMatch(financeText, /Punch In|trailer|drop & hook/i);
assert.equal(authority.resolveRole('Build a habit tracker').buildTarget, 'web');
```

- [ ] **Step 2: Run all tests**

Run:

```bash
node --test tests/*.test.cjs
```

Expected: PASS with zero failures.

- [ ] **Step 3: Update README architecture description**

Change the “How it works” description so generation explicitly says SpecSmith now resolves the best expert role and renders:

```text
Role → Product Mission → Idea Lock → Design & UX Standard → Primary Workflow → Screen Architecture → Screen-by-Screen Composition → Product Behavior → Interaction/State Rules → Scope Lock → Implementation Guidance → Verification.
```

Also state that premium UI/UX is automatic and the role cannot override explicit platform/product requirements.

- [ ] **Step 4: Add dependency-free CI**

Create `.github/workflows/test.yml`:

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

- [ ] **Step 5: Run a final local-equivalent verification command**

Run:

```bash
node --test tests/*.test.cjs
```

Expected: zero failures.

- [ ] **Step 6: Commit**

```bash
git add README.md .github/workflows/test.yml tests
git commit -m "test: verify SpecSmith global prompt authority"
```

---

### Task 5: Integrate to `main` and verify GitHub/Vercel delivery

**Files:**
- No production-file changes expected unless verification exposes a defect.

**Interfaces:**
- Feature branch → PR → `main` → linked Vercel deployment.

- [ ] **Step 1: Create an isolated feature branch from current `main`**

Use branch name:

```text
feature/global-prompt-authority
```

- [ ] **Step 2: Execute Tasks 1–4 on the feature branch with TDD**

For every production behavior: write failing test, verify RED, implement minimal change, verify GREEN, then commit.

- [ ] **Step 3: Verify full feature-branch test suite**

Run:

```bash
node --test tests/*.test.cjs
```

Expected: zero failures.

- [ ] **Step 4: Open PR and inspect changed files**

Expected changed production files are limited to:
- `prompt-authority.js`
- `app.js`
- `index.html`
- `README.md`
- `.github/workflows/test.yml`
- `tests/*.test.cjs`

The already-approved spec/plan docs are documentation-only.

- [ ] **Step 5: Merge only after branch CI is green**

Use squash or normal merge according to repository capability. Record the exact merged SHA.

- [ ] **Step 6: Verify `main` CI on the exact merged SHA**

The GitHub Actions `SpecSmith Tests` workflow must complete successfully for the merged SHA before claiming completion.

- [ ] **Step 7: Verify Vercel deployment**

Check the linked SpecSmith Vercel project for a deployment sourced from the exact merged SHA. If Vercel is rate-limited, report the code as merged/CI-green but not production-live; do not claim deployment until the exact SHA is READY and the production alias serves the new prompt hierarchy.

- [ ] **Step 8: Live behavior smoke check when deployment is available**

Generate at least:
- personal timesheet
- generic habit/productivity app
- explicit Android app

Confirm the live output starts with Role, keeps Design & UX near the top, includes Screen Architecture and Screen-by-Screen Composition, preserves domain behavior, and contains the first-screen quality gate.
