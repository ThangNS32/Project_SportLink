import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA4KaKJqK9VvucEA1Vc_EmRTbD_bgOSE1o",
    authDomain: "sportlink-chat.firebaseapp.com",
    projectId: "sportlink-chat",
    storageBucket: "sportlink-chat.firebasestorage.app",
    messagingSenderId: "762758416489",
    appId: "1:762758416489:web:708d021f4f136fa31bfaf8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);