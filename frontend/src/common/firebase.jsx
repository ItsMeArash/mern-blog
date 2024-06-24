// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBg0QYFQgkUVW9A478Bi7HCkeWNMXV3RAQ",
    authDomain: "mern-blog-6eb87.firebaseapp.com",
    projectId: "mern-blog-6eb87",
    storageBucket: "mern-blog-6eb87.appspot.com",
    messagingSenderId: "423168589916",
    appId: "1:423168589916:web:54682ca8793c305c262699"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Google auth
const provider = new GoogleAuthProvider()

const auth = getAuth();

const authWithGoogle = async () => {
    let user = null;
    await signInWithPopup(auth, provider)
        .then(result => {
            user = result.user;
        })
        .catch(err => {
            console.log(err)
        })
    return user;
}

export {authWithGoogle};