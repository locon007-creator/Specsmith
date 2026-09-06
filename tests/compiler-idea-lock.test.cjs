const test = require('node:test');
const assert = require('node:assert/strict');
const authority = require('../prompt-authority.js');

const dropHookIdea = `Drop & Hook Assistant
Product Brief
Its purpose is to keep the driver’s equipment, route, stops, trailer changes, arrival/departure times, mileage, and daily progress organized with as little friction as possible.
It is not fleet management, dispatch software, GPS tracking, payroll, or an ELD.
Target User
One truck driver working a daily multi-stop route.
Main Workflow
Home → Start My Day → Day Setup → Create Route → Start Route → Work Mode → Day Complete → Navigate Home or Finish Day → Ending Mileage → Finish Day
Home
Show:
- Drop & Hook Assistant branding
- Top-right menu
- One dominant Start My Day button
Day Setup
Collect only:
- Truck / Unit Number — required
- Starting Mileage — required
- Current Trailer Number — optional
Create Route
Primary action:
+ Add Stop
Use OSM for search only.
Work Mode
Do not show:
- OSM map
- Embedded map
Show the active stop clearly.
Active Stop Card
Show:
Business Name
Full Address
Drop & Hook Info
Fields:
- Drop Trailer
- Hook Trailer
- Loaded / Empty
- Seal Number
- Reference / Load Number
Button:
Navigate
After navigation begins, change the button to:
Arrive
When the driver presses Arrive, record arrival time and change the main action to Depart.
When the driver presses Depart, record departure time, save Drop & Hook information, mark the stop completed, and move to the next stop.`;

test('detailed ideas compile from their own content instead of a preset domain', () => {
  assert.equal(typeof authority.compileIdeaPlan, 'function');
  const plan = authority.compileIdeaPlan(dropHookIdea, {
    id: 'habit',
    name: 'Ritual',
    purpose: 'help one person build daily habits with streaks',
    user: 'a habit tracker user',
    workflow: 'open → check habits → update streaks',
    screens: [['Today', 'habit checklist']],
    features: ['habit streaks'],
    logic: ['reset at midnight'],
    persistence: 'habits in localStorage'
  });

  assert.equal(plan.name, 'Drop & Hook Assistant');
  assert.match(plan.purpose, /driver.*equipment.*route.*stops/i);
  assert.match(plan.user, /truck driver/i);
  assert.match(plan.workflow, /Start My Day.*Day Setup.*Create Route.*Work Mode.*Finish Day/i);
  assert.ok(plan.screens.some(([name]) => /Work Mode/i.test(name)));
  assert.ok(plan.features.some((line) => /Drop Trailer|Hook Trailer|OSM|Navigate/i.test(line)));
  assert.doesNotMatch(JSON.stringify(plan), /habit|streak|Ritual/i);
});

test('short ideas may still use a matching preset as a fallback', () => {
  const habit = {
    id: 'habit',
    name: 'Ritual',
    purpose: 'help one person build daily habits with streaks',
    user: 'one person building routines',
    workflow: 'open → see habits → mark one done',
    screens: [['Today', 'habit checklist']],
    features: ['habit streaks'],
    logic: ['reset at midnight'],
    persistence: 'habits in localStorage'
  };
  const plan = authority.compileIdeaPlan('A habit tracker with streaks', habit);
  assert.equal(plan.name, 'Ritual');
  assert.match(plan.purpose, /habits/i);
});
