// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { Firestore, getFirestore } from "firebase/firestore";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHLu8Ss-Onl-yaAHL1gPi4YU-AhcPusBI",
  authDomain: "cp2-mobile-2tdspx.firebaseapp.com",
  projectId: "cp2-mobile-2tdspx",
  storageBucket: "cp2-mobile-2tdspx.firebasestorage.app",
  messagingSenderId: "529135404603",
  appId: "1:529135404603:web:8fb8c8693b49ad66f4fe1e",
  measurementId: "G-3TH41QWTT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app)
// const analytics = getAnalytics(app);