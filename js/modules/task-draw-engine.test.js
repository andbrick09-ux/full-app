/**
 * Unit tests for task-draw-engine.js
 * Run via `node js/modules/task-draw-engine.test.js`
 */

import { TASK_DRAW_CARDS } from '../data/task-draw-cards.js';
import {
  getEligibleCards,
  substituteDomName,
  getEmptyDeckDiagnostics,
  DEFAULT_TASK_DRAW_SETTINGS
} from './task-draw-engine.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

console.log('--- TASK DRAW ENGINE UNIT TESTS ---');

// Test 1: Total catalog length
assert(TASK_DRAW_CARDS.length === 30, 'Catalog has exactly 30 cards');

// Test 2: Default packs filter out defaultOff cards (5, 9, 20, 26, 28)
const defaultEligible = getEligibleCards({
  catalog: TASK_DRAW_CARDS,
  packsOn: DEFAULT_TASK_DRAW_SETTINGS.packsOn
});

const defaultIds = defaultEligible.map(c => c.id);
assert(!defaultIds.includes(5), 'Default packs excludes card 5 (Marathon)');
assert(!defaultIds.includes(9), 'Default packs excludes card 9 (Public)');
assert(!defaultIds.includes(20), 'Default packs excludes card 20 (Gambler 120m)');
assert(!defaultIds.includes(26), 'Default packs excludes card 26 (Hidden goal long)');
assert(!defaultIds.includes(28), 'Default packs excludes card 28 (Sleeper trigger long)');

// Test 3: Hard limit filter
const bondageBlocked = getEligibleCards({
  catalog: TASK_DRAW_CARDS,
  packsOn: DEFAULT_TASK_DRAW_SETTINGS.packsOn,
  hardLimits: ['bondage']
});
const bondageIds = bondageBlocked.map(c => c.id);
assert(!bondageIds.includes(1), 'Hard limit bondage excludes card 1');
assert(!bondageIds.includes(8), 'Hard limit bondage excludes card 8');
assert(!bondageIds.includes(19), 'Hard limit bondage excludes card 19');
assert(!bondageIds.includes(27), 'Hard limit bondage excludes card 27');

// Test 4: History exclusion
const historyFiltered = getEligibleCards({
  catalog: TASK_DRAW_CARDS,
  packsOn: DEFAULT_TASK_DRAW_SETTINGS.packsOn,
  historyIds: [2, 3, 4]
});
const historyIds = historyFiltered.map(c => c.id);
assert(!historyIds.includes(2), 'History filter excludes card 2');
assert(!historyIds.includes(3), 'History filter excludes card 3');
assert(!historyIds.includes(4), 'History filter excludes card 4');

// Test 5: Soft ban exclusion
const softBanned = getEligibleCards({
  catalog: TASK_DRAW_CARDS,
  packsOn: DEFAULT_TASK_DRAW_SETTINGS.packsOn,
  softBanIds: [14, 15]
});
const softBanResultIds = softBanned.map(c => c.id);
assert(!softBanResultIds.includes(14), 'Soft ban excludes card 14');
assert(!softBanResultIds.includes(15), 'Soft ban excludes card 15');

// Test 6: Tonight chip filter (short cards <= 25m)
const tonightFiltered = getEligibleCards({
  catalog: TASK_DRAW_CARDS,
  packsOn: DEFAULT_TASK_DRAW_SETTINGS.packsOn,
  isTonightOnly: true
});
const tonightIds = tonightFiltered.map(c => c.id);
assert(tonightFiltered.every(c => c.durationMin <= 25 && !c.flags.includes('longform')), 'Tonight chip filters out long duration cards');

// Test 7: Name substitution
const substituted = substituteDomName("I belong to {{domName}}.", "Master Alex");
assert(substituted === "I belong to Master Alex.", "Replaces {{domName}} with Master Alex");

const fallbackSubstituted = substituteDomName("I belong to {{domName}}.", null);
assert(fallbackSubstituted === "I belong to Sir.", "Falls back to Sir when domName is missing");

// Test 8: Empty deck diagnostics
const diag = getEmptyDeckDiagnostics({
  packsOn: ['home'],
  hardLimits: ['bondage'],
  isTonightOnly: true
});
assert(diag.includes('Tonight'), 'Empty deck diagnostic includes Tonight filter reason');

console.log(`\nRESULTS: ${passedTests}/${totalTests} tests passed.`);
if (passedTests !== totalTests) {
  process.exit(1);
}
