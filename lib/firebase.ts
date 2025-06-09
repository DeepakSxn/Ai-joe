import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBw37JHob_sRsXCLPLLIj3Eg0jwP1QDc8o",
  authDomain: "ai-joe-7e82d.firebaseapp.com",
  projectId: "ai-joe-7e82d",
  storageBucket: "ai-joe-7e82d.firebasestorage.app",
  messagingSenderId: "821656626441",
  appId: "1:821656626441:web:1206a61e3799e9cb6b1fd8",
  measurementId: "G-Y9EL3YGR29"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db }; 