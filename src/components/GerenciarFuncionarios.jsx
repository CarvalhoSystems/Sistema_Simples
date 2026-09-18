import React, { useState, useEffect } from "react";
import {
  getFuncionarios,
  addFuncionario,
  setFuncionarios,
} from "../services/tenantData";
import Swal from "sweetalert2";




export default function GerenciarFuncionarios() {
  const [funcionarios, setFuncionariosList] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [formFuncionario, setFormFuncionario] = useState({
    codigo: "",
    nome: "",
    senha: "",
    cargo: "Atendente",
    ativo: true,
  });

  useEffect(() => {
    carregarLista();
  }, []);

  const carregarLista = async () => {
    try {
      setCarregando(true);
      const lista = await getFuncionarios();
      setFuncionariosList(lista || []);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      Swal.fire("Erro", "Não foi possível carregar os funcionários.", "error");
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFuncionario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (
      !formFuncionario.nome ||
      !formFuncionario.codigo ||
      !formFuncionario.senha
    ) {
      Swal.fire("Atenção", "Preencha o nome, código (PIN) e senha.", "warning");
      return;
    }

    // TRAVA DE SEGURANÇA: Se tentar cadastrar alguém como "admin", exige confirmação extra
    if (formFuncionario.cargo?.toLowerCase() === "admin") {
      const { value: confirmacao } = await Swal.fire({
        title: "Atenção Crítica",
        text: "Você está criando/editando um usuário com privilérios de ADMIN. Deseja prosseguir?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, autorizar",
        cancelButtonText: "Cancelar",
      });
      if (!confirmacao) return;
    }

    setSalvando(true);
    try {
      if (editandoId) {
        // Edição de funcionário existente
        const atualizados = funcionarios.map((func) => {
          if (func.id === editandoId) {
            return { ...func, ...formFuncionario };
          }
          return func;
        });
        await setFuncionarios(atualizados);
        Swal.fire("Sucesso!", "Funcionário atualizado com sucesso.", "success");
      } else {
        // Adiciona usando a função pronta do tenantData
        await addFuncionario(formFuncionario);
        Swal.fire("Sucesso!", "Funcionário cadastrado com sucesso.", "success");
      }

      setFormFuncionario({
        codigo: "",
        nome: "",
        senha: "",
        cargo: "Atendente",
        ativo: true,
      });
      setEditandoId(null);
      carregarLista();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      Swal.fire(
        "Erro",
        error.message || "Não foi possível salvar o funcionário.",
        "error",
      );
    } finally {
      setSalvando(false);
    }
  };

  const preencherEdicao = (func) => {
    setEditandoId(func.id);
    setFormFuncionario({
      codigo: func.codigo || "",
      nome: func.nome || "",
      senha: func.senha || "",
      cargo: func.cargo || "Atendente",
      ativo: func.ativo !== undefined ? func.ativo : true,
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setFormFuncionario({
      codigo: "",
      nome: "",
      senha: "",
      cargo: "Atendente",
      ativo: true,
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "1.5rem",
        borderRadius: "0.5rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#334155",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "0.75rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <i className="fas fa-users"></i> Gestão de Funcionários / Caixas
      </h3>

      <form
        onSubmit={handleSalvar}
        style={{
          marginBottom: "1.5rem",
          background: "#f8fafc",
          padding: "1rem",
          borderRadius: "0.375rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <h4
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            marginBottom: "0.75rem",
            color: "#475569",
          }}
        >
          {editandoId ? "Editar Funcionário" : "Adicionar Novo Funcionário"}
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#475569",
                marginBottom: "0.25rem",
              }}
            >
              Código (PIN)
            </label>
            <input
              type="text"
              name="codigo"
              value={formFuncionario.codigo}
              onChange={handleChange}
              placeholder="Ex: 101"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "0.9rem",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#475569",
                marginBottom: "0.25rem",
              }}
            >
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={formFuncionario.nome}
              onChange={handleChange}
              placeholder="Nome completo"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "0.9rem",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#475569",
                marginBottom: "0.25rem",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              name="senha"
              value={formFuncionario.senha}
              onChange={handleChange}
              placeholder="Senha de acesso"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "0.9rem",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#475569",
                marginBottom: "0.25rem",
              }}
            >
              Cargo
            </label>
            <select
              name="cargo"
              value={formFuncionario.cargo}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "0.9rem",
                backgroundColor: "#fff",
              }}
            >
              <option value="Atendente">Atendente</option>
              <option value="Caixa">Caixa</option>
              <option value="Gerente">Gerente</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="submit"
            disabled={salvando}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "0.375rem",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            {salvando
              ? "Salvando..."
              : editandoId
                ? "Salvar Alterações"
                : "Adicionar Funcionário"}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicao}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#94a3b8",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Listagem */}
      <div>
        <h4
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            marginBottom: "0.75rem",
            color: "#475569",
          }}
        >
          Equipe Cadastrada
        </h4>
        {carregando ? (
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Carregando funcionários...
          </p>
        ) : funcionarios.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Nenhum funcionário cadastrado ainda.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #e2e8f0",
                    color: "#475569",
                  }}
                >
                  <th style={{ padding: "0.5rem" }}>PIN</th>
                  <th style={{ padding: "0.5rem" }}>Nome</th>
                  <th style={{ padding: "0.5rem" }}>Cargo</th>
                  <th style={{ padding: "0.5rem" }}>Status</th>
                  <th style={{ padding: "0.5rem", textAlign: "right" }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((func) => (
                  <tr
                    key={func.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {func.codigo}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        color: "#1e293b",
                        fontWeight: 500,
                      }}
                    >
                      {func.nome}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "#334155" }}>
                      {func.cargo}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <span
                        style={{
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          backgroundColor:
                            func.ativo !== false ? "#dcfce7" : "#fee2e2",
                          color: func.ativo !== false ? "#166534" : "#991b1b",
                        }}
                      >
                        {func.ativo !== false ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td
                      style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}
                    >
                      <button
                        type="button"
                        onClick={() => preencherEdicao(func)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#4f46e5",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
