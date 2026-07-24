import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Simula um login. Em um projeto real, isso faria uma chamada a um backend.
  const login = (username, password) => {
    // Credenciais Fictícias para teste
    if (username === "gerente" && password === "1234") {
      const userData = { name: username };
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => useContext(AuthContext);
