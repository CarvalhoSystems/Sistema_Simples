import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { formatCurrency } from "../utils/formatters";

/**
 * Modal de QR Code PIX para pagamento
 * Exibe o QR Code e o código copia-e-cola para o cliente pagar
 */
export default function PixQrCodeModal({
  payloadPix,
  valor,
  onConfirmar,
  onCancelar,
}) {
  const [copiado, setCopiado] = useState(false);

  // Copia o código PIX para a área de transferência
  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(payloadPix);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = payloadPix;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-5 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-white/20 rounded-full p-3">
              <i className="fas fa-qrcode text-3xl"></i>
            </div>
          </div>
          <h2 className="text-xl font-bold">Pagamento via PIX</h2>
          <p className="text-green-100 text-sm mt-1">
            Escaneie o QR Code abaixo para pagar
          </p>
        </div>

        {/* Corpo */}
        <div className="p-6 flex flex-col items-center">
          {/* Valor */}
          <div className="text-center mb-4">
            <p className="text-sm text-slate-500">Valor a pagar</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatCurrency(valor)}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-sm mb-4">
            <QRCode
              value={payloadPix}
              size={220}
              bgColor="#FFFFFF"
              fgColor="#1a1a1a"
              level="M"
            />
          </div>

          {/* Código copia-e-cola */}
          <div className="w-full mb-4">
            <p className="text-xs text-slate-500 mb-1 text-center">
              Ou copie o código PIX abaixo:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={payloadPix}
                readOnly
                className="flex-1 p-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-600 truncate"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={copiarCodigo}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copiado
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {copiado ? (
                  <>
                    <i className="fas fa-check mr-1"></i> Copiado!
                  </>
                ) : (
                  <>
                    <i className="fas fa-copy mr-1"></i> Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instruções */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700">
            <p className="font-medium mb-1">
              <i className="fas fa-info-circle mr-1"></i>
              Como pagar:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          {/* Botões */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancelar}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
            >
              <i className="fas fa-check mr-1"></i> Pagamento Confirmado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
