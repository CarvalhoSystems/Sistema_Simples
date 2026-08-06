import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTenant, setTenant } from "../hooks/useTenant";
import Swal from "sweetalert2";


export default function Configuracoes() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeFantasia: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    pixKey: "",
    pixHolder: "",
    receiptMessage: "",
    cartaoProvedor: "manual_pos",
    mercadoPagoAccessToken: "",
    mercadoPagoDeviceId: "",
    mercadoPagoCommercialAddress: "",
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const tenant = getTenant();
    if (tenant) {
      setFormData({
        nomeFantasia: tenant.nomeFantasia || tenant.nomeEstabelecimento || "",
        telefone: tenant.telefone || "",
        cnpj: tenant.cnpj || "",
        endereco: tenant.endereco || "",
        pixKey: tenant.pixKey || "",
        pixHolder: tenant.pixHolder || "",
        receiptMessage: tenant.receiptMessage || "",
        cartaoProvedor: tenant.cartaoProvedor || "manual_pos",
        mercadoPagoAccessToken: tenant.mercadoPagoAccessToken || "",
        mercadoPagoDeviceId: tenant.mercadoPagoDeviceId || "",
        mercadoPagoCommercialAddress: tenant.mercadoPagoCommercialAddress || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const tenant = getTenant();
      if (!tenant) {
        Swal.fire(
          "Erro",
          "Nenhuma loja encontrada. Faça login novamente.",
          "error",
        );
        return;
      }

      const updatedTenant = {
        ...tenant,
        nomeFantasia: formData.nomeFantasia,
        nomeEstabelecimento:
          formData.nomeFantasia || tenant.nomeEstabelecimento,
        cnpj: formData.cnpj,
        endereco: formData.endereco,
        telefone: formData.telefone,
        pixKey: formData.pixKey,
        pixHolder: formData.pixHolder,
        receiptMessage: formData.receiptMessage,
        cartaoProvedor: formData.cartaoProvedor,
        mercadoPagoAccessToken: formData.mercadoPagoAccessToken,
        mercadoPagoDeviceId: formData.mercadoPagoDeviceId,
        mercadoPagoCommercialAddress: formData.mercadoPagoCommercialAddress,
      };

      setTenant(updatedTenant);

      Swal.fire(
        "Salvo!",
        "As configurações da loja foram salvas com sucesso.",
        "success",
      );
    } catch (error) {
      Swal.fire("Erro", "Ocorreu um erro ao salvar as configurações.", "error");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <header
        className="content-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "1.5rem",
          backgroundColor: "#fff",
          borderBottom: "1px solid #e2e8f0",
          borderRadius: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="header-title">
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <i className="fas fa-cog"></i> Configurações da Unidade
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#64748b",
              marginTop: "0.25rem",
            }}
          >
            Gerencie os dados que aparecem nos comprovantes e notas
          </p>
        </div>

        <div
          className="header-actions"
          style={{ display: "flex", gap: "0.75rem" }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={salvando}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
          >
            <i className="fas fa-save"></i>
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </header>

      <section
        className="settings-grid"
        style={{ display: "grid", gap: "1.5rem" }}
      >
        <form id="settingsForm" onSubmit={handleSave}>
          {/* Dados da Empresa */}
          <div
            className="settings-card"
            style={{
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              marginBottom: "1.5rem",
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
              <i className="fas fa-building"></i> Dados da Empresa
            </h3>
            <div
              className="form-group-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="nomeFantasia"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#475569",
                    marginBottom: "0.25rem",
                  }}
                >
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  id="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  placeholder="Ex: Papelaria do João"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.375rem",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="cnpj"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#475569",
                    marginBottom: "0.25rem",
                  }}
                >
                  CNPJ
                </label>
                <input
                  type="text"
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.375rem",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="endereco"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "0.25rem",
                }}
              >
                Endereço Completo
              </label>
              <input
                type="text"
                id="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Rua, Número, Bairro, Cidade - UF"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="telefone"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "0.25rem",
                }}
              >
                Telefone
              </label>
            </div>
            <input
              type="text"
              id="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "0.9rem",
              }}
            />
          </div>

          {/* Recebimentos PIX */}
          <div
            className="settings-card"
            style={{
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              marginBottom: "1.5rem",
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
              <i className="fas fa-wallet"></i> Recebimentos (PIX)
            </h3>
            <div
              className="form-group-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="pixKey"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#475569",
                    marginBottom: "0.25rem",
                  }}
                >
                  Chave PIX Principal
                </label>
                <input
                  type="text"
                  id="pixKey"
                  value={formData.pixKey}
                  onChange={handleChange}
                  placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.375rem",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="pixHolder"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#475569",
                    marginBottom: "0.25rem",
                  }}
                >
                  Nome do Titular
                </label>
                <input
                  type="text"
                  id="pixHolder"
                  value={formData.pixHolder}
                  onChange={handleChange}
                  placeholder="Nome completo ou Razão Social"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.375rem",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>
            <p
              className="helper-text"
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                marginTop: "0.5rem",
              }}
            >
              Esta chave será utilizada para gerar o QR Code no PDV.
            </p>
          </div>

          {/* Rodapé do Recibo */}
          <div
            className="settings-card"
            style={{
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              marginBottom: "1.5rem",
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
              <i className="fas fa-file-invoice-dollar"></i> Rodapé do Recibo
            </h3>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="receiptMessage"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "0.25rem",
                }}
              >
                Mensagem de Agradecimento
              </label>
              <textarea
                id="receiptMessage"
                rows="3"
                value={formData.receiptMessage}
                onChange={handleChange}
                placeholder="Ex: Obrigado pela preferência! Volte sempre."
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              ></textarea>
            </div>
          </div>

          {/* Integração Cartão / Maquininha */}
          <div
            className="settings-card"
            style={{
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              marginBottom: "1.5rem",
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
              <i className="fas fa-credit-card"></i> Pagamento com Cartão
            </h3>
            <p
              className="helper-text"
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                marginBottom: "15px",
              }}
            >
              Escolha o tipo de maquininha que você utiliza para receber
              pagamentos com cartão.
            </p>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="cartaoProvedor"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "0.25rem",
                }}
              >
                Tipo de Maquininha
              </label>
              <select
                id="cartaoProvedor"
                value={formData.cartaoProvedor}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#fff",
                }}
              >
                <option value="manual_pos">
                  Maquininha Física (Manual) - Qualquer marca (Cielo, Rede,
                  Stone, PagSeguro, etc.)
                </option>
                <option value="mercadopago">
                  Mercado Pago Point Smart/Pro (Integração Automática)
                </option>
                <option value="outros">Outros / Não sei</option>
              </select>
              <p
                className="helper-text"
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  marginTop: "0.5rem",
                }}
              >
                <i className="fas fa-info-circle"></i> Se você usa uma
                maquininha física de qualquer marca (Cielo, Rede, Stone,
                PagSeguro, etc.), selecione "Maquininha Física (Manual)". O
                sistema apenas registrará a venda após você confirmar o
                pagamento na maquininha.
              </p>
            </div>

            {formData.cartaoProvedor === "mercadopago" && (
              <>
                <p
                  className="helper-text"
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    marginBottom: "15px",
                  }}
                >
                  Configure sua maquininha Point Smart 2 para receber pagamentos
                  automáticos no cartão.
                </p>
                <div
                  className="form-group-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: "1rem" }}>
                    <label
                      htmlFor="mercadoPagoAccessToken"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#475569",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Access Token
                    </label>
                    <input
                      type="password"
                      id="mercadoPagoAccessToken"
                      value={formData.mercadoPagoAccessToken}
                      onChange={handleChange}
                      placeholder="Seu access token do Mercado Pago"
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "0.375rem",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "1rem" }}>
                    <label
                      htmlFor="mercadoPagoDeviceId"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#475569",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Device ID
                    </label>
                    <input
                      type="text"
                      id="mercadoPagoDeviceId"
                      value={formData.mercadoPagoDeviceId}
                      onChange={handleChange}
                      placeholder="ID do dispositivo da maquininha"
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "0.375rem",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label
                    htmlFor="mercadoPagoCommercialAddress"
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#475569",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Endereço Comercial (Opcional)
                  </label>
                  <input
                    type="text"
                    id="mercadoPagoCommercialAddress"
                    value={formData.mercadoPagoCommercialAddress}
                    onChange={handleChange}
                    placeholder="Endereço onde a maquininha está localizada"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "0.375rem",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <p
                  className="helper-text"
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    marginTop: "0.5rem",
                  }}
                >
                  <i className="fas fa-info-circle"></i> O Access Token e Device
                  ID são obtidos no painel do Mercado Pago Developers. Cada loja
                  pode ter sua própria configuração.
                </p>
              </>
            )}
          </div>

          {/* Botão Salvar no final do formulário */}
          <div style={{ textAlign: "right", marginTop: "1rem" }}>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium inline-flex"
            >
              <i className="fas fa-save"></i>
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}