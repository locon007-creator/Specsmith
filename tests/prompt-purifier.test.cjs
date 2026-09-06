const assert = require('node:assert/strict');
const purifier = require('../prompt-purifier.js');

const budgetIdea = `Build a premium personal finance and budgeting app named Budget Flow.
The app helps one person understand their money, control spending, and stay within a monthly budget.
Home shows Available Balance, Monthly Income, Total Spent, Remaining Budget, Savings progress, Upcoming bills, Recent transactions, and + Add Transaction.
Budget categories show Budgeted, Spent, and Remaining.
Transactions support income and expenses. Bills, savings goals, history, settings, and local persistence are required.`;

const contaminated = `Role:\n- Android App Developer\n\nRequired Product Behavior:\n- Home updates budget totals automatically.\n- Search memory: prioritize Recent, frequently used locations, and Saved Stops when requested.\n- Trailer number becomes the next Drop Trailer.\n- Income and expense transactions persist locally.\n- Home must immediately show:\n- Expense flow: Amount → Category → Merchant/Description → Date → Save\n\nDone When:\n- No unrelated features remain.`;

const cleaned = purifier.purify(contaminated, budgetIdea);
assert.ok(cleaned.includes('Home updates budget totals automatically.'));
assert.ok(cleaned.includes('Income and expense transactions persist locally.'));
assert.ok(!/Saved Stops/i.test(cleaned));
assert.ok(!/Trailer|Drop Trailer/i.test(cleaned));
assert.ok(!/Home must immediately show:\s*$/m.test(cleaned));

const truckingIdea = `Build Drop & Hook Assistant for one truck driver. Create a route with stops. Track truck number, trailer number, mileage, arrival, departure, drop trailer, hook trailer, seal and reference.`;
const truckingPrompt = `Required Product Behavior:\n- Saved Stops persist locally.\n- Current trailer becomes Stop 1 Drop Trailer.\n- Arrival and departure times are recorded.`;
const truckingCleaned = purifier.purify(truckingPrompt, truckingIdea);
assert.ok(/Saved Stops/.test(truckingCleaned));
assert.ok(/Drop Trailer/.test(truckingCleaned));

assert.equal(purifier.VERSION, '1.0.0');
assert.equal(purifier.SEALED, true);
console.log('prompt purifier tests passed');
