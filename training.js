export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  MASTERED: 'mastered'
};

export function defaultSpacedRepetitionFields() {
  return {
    intervalDays: 0,
    easeFactor: 2.5,
    consecutiveCorrect: 0
  };
}

export function updateSpacedRepetition(progress, performancePct) {
  let { intervalDays = 0, easeFactor = 2.5, consecutiveCorrect = 0 } = progress;
  
  // Convert 0-100 scale to 0-5 scale for SuperMemo-2 algorithm
  const quality = Math.max(0, Math.min(5, Math.round(performancePct / 20)));
  
  if (quality >= 3) { // Successful recall
    if (consecutiveCorrect === 0) {
      intervalDays = 1;
    } else if (consecutiveCorrect === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    consecutiveCorrect++;
  } else { // Failed recall
    consecutiveCorrect = 0;
    intervalDays = 1;
  }
  
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  
  return {
    intervalDays,
    easeFactor,
    consecutiveCorrect
  };
}

export function evaluateAttempt(type, payload) {
  let mastered = false;
  
  if (type === 'flashcard') {
    // Mastered if they click 'Known' 3 times, or if the linked practical item is already mastered
    if (payload.knownCount >= 3 || payload.linkedItemMastered) mastered = true;
  } else if (type === 'true_false' || type === 'multiple_choice') {
    const recent = payload.recentScores || [];
    // Mastered if they score 100 on the first try, or have 3 recent passing scores
    if (recent.length >= 1 && recent[recent.length - 1] === 100) mastered = true;
    else if (recent.length >= 3 && recent.every(s => s >= 75)) mastered = true;
  } else if (type === 'reflection') {
    // Reflections are considered mastered once submitted
    if (payload.hasSubmitted) mastered = true; 
  } else if (type === 'hold_practice') {
    // Mastered if they can hold it for the recommended duration
    if (payload.bestHoldSeconds >= (payload.recommendedHoldSeconds || 60)) {
      mastered = true;
    }
  }
  
  return {
    mastered,
    status: mastered ? STATUS.MASTERED : STATUS.IN_PROGRESS
  };
}

export function markFlashcardViewed(currentStatus) {
  return currentStatus === STATUS.NOT_STARTED ? STATUS.IN_PROGRESS : currentStatus;
}

export function calculateTopicMastery(allItemIds, progressByItemId) {
  if (!allItemIds || allItemIds.length === 0) return 0;
  
  let masteredCount = 0;
  for (const id of allItemIds) {
    const progress = progressByItemId[id];
    if (progress && progress.status === STATUS.MASTERED) {
      masteredCount++;
    }
  }
  
  return Math.round((masteredCount / allItemIds.length) * 100);
}
