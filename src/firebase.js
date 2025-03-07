// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQxA-ZU7fcWehR91boKzSkX32qGLIBqW4",
  authDomain: "control-gastos-54f2a.firebaseapp.com",
  projectId: "control-gastos-54f2a",
  storageBucket: "control-gastos-54f2a.firebasestorage.app",
  messagingSenderId: "936076380258",
  appId: "1:936076380258:web:653c85c94af2a2c254293b",
  measurementId: "G-5GFRXYD8VX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
