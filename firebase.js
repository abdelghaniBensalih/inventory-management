// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore }  from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgSVmkapIMBEKZoUkVtl2gZDBwJoSB_vw",
  authDomain: "inventory-management-db48b.firebaseapp.com",
  projectId: "inventory-management-db48b",
  storageBucket: "inventory-management-db48b.appspot.com",
  messagingSenderId: "387171182248",
  appId: "1:387171182248:web:4d6feeecd3f1792466c49d",
  measurementId: "G-12XCMFXNLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestor(app)

export { firestore }