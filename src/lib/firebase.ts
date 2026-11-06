import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBvP_2jadwuuhQU3jJxWIHqWSSvukdfYLg",
  authDomain: "maamgoonline.firebaseapp.com",
  projectId: "maamgoonline",
  storageBucket: "maamgoonline.firebasestorage.app",
  messagingSenderId: "842655598000",
  appId: "1:842655598000:web:1bd90faa7fa71b94a9c275",
  measurementId: "G-TNWPLVZGH6",
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const functions = getFunctions(firebaseApp);
export const storage = getStorage(firebaseApp);

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) getAnalytics(firebaseApp);
  });
}
