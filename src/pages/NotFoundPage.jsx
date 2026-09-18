import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.errorCode}>404</h1>
        <h2 style={styles.title}>Página não encontrada</h2>
        <p style={styles.description}>
          Ops! Parece que a página que você está procurando não existe, foi
          removida ou o endereço foi digitado incorretamente.
        </p>
        <Link to="/" style={styles.button}>
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
}

// Estilos inline para facilitar a aplicação imediata (pode ser substituído por CSS Modules ou Tailwind)
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    fontFamily: "sans-serif",
    textAlign: "center",
    padding: "20px",
  },
  content: {
    maxWidth: "480px",
  },
  errorCode: {
    fontSize: "6rem",
    fontWeight: "800",
    color: "#cbd5e1",
    margin: "0 0 10px 0",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "700",
    margin: "0 0 15px 0",
  },
  description: {
    fontSize: "1rem",
    color: "#64748b",
    lineHeight: "1.5",
    margin: "0 0 30px 0",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "background-color 0.2s",
  },
};
