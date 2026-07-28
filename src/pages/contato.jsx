import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Contato() {
  const [formData, setFormData] = useState({
    userName: "",
    contactSubject: "",
    message: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { userName, contactSubject, message } = formData;

    // Pega o número do WhatsApp do .env ou usa o padrão como fallback
    const meuWhatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || "5511999258488";

    // Formatação da mensagem para o WhatsApp
    const mensagem = encodeURIComponent(
      `*NOVO CONTATO - SITE*\n\n` +
        `*Nome:* ${userName}\n` +
        `*Assunto:* ${contactSubject}\n` +
        `*Mensagem:* ${message}`,
    );

    const url = `https://api.whatsapp.com/send?phone=${meuWhatsapp}&text=${mensagem}`;

    Swal.fire({
      title: "Enviando Mensagem",
      text: "Estamos te redirecionando para o nosso WhatsApp.",
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
            <i className="fas fa-envelope"></i>
            <h2>Fale Conosco</h2>
            <p>Envie sua mensagem e entraremos em contato rapidamente.</p>
          </div>

          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label htmlFor="userName">Seu Nome:</label>
              <input
                type="text"
                id="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Ex: Rodrigo Carvalho"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactSubject">Assunto:</label>
              <select
                id="contactSubject"
                value={formData.contactSubject}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Selecione uma opção...
                </option>
                <option value="Dúvidas Comerciais">Dúvidas Comerciais</option>
                <option value="Orçamento / Proposta">
                  Orçamento / Proposta
                </option>
                <option value="Parcerias">Parcerias</option>
                <option value="Outros">Outros Assuntos</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Sua Mensagem:</label>
              <textarea
                id="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escreva sua mensagem aqui..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-support">
              <i className="fab fa-whatsapp"></i> Enviar Mensagem via WhatsApp
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
