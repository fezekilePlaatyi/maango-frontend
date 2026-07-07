import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCgWjS3XcXcxReBqiUSJoxKUmP1z6G6nD8",
  authDomain: "myqwiktip-dev.firebaseapp.com",
  projectId: "myqwiktip-dev",
  storageBucket: "myqwiktip-dev.firebasestorage.app",
  messagingSenderId: "65767116084",
  appId: "1:65767116084:web:2d5160415a9c16ba212961",
  measurementId: "G-J36578WYXM",
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
