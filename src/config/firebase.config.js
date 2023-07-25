import { initializeApp } from "firebase/app";
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

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
