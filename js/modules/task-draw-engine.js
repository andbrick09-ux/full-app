/**
 * Task Draw Engine
 * Handles deck eligibility filtering, token substitution, deck diagnostics,
 * and default settings calculation for pair-scoped Task Draw.
 */

import { TASK_DRAW_CARDS } from '../data/task-draw-cards.js';

export const DEFAULT_TASK_DRAW_SETTINGS = {
  packsOn: ['home', 'dice', 'writing', 'bondage', 'short'],
  redrawsPerDay: 2,
  noRepeatUntil: 8,
  oneLiveOnly: true,
  photosOptional: true,
  nameTemplate: "{{domName}}'s girl",
  remoteStop: false,
  discreet: false,
  explicitPush: false
};

/**
 * Filter card catalog down to eligible cards based on active settings and user state.
 */
export function getEligibleCards({
  catalog = TASK_DRAW_CARDS,
  packsOn = DEFAULT_TASK_DRAW_SETTINGS.packsOn,
  hardLimits = [], // Array of flagged categories the sub hard-blocked (e.g. ['bondage', 'writing'])
  historyIds = [], // Array of recently completed card IDs (up to noRepeatUntil)
  softBanIds = [], // Array of card IDs soft-banned via skip_next
  isTonightOnly = false // Sub session filter for short cards (durationMin <= 25 & not longform)
} = {}) {
  const packsSet = new Set(packsOn || []);
  const limitsSet = new Set((hardLimits || []).map(l => String(l).toLowerCase()));
  const historySet = new Set((historyIds || []).map(Number));
  const softBanSet = new Set((softBanIds || []).map(Number));

  return catalog.filter(card => {
    // 1. Drop cards marked defaultOff unless pack explicitly enabled
    if (card.defaultOff) {
      const hasExplicitPack = card.packs.some(p => packsSet.has(p));
      if (!hasExplicitPack) return false;
    }

    // 2. Drop cards whose required packs are not in settings.packsOn
    const hasAllowedPack = card.packs.some(p => packsSet.has(p));
    if (!hasAllowedPack) return false;

    // 3. Drop cards that contain flags hitting user's hard limits
    const hitsHardLimit = card.flags.some(flag => limitsSet.has(flag.toLowerCase()));
    if (hitsHardLimit) return false;

    // 4. Drop last N completed card IDs (noRepeatUntil history)
    if (historySet.has(card.id)) return false;

    // 5. Drop soft-banned card IDs
    if (softBanSet.has(card.id)) return false;

    // 6. If Tonight/Short chip active, drop durationMin > 25 or longform cards
    if (isTonightOnly) {
      if (card.durationMin > 25 || card.flags.includes('longform')) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Replace {{domName}} placeholders safely with live Dom display name or fallback "Sir".
 */
export function substituteDomName(text, domName) {
  if (!text) return '';
  const safeName = (domName && String(domName).trim()) ? String(domName).trim() : 'Sir';
  return text.replace(/\{\{domName\}\}/g, safeName);
}

/**
 * Generate human-readable diagnostics explaining why a deck is empty.
 */
export function getEmptyDeckDiagnostics({
  catalog = TASK_DRAW_CARDS,
  packsOn = [],
  hardLimits = [],
  historyIds = [],
  softBanIds = [],
  isTonightOnly = false
} = {}) {
  const reasons = [];

  if (isTonightOnly) {
    reasons.push("'Tonight/Short' filter active");
  }
  if (softBanIds && softBanIds.length > 0) {
    reasons.push(`${softBanIds.length} card(s) soft-banned`);
  }
  if (historyIds && historyIds.length > 0) {
    reasons.push(`${historyIds.length} card(s) in recent history`);
  }
  if (hardLimits && hardLimits.length > 0) {
    reasons.push(`Hard limits active: [${hardLimits.join(', ')}]`);
  }

  const activePacks = packsOn && packsOn.length > 0 ? packsOn.join(', ') : 'none';
  
  if (reasons.length === 0) {
    return `Deck empty under active packs (${activePacks}). Ask Sir to enable more packs.`;
  }

  return `Deck empty (${reasons.join(' · ')}). Try turning off 'Tonight' filter or ask Sir to clear soft-bans.`;
}

/**
 * Returns YYYY-MM-DD date key based on sub timezone or UTC.
 */
export function getTodayDateKey(timeZone) {
  try {
    const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    return formatter.format(new Date()); // YYYY-MM-DD
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}
