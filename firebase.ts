import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuração do Firebase com as credenciais do seu projeto.
const firebaseConfig = {
  apiKey: "AIzaSyBFCuhoJ6TDvLrivaGU-hukjxOQEEkMck8",
  authDomain: "manutencao-c65c0.firebaseapp.com",
  projectId: "manutencao-c65c0",
  storageBucket: "manutencao-c65c0.appspot.com",
  messagingSenderId: "93018223031",
  appId: "1:93018223031:web:697a49eead94371e2cb832",
  measurementId: "G-M8LC4MGKJQ"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as instâncias dos serviços para serem usadas no aplicativo
export const db = getFirestore(app);
export const auth = getAuth(app);
