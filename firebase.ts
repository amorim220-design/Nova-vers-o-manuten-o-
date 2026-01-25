import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

if (!apiKey) {
  // Isso evita “tela branca silenciosa”
  console.error(
    "[FIREBASE] VITE_FIREBASE_API_KEY está vazio. " +
      "Você precisa definir isso no build (GitHub Actions / .env)."
  );
  // Você pode lançar erro pra aparecer no seu showError do index.tsx:
  throw new Error("FIREBASE ENV MISSING: VITE_FIREBASE_API_KEY");
}

const firebaseConfig = {
  apiKey,
  authDomain: "manutencao-c65c0.firebaseapp.com",
  projectId: "manutencao-c65c0",
  storageBucket: "manutencao-c65c0.appspot.com",
  messagingSenderId: "93018223031",
  appId: "1:93018223031:web:697a49eead94371e2cb832",
  measurementId: "G-M8LC4MGKJQ",
};

// Evita reinicializar (bom pra hot reload e também pra evitar duplicação)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
