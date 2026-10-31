import React, { useState } from "react";
import {
  exportarBackupTenant,
  restaurarBackupTenant,
} from "../services/firebaseData"; // Ajuste o caminho conforme seu projeto

export default function AdminBackups() {
  const [tenantIdBackup, setTenantIdBackup] = useState("");
  const [carregandoBackup, setCarregandoBackup] = useState(false);

  const handleExportarBackup = async () => {
    if (!tenantIdBackup.trim()) {
      alert("Por favor, informe o ID do Tenant (cliente) para o backup.");
      return;
    }

    try {
      setCarregandoBackup(true);
      const resultado = await exportarBackupTenant(tenantIdBackup.trim());
      alert(
        `Backup gerado com sucesso! Total de ${resultado.total} itens exportados.`,
      );
    } catch (error) {
      alert(
        "Erro ao gerar o backup. Verifique se o ID do Tenant está correto.",
      );
    } finally {
      setCarregandoBackup(false);
    }
  };

  const handleRestaurarBackup = async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    if (!tenantIdBackup.trim()) {
      alert("Informe o ID do Tenant antes de selecionar o arquivo de backup.");
      event.target.value = null;
      return;
    }

    const confirmar = window.confirm(
      `ATENÇÃO: Deseja restaurar o backup para o tenant "${tenantIdBackup.trim()}"? Isso irá atualizar os produtos com os dados do arquivo.`,
    );

    if (!confirmar) {
      event.target.value = null;
      return;
    }

    try {
      setCarregandoBackup(true);
      const resultado = await restaurarBackupTenant(
        tenantIdBackup.trim(),
        arquivo,
      );
      alert(
        `Restauração concluída! ${resultado.totalRestaurado} itens foram recuperados com sucesso.`,
      );
    } catch (error) {
      alert(
        "Erro ao restaurar o arquivo. Certifique-se de que é um JSON válido.",
      );
    } finally {
      setCarregandoBackup(false);
      event.target.value = null;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto text-white-600 min-h-screen">
      {/* Cabeçalho */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-sm">
              <i className="fas fa-database text-xl"></i>
            </div>
            Gestão de Backups e Segurança
          </h1>
          <p className="text-sm text-black-400 mt-2">
            Exporte ou recupere cópias de segurança do estoque e produtos dos
            seus clientes ativos
          </p>
        </div>
      </div>

      {/* Card Principal */}
      <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <i className="fas fa-hdd text-base"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Backup / Restauração por Tenant
            </h2>
            <p className="text-xs text-gray-400">
              Gerenciamento manual de dados dos estabelecimentos cadastrados
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              ID do Cliente (Tenant ID)
            </label>
            <input
              type="text"
              value={tenantIdBackup}
              onChange={(e) => setTenantIdBackup(e.target.value)}
              placeholder="Ex: BN6qGYDZMQWTvt0BxCKUyR3LBQ63"
              className="w-full px-4 py-3 bg-gray-950/70 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-all"
            />
            <p className="text-xs text-white mt-1">
              Copie e cole o ID do documento da coleção <code>tenants</code> do
              Firebase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={handleExportarBackup}
              disabled={carregandoBackup}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              <i className="fas fa-download"></i>
              {carregandoBackup ? "Processando..." : "Baixar Backup (JSON)"}
            </button>

            <label
              className={`w-full py-3.5 font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-lg ${
                carregandoBackup
                  ? "bg-gray-700 cursor-not-allowed opacity-50"
                  : "bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-rose-900/20"
              }`}
            >
              <i className="fas fa-upload"></i>
              {carregandoBackup ? "Restaurando..." : "Restaurar Backup (JSON)"}
              <input
                type="file"
                accept=".json"
                onChange={handleRestaurarBackup}
                disabled={carregandoBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
