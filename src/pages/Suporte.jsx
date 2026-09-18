import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Suporte() {
  const [formData, setFormData] = useState({
    userName: "",
    issueType: "",
    description: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { userName, issueType, description } = formData;

    // CONFIGURAÇÃO: Coloque seu número de WhatsApp aqui (DDI + DDD + Número)
    const meuWhatsapp = "5511999258488";

    // Formatação da mensagem para o WhatsApp
    const mensagem = encodeURIComponent(
      `*SOLICITAÇÃO DE SUPORTE - SISTEMA SIMPLES*\n\n` +
        `*Nome:* ${userName}\n` +
        `*Tipo:* ${issueType}\n` +
        `*Problema:* ${description}`,
    );

    const url = `https://api.whatsapp.com/send?phone=${meuWhatsapp}&text=${mensagem}`;

    Swal.fire({
      title: "Iniciando Atendimento",
      text: "Estamos te redirecionando para o nosso WhatsApp técnico.",
      icon: "success",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    }).then(() => {
      window.open(url, "_blank");
    });
  };

  return (
    <main className="main-content">
      <div className="support-container">
        <div className="support-card">
          <div className="support-header">
            <i className="fas fa-headset"></i>
            <h2>Central de Suporte</h2>
            <p>Conte-nos o que aconteceu e nossa equipe ajudará você.</p>
          </div>

          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label htmlFor="userName">Seu Nome:</label>
              <input type="text" id="userName" value={formData.userName} onChange={handleChange} placeholder="Ex: Rodrigo Carvalho" required />
            </div>

            <div className="form-group">
              <label htmlFor="issueType">Tipo de Problema:</label>
              <select id="issueType" value={formData.issueType} onChange={handleChange} required>
                <option value="" disabled>Selecione uma opção...</option>
                <option value="Erro no Sistema">Erro no Sistema (Bug)</option>
                <option value="Dúvida de Uso">Dúvida de Uso</option>
                <option value="Financeiro/Assinatura">Financeiro / Assinatura</option>
                <option value="Sugestão">Sugestão de Melhoria</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descrição do Problema:</label>
              <textarea id="description" rows="5" value={formData.description} onChange={handleChange} placeholder="Descreva detalhadamente o que ocorreu..." required></textarea>
            </div>

            <button type="submit" className="btn-support">
              <i className="fab fa-whatsapp"></i> Chamar no WhatsApp
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}