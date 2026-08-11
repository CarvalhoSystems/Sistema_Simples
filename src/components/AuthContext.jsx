import React, { createContext, useState, useContext, useEffect } from "react";
import {
  firebaseDisponivel,
  auth as firebaseAuth,
  db,
} from "../services/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  clearTenant,
  setTenant,
  setTenantByEmail,
  getTenantId,
  getTenantByEmail,
  normalizeEmail,
  getTenant,
} from "../hooks/useTenant";
import { carregarAssinatura } from "../services/planoManager";
import { carregarTenantFirebase } from "../services/firebaseData";
import {
  getEstabelecimentoAtivoId,
  getEstabelecimentoAtivo,
} from "../services/estabelecimentoManager";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Escuta mudanças no estado de autenticação do Firebase
  useEffect(() => {
    if (firebaseDisponivel && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(
        firebaseAuth,
        async (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email,
            });

            // **RESTAURA O TENANT** ao recarregar a página
            // Isso garante que o usuário volte para o mesmo estabelecimento
            // mesmo após atualizar a página ou abrir em outro dispositivo
            try {
              const tenantDataFromFirebase = await carregarTenantFirebase(
                firebaseUser.uid,
              );
              const tenantInfo =
                tenantDataFromFirebase?.info || tenantDataFromFirebase || {};

              let tenantData = {
                ...tenantInfo,
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                nome:
                  tenantInfo.nome ||
                  firebaseUser.displayName ||
                  firebaseUser.email,
                nomeEstabelecimento:
                  tenantInfo.nomeEstabelecimento ||
                  firebaseUser.displayName ||
                  firebaseUser.email,
                ramo: tenantInfo.ramo || "mercado",
                criadoEm: tenantInfo.criadoEm || new Date().toISOString(),
              };

              // Restaura o estabelecimento ativo (sincronizado entre dispositivos)
              const estabAtivoId = await getEstabelecimentoAtivoId();
              const estabAtivo = await getEstabelecimentoAtivo();
              if (estabAtivoId && estabAtivo) {
                tenantData = {
                  ...tenantData,
                  id: estabAtivoId,
                  nomeEstabelecimento: estabAtivo.nome,
                  ramo: estabAtivo.ramo || tenantData.ramo,
                  estabelecimentoAtivo: estabAtivoId,
                };
              }

              setTenant(tenantData);
            } catch (error) {
              console.warn("Erro ao restaurar tenant:", error);
            }
          }
          setCarregando(false);
        },
      );
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

  // Login local (demo sem Firebase)
  const loginLocal = async (email, password) => {
    const tenantData = getTenantByEmail(email);

    if (!tenantData) {
      // Tenta buscar o tenant ativo
      const tenantAtivo = getTenant();
      if (
        tenantAtivo &&
        normalizeEmail(tenantAtivo.email) === normalizeEmail(email)
      ) {
        // Verifica bloqueio
        const tenantId = tenantAtivo.id || tenantAtivo.uid;
        if (tenantId) {
          const assinatura = await carregarAssinatura(true);
          if (assinatura && assinatura.bloqueado) {
            return {
              bloqueado: true,
              mensagem:
                "Sua conta foi bloqueada. Entre em contato com o suporte.",
            };
          }
        }
      }
      return null;
    }

    // Verifica se o cliente está bloqueado
    const tenantId = tenantData.id || tenantData.uid;
    if (tenantId) {
      const assinatura = await carregarAssinatura(true);
      if (assinatura && assinatura.bloqueado) {
        return {
          bloqueado: true,
          mensagem: "Sua conta foi bloqueada. Entre em contato com o suporte.",
        };
      }
    }

    const userData = {
      uid: tenantData.id || tenantData.uid,
      email: tenantData.email,
      name: tenantData.nome || tenantData.email,
    };

    setUser(userData);
    sessionStorage.setItem("pdv_session_user", JSON.stringify(userData));
    setTenant(tenantData);

    return userData;
  };

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

        // Define o tenant automaticamente após login
        const tenantData = {
          id: result.user.uid,
          uid: result.user.uid,
          nome: result.user.displayName || result.user.email,
          nomeEstabelecimento: result.user.displayName || result.user.email,
          email: result.user.email,
          ramo: "mercado",
          criadoEm: new Date().toISOString(),
        };
        setTenant(tenantData);

        // Verifica se o cliente está bloqueado (busca direta do Firebase)
        const tenantId = getTenantId();
        if (tenantId && db) {
          try {
            const docRef = doc(db, "tenants", tenantId);
            const docSnap = await getDoc(docRef);
            if (
              docSnap.exists() &&
              docSnap.data().assinatura &&
              docSnap.data().assinatura.bloqueado
            ) {
              // Cliente bloqueado - faz logout e retorna erro
              await logout();
              return {
                bloqueado: true,
                mensagem:
                  "Sua conta foi bloqueada. Entre em contato com o suporte.",
              };
            }
          } catch (error) {
            console.warn("Erro ao verificar bloqueio no Firebase:", error);
          }
        }

        return userData; // Retorna os dados do usuário em vez de true
      } catch (error) {
        console.warn("Erro no login Firebase:", error.code);
        // Se for erro de configuração, cai no fallback
        if (error.code === "auth/configuration-not-found") {
          return loginLocal(email, password);
        }
        return null; // Retorna null em caso de falha
      }
    }

    // Fallback: login local (demo)
    return loginLocal(email, password);
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
        const tenantData = {
          id: result.user.uid,
          uid: result.user.uid,
          nome,
          nomeEstabelecimento: estabelecimento,
          email,
          ramo,
          criadoEm: new Date().toISOString(),
        };
        setTenant(tenantData);
        // Salva também vinculado ao email para recuperação futura
        setTenantByEmail(email, tenantData);

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

    const tenantData = {
      id: userData.uid,
      uid: userData.uid,
      nome,
      nomeEstabelecimento: estabelecimento,
      email,
      ramo,
      criadoEm: new Date().toISOString(),
    };
    setTenant(tenantData);
    // Salva também vinculado ao email para recuperação futura
    setTenantByEmail(email, tenantData);

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
