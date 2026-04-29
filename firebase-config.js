// ============================================================
//  Dom Sub Hub — Firebase Configuration
//  Import this in every page that needs Firebase access.
// ============================================================
import { initializeApp }    from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth }          from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore }     from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            "AIzaSyAV7Tmfw06rgKEY5LVOmR8bSmH0UrjB314",
  authDomain:        "dom-sub-hub-3e530.firebaseapp.com",
  projectId:         "dom-sub-hub-3e530",
  storageBucket:     "dom-sub-hub-3e530.firebasestorage.app",
  messagingSenderId: "672279944225",
  appId:             "1:672279944225:web:18acb9fb8158a1f14b1760"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export { app, auth, db };
