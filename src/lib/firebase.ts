import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXrCpQYLwVB42dNGIO0Z32tN5f8WJwlwk",
  authDomain: "vasooli-bhai-app-fe0b7.firebaseapp.com",
  projectId: "vasooli-bhai-app-fe0b7",
  storageBucket: "vasooli-bhai-app-fe0b7.firebasestorage.app",
  messagingSenderId: "128041907630",
  appId: "1:128041907630:web:00fb411ecea1238988443f",
  measurementId: "G-JDLNJQ7E16"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
