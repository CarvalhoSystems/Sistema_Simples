import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function InputSenha({
  label = "Senha / PIN",
  name = "senha",
  value,
  onChange,
  placeholder = "Digite...",
  style = {},
  inputStyle = {},
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div style={{ marginBottom: "1rem", ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#475569",
            marginBottom: "0.25rem",
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <input
          type={mostrar ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "0.5rem",
            paddingRight: "2.5rem", // Espaço reservado para o ícone não tampar o texto
            border: "1px solid #cbd5e1",
            borderRadius: "0.375rem",
            fontSize: "0.9rem",
            backgroundColor: "#fff",
            ...inputStyle,
          }}
        />

        <button
          type="button"
          onClick={() => setMostrar(!mostrar)}
          style={{
            position: "absolute",
            right: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            padding: "0.25rem",
          }}
          title={mostrar ? "Ocultar" : "Visualizar"}
        >
          {mostrar ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
