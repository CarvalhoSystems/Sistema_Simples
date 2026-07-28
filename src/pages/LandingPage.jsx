import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RAMOS_NEGOCIO } from "../services/supabaseClient";

const PLANOS = [
  {
    id: "free",
    nome: "Free",
    preco: "0",
    periodo: "grátis por 7 dias",
    destaque: false,
    features: [
      "1 estabelecimento",
      "Até 50 produtos",
      "PDV completo",
      "Dashboard básico",
      "Suporte por email",
    ],
    tag: "TESTE GRÁTIS",
  },
  {
    id: "basico",
    nome: "Básico",
    preco: "79,90",
    periodo: "/mês",
    destaque: false,
    features: [
      "1 estabelecimento",
      "Produtos ilimitados",
      "PDV + Dashboard",
      "Relatórios completos",
      "Suporte prioritário",
      "Salvamento em nuvem",
    ],
    tag: "MAIS ACESSÍVEL",
  },
  {
    id: "profissional",
    nome: "Profissional",
    preco: "99,90",
    periodo: "/mês",
    destaque: true,
    features: [
      "Até 3 estabelecimentos",
      "Produtos ilimitados",
      "Nota Fiscal Paulista",
      "NF-e completa",
      "Relatórios avançados",
      "Suporte VIP",
      "Backup automático",
    ],
    tag: "POPULAR",
  },
  {
    id: "premium",
    nome: "Premium",
    preco: "149,90",
    periodo: "/mês",
    destaque: false,
    features: [
      "Estabelecimentos ilimitados",
      "Produtos ilimitados",
      "Nota Fiscal Paulista",
      "Múltiplos usuários",
      "Suporte 24h dedicado",
      "Personalização completa",
      "API de integração",
      "Relatórios customizados",
      "Prioridade em novas features",
    ],
    tag: "COMPLETO",
  },
];

const DEPOIMENTOS = [
  {
    nome: "Maria Silva",
    negocio: "Padaria da Maria",
    texto:
      "Meu faturamento aumentou 30% depois que organizei o estoque com o sistema. A Nota Fiscal Paulista integrada é um diferencial!",
    estrelas: 5,
    ramo: "padaria",
  },
  {
    nome: "João Santos",
    negocio: "Pet Shop Amigo",
    texto:
      "Tinha 3 lojas e não conseguia gerenciar. Agora com o plano Profissional vejo tudo em um só lugar. Recomendo!",
    estrelas: 5,
    ramo: "casa_racao",
  },
  {
    nome: "Ana Oliveira",
    negocio: "PaperLar",
    texto:
      "Comecei com o Free e em uma semana já migrei para o Básico. Muito fácil de usar e os clientes adoram a nota fiscal.",
    estrelas: 5,
    ramo: "papelaria",
  },
];

const FAQ = [
  {
    q: "Precisa de cartão de crédito para testar?",
    r: "Não! O plano Free é gratuito por 7 dias sem necessidade de cadastrar cartão. Apenas seu email e senha.",
  },
  {
    q: "Posso mudar de ramo depois de cadastrar?",
    r: "Sim! Você pode alterar o ramo do seu estabelecimento nas configurações a qualquer momento.",
  },
  {
    q: "Como funciona a Nota Fiscal Paulista?",
    r: "Configuramos sua empresa com CNPJ e IE, e o sistema emite as notas automaticamente ao finalizar a venda com CPF do cliente.",
  },
  {
    q: "Meus dados estão seguros?",
    r: "Sim! Utilizamos criptografia e backup automático. Seus dados são isolados por estabelecimento (multi-tenant).",
  },
  {
    q: "Posso cancelar quando quiser?",
    r: "Sim! Sem multa ou fidelidade. Seu acesso continua até o final do período pago.",
  },
  {
    q: "Aceita mais de um CNPJ no mesmo plano?",
    r: "Sim! Nos planos Profissional e Premium você pode adicionar múltiplos estabelecimentos com CNPJs diferentes.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [faqAberto, setFaqAberto] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuAberto(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-store text-white text-sm"></i>
              </div>
              <span className="font-bold text-gray-800 text-lg">
                Facil<span className="text-blue-600">Sistemas</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollTo("ramos")}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Ramos
              </button>
              <button
                onClick={() => scrollTo("planos")}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Planos
              </button>
              <button
                onClick={() => scrollTo("depoimentos")}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Depoimentos
              </button>
              <button
                onClick={() => scrollTo("faq")}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                FAQ
              </button>
              <Link
                to="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Entrar
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Começar Grátis
              </Link>
            </div>

            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <i
                className={`fas ${menuAberto ? "fa-times" : "fa-bars"} text-gray-600`}
              ></i>
            </button>
          </div>

          {menuAberto && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
              <button
                onClick={() => scrollTo("ramos")}
                className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 py-2"
              >
                <i className="fas fa-tag mr-2 w-5 text-blue-600"></i>Ramos
              </button>
              <button
                onClick={() => scrollTo("planos")}
                className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 py-2"
              >
                <i className="fas fa-crown mr-2 w-5 text-yellow-500"></i>Planos
              </button>
              <button
                onClick={() => scrollTo("depoimentos")}
                className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 py-2"
              >
                <i className="fas fa-star mr-2 w-5 text-yellow-500"></i>
                Depoimentos
              </button>
              <button
                onClick={() => scrollTo("faq")}
                className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 py-2"
              >
                <i className="fas fa-question-circle mr-2 w-5 text-blue-600"></i>
                FAQ
              </button>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center text-sm font-medium text-blue-600 border border-blue-600 rounded-lg py-2"
                >
                  Entrar
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center text-sm font-medium bg-blue-600 text-white rounded-lg py-2"
                >
                  Começar Grátis
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-6">
                <i className="fas fa-rocket"></i>
                <span>Sistema completo para seu negócio</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                O PDV que{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  cresce com você
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Sistema de gestão completo com PDV, controle de estoque, emissão
                de Nota Fiscal Paulista e planos para todos os tamanhos de
                negócio.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl text-center"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Começar Grátis
                </Link>
                <button
                  onClick={() => scrollTo("ramos")}
                  className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all"
                >
                  <i className="fas fa-play-circle mr-2"></i>
                  Ver Funcionalidades
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="fas fa-check-circle text-green-500"></i>
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="fas fa-check-circle text-green-500"></i>7 dias
                  grátis
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="fas fa-check-circle text-green-500"></i>
                  Cancele quando quiser
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs text-gray-400 ml-2">
                      System PDV
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">CAIXA ABERTO</p>
                        <p className="text-lg font-bold text-gray-800">
                          R$ 1.247,50
                        </p>
                      </div>
                      <div className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
                        NOTA FISCAL PAULISTA ✓
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <i className="fas fa-box text-blue-600 text-xs"></i>
                          </div>
                          <div className="flex-1">
                            <div className="h-2.5 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-100 rounded w-1/2 mt-1"></div>
                          </div>
                          <div className="h-2.5 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="flex-1 h-10 bg-blue-600 rounded-lg animate-pulse"></div>
                      <div className="flex-1 h-10 bg-green-500 rounded-lg animate-pulse"></div>
                      <div className="flex-1 h-10 bg-purple-500 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                  <i className="fas fa-check mr-1"></i>
                  Multi-ramo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NÚMEROS ===== */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-3xl md:text-4xl font-bold">10+</p>
              <p className="text-blue-200 text-sm mt-1">Ramos de Negócio</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">100+</p>
              <p className="text-blue-200 text-sm mt-1">
                Produtos Pré-cadastrados
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">7</p>
              <p className="text-blue-200 text-sm mt-1">Dias Grátis</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">100%</p>
              <p className="text-blue-200 text-sm mt-1">Online</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RAMOS ===== */}
      <section id="ramos" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase">
              Para todos os segmentos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              10 ramos de negócio prontos
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Ao se cadastrar, escolha seu ramo e o sistema já carrega produtos
              e categorias específicas para seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {RAMOS_NEGOCIO.map((ramo) => (
              <div
                key={ramo.id}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: ramo.cor + "20" }}
                >
                  <i
                    className={`fas ${ramo.icone} text-xl`}
                    style={{ color: ramo.cor }}
                  ></i>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  {ramo.nome}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {ramo.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase">
              Funcionalidades
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Tudo que seu negócio precisa
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "fa-cash-register",
                cor: "blue",
                titulo: "PDV Completo",
                desc: "Interface otimizada para operadores de caixa com atalhos de teclado (F1 a F12).",
              },
              {
                icon: "fa-file-invoice",
                cor: "green",
                titulo: "Nota Fiscal Paulista",
                desc: "Emissão de NF-e integrada com a SEFAZ-SP. Seus clientes acumulam créditos de ICMS.",
              },
              {
                icon: "fa-boxes",
                cor: "purple",
                titulo: "Controle de Estoque",
                desc: "Gerencie produtos, estoque mínimo e receba alertas quando precisar repor.",
              },
              {
                icon: "fa-chart-bar",
                cor: "orange",
                titulo: "Relatórios",
                desc: "Dashboard com gráficos, vendas por período e indicadores de desempenho.",
              },
              {
                icon: "fa-layer-group",
                cor: "red",
                titulo: "Multi-ramo",
                desc: "Cada estabelecimento pode ter seu próprio ramo com produtos e categorias específicas.",
              },
              {
                icon: "fa-shield-alt",
                cor: "teal",
                titulo: "Multi-tenant Seguro",
                desc: "Dados isolados por cliente. Cada estabelecimento tem seu próprio ambiente seguro.",
              },
              {
                icon: "fa-print",
                cor: "pink",
                titulo: "Impressão de Cupom",
                desc: "Impressão de cupom não fiscal e DANFE (Documento Auxiliar da NF-e).",
              },
              {
                icon: "fa-barcode",
                cor: "indigo",
                titulo: "Código de Barras",
                desc: "Suporte a leitura de código de barras e balanças com produtos por peso.",
              },
              {
                icon: "fa-users",
                cor: "cyan",
                titulo: "Múltiplos Usuários",
                desc: "Planos Premium permitem múltiplos usuários com níveis de acesso diferentes.",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                  style={{ backgroundColor: `var(--${feat.cor}-100)` }}
                >
                  <i
                    className={`fas ${feat.icon} text-xl`}
                    style={{ color: `var(--${feat.cor}-600)` }}
                  ></i>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {feat.titulo}
                </h3>
                <p className="text-sm text-gray-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PLANOS ===== */}
      <section id="planos" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase">
              Planos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Invista no seu negócio
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Escolha o plano ideal para sua empresa. Todos incluem 7 dias
              grátis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANOS.map((plano) => (
              <div
                key={plano.id}
                className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl ${
                  plano.destaque
                    ? "border-blue-500 shadow-lg scale-105 md:scale-110"
                    : "border-gray-200"
                }`}
              >
                {plano.destaque && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center text-xs font-bold py-1.5 tracking-wider">
                    {plano.tag}
                  </div>
                )}

                <div className={`p-6 ${plano.destaque ? "pt-10" : ""}`}>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">
                      {plano.nome}
                    </h3>
                    <div className="mt-3">
                      <span className="text-4xl font-bold text-gray-900">
                        R$ {plano.preco}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">
                        {plano.periodo}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plano.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <i className="fas fa-check text-green-500 mt-0.5"></i>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                      plano.destaque
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {plano.id === "free" ? "Testar Grátis" : "Começar Agora"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      <section id="depoimentos" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase">
              Depoimentos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Quem usa recomenda
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((dep, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(dep.estrelas)].map((_, s) => (
                    <i
                      key={s}
                      className="fas fa-star text-yellow-400 text-sm"
                    ></i>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">
                  "{dep.texto}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-blue-600"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {dep.nome}
                    </p>
                    <p className="text-xs text-gray-400">{dep.negocio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Dúvidas frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800 text-sm">
                    {item.q}
                  </span>
                  <i
                    className={`fas fa-chevron-down text-gray-400 transition-transform ${faqAberto === i ? "rotate-180" : ""}`}
                  ></i>
                </button>
                {faqAberto === i && (
                  <div className="px-4 pb-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                    {item.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Teste grátis por 7 dias. Sem compromisso, sem cartão de crédito.
            Cancele quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
            >
              <i className="fas fa-rocket mr-2"></i>
              Criar Conta Grátis
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-store text-white text-sm"></i>
                </div>
                <span className="font-bold text-white text-lg">
                  Facíl Sistemas
                </span>
              </div>
              <p className="text-sm">
                Sistema de gestão comercial completo com PDV, NF-e e multi-ramo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => scrollTo("ramos")}
                    className="hover:text-white transition-colors"
                  >
                    Ramos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("planos")}
                    className="hover:text-white transition-colors"
                  >
                    Planos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("faq")}
                    className="hover:text-white transition-colors"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status do Sistema
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    LGPD
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>
              © 2026 SystemPDV. Todos os direitos reservados. Carvalho Systems.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
