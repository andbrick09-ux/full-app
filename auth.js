// ============================================================
//  Dom Sub Hub — auth.js
//  Shared authentication & relationship helpers.
//  All pages import from this module.
// ============================================================

import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Auth state ────────────────────────────────────────────────────────────────

/**
 * Returns a Promise that resolves with the current Firebase User,
 * or redirects to login.html if not signed in.
 */
export function requireAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) {
        window.location.href = 'login.html';
      } else {
        resolve(user);
      }
    });
  });
}

/**
 * Returns a Promise that resolves with the Firebase User or null
 * (does NOT redirect — use this on login.html itself).
 */
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

// ── Sign in / Sign up / Sign out ──────────────────────────────────────────────

export async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email, password, displayName, role) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;

  // Write user profile doc
  await setDoc(doc(db, 'users', uid), {
    displayName,
    role,          // 'dom' | 'sub'
    email,
    relationshipId: null,
    createdAt: serverTimestamp()
  });

  return cred;
}

export async function logOut() {
  await signOut(auth);
  window.location.href = 'login.html';
}

// ── Profile helpers ───────────────────────────────────────────────────────────

/**
 * Returns the current user's Firestore profile document data.
 */
export async function getMyProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Returns the relationship document { domId, subId, status }.
 * Returns null if no relationship exists yet.
 */
export async function getRelationship() {
  const profile = await getMyProfile();
  if (!profile?.relationshipId) return null;
  const snap = await getDoc(doc(db, 'relationships', profile.relationshipId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Returns the Firebase UID of the partner (Dom or Sub).
 */
export async function getPartnerUid() {
  const rel = await getRelationship();
  if (!rel) return null;
  const me = auth.currentUser.uid;
  return rel.domId === me ? rel.subId : rel.domId;
}

/**
 * Returns 'dom' | 'sub' | null
 */
export async function getMyRole() {
  const profile = await getMyProfile();
  return profile?.role ?? null;
}

// ── Relationship pairing ──────────────────────────────────────────────────────

/**
 * Dom sends a pairing invite to Sub's email.
 * Creates a /relationships doc with status: 'pending'.
 */
export async function sendPairingInvite(subEmail) {
  const dom = auth.currentUser;
  if (!dom) throw new Error('Not signed in');

  // Look up Sub's user by email
  const q = query(collection(db, 'users'), where('email', '==', subEmail));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('No account found with that email. Ask your Sub to create an account first.');

  const subDoc  = snap.docs[0];
  const subData = subDoc.data();

  if (subData.role !== 'sub') throw new Error('That account is not registered as a Sub.');
  if (subData.relationshipId) throw new Error('That Sub is already paired with someone.');

  // Create relationship
  const relRef = await addDoc(collection(db, 'relationships'), {
    domId:     dom.uid,
    subId:     subDoc.id,
    status:    'pending',
    createdAt: serverTimestamp()
  });

  // Mark Dom as pending
  await updateDoc(doc(db, 'users', dom.uid), { relationshipId: relRef.id });

  return relRef.id;
}

/**
 * Sub accepts a pending pairing invite.
 */
export async function acceptPairingInvite() {
  const sub     = auth.currentUser;
  const profile = await getMyProfile();

  // Find pending relationship for this sub
  const q    = query(collection(db, 'relationships'), where('subId', '==', sub.uid), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('No pending invite found.');

  const relDoc = snap.docs[0];
  await updateDoc(doc(db, 'relationships', relDoc.id), { status: 'active' });
  await updateDoc(doc(db, 'users', sub.uid), { relationshipId: relDoc.id });

  return relDoc.id;
}

/**
 * Unpairs the current user from their partner.
 * Sets the relationship status to 'inactive' and clears relationshipId
 * on both users' profiles.
 */
export async function unpair() {
  const me = auth.currentUser;
  if (!me) throw new Error('Not signed in');

  const profile = await getMyProfile();
  if (!profile?.relationshipId) {
    throw new Error('You are not currently paired with anyone.');
  }

  const relId = profile.relationshipId;

  // Load the relationship to know who the partner is
  const relSnap = await getDoc(doc(db, 'relationships', relId));
  if (!relSnap.exists()) {
    // Clean up orphaned reference
    await updateDoc(doc(db, 'users', me.uid), { relationshipId: null });
    throw new Error('Relationship record not found. Cleared stale reference.');
  }

  const relData = relSnap.data();
  const partnerUid = relData.domId === me.uid ? relData.subId : relData.domId;

  // Mark as inactive
  await updateDoc(doc(db, 'relationships', relId), {
    status: 'inactive',
    unpairedAt: serverTimestamp()
  });

  // Clear relationshipId on both sides
  await updateDoc(doc(db, 'users', me.uid), { relationshipId: null });
  if (partnerUid) {
    await updateDoc(doc(db, 'users', partnerUid), { relationshipId: null });
  }

  return true;
}

// ── Data path helpers ─────────────────────────────────────────────────────────

/**
 * Returns a Firestore document reference for the current user's data.
 * Usage: dataRef('settings')  →  /data/{uid}/settings
 */
export function dataRef(path) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  return doc(db, 'data', uid, ...path.split('/'));
}

/**
 * Returns a Firestore collection reference for the current user's data.
 * Usage: dataCol('scenes')  →  /data/{uid}/scenes
 */
export function dataCol(path) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  return collection(db, 'data', uid, ...path.split('/'));
}

/**
 * Returns a Firestore document reference for the partner's data.
 */
export async function partnerDataRef(path) {
  const partnerUid = await getPartnerUid();
  if (!partnerUid) throw new Error('No partner linked');
  return doc(db, 'data', partnerUid, ...path.split('/'));
}

export async function partnerDataCol(path) {
  const partnerUid = await getPartnerUid();
  if (!partnerUid) throw new Error('No partner linked');
  return collection(db, 'data', partnerUid, ...path.split('/'));
}

/**
 * Reads the settings document for a given uid.
 * Returns the settings data object, or {} if not found.
 */
export async function getSettings(uid) {
  const snap = await getDoc(doc(db, 'data', uid, 'settings'));
  return snap.exists() ? snap.data() : {};
}