import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCzN5beetIjIAZ0FyrS2-gz16p7toSh97E",
  authDomain: "sales-app-12819.firebaseapp.com",
  projectId: "sales-app-12819",
  storageBucket: "sales-app-12819.firebasestorage.app",
  messagingSenderId: "235915717368",
  appId: "1:235915717368:web:f6f8a4c1f154ce9873a90d"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)