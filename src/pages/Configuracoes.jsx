import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Swal from "sweetalert2";

export default function Configuracoes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    storeName: "Papelaria do Zé",
    storeCnpj: "12.345.678/0001-99",
    storeAddress: "Rua Fictícia, 123, Centro, São Paulo - SP",
    pixKey: "email@example.com",
    pixHolder: "José da Silva",
    receiptMessage: "Obrigado pela preferência! Volte sempre.",
    mercadoPagoAccessToken: "",
    mercadoPagoDeviceId: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Em um app real, você enviaria 'settings' para sua API/backend
    console.log("Salvando configurações:", settings);
    Swal.fire({
      icon: "success",
      title: "Salvo!",
      text: "As configurações da loja foram atualizadas.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="main-content">
      <header className="content-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-cog"></i> Configurações da Unidade
          </h1>
          <p>Gerencie os dados que aparecem nos comprovantes e notas</p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={handleSave} className="btn-primary">
            <i className="fas fa-save"></i> Salvar Alterações
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary"
          >
            <i className="fas fa-sign-out-alt"></i> Sair
          </button>
        </div>
      </header>

      <section className="settings-grid">
        <form id="settingsForm" onSubmit={handleSave}>
          {/* Dados da Empresa */}
          <div className="settings-card">
            <h3>
              <i className="fas fa-building"></i> Dados da Empresa
            </h3>
            <div className="form-group-grid">
              <div className="form-group">
                <label htmlFor="storeName">Nome Fantasia</label>
                <input
                  type="text"
                  id="storeName"
                  value={settings.storeName}
                  onChange={handleChange}
                  placeholder="Ex: Papelaria do Zé"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="storeCnpj">CNPJ</label>
                <input
                  type="text"
                  id="storeCnpj"
                  value={settings.storeCnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="storeAddress">Endereço Completo</label>
              <input
                type="text"
                id="storeAddress"
                value={settings.storeAddress}
                onChange={handleChange}
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>
          </div>

          {/* Recebimentos (PIX) */}
          <div className="settings-card">
            <h3>
              <i className="fas fa-wallet"></i> Recebimentos (PIX)
            </h3>
            <div className="form-group-grid">
              <div className="form-group">
                <label htmlFor="pixKey">Chave PIX Principal</label>
                <input
                  type="text"
                  id="pixKey"
                  value={settings.pixKey}
                  onChange={handleChange}
                  placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pixHolder">Nome do Titular</label>
                <input
                  type="text"
                  id="pixHolder"
                  value={settings.pixHolder}
                  onChange={handleChange}
                  placeholder="Nome completo ou Razão Social"
                />
              </div>
            </div>
            <p className="helper-text">
              Esta chave será utilizada para gerar o QR Code no PDV.
            </p>
          </div>

          {/* Rodapé do Recibo */}
          <div className="settings-card">
            <h3>
              <i className="fas fa-file-invoice-dollar"></i> Rodapé do Recibo
            </h3>
            <div className="form-group">
              <label htmlFor="receiptMessage">Mensagem de Agradecimento</label>
              <textarea
                id="receiptMessage"
                rows="3"
                value={settings.receiptMessage}
                onChange={handleChange}
                placeholder="Ex: Obrigado pela preferência! Volte sempre."
              ></textarea>
            </div>
          </div>

          {/* Integração Mercado Pago */}
          <div className="settings-card">
            <h3>
              <i className="fas fa-credit-card"></i> Integração Mercado Pago
            </h3>
            <p className="helper-text" style={{ marginBottom: "15px" }}>
              Configure sua maquininha para receber pagamentos automáticos.
            </p>
            <div className="form-group">
              <label htmlFor="mercadoPagoAccessToken">Access Token</label>
              <input
                type="password"
                id="mercadoPagoAccessToken"
                value={settings.mercadoPagoAccessToken}
                onChange={handleChange}
                placeholder="Seu access token do Mercado Pago"
              />
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
