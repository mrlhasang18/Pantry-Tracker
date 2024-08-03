// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDs-Y4_TsbOgzogeuh0C9CDJ0jKLZxJGCM",
  authDomain: "lama-inventory.firebaseapp.com",
  projectId: "lama-inventory",
  storageBucket: "lama-inventory.appspot.com",
  messagingSenderId: "423637112591",
  appId: "1:423637112591:web:e3f2e93e0f16dbf44a507a",
  measurementId: "G-RMRYTN6GWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

//for accessing
export {firestore}