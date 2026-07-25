import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext.jsx";
import App from "./App.jsx";

import "./index.css";
import "./components/dashboard.css"; // Importa o novo estilo do dashboard
import "./components/relatorio.css"; // Importa o estilo da página de relatórios
import "./pages/config.css"; // Importa o estilo da página de configurações
import "./pages/suporte.css"; // Importa o estilo da página de suporte

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
