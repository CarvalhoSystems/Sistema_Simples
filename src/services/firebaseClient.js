/**
 * Configuração do Firebase
 *
 * COMO CONFIGURAR:
 * 1. Acesse https://console.firebase.google.com
 * 2. Crie um projeto (ex: "system-pdv")
 * 3. Vá em Authentication → Sign-in method → Email/Password → Ativar
 * 4. Vá em Firestore Database → Criar banco → Modo teste
 * 5. Vá em Project Settings → Seu app Web (</>) → Copiar config
 * 6. Cole as chaves no arquivo .env
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Flag que indica se o Firebase está configurado
export const firebaseDisponivel = !!(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;

if (firebaseDisponivel) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);

    if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
      connectAuthEmulator(auth, "http://localhost:9099");
      connectFirestoreEmulator(db, "localhost", 8080);
    }

    console.log("🔥 Firebase conectado:", firebaseConfig.projectId);
  } catch (error) {
    console.warn("⚠️ Erro ao inicializar Firebase:", error.message);
  }
} else {
  console.log("💾 Firebase não configurado. Usando localStorage.");
}

export { auth, db, app };
export default app;
