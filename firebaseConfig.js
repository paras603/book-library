import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCEU7K43CXqi4XkSR1fOWWJmdiDghepgdQ",
  authDomain: "book-library-702b0.firebaseapp.com",
  projectId: "book-library-702b0",
  storageBucket: "book-library-702b0.firebasestorage.app",
  messagingSenderId: "888889850683",
  appId: "1:888889850683:web:a5153f169894db6e80951e"
};

// Ensure Firebase initializes only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];


const db = getFirestore();
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

export { db, auth };
