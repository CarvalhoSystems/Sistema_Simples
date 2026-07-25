import React, { createContext, useState, useContext, useEffect } from "react";
import {
  firebaseDisponivel,
  auth as firebaseAuth,
} from "../services/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { clearTenant, setTenant } from "../hooks/useTenant";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Escuta mudanças no estado de autenticação do Firebase
  useEffect(() => {
    if (firebaseDisponivel && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email,
          });
        }
        setCarregando(false);
      });
      return () => unsubscribe();
    } else {
      // Sem Firebase: verifica se tem usuário no sessionStorage
      const sessionUser = sessionStorage.getItem("pdv_session_user");
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
      setCarregando(false);
    }
  }, []);

  // Login com Firebase (fallback para demo se não configurado)
  const login = async (email, password) => {
    // Tenta Firebase primeiro
    if (firebaseDisponivel && firebaseAuth) {
      try {
        const result = await signInWithEmailAndPassword(
          firebaseAuth,
          email,
          password,
        );
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || result.user.email,
        };
        setUser(userData);
        return true;
      } catch (error) {
        console.warn("Erro no login Firebase:", error.code);
        // Se for erro de configuração, cai no fallback
        if (error.code === "auth/configuration-not-found") {
          return loginLocal(email, password);
        }
        return false;
      }
    }

    // Fallback: login local (demo)
    return loginLocal(email, password);
  };

  // Login local para demonstração (sem Firebase)
  const loginLocal = (email, password) => {
    // Aceita qualquer email com senha "1234" ou "admin" para teste
    if (password === "1234" || password === "admin" || email === "admin") {
      const userData = {
        uid: `local_${Date.now()}`,
        email: email || "admin@demo.com",
        name: email || "Administrador",
      };
      setUser(userData);
      sessionStorage.setItem("pdv_session_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  // Cadastro com Firebase (fallback para localStorage)
  const signup = async (email, password, nome, estabelecimento, ramo) => {
    if (firebaseDisponivel && firebaseAuth) {
      try {
        const result = await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password,
        );
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          name: nome || email,
        };
        setUser(userData);

        // Salva dados do tenant no Firestore (via tenantData js)
        setTenant({
          id: result.user.uid,
          uid: result.user.uid,
          nome,
          nomeEstabelecimento: estabelecimento,
          email,
          ramo,
          criadoEm: new Date().toISOString(),
        });

        return { success: true, user: userData };
      } catch (error) {
        console.error("Erro no cadastro Firebase:", error);
        return { success: false, error: error.message };
      }
    }

    // Fallback: cadastro local
    const userData = {
      uid: `local_${Date.now()}`,
      email,
      name: nome,
    };
    setUser(userData);
    sessionStorage.setItem("pdv_session_user", JSON.stringify(userData));

    setTenant({
      id: userData.uid,
      uid: userData.uid,
      nome,
      nomeEstabelecimento: estabelecimento,
      email,
      ramo,
      criadoEm: new Date().toISOString(),
    });

    return { success: true, user: userData };
  };

  // Logout
  const logout = async () => {
    if (firebaseDisponivel && firebaseAuth) {
      try {
        await signOut(firebaseAuth);
      } catch (error) {
        console.warn("Erro no logout Firebase:", error);
      }
    }

    setUser(null);
    sessionStorage.removeItem("pdv_session_user");
    clearTenant();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        signup,
        logout,
        carregando,
        firebaseDisponivel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => useContext(AuthContext);
