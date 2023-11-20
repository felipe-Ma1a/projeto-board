import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfbXw3pB1GfcbKCjTqw4M3GfKSLZrHcio",
  authDomain: "tarefas-a6302.firebaseapp.com",
  projectId: "tarefas-a6302",
  storageBucket: "tarefas-a6302.appspot.com",
  messagingSenderId: "601966026359",
  appId: "1:601966026359:web:b5da504d17f4aa837fb072",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export { db };
