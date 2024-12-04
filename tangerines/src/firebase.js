// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from "firebase/compat/app";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuJ4ZqhkRzuazpYoZBwQv2maRFznAlNcI",
  authDomain: "tangerines-7f2c8.firebaseapp.com",
  projectId: "tangerines-7f2c8",
  storageBucket: "tangerines-7f2c8.firebasestorage.app",
  messagingSenderId: "1051755758274",
  appId: "1:1051755758274:web:2e2f3780c17cb932abf15b",
  measurementId: "G-XM0F0L8PKT"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage().ref(); //.ref() is a reference to the root of our bucket
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, storage, provider, firebase, doc, getDoc };