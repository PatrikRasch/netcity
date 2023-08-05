import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDAdQFrVmnFOfX8B4W_J5sIBMHAhBgGvrU",
  authDomain: "top-netcity.firebaseapp.com",
  projectId: "top-netcity",
  storageBucket: "top-netcity.appspot.com",
  messagingSenderId: "240729259839",
  appId: "1:240729259839:web:ab67d5608c3ef35a005d8a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();
firestore.enablePersistence().catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a time.
    console.log("Multiple tabs open.");
  } else if (err.code === "unimplemented") {
    // The current browser does not support all of the
    // features required to enable persistence.
    console.log("Browser does not support persistence.");
  }
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
