# 🏪 System PDV - Sistema de Gestão Comercial

Sistema completo de Ponto de Venda (PDV) com **Painel Administrativo**, **Gerenciamento de Planos e Assinaturas**, e integração à **Nota Fiscal Paulista (SEFAZ-SP)**, desenvolvido em React + Vite.

---

## 📋 Índice

- [Sobre o Sistema](#-sobre-o-sistema)
- [Funcionalidades](#-funcionalidades)
- [Planos e Assinaturas](#-planos-e-assinaturas)
- [Painel Administrativo](#-painel-administrativo)
- [Bloqueio por Plano](#-bloqueio-por-plano)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Módulos do Sistema](#-módulos-do-sistema)
- [Integração com Nota Fiscal Paulista](#-integração-com-nota-fiscal-paulista)
- [Atalhos do Teclado](#-atalhos-do-teclado)
- [API de Serviços](#-api-de-serviços)
- [Deploy e Produção](#-deploy-e-produção)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Sobre o Sistema

O **System PDV** é um sistema de gestão comercial completo com **sistema de planos e assinaturas**, desenvolvido para atender desde pequenos comerciantes até empresas que precisam de múltiplos estabelecimentos. O sistema oferece:

- **PDV (Ponto de Venda)** com interface otimizada para operadores de caixa
- **Dashboard gerencial** com gráficos e indicadores de desempenho
- **Controle de inventário** com alertas de estoque mínimo
- **Emissão de Nota Fiscal Eletrônica** integrada à **Nota Fiscal Paulista (SEFAZ-SP)**
- **Sistema de Planos** Free, Básico, Profissional e Premium
- **Painel Administrativo secreto** para gerenciar todos os clientes
- **Bloqueio automático de features** por plano
- **Autenticação** de usuários com rotas protegidas

---

## ✨ Funcionalidades

### PDV (Caixa)
- ✅ Adição de produtos por código de barras ou busca (F10)
- ✅ Suporte a balanças com produtos por peso/quantidade variável
- ✅ Cálculo automático de subtotal, descontos e total
- ✅ Múltiplas formas de pagamento: Dinheiro, PIX, Cartão
- ✅ Cálculo de troco para pagamento em dinheiro
- ✅ Cancelamento de itens individuais (F2) ou cupom inteiro (F3)
- ✅ Impressão de cupom não fiscal (F12)
- ✅ Atalhos de teclado para todas as operações

### Nota Fiscal Paulista
- ✅ Emissão de NF-e modelo 55 no padrão 4.00 da SEFAZ-SP
- ✅ Geração de chave de acesso de 44 dígitos com dígito verificador
- ✅ Validação de CPF do cliente
- ✅ Geração de DANFE (Documento Auxiliar da NF-e)
- ✅ Consulta de notas emitidas por CPF
- ✅ Cálculo de créditos acumulados (0,3% do valor)
- ✅ Cancelamento de notas fiscais
- ✅ Configuração de dados da empresa (CNPJ, IE, endereço)
- ✅ Suporte a certificado digital A1 e A3
- ✅ Ambientes de homologação e produção

### Dashboard
- ✅ Gráficos de vendas (Chart.js)
- ✅ Indicadores de desempenho
- ✅ Cards de resumo financeiro

### Inventário
- ✅ Cadastro e gerenciamento de produtos
- ✅ Controle de estoque
- ✅ Alertas de estoque mínimo
- ✅ Categorias de produtos

### Sistema de Planos e Assinaturas
- ✅ 4 planos: Free, Básico, Profissional, Premium
- ✅ Teste grátis de 7 dias automático
- ✅ Bloqueio automático de features por plano
- ✅ Controle de trial, ativa, vencida, cancelada
- ✅ Verificação automática de vencimento
- ✅ Controle manual pelo Admin

### Painel Administrativo (Secreto)
- ✅ Login exclusivo em `/admin/login`
- ✅ Dashboard Admin com visão geral do sistema
- ✅ Gerenciamento de clientes com ações manuais
- ✅ Visão financeira completa
- ✅ Distribuição de clientes por plano
- ✅ Acesso restrito apenas para administradores

### Segurança
- ✅ Autenticação de usuários (login/signup)
- ✅ Rotas protegidas
- ✅ AdminRoute separado (verificação por email)
- ✅ Painel Admin invisível para clientes

---

## 👑 Planos e Assinaturas

### Planos Disponíveis

| Plano | Preço | Features |
|-------|-------|----------|
| **Free** | Grátis (7 dias) | PDV, Dashboard, 1 estabelecimento, 50 produtos |
| **Básico** | R$ 49,90/mês | + Relatórios, Backup Automático, Produtos Ilimitados |
| **Profissional** | R$ 74,90/mês | + NFP, 3 estabelecimentos, Suporte VIP |
| **Premium** | R$ 99,90/mês | + API, Estabelecimentos Ilimitados, Usuários Ilimitados |

### Status de Assinatura

| Status | Descrição |
|--------|-----------|
| 🔵 **Trial** | Período de teste grátis (7 dias) |
| 🟢 **Ativa** | Assinatura paga ativa |
| 🔴 **Vencida** | Assinatura expirou |
| 🟡 **Trial Expirado** | Período de teste acabou |
| ⚪ **Cancelada** | Assinatura cancelada |

### Fluxo de Assinatura

```
1. Cliente se cadastra → Ganha 7 dias de trial grátis (plano Profissional)
2. Durante o trial → Todas as features liberadas
3. Trial expira → Bloqueia features não inclusas no Free
4. Cliente escolhe plano → Assinatura ativada por 30 dias
5. Renovação → Automática ou manual pelo Admin
```

---

## 🛡️ Painel Administrativo

### Acesso

**URL Secreta:** `/admin/login`

**Credenciais:**
- **Email:** `admin@sistema.com`
- **Senha:** `1234`

> ⚠️ Apenas o email `admin@sistema.com` tem permissão para acessar o painel.
> Clientes comuns que tentarem acessar `/admin` são redirecionados de volta ao dashboard.

### Módulos do Admin

#### 📊 Dashboard Admin (`/admin`)
Visão geral do sistema com:
- Total de clientes cadastrados
- Quantos estão em teste grátis
- Assinantes ativos
- Clientes vencidos
- Distribuição por plano (gráfico de barras)
- Resumo financeiro (total vendas, faturamento, média por cliente)
- Últimos clientes cadastrados

#### 👥 Gerenciar Clientes (`/admin/clientes`)
Tabela completa com todos os clientes e **3 ações manuais**:

| Ícone | Ação | Descrição |
|-------|------|-----------|
| 👑 | **Alterar Plano** | Muda entre Free, Básico, Profissional, Premium |
| 🕐 | **Renovar Trial** | Adiciona +3, +7, +15 ou +30 dias de teste |
| 🔄 | **Alterar Status** | Ativar, Trial, Vencida ou Cancelar manualmente |

#### 💰 Financeiro (`/admin/financeiro`)
Visão financeira do sistema:
- Faturamento total
- Total de vendas
- Clientes pagantes (% de conversão)
- Receita potencial mensal
- Tabela de faturamento por cliente

#### 👑 Planos (`/admin/planos`)
- Cards com distribuição de clientes por plano
- Features de cada plano
- Listagem de clientes por plano com status

---

## 🔒 Bloqueio por Plano

O sistema utiliza o componente `<PlanBlock>` para controlar o acesso às features:

### Features por Plano

| Feature | Free | Básico | Profissional | Premium |
|---------|------|--------|--------------|---------|
| PDV Completo | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| 1 Estabelecimento | ✅ | ✅ | ✅ | ✅ |
| Até 50 Produtos | ✅ | ✅ | ✅ | ✅ |
| Relatórios | ❌ | ✅ | ✅ | ✅ |
| Backup Automático | ❌ | ✅ | ✅ | ✅ |
| Produtos Ilimitados | ❌ | ✅ | ✅ | ✅ |
| Nota Fiscal Paulista | ❌ | ❌ | ✅ | ✅ |
| 3 Estabelecimentos | ❌ | ❌ | ✅ | ✅ |
| Suporte VIP | ❌ | ❌ | ✅ | ✅ |
| API Integração | ❌ | ❌ | ❌ | ✅ |
| Estabelecimentos Ilimitados | ❌ | ❌ | ❌ | ✅ |
| Usuários Ilimitados | ❌ | ❌ | ❌ | ✅ |

### Como usar o PlanBlock

```jsx
import PlanBlock from "../components/PlanBlock";

export default function MinhaPagina() {
  return (
    <PlanBlock feature="relatorios" mensagem="Mensagem personalizada">
      {/* Conteúdo da página */}
      <div>...</div>
    </PlanBlock>
  );
}
```

### Comportamento
- ✅ Se o plano do cliente **tem a feature** → renderiza o conteúdo
- ❌ Se o plano **não tem a feature** → exibe tela de upgrade com:
  - Plano necessário e preço
  - Features que o plano atual inclui
  - Botão "Fazer Upgrade Agora"

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **React** | 19.x | Biblioteca principal para construção da interface |
| **Vite** | 8.x | Bundler e servidor de desenvolvimento |
| **React Router** | 7.x | Roteamento SPA |
| **SweetAlert2** | 11.x | Modais e diálogos interativos |
| **Chart.js** | 4.x | Gráficos do dashboard |
| **Tailwind CSS** | 4.x | Estilização utilitária |
| **Font Awesome** | 6.x | Ícones |
| **localStorage** | - | Persistência de dados no navegador |
| **Firebase** | 12.x | Autenticação e Firestore (opcional) |

---

## 📦 Pré-requisitos

- **Node.js** versão 18.x ou superior
- **npm** ou **bun** como gerenciador de pacotes
- Navegador moderno (Chrome, Firefox, Edge, etc.)
- Para produção com NFP: Certificado digital A1 ou A3 válido

---

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/CarvalhoSystems/Sistema_Simples.git
cd Sistema_Simples
```

### 2. Instale as dependências

```bash
npm install
# ou
bun install
```

### 3. Configure as variáveis de ambiente (opcional)

Crie um arquivo `.env` na raiz do projeto:

```env
# Firebase (opcional - sem isso funciona em modo demo)
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
# ou
bun run dev
```

O sistema estará disponível em: **http://localhost:5173**

### 5. Build para produção

```bash
npm run build
# ou
bun run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

---

## 📁 Estrutura do Projeto

```
Sistema_Simples/
├── public/                      # Arquivos públicos
│   ├── favicon.ico
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                  # Recursos estáticos
│   ├── components/              # Componentes reutilizáveis
│   │   ├── AdminLayout.jsx      # ⭐ Layout do painel admin
│   │   ├── AdminRoute.jsx       # ⭐ Rota protegida do admin
│   │   ├── AuthContext.jsx      # Contexto de autenticação
│   │   ├── Dashboard.jsx        # Dashboard gerencial
│   │   ├── DashboardCard.jsx    # Card de indicador
│   │   ├── DashboardLayout.jsx  # Layout do dashboard
│   │   ├── Layout.jsx           # Layout principal (PDV)
│   │   ├── PlanBlock.jsx        # ⭐ Componente de bloqueio por plano
│   │   ├── ProductModal.jsx     # Modal de produto
│   │   ├── ProductTable.jsx     # Tabela de produtos
│   │   ├── ProtectedRoute.jsx   # Rota protegida padrão
│   │   ├── SalesChart.jsx       # Gráfico de vendas
│   │   └── Sidebar.jsx          # Barra lateral de navegação
│   ├── hooks/                   # Hooks personalizados
│   │   ├── useKeyboardShortcuts.js
│   │   └── useTenant.js         # ⭐ Hook de gerenciamento de tenant
│   ├── pages/                   # Páginas do sistema
│   │   ├── AdminClientes.jsx    # ⭐ Gerenciamento de clientes (Admin)
│   │   ├── AdminDashboard.jsx   # ⭐ Dashboard do Admin
│   │   ├── AdminFinanceiro.jsx  # ⭐ Visão financeira (Admin)
│   │   ├── AdminLogin.jsx       # ⭐ Login exclusivo do Admin
│   │   ├── AdminPlanos.jsx      # ⭐ Gerenciamento de planos (Admin)
│   │   ├── Configuracoes.jsx    # Configurações do sistema
│   │   ├── inventario.jsx       # Controle de inventário
│   │   ├── LandingPage.jsx      # Página inicial com planos
│   │   ├── Login.jsx            # Tela de login do cliente
│   │   ├── NotaFiscalPaulista.jsx # Gerenciamento NFP
│   │   ├── Relatorios.jsx       # ⭐ Relatórios (com trava por plano)
│   │   ├── Signup.jsx           # Cadastro de usuário
│   │   └── Suporte.jsx          # Página de suporte
│   ├── services/                # Serviços e APIs
│   │   ├── firebaseClient.js    # Configuração do Firebase
│   │   ├── firebaseData.js      # Dados do Firebase
│   │   ├── impressaoService.js  # Serviço de impressão
│   │   ├── notaFiscalPaulista.js # Integração NFP
│   │   ├── planoManager.js      # ⭐ Gerenciamento de planos e assinaturas
│   │   ├── supabaseClient.js    # Configuração Supabase
│   │   └── tenantData.js        # ⭐ Dados do tenant
│   ├── utils/                   # Utilitários
│   │   ├── formatters.js        # Formatadores (moeda, data)
│   │   └── planos.js            # ⭐ Constantes dos planos
│   ├── App.jsx                  # Componente principal com rotas
│   ├── App.css                  # Estilos globais
│   ├── index.css                # Estilos base
│   ├── main.jsx                 # Ponto de entrada
│   ├── mockData.js              # Dados mockados para testes
│   └── PDV.jsx                  # Página principal do PDV
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md                    # ⭐ Documentação
```

---

## 📦 Módulos do Sistema

### 1. PDV (Caixa)

**Arquivo principal:** `src/PDV.jsx`

O módulo PDV é o coração do sistema, projetado para operação rápida e eficiente:

- **Entrada de produtos**: Código de barras com foco automático no input
- **Busca de produtos**: Modal F10 com filtro por código ou descrição
- **Carrinho de compras**: Tabela com código, descrição, quantidade, valor unitário e total
- **Painel lateral**: Exibe subtotal, desconto e total da venda
- **Formas de pagamento**: Dinheiro (com cálculo de troco), PIX e Cartão
- **Integração NFP**: Solicita CPF e emite NF-e automaticamente

### 2. Dashboard

**Arquivo principal:** `src/components/Dashboard.jsx`

Painel gerencial com:
- Gráfico de vendas (Chart.js)
- Cards com indicadores (faturamento, ticket médio, etc.)
- Visão geral do desempenho do negócio

### 3. Inventário

**Arquivo principal:** `src/pages/inventario.jsx`

Controle de estoque com:
- Listagem de produtos com código, descrição, preço e estoque
- Alertas visuais para estoque baixo (vermelho) e sem estoque (laranja)
- Categorias de produtos
- Modal para adicionar/editar produtos

### 4. Relatórios

**Arquivo principal:** `src/pages/Relatorios.jsx`

> ⚠️ **Disponível apenas nos planos Básico, Profissional e Premium**

Geração de relatórios de vendas com:
- Cards de resumo (faturamento, vendas, ticket médio, descontos)
- Gráficos (faturamento semanal, formas de pagamento, top produtos)
- Comparativo mensal
- Tabelas detalhadas

### 5. Configurações

**Arquivo principal:** `src/pages/Configuracoes.jsx`

Configurações gerais do sistema e upgrade de plano.

### 6. Suporte

**Arquivo principal:** `src/pages/Suporte.jsx`

Página de suporte e ajuda ao usuário.

### 7. Nota Fiscal Paulista

**Arquivo principal:** `src/pages/NotaFiscalPaulista.jsx`
**Serviço:** `src/services/notaFiscalPaulista.js`

> ⚠️ **Disponível apenas nos planos Profissional e Premium**

Módulo completo de gestão fiscal com 3 abas.

### 8. Administrativo (Secreto)

**Acesso:** `/admin/login` (email: `admin@sistema.com`, senha: `1234`)

#### Dashboard Admin (`/admin`)
- Cards: Total Clientes, Teste Grátis, Assinantes Ativos, Vencidos
- Distribuição por Plano (gráfico de barras)
- Resumo Financeiro
- Últimos Clientes Cadastrados

#### Gerenciar Clientes (`/admin/clientes`)
- Tabela com todos os clientes
- Ações: Alterar Plano, Renovar Trial, Alterar Status
- Filtros por status
- Cards de resumo

#### Financeiro (`/admin/financeiro`)
- Faturamento Total
- Total de Vendas
- Clientes Pagantes (%)
- Receita Potencial Mensal
- Faturamento por Cliente

#### Planos (`/admin/planos`)
- Cards com distribuição por plano
- Features de cada plano
- Clientes por Plano

---

## 🔌 Integração com Nota Fiscal Paulista

### Fluxo de Emissão

```
1. Operador finaliza venda no PDV
2. Sistema pergunta: "CPF na nota?"
3. Se sim → operador digita o CPF do cliente
4. Sistema valida o CPF (dígitos verificadores)
5. Sistema verifica se a empresa está configurada (CNPJ, IE, etc.)
6. Gera o XML da NF-e no padrão 4.00
7. Gera chave de acesso de 44 dígitos
8. Envia para a SEFAZ-SP (simulado ou real)
9. Retorna protocolo de autorização
10. Exibe confirmação com dados da nota
11. Salva no histórico local
12. Finaliza a venda
```

### Chave de Acesso (44 dígitos)

A chave de acesso é gerada no formato:

```
UF + AAMM + CNPJ + modelo + série + número + tpEmis + código numérico + DV
35   2412   00000000000000 55    1     000000001 1       12345678        X
```

- **UF**: 35 (São Paulo)
- **AAMM**: Ano e mês de emissão
- **CNPJ**: 14 dígitos do emitente
- **Modelo**: 55 (NF-e)
- **Série**: 1
- **Número**: 9 dígitos
- **tpEmis**: 1 (Normal)
- **Código numérico**: 8 dígitos aleatórios
- **DV**: Dígito verificador (módulo 11)

### Ambientes

| Ambiente | Finalidade | tpAmb no XML |
|----------|------------|--------------|
| **Homologação** | Testes e validação | 2 |
| **Produção** | Emissão real de notas | 1 |

> ⚠️ **Importante**: Sempre teste no ambiente de homologação antes de migrar para produção.

---

## ⌨ Atalhos do Teclado

O PDV possui atalhos otimizados para agilizar o atendimento:

| Tecla | Função | Descrição |
|-------|--------|-----------|
| **F2** | Cancelar Item | Remove um item específico do cupom |
| **F3** | Cancelar Cupom | Remove todos os itens do cupom |
| **F5** | Definir Quantidade | Altera a quantidade padrão |
| **F6** | Aplicar Desconto | Aplica desconto em reais |
| **F7** | Pagamento PIX | Finaliza venda via PIX |
| **F8** | Pagamento Dinheiro | Finaliza venda em dinheiro |
| **F9** | Pagamento Cartão | Finaliza venda com cartão |
| **F10** | Buscar Produtos | Abre modal de consulta de produtos |
| **F11** | Dashboard | Navega para o dashboard |
| **F12** | Imprimir | Imprime o cupom fiscal |
| **ESC** | Fechar Modal | Fecha o modal F10 |

---

## 📡 API de Serviços

### `src/services/planoManager.js`

| Função | Descrição |
|--------|-----------|
| `criarAssinatura(planoId, periodoTeste)` | Cria nova assinatura |
| `carregarAssinatura()` | Carrega assinatura do localStorage |
| `salvarAssinatura(assinatura)` | Salva assinatura |
| `verificarStatusAssinatura()` | Verifica status atual |
| `featureDisponivel(featureName)` | Verifica se feature está disponível |
| `gerarRelatorioAdmin()` | Gera relatório de todos os clientes |
| `alterarPlanoManual(tenantId, novoTenant, novoPlano)` | ⭐ Altera plano manualmente |
| `renovarTrialManual(tenantId, dias)` | ⭐ Renova trial manualmente |
| `alterarStatusManual(tenantId, novoStatus)` | ⭐ Altera status manualmente |

### `src/services/notaFiscalPaulista.js`

| Função | Descrição |
|--------|-----------|
| `carregarConfiguracoes()` | Carrega config do localStorage |
| `salvarConfiguracoes(novaConfig)` | Salva config no localStorage |
| `isConfigurado()` | Verifica se está configurado |
| `emitirNotaFiscal(dadosVenda, cpfCliente)` | Emite NF-e |
| `validarCPF(cpf)` | Valida CPF |
| `consultarNotasPorCPF(cpf)` | Consulta notas por CPF |
| `cancelarNotaFiscal(chaveAcesso, justificativa)` | Cancela NF-e |
| `gerarDANFE(nota)` | Gera HTML do DANFE |

---

## 🚢 Deploy e Produção

### Build

```bash
npm run build
```

### Hospedagem

O sistema pode ser hospedado em qualquer servidor estático:

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Configurar no repositório
- **Servidor próprio**: Copiar conteúdo de `dist/` para o servidor web

### Configuração para Produção

1. Configure as variáveis de ambiente no servidor
2. Defina o ambiente NFP como "Produção"
3. Instale o certificado digital A1/A3
4. Configure o redirecionamento SPA no servidor (todas as rotas para `index.html`)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

**Carvalho Systems**

- GitHub: [@CarvalhoSystems](https://github.com/CarvalhoSystems)
- Projeto: [Sistema_Simples](https://github.com/CarvalhoSystems/Sistema_Simples)

---

<div align="center">
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!</p>
</div>