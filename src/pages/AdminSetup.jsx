import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseDisponivel, auth, db } from "../services/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "carvalho_borges@icloud.com";

export default function AdminSetup() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [adminExiste, setAdminExiste] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const navigate = useNavigate();

  // Verifica se o admin já foi criado
  useEffect(() => {
    async function verificarAdmin() {
      if (!firebaseDisponivel || !db) {
        setAdminExiste("no_firebase");
        setVerificando(false);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, "_admin", "config"));
        if (adminDoc.exists() && adminDoc.data().criado) {
          setAdminExiste(true);
        } else {
          setAdminExiste(false);
        }
      } catch (e) {
        console.warn("Erro ao verificar admin:", e);
        setAdminExiste(false);
      }
      setVerificando(false);
    }

    verificarAdmin();
  }, []);

  const handleSetup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    if (!firebaseDisponivel || !auth || !db) {
      setError(
        "Firebase não está configurado. Verifique seu arquivo .env e se o Firebase está ativo no console.",
      );
      return;
    }

    setCarregando(true);

    try {
      // Cria o usuário admin no Firebase Auth
      const result = await createUserWithEmailAndPassword(
        auth,
        ADMIN_EMAIL,
        password,
      );

      // Salva no Firestore que o admin foi criado
      await setDoc(doc(db, "_admin", "config"), {
        criado: true,
        uid: result.user.uid,
        email: ADMIN_EMAIL,
        criadoEm: new Date().toISOString(),
      });

      setSuccess("✅ Admin criado com sucesso! Redirecionando para o login...");

      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (err) {
      console.error("Erro ao criar admin:", err);

      if (err.code === "auth/email-already-in-use") {
        // Se o usuário já existe no Auth mas não no Firestore, salva a referência
        try {
          await setDoc(doc(db, "_admin", "config"), {
            criado: true,
            email: ADMIN_EMAIL,
            criadoEm: new Date().toISOString(),
            observacao: "Usuário já existia no Auth",
          });
          setSuccess("✅ Admin já existia. Configuração finalizada!");
          setTimeout(() => navigate("/admin/login"), 2000);
          return;
        } catch (e2) {
          setError(
            "O email admin já está cadastrado no Firebase Auth. Faça login diretamente.",
          );
          setTimeout(() => navigate("/admin/login"), 3000);
          return;
        }
      }

      setError(`Erro: ${err.message}`);
    } finally {
      setCarregando(false);
    }
  };

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-yellow-500 mb-4"></i>
          <p className="text-gray-400">Verificando configuração...</p>
        </div>
      </div>
    );
  }

  if (adminExiste === "no_firebase") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-yellow-500 text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Firebase não configurado
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Para usar o painel admin, você precisa ativar o Firebase
            Authentication e Firestore Database no console do Firebase.
          </p>
          <a
            href={`https://console.firebase.google.com/project/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/authentication`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Ir para Firebase Console
          </a>
        </div>
      </div>
    );
  }

  if (adminExiste === true) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check-circle text-green-500 text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Admin já configurado
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            O administrador já foi criado. Vá para a página de login admin.
          </p>
          <button
            onClick={() => navigate("/admin/login")}
            className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Ir para Login Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
            <i className="fas fa-crown text-gray-900 text-4xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white">Configurar Admin</h1>
          <p className="text-gray-400 text-sm mt-1">
            Crie o usuário administrador do sistema
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6 text-sm text-blue-300">
            <p className="font-medium flex items-center gap-2 mb-1">
              <i className="fas fa-info-circle"></i>
              Email do admin:
            </p>
            <p className="font-mono text-blue-200">{ADMIN_EMAIL}</p>
            <p className="mt-2 text-blue-400 text-xs">
              Este email está definido no arquivo .env como VITE_ADMIN_EMAIL
            </p>
          </div>

          <form onSubmit={handleSetup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Senha do Admin
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                placeholder="Repita a senha"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 text-sm text-green-300 flex items-center gap-2">
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full px-4 py-3 font-semibold text-gray-900 bg-yellow-500 rounded-lg hover:bg-yellow-400 shadow-lg shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Criando Admin...
                </>
              ) : (
                <>
                  <i className="fas fa-crown"></i>
                  Criar Administrador
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Esta página só pode ser usada uma vez. Após criar o admin, use a
              página de login.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/admin/login")}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <i className="fas fa-arrow-left mr-1"></i>
            Já tenho admin. Ir para login
          </button>
        </div>
      </div>
    </div>
  );
}
