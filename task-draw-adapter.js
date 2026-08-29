/**
 * Task Draw Firestore Adapter
 * Pair-scoped Firebase Firestore synchronization module for Task Draw.
 * Integrates with full-app relationships/{relationshipId}/taskDraw paths.
 */

import { db, auth } from './firebase-config.js';
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  setDoc,
  updateDoc,
  addDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { DEFAULT_TASK_DRAW_SETTINGS, getTodayDateKey } from './js/modules/task-draw-engine.js';

let activeUnsubscribers = [];

/**
 * Clean up all active listeners when switching context or leaving page.
 */
export function unsubscribeTaskDrawListeners() {
  activeUnsubscribers.forEach(unsub => {
    try { if (typeof unsub === 'function') unsub(); } catch (e) { console.error(e); }
  });
  activeUnsubscribers = [];
}

/**
 * Subscribe to Task Draw settings, state, active draw, and recent history for active pairId.
 */
export function subscribeTaskDraw({
  relationshipId,
  onSettings,
  onState,
  onActiveDraw,
  onHistory,
  onIndex
}) {
  unsubscribeTaskDrawListeners();

  if (!relationshipId) return;

  // 1. Settings listener (4 segments: relationships / id / taskDraw / settings)
  const settingsRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'settings');
  const unsubSettings = onSnapshot(settingsRef, (snap) => {
    if (snap.exists()) {
      if (onSettings) onSettings(snap.data());
    } else {
      // Seed default settings if missing
      setDoc(settingsRef, {
        ...DEFAULT_TASK_DRAW_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(err => console.error('Error seeding settings:', err));
      if (onSettings) onSettings(DEFAULT_TASK_DRAW_SETTINGS);
    }
  });
  activeUnsubscribers.push(unsubSettings);

  // 2. State listener (4 segments: relationships / id / taskDraw / state)
  const stateRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'state');
  let currentLiveDrawId = null;
  let activeDrawUnsub = null;

  const unsubState = onSnapshot(stateRef, (snap) => {
    const stateData = snap.exists() ? snap.data() : { liveDrawId: null, redrawsUsedToday: 0, lastDrawIds: [], softBanIds: [], dateKey: getTodayDateKey() };
    if (onState) onState(stateData);

    const newLiveDrawId = stateData.liveDrawId;

    // Attach listener to active live draw document if liveDrawId changed (4 segments: relationships / id / taskDraws / drawId)
    if (newLiveDrawId !== currentLiveDrawId) {
      if (activeDrawUnsub) {
        activeDrawUnsub();
        activeDrawUnsub = null;
      }
      currentLiveDrawId = newLiveDrawId;

      if (currentLiveDrawId) {
        const drawRef = doc(db, 'relationships', relationshipId, 'taskDraws', currentLiveDrawId);
        activeDrawUnsub = onSnapshot(drawRef, (drawSnap) => {
          if (onActiveDraw) onActiveDraw(drawSnap.exists() ? { id: drawSnap.id, ...drawSnap.data() } : null);
        });
      } else {
        if (onActiveDraw) onActiveDraw(null);
      }
    }
  });
  activeUnsubscribers.push(unsubState);
  activeUnsubscribers.push(() => { if (activeDrawUnsub) activeDrawUnsub(); });

  // 3. History listener (3 segments: relationships / id / taskDraws)
  const drawsCol = collection(db, 'relationships', relationshipId, 'taskDraws');
  const historyQuery = query(drawsCol, orderBy('startedAt', 'desc'), limit(20));
  const unsubHistory = onSnapshot(historyQuery, (snap) => {
    const draws = [];
    snap.forEach(docSnap => draws.push({ id: docSnap.id, ...docSnap.data() }));
    if (onHistory) onHistory(draws);
  });
  activeUnsubscribers.push(unsubHistory);

  // 4. Optional Index chip listener for Dom (active pair live chip updates)
  const user = auth.currentUser;
  if (user && onIndex) {
    const indexRef = doc(db, 'users', user.uid, 'taskDrawIndex', relationshipId);
    const unsubIndex = onSnapshot(indexRef, (snap) => {
      if (onIndex) onIndex(snap.exists() ? snap.data() : null);
    });
    activeUnsubscribers.push(unsubIndex);
  }
}

/**
 * Perform atomic Draw transaction: check liveDrawId == null, create draw doc, update live state pointer.
 */
export async function drawCardTransaction({
  relationshipId,
  subUid,
  domUid,
  cardId,
  catalogVersion = 1,
  source = 'rng',
  allowOverride = false
}) {
  const stateRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'state');
  const drawsCol = collection(db, 'relationships', relationshipId, 'taskDraws');
  const newDrawRef = doc(drawsCol);

  return runTransaction(db, async (transaction) => {
    const stateSnap = await transaction.get(stateRef);
    const stateData = stateSnap.exists() ? stateSnap.data() : {};

    if (stateData.liveDrawId && !allowOverride) {
      throw new Error('A card is already live for this pair.');
    } else if (stateData.liveDrawId && allowOverride) {
      const oldDrawRef = doc(db, 'relationships', relationshipId, 'taskDraws', stateData.liveDrawId);
      transaction.update(oldDrawRef, {
        status: 'replaced',
        endedAt: serverTimestamp()
      });
    }

    const todayKey = getTodayDateKey();
    let redrawsUsedToday = stateData.redrawsUsedToday || 0;
    if (stateData.dateKey !== todayKey) {
      redrawsUsedToday = 0; // Daily reset
    }

    const now = serverTimestamp();

    // Create draw document
    transaction.set(newDrawRef, {
      pairId: relationshipId,
      subUid,
      domUid: domUid || null,
      cardId,
      catalogVersion,
      status: 'drawn',
      source, // 'rng' | 'assign'
      startedAt: now,
      endedAt: null,
      edges: 0,
      mood: null,
      note: null,
      aftercareShown: false,
      visibleTo: [domUid, subUid].filter(Boolean)
    });

    // Update state live pointer
    transaction.set(stateRef, {
      liveDrawId: newDrawRef.id,
      redrawsUsedToday,
      dateKey: todayKey,
      lastDrawIds: stateData.lastDrawIds || [],
      softBanIds: stateData.softBanIds || []
    }, { merge: true });

    // Write Dom index fanout
    if (domUid) {
      const indexRef = doc(db, 'users', domUid, 'taskDrawIndex', relationshipId);
      transaction.set(indexRef, {
        relationshipId,
        subUid,
        liveDrawId: newDrawRef.id,
        liveCardId: cardId,
        status: 'drawn',
        updatedAt: now
      }, { merge: true });
    }

    return newDrawRef.id;
  });
}

/**
 * Assign card (Dom action): force assigns a card and replaces existing active card if any.
 */
export async function assignCardTransaction({
  relationshipId,
  subUid,
  domUid,
  cardId
}) {
  return drawCardTransaction({
    relationshipId,
    subUid,
    domUid,
    cardId,
    source: 'assign',
    allowOverride: true
  });
}

/**
 * Unassign active card (Dom action): clears live pointer and marks current draw as 'unassigned'.
 */
export async function unassignCardTransaction({ relationshipId, domUid }) {
  const stateRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'state');
  const now = serverTimestamp();

  return runTransaction(db, async (transaction) => {
    const stateSnap = await transaction.get(stateRef);
    const stateData = stateSnap.exists() ? stateSnap.data() : {};
    const liveDrawId = stateData.liveDrawId;

    if (liveDrawId) {
      const drawRef = doc(db, 'relationships', relationshipId, 'taskDraws', liveDrawId);
      transaction.update(drawRef, {
        status: 'unassigned',
        endedAt: now
      });
    }

    transaction.set(stateRef, {
      liveDrawId: null
    }, { merge: true });

    if (domUid) {
      const indexRef = doc(db, 'users', domUid, 'taskDrawIndex', relationshipId);
      transaction.set(indexRef, {
        liveDrawId: null,
        status: 'idle',
        updatedAt: now
      }, { merge: true });
    }

    return true;
  });
}

/**
 * Begin card session (moves status from 'drawn' to 'live').
 */
export async function startLiveSession({ relationshipId, drawId, domUid }) {
  const drawRef = doc(db, 'relationships', relationshipId, 'taskDraws', drawId);
  const now = serverTimestamp();
  
  await updateDoc(drawRef, {
    status: 'live',
    liveStartedAt: now
  });

  if (domUid) {
    const indexRef = doc(db, 'users', domUid, 'taskDrawIndex', relationshipId);
    await updateDoc(indexRef, {
      status: 'live',
      updatedAt: now
    }).catch(() => {});
  }
}

/**
 * Increment edge count or update live session state.
 */
export async function updateLiveDrawProgress({ relationshipId, drawId, edges }) {
  const drawRef = doc(db, 'relationships', relationshipId, 'taskDraws', drawId);
  await updateDoc(drawRef, { edges });
}

/**
 * Redraw transaction: burns 1 daily redraw token, marks old card as skipped_redraw, creates new drawn card.
 */
export async function redrawCardTransaction({
  relationshipId,
  subUid,
  domUid,
  oldDrawId,
  newCardId,
  catalogVersion = 1,
  maxRedrawsPerDay = 2
}) {
  const stateRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'state');
  const oldDrawRef = doc(db, 'relationships', relationshipId, 'taskDraws', oldDrawId);
  const drawsCol = collection(db, 'relationships', relationshipId, 'taskDraws');
  const newDrawRef = doc(drawsCol);

  return runTransaction(db, async (transaction) => {
    const stateSnap = await transaction.get(stateRef);
    const stateData = stateSnap.exists() ? stateSnap.data() : {};
    const todayKey = getTodayDateKey();

    let redrawsUsed = stateData.redrawsUsedToday || 0;
    if (stateData.dateKey !== todayKey) {
      redrawsUsed = 0;
    }

    if (redrawsUsed >= maxRedrawsPerDay) {
      throw new Error(`Daily redraw limit (${maxRedrawsPerDay}) reached.`);
    }

    const now = serverTimestamp();

    // Mark old draw as skipped_redraw
    transaction.update(oldDrawRef, {
      status: 'skipped',
      redrawBurned: true,
      endedAt: now
    });

    // Create new draw document
    transaction.set(newDrawRef, {
      pairId: relationshipId,
      subUid,
      domUid: domUid || null,
      cardId: newCardId,
      catalogVersion,
      status: 'drawn',
      source: 'rng',
      startedAt: now,
      endedAt: null,
      edges: 0,
      visibleTo: [domUid, subUid].filter(Boolean)
    });

    // Update state pointer & increment redraw count
    transaction.set(stateRef, {
      liveDrawId: newDrawRef.id,
      redrawsUsedToday: redrawsUsed + 1,
      dateKey: todayKey
    }, { merge: true });

    // Update Dom index fanout
    if (domUid) {
      const indexRef = doc(db, 'users', domUid, 'taskDrawIndex', relationshipId);
      transaction.set(indexRef, {
        liveDrawId: newDrawRef.id,
        liveCardId: newCardId,
        status: 'drawn',
        updatedAt: now
      }, { merge: true });
    }

    return newDrawRef.id;
  });
}

/**
 * Skip card ("Not tonight"): releases live pointer without burning redraw token or appending history.
 */
export async function skipDraw({ relationshipId, drawId, domUid }) {
  const drawRef = doc(db, 'relationships', relationshipId, 'taskDraws', drawId);
  const stateRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'state');
  const now = serverTimestamp();

  await updateDoc(drawRef, {
    status: 'skipped',
    endedAt: now
  });

  await updateDoc(stateRef, {
    liveDrawId: null
  });

  if (domUid) {
    const indexRef = doc(db, 'users', domUid, 'taskDrawIndex', relationshipId);
    await updateDoc(indexRef, {
      liveDrawId: null,
      status: 'skipped',
      updatedAt: now
    }).catch(() => {});
  }
}

/**
 * Complete draw: updates card status to 'done', appends history array, clears live pointer, writes notes & calendar items if provided.
 */
export async function completeDraw({
  relationshipId,
  drawId,
  subUid,
  domUid,
  cardId,
  cardTitle,
  mood,
  noteText,
  skipNext = false,
  noRepeatUntil = 8
}) {
  const stateRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'state');
  const drawRef = doc(db, 'relationships', relationshipId, 'taskDraws', drawId);
  const now = serverTimestamp();

  await runTransaction(db, async (transaction) => {
    const stateSnap = await transaction.get(stateRef);
    const stateData = stateSnap.exists() ? stateSnap.data() : {};

    // Calculate updated history array
    const lastDrawIds = stateData.lastDrawIds || [];
    const updatedHistory = [cardId, ...lastDrawIds.filter(id => id !== cardId)].slice(0, noRepeatUntil);

    // Calculate updated soft ban array
    let softBanIds = stateData.softBanIds || [];
    if (skipNext && !softBanIds.includes(cardId)) {
      softBanIds = [...softBanIds, cardId];
    }

    // Update draw doc
    transaction.update(drawRef, {
      status: 'done',
      mood,
      note: noteText || null,
      aftercareShown: true,
      endedAt: now
    });

    // Update state pointer & history
    transaction.set(stateRef, {
      liveDrawId: null,
      lastDrawIds: updatedHistory,
      softBanIds
    }, { merge: true });

    // Update Dom index fanout
    if (domUid) {
      const indexRef = doc(db, 'users', domUid, 'taskDrawIndex', relationshipId);
      transaction.set(indexRef, {
        liveDrawId: null,
        status: 'done',
        updatedAt: now
      }, { merge: true });
    }
  });

  // Write paired note if note text provided
  if (noteText && subUid) {
    try {
      const notesCol = collection(db, 'relationships', relationshipId, 'notes');
      await addDoc(notesCol, {
        title: `Task Draw #${cardId}: ${cardTitle}`,
        content: `Mood: ${mood}\n\n${noteText}`,
        type: 'task-draw',
        cardId,
        authorUid: subUid,
        createdAt: now
      });
    } catch (err) {
      console.error('Failed to create Task Draw completion note:', err);
    }
  }

  // Write calendar item for completion
  try {
    const calCol = collection(db, 'relationships', relationshipId, 'calendar');
    await addDoc(calCol, {
      title: `Task Draw #${cardId} ${cardTitle}`,
      type: 'task-draw',
      completedBy: subUid,
      date: new Date().toISOString(),
      createdAt: now
    });
  } catch (err) {
    console.error('Failed to create Task Draw calendar item:', err);
  }
}

/**
 * Emergency Stop / Safeword exit path.
 */
export async function stopDraw({ relationshipId, drawId, isSafeword = false, domUid }) {
  const drawRef = doc(db, 'relationships', relationshipId, 'taskDraws', drawId);
  const stateRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'state');
  const now = serverTimestamp();

  const status = 'stopped';

  await updateDoc(drawRef, {
    status,
    isSafeword,
    endedAt: now
  });

  await updateDoc(stateRef, {
    liveDrawId: null
  });

  if (domUid) {
    const indexRef = doc(db, 'users', domUid, 'taskDrawIndex', relationshipId);
    await updateDoc(indexRef, {
      liveDrawId: null,
      status: isSafeword ? 'safeword' : 'stopped',
      updatedAt: now
    }).catch(() => {});
  }
}

/**
 * Dom Assign card to active sub.
 */
export async function assignCardTransaction({
  relationshipId,
  subUid,
  domUid,
  cardId,
  catalogVersion = 1
}) {
  return drawCardTransaction({
    relationshipId,
    subUid,
    domUid,
    cardId,
    catalogVersion,
    source: 'assign'
  });
}

/**
 * Update deck settings (Dom only).
 */
export async function updateTaskDrawSettings({ relationshipId, newSettings }) {
  const settingsRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'settings');
  await setDoc(settingsRef, {
    ...newSettings,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Clear soft-banned card ID from state (Dom only).
 */
export async function clearSoftBan({ relationshipId, cardId }) {
  const stateRef = doc(db, 'relationships', relationshipId, 'taskDraw', 'state');
  await updateDoc(stateRef, {
    softBanIds: arrayRemove(cardId)
  });
}
