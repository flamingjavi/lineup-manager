// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpiwLCZaamh9pGytYWtzJfeeOCAortZQg",
  authDomain: "lineup-manager-5c6c0.firebaseapp.com",
  projectId: "lineup-manager-5c6c0",
  storageBucket: "lineup-manager-5c6c0.firebasestorage.app",
  messagingSenderId: "1021532423933",
  appId: "1:1021532423933:web:3d7924b43e79dc96746094",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);