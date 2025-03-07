import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQxA-ZU7fcWehR91boKzSkX32qGLIBqW4",
  authDomain: "control-gastos-54f2a.firebaseapp.com",
  projectId: "control-gastos-54f2a",
  storageBucket: "control-gastos-54f2a.appspot.com", 
  messagingSenderId: "936076380258",
  appId: "1:936076380258:web:c4bb45c9a866745754293b",
  measurementId: "G-RRN68VR5ZV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
