import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAj8VFfJgcOIAVu-JBnb__eIFMntxJaJjE",
  authDomain: "admin-izabel-resende.firebaseapp.com",
  projectId: "admin-izabel-resende",
  storageBucket: "admin-izabel-resende.firebasestorage.app",
  messagingSenderId: "770177416161",
  appId: "1:770177416161:web:cac0e58d3c4f1e2624f0a0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
