// training-log.js
// Helper to log training completions so they appear in the Dom's "Recent Sub Activity" feed

import { requireAuth, dataCol } from './auth.js';
import { addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/**
 * Log a training completion to the activity feed
 * @param {string} trainingId - e.g. 'deepthroat', 'heel', 'kegel'
 * @param {number} level - Current level completed
 * @param {string} [customMessage] - Optional custom message
 */
export async function logTrainingCompletion(trainingId, level, customMessage = null) {
  try {
    const user = await requireAuth();
    
    const trainingNames = {
      'deepthroat': 'Deepthroat',
      'heel': 'Heel Training',
      'kegel': 'Kegel',
      'positions': 'Positions',
      'anal-plug': 'Anal Plug',
      'the-5': 'The 5 Training'
    };

    const name = trainingNames[trainingId] || trainingId;
    const message = customMessage || `Completed ${name} (Level ${level})`;

    await addDoc(dataCol('notes'), {
      content: message,
      type: 'training',
      trainingId: trainingId,
      level: level,
      timestamp: serverTimestamp()
    });

    console.log(`Training log saved: ${message}`);
  } catch (error) {
    console.error('Failed to log training completion:', error);
  }
}