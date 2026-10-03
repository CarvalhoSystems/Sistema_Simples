import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PlanBlock from "../components/PlanBlock";
import {
  salvarConfiguracoes,
  getConfiguracoes,
  sincronizarConfiguracoes,
  consultarNotasPorCPF,
  carregarNotasEmitidas,
  gerarDANFE,
  validarCPF,
} from "../services/notaFiscalPaulista";

export default function NotaFiscalPaulista() {
  const [abaAtiva, setAbaAtiva] = useState("configuracao");
  const [config, setConfig] = useState(getConfiguracoes());
  const [notas, setNotas] = useState([]);
  const [configurado, setConfigurado] = useState(false);
  const [configSincronizada, setConfigSincronizada] = useState(false);
  const [cpfConsulta, setCpfConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const carregarDados = React.useCallback(async () => {
    const resultado = await sincronizarConfiguracoes();
    setConfig(resultado.config);
    setConfigSincronizada(resultado.sincronizado);
    setConfigurado(
      Boolean(
        resultado.config.razaoSocial &&
          resultado.config.cnpj &&
          resultado.config.ie,
      ),
    );
    const notasSalvas = carregarNotasEmitidas();
    setNotas(notasSalvas);
  }, []);

  useEffect(() => {
    carregarDados().catch((error) => {
      console.error("Erro ao carregar configuração fiscal:", error);
      const configLocal = getConfiguracoes();
      setConfig(configLocal);
      setConfigurado(
        Boolean(
          configLocal.razaoSocial && configLocal.cnpj && configLocal.ie,
        ),
      );
      setConfigSincronizada(false);
      setNotas(carregarNotasEmitidas());
      Swal.fire({
        icon: "warning",
        title: "Não foi possível carregar os dados da nuvem",
        text: "Os dados locais continuam disponíveis neste dispositivo. Confira a conexão e as permissões do estabelecimento no Firebase.",
      });
    });
  }, [carregarDados]);

  function handleConfigChange(campo, valor) {
    if (campo.includes(".")) {
      const [pai, filho] = campo.split(".");
      setConfig((prev) => ({
        ...prev,
        [pai]: { ...prev[pai], [filho]: valor },
      }));
    } else {
      setConfig((prev) => ({ ...prev, [campo]: valor }));
    }
  }

  async function handleSalvarConfig() {
    if (!config.razaoSocial || !config.cnpj || !config.ie) {
      Swal.fire({
        icon: "error",
        title: "Campos obrigatórios",
        text: "Preencha pelo menos Razão Social, CNPJ e Inscrição Estadual.",
      });
      return;
    }

    try {
      const resultado = await salvarConfiguracoes(config);
      setConfig(resultado.config);
      setConfigSincronizada(resultado.sincronizado);
      setConfigurado(true);
      if (resultado.sincronizado) {
        await Swal.fire({
          icon: "success",
          title: "Dados salvos e sincronizados",
          text: "Os dados da empresa estão disponíveis nos dispositivos que acessarem este estabelecimento.",
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          icon: "warning",
          title: "Salvo somente neste dispositivo",
          text: "O Firebase não está disponível ou não há estabelecimento autenticado. Estes dados ainda não estão sincronizados com os outros dispositivos.",
        });
      }
    } catch (error) {
      console.error("Erro ao sincronizar configuração fiscal:", error);
      await Swal.fire({
        icon: "error",
        title: "Não foi possível sincronizar",
        text: `Os dados ficaram salvos neste dispositivo, mas não foram enviados ao servidor. ${error.message}`,
      });
    }
  }

  async function handleConsultarCPF() {
    if (!cpfConsulta || !validarCPF(cpfConsulta)) {
      Swal.fire({
        icon: "error",
        title: "CPF inválido",
        text: "Digite um CPF válido para consultar as notas.",
      });
      return;
    }

    setCarregando(true);
    try {
      const resultado = await consultarNotasPorCPF(cpfConsulta);
      setResultadoConsulta(resultado);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro na consulta",
        text: error.message,
      });
    } finally {
      setCarregando(false);
    }
  }

  function handleVisualizarDANFE(nota) {
    const danfeHtml = gerarDANFE(nota);
    const janela = window.open("", "_blank", "width=800,height=600");
    janela.document.write(danfeHtml);
    janela.document.close();
  }

  function formatarData(dataISO) {
    return new Date(dataISO).toLocaleString("pt-BR");
  }

  function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2)}`;
  }

  return (
    <PlanBlock feature="nfp" mensagem="Nota Fiscal Paulista - NFC-e modelo 65">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-file-invoice text-blue-600"></i>
            Nota Fiscal Paulista
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Cadastro de dados fiscais. A emissão de NFC-e modelo 65 ainda não
            está conectada à SEFAZ-SP.
          </p>
          {configurado && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              <i className="fas fa-check-circle"></i>
              Dados da empresa preenchidos
            </span>
          )}
          {configSincronizada && (
            <span className="inline-flex items-center gap-1 mt-2 ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              <i className="fas fa-cloud"></i>
              Sincronizado
            </span>
          )}
          <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Importante:</strong> o sistema ainda não está integrado à
            SEFAZ para autorizar NFC-e modelo 65. Chaves geradas antes desta
            correção eram simuladas e não são documentos fiscais. Para emissão
            real, é necessário implementar e validar a integração com
            certificado A1, CSC/ID do CSC e dados fiscais dos produtos.
          </div>
        </div>

        {/* Abas de navegação */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setAbaAtiva("configuracao")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === "configuracao"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className="fas fa-cog mr-1"></i>
            Configuração
          </button>
          <button
            onClick={() => setAbaAtiva("notas")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === "notas"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className="fas fa-list mr-1"></i>
            Notas Emitidas
            {notas.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {notas.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAbaAtiva("consulta")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === "consulta"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className="fas fa-search mr-1"></i>
            Consultar CPF
          </button>
        </div>

        {/* Aba: Configuração */}
        {abaAtiva === "configuracao" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                <i className="fas fa-building text-blue-600 mr-2"></i>
                Dados da Empresa
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Preencha os dados da sua empresa para emitir notas fiscais
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    value={config.razaoSocial}
                    onChange={(e) =>
                      handleConfigChange("razaoSocial", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="FÁCIL SISTEMAS S.A."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={config.nomeFantasia}
                    onChange={(e) =>
                      handleConfigChange("nomeFantasia", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Fácil Sistemas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={config.cnpj}
                    onChange={(e) => handleConfigChange("cnpj", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inscrição Estadual *
                  </label>
                  <input
                    type="text"
                    value={config.ie}
                    onChange={(e) => handleConfigChange("ie", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="000.000.000.000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inscrição Municipal
                  </label>
                  <input
                    type="text"
                    value={config.im}
                    onChange={(e) => handleConfigChange("im", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNAE
                  </label>
                  <input
                    type="text"
                    value={config.cnae}
                    onChange={(e) => handleConfigChange("cnae", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0000-0/00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regime Tributário
                  </label>
                  <select
                    value={config.crt}
                    onChange={(e) => handleConfigChange("crt", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="1">Simples Nacional</option>
                    <option value="2">Simples Nacional - Excesso</option>
                    <option value="3">Regime Normal</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  <i className="fas fa-map-marker-alt text-blue-600 mr-2"></i>
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logradouro
                    </label>
                    <input
                      type="text"
                      value={config.endereco.logradouro}
                      onChange={(e) =>
                        handleConfigChange(
                          "endereco.logradouro",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="AV. PRINCIPAL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={config.endereco.numero}
                      onChange={(e) =>
                        handleConfigChange("endereco.numero", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={config.endereco.bairro}
                      onChange={(e) =>
                        handleConfigChange("endereco.bairro", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="CENTRO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={config.endereco.cidade}
                      onChange={(e) =>
                        handleConfigChange("endereco.cidade", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="SAO PAULO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UF
                    </label>
                    <input
                      type="text"
                      value={config.endereco.uf}
                      onChange={(e) =>
                        handleConfigChange("endereco.uf", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={config.endereco.cep}
                      onChange={(e) =>
                        handleConfigChange("endereco.cep", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  <i className="fas fa-shield-alt text-blue-600 mr-2"></i>
                  Credenciais fiscais
                </h3>
                <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                  Este sistema ainda não recebe nem utiliza certificado A1,
                  token A3, CSC ou ID do CSC. Não informe senhas, tokens ou
                  envie arquivos de certificado nesta tela. Essas credenciais
                  só devem ser configuradas depois que existir um serviço de
                  emissão seguro no servidor.
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    Informações importantes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>
                      Confirme com o contador do estabelecimento os requisitos
                      de credenciamento de NFC-e modelo 65 em São Paulo,
                      incluindo CSC/ID do CSC e cadastro do contribuinte.
                    </li>
                    <li>
                      Salvar os dados da empresa não emite nem autoriza uma
                      NFC-e.
                    </li>
                    <li>
                      Consulte a documentação oficial em{" "}
                      <a
                        href="https://www.nfpaulista.fazenda.sp.gov.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        www.nfpaulista.fazenda.sp.gov.br
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSalvarConfig}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <i className="fas fa-save"></i>
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aba: Notas Emitidas */}
        {abaAtiva === "notas" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                <i className="fas fa-file-invoice text-blue-600 mr-2"></i>
                Notas Fiscais Emitidas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Registros locais. As chaves criadas pela versão de simulação
                não são notas fiscais autorizadas.
              </p>
            </div>

            {notas.some((nota) => nota.status === "simulada") && (
              <div className="m-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                Há registros criados pela simulação antiga. Eles não foram
                autorizados pela SEFAZ e não têm validade fiscal.
              </div>
            )}

            {notas.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <i className="fas fa-file-invoice text-5xl mb-4"></i>
                <p className="text-lg font-medium">
                  Nenhuma nota fiscal emitida ainda
                </p>
                <p className="text-sm mt-1">
                  As notas emitidas no PDV aparecerão aqui automaticamente.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-600">
                        Nº Nota
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        Data
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        CPF Cliente
                      </th>
                      <th className="text-right p-3 font-medium text-gray-600">
                        Valor
                      </th>
                      <th className="text-center p-3 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-center p-3 font-medium text-gray-600">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {notas.map((nota) => (
                      <tr
                        key={nota.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-3 font-mono text-blue-600">
                          {nota.numeroNota}
                        </td>
                        <td className="p-3 text-gray-600">
                          {formatarData(nota.dataEmissao)}
                        </td>
                        <td className="p-3 font-mono">{nota.cpfCliente}</td>
                        <td className="p-3 text-right font-medium">
                          {formatarMoeda(nota.valorTotal)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              nota.status === "autorizada"
                                ? "bg-green-100 text-green-800"
                                : nota.status === "cancelada"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {nota.status === "autorizada" && (
                              <i className="fas fa-check-circle mr-1"></i>
                            )}
                            {nota.status === "cancelada" && (
                              <i className="fas fa-times-circle mr-1"></i>
                            )}
                            {nota.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                try {
                                  handleVisualizarDANFE(nota);
                                } catch (error) {
                                  Swal.fire({
                                    icon: "warning",
                                    title: "Documento não autorizado",
                                    text: error.message,
                                  });
                                }
                              }}
                              disabled={nota.status === "simulada"}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                              title={
                                nota.status === "simulada"
                                  ? "Registro simulado, sem validade fiscal"
                                  : "Visualizar DANFE"
                              }
                            >
                              <i className="fas fa-file-alt mr-1"></i>
                              DANFE
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(nota.chaveAcesso);
                                Swal.fire({
                                  icon: "success",
                                  title: "Chave copiada!",
                                  text: nota.chaveAcesso,
                                  timer: 1500,
                                  showConfirmButton: false,
                                });
                              }}
                              disabled={nota.status === "simulada"}
                              className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                              title={
                                nota.status === "simulada"
                                  ? "Chave simulada, sem validade fiscal"
                                  : "Copiar chave de acesso"
                              }
                            >
                              <i className="fas fa-copy mr-1"></i>
                              Chave
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Aba: Consulta por CPF */}
        {abaAtiva === "consulta" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-search text-blue-600 mr-2"></i>
                Consultar Notas por CPF
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                A consulta oficial à Nota Fiscal Paulista ainda não está
                integrada a este sistema.
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={cpfConsulta}
                  onChange={(e) => setCpfConsulta(e.target.value)}
                  placeholder="Digite o CPF do cliente (000.000.000-00)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  maxLength={14}
                  disabled
                />
                <button
                  onClick={handleConsultarCPF}
                  disabled
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {carregando ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Consultando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Consultar
                    </>
                  )}
                </button>
              </div>
            </div>

            {resultadoConsulta && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-md font-semibold text-gray-800">
                    Resultado da Consulta
                  </h3>
                  <p className="text-sm text-gray-500">
                    CPF: {resultadoConsulta.cpf}
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {resultadoConsulta.totalNotas}
                      </p>
                      <p className="text-sm text-blue-800">Notas Emitidas</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatarMoeda(resultadoConsulta.valorTotalAcumulado)}
                      </p>
                      <p className="text-sm text-green-800">
                        Valor Total em Compras
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatarMoeda(resultadoConsulta.creditosAcumulados)}
                      </p>
                      <p className="text-sm text-purple-800">
                        Créditos Acumulados (est.)
                      </p>
                    </div>
                  </div>

                  {resultadoConsulta.notas.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left p-3 font-medium text-gray-600">
                              Nº Nota
                            </th>
                            <th className="text-left p-3 font-medium text-gray-600">
                              Data
                            </th>
                            <th className="text-right p-3 font-medium text-gray-600">
                              Valor
                            </th>
                            <th className="text-center p-3 font-medium text-gray-600">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultadoConsulta.notas.map((nota) => (
                            <tr
                              key={nota.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="p-3 font-mono text-blue-600">
                                {nota.numeroNota}
                              </td>
                              <td className="p-3 text-gray-600">
                                {formatarData(nota.dataEmissao)}
                              </td>
                              <td className="p-3 text-right font-medium">
                                {formatarMoeda(nota.valorTotal)}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    nota.status === "autorizada"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {nota.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PlanBlock>
  );
}
