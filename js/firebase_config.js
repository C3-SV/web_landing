// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
//import { getAnalytics } from "firebase/analytics";
import { getAuth} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCLNj65uwgORStzqR7FulNIuDT7lqnaE5s",
    authDomain: "landing-c3.firebaseapp.com",
    projectId: "landing-c3",
    storageBucket: "landing-c3.firebasestorage.app",
    messagingSenderId: "911691009600",
    appId: "1:911691009600:web:e8c1433f78823634b0d9a5",
    measurementId: "G-Z2JB5KBFZK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//export const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {app, db, auth, storage}; 