// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqDJ5Sarm416EJ5TcB-YS92wTDXs2O5rU",
  authDomain: "silent-class-35c72.firebaseapp.com",
  projectId: "silent-class-35c72",
  storageBucket: "silent-class-35c72.appspot.com",
  messagingSenderId: "384964827543",
  appId: "1:384964827543:web:577e9912383cbbf2c68cd2",
  measurementId: "G-VDZF9LRJJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };