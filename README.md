# 🏪 System PDV - Sistema de Gestão Comercial

Sistema completo de Ponto de Venda (PDV) com integração à **Nota Fiscal Paulista (SEFAZ-SP)**, desenvolvido em React + Vite.

---

## 📋 Índice

- [Sobre o Sistema](#-sobre-o-sistema)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Módulos do Sistema](#-módulos-do-sistema)
  - [PDV (Caixa)](#1-pdv-caixa)
  - [Dashboard](#2-dashboard)
  - [Inventário](#3-inventário)
  - [Relatórios](#4-relatórios)
  - [Configurações](#5-configurações)
  - [Suporte](#6-suporte)
  - [Nota Fiscal Paulista](#7-nota-fiscal-paulista)
- [Integração com Nota Fiscal Paulista](#-integração-com-nota-fiscal-paulista)
  - [Fluxo de Emissão](#fluxo-de-emissão)
  - [Estrutura do XML](#estrutura-do-xml)
  - [Configuração da Empresa](#configuração-da-empresa)
  - [Ambientes](#ambientes)
  - [Certificado Digital](#certificado-digital)
- [Atalhos do Teclado](#-atalhos-do-teclado)
- [API de Serviços](#-api-de-serviços)
- [Deploy e Produção](#-deploy-e-produção)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Sobre o Sistema

O **System PDV** é um sistema de gestão comercial completo, desenvolvido para atender estabelecimentos comerciais de pequeno e médio porte. O sistema oferece:

- **PDV (Ponto de Venda)** com interface otimizada para operadores de caixa
- **Dashboard gerencial** com gráficos e indicadores de desempenho
- **Controle de inventário** com alertas de estoque mínimo
- **Emissão de Nota Fiscal Eletrônica** integrada à **Nota Fiscal Paulista (SEFAZ-SP)**
- **Relatórios** de vendas e movimentações
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
- ✅ Histórico completo de notas emitidas
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

### Segurança
- ✅ Autenticação de usuários (login/signup)
- ✅ Rotas protegidas
- ✅ Contexto de autenticação global

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **React** | 19.x | Biblioteca principal para construção da interface |
| **Vite** | 6.x | Bundler e servidor de desenvolvimento |
| **React Router** | 7.x | Roteamento SPA |
| **SweetAlert2** | 11.x | Modais e diálogos interativos |
| **Chart.js** | 4.x | Gráficos do dashboard |
| **Tailwind CSS** | 4.x | Estilização utilitária |
| **Font Awesome** | 6.x | Ícones |
| **localStorage** | - | Persistência de dados no navegador |

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
# URL da API da Nota Fiscal Paulista (opcional - padrão: homologação SEFAZ)
VITE_NFP_API_URL=https://homologacao.nfpaulista.fazenda.sp.gov.br/api

# Token de autenticação da API (se aplicável)
VITE_NFP_API_TOKEN=
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
├── public/                    # Arquivos públicos
│   ├── favicon.ico
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                # Recursos estáticos
│   ├── components/            # Componentes reutilizáveis
│   │   ├── PDV/               # Componentes específicos do PDV
│   │   │   ├── BarraSuperior.jsx
│   │   │   ├── TabelaCupom.jsx
│   │   │   ├── PainelLateral.jsx
│   │   │   └── RodapeAtalhos.jsx
│   │   ├── AuthContext.jsx    # Contexto de autenticação
│   │   ├── Dashboard.jsx      # Dashboard gerencial
│   │   ├── DashboardCard.jsx  # Card de indicador
│   │   ├── DashboardLayout.jsx # Layout do dashboard
│   │   ├── Layout.jsx         # Layout principal
│   │   ├── ProductModal.jsx   # Modal de produto
│   │   ├── ProductTable.jsx   # Tabela de produtos
│   │   ├── ProtectedRoute.jsx # Rota protegida
│   │   ├── SalesChart.jsx     # Gráfico de vendas
│   │   └── Sidebar.jsx        # Barra lateral de navegação
│   ├── hooks/                 # Hooks personalizados
│   │   └── useKeyboardShortcuts.js
│   ├── pages/                 # Páginas do sistema
│   │   ├── Configuracoes.jsx  # Configurações do sistema
│   │   ├── inventario.jsx     # Controle de inventário
│   │   ├── InventoryHeader.jsx # Cabeçalho do inventário
│   │   ├── Login.jsx          # Tela de login
│   │   ├── NotaFiscalPaulista.jsx # ⭐ Gerenciamento NFP
│   │   ├── ProductModal.jsx   # Modal de produto (inventário)
│   │   ├── ProductTable.jsx   # Tabela de produtos (inventário)
│   │   ├── Relatorios.jsx     # Relatórios
│   │   ├── Signup.jsx         # Cadastro de usuário
│   │   ├── Suporte.jsx        # Página de suporte
│   │   └── Toolbar.jsx        # Barra de ferramentas
│   ├── services/              # ⭐ Serviços e APIs
│   │   └── notaFiscalPaulista.js # Integração NFP
│   ├── utils/                 # Utilitários
│   │   └── formatters.js      # Formatadores (moeda, data)
│   ├── App.jsx                # Componente principal com rotas
│   ├── App.css                # Estilos globais
│   ├── index.css              # Estilos base
│   ├── main.jsx               # Ponto de entrada
│   ├── mockData.js            # Dados mockados para testes
│   └── PDV.jsx                # ⭐ Página principal do PDV
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md                  # ⭐ Documentação
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

**Componentes:**
- `BarraSuperior.jsx` — Cabeçalho com informações do sistema
- `TabelaCupom.jsx` — Tabela de itens do cupom fiscal
- `PainelLateral.jsx` — Painel com totais e formas de pagamento
- `RodapeAtalhos.jsx` — Rodapé com atalhos de teclado

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
- Categorias de produtos (Padaria, Mercearia, Frios, Bebidas)
- Modal para adicionar/editar produtos

### 4. Relatórios

**Arquivo principal:** `src/pages/Relatorios.jsx`

Geração de relatórios de vendas e movimentações.

### 5. Configurações

**Arquivo principal:** `src/pages/Configuracoes.jsx`

Configurações gerais do sistema.

### 6. Suporte

**Arquivo principal:** `src/pages/Suporte.jsx`

Página de suporte e ajuda ao usuário.

### 7. Nota Fiscal Paulista

**Arquivo principal:** `src/pages/NotaFiscalPaulista.jsx`
**Serviço:** `src/services/notaFiscalPaulista.js`

Módulo completo de gestão fiscal com 3 abas:

#### Aba 1: Configuração
- **Dados da Empresa**: Razão Social, Nome Fantasia, CNPJ, IE, IM, CNAE
- **Regime Tributário**: Simples Nacional, Simples Nacional Excesso, Regime Normal
- **Endereço**: Logradouro, número, bairro, cidade, UF, CEP
- **Certificado Digital**: Tipo (A1/A3), caminho do arquivo, senha
- **Ambiente**: Homologação (testes) ou Produção

#### Aba 2: Notas Emitidas
- Histórico completo de notas fiscais emitidas
- Número da nota, data, CPF do cliente, valor, status
- Ações: Visualizar DANFE, copiar chave de acesso
- Status: Autorizada (verde), Cancelada (vermelho)

#### Aba 3: Consulta CPF
- Consulta de notas por CPF do cliente
- Indicadores: total de notas, valor acumulado, créditos estimados
- Listagem detalhada das notas do cliente

---

## 🔌 Integração com Nota Fiscal Paulista

### Fluxo de Emissão

O fluxo completo de emissão de uma Nota Fiscal Paulista ocorre da seguinte forma:

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

### Estrutura do XML

O XML gerado segue o **padrão 4.00 da SEFAZ** e inclui:

```xml
<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <idLote>...</idLote>
  <NFe>
    <infNFe>
      <ide>        <!-- Identificação da NF-e -->
        <cUF>35</cUF>           <!-- SP -->
        <mod>55</mod>           <!-- Modelo NF-e -->
        <serie>1</serie>
        <nNF>...</nNF>          <!-- Número da nota -->
        <dhEmi>...</dhEmi>      <!-- Data/hora emissão -->
        <tpAmb>1|2</tpAmb>      <!-- 1=Produção, 2=Homologação -->
      </ide>
      <emit>      <!-- Emitente (sua empresa) -->
        <CNPJ>...</CNPJ>
        <xNome>...</xNome>      <!-- Razão Social -->
        <IE>...</IE>            <!-- Inscrição Estadual -->
        <CRT>1|2|3</CRT>        <!-- Regime Tributário -->
      </emit>
      <dest>      <!-- Destinatário (cliente) -->
        <CPF>...</CPF>
      </dest>
      <det>       <!-- Detalhamento dos produtos -->
        <prod>
          <cProd>...</cProd>    <!-- Código do produto -->
          <xProd>...</xProd>    <!-- Descrição -->
          <NCM>21069090</NCM>   <!-- NCM padrão -->
          <CFOP>5102</CFOP>     <!-- CFOP venda -->
          <vProd>...</vProd>    <!-- Valor -->
        </prod>
        <imposto>
          <ICMS>...</ICMS>      <!-- ICMS 18% -->
          <PIS>...</PIS>        <!-- PIS 1,65% -->
          <COFINS>...</COFINS>  <!-- COFINS 7,6% -->
        </imposto>
      </det>
      <total>     <!-- Totais da nota -->
        <ICMSTot>
          <vBC>...</vBC>        <!-- Base de cálculo ICMS -->
          <vICMS>...</vICMS>    <!-- Valor ICMS -->
          <vProd>...</vProd>    <!-- Valor dos produtos -->
          <vNF>...</vNF>        <!-- Valor total da NF -->
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</enviNFe>
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

### Configuração da Empresa

Para emitir notas fiscais, configure os seguintes dados no menu **N. Fiscal Paulista > Configuração**:

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| Razão Social | ✅ | Nome jurídico da empresa |
| CNPJ | ✅ | Cadastro Nacional da Pessoa Jurídica |
| Inscrição Estadual | ✅ | Inscrição estadual (formato SP) |
| Inscrição Municipal | ❌ | Inscrição municipal |
| CNAE | ❌ | Classificação Nacional de Atividades Econômicas |
| Regime Tributário | ✅ | Simples Nacional, Excesso ou Regime Normal |
| Endereço | ✅ | Logradouro, número, bairro, cidade, UF, CEP |
| Certificado Digital | ✅ (produção) | Tipo A1 ou A3 |

### Ambientes

| Ambiente | Finalidade | tpAmb no XML |
|----------|------------|--------------|
| **Homologação** | Testes e validação | 2 |
| **Produção** | Emissão real de notas | 1 |

> ⚠️ **Importante**: Sempre teste no ambiente de homologação antes de migrar para produção.

### Certificado Digital

Para emitir NF-e em produção, é necessário um certificado digital:

| Tipo | Formato | Armazenamento |
|------|---------|---------------|
| **A1** | Arquivo `.pfx` ou `.p12` | Disco local |
| **A3** | Token ou cartão | Dispositivo físico |

**Onde obter:**
- Certisign
- Serasa
- Soluti
- Outras ACs credenciadas pela ICP-Brasil

### Documentação Oficial

- [Portal da Nota Fiscal Paulista](https://www.nfpaulista.fazenda.sp.gov.br)
- [Manual de Integração NF-e 4.00](https://www.nfe.fazenda.gov.br)
- [SEFAZ-SP](https://www.fazenda.sp.gov.br)

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

### `src/services/notaFiscalPaulista.js`

| Função | Descrição | Parâmetros | Retorno |
|--------|-----------|------------|---------|
| `carregarConfiguracoes()` | Carrega config do localStorage | - | `Object` config |
| `salvarConfiguracoes(novaConfig)` | Salva config no localStorage | `Object` | `Object` config |
| `getConfiguracoes()` | Obtém config atual | - | `Object` config |
| `isConfigurado()` | Verifica se está configurado | - | `boolean` |
| `emitirNotaFiscal(dadosVenda, cpfCliente)` | Emite NF-e | `Object`, `String` | `Object` nota |
| `validarCPF(cpf)` | Valida CPF | `String` | `boolean` |
| `formatarCPF(cpf)` | Formata CPF | `String` | `String` |
| `consultarNotasPorCPF(cpf)` | Consulta notas por CPF | `String` | `Object` resultado |
| `cancelarNotaFiscal(chaveAcesso, justificativa)` | Cancela NF-e | `String`, `String` | `Object` nota |
| `gerarDANFE(nota)` | Gera HTML do DANFE | `Object` | `String` HTML |
| `carregarNotasEmitidas()` | Carrega notas do localStorage | - | `Array` notas |

### Exemplo de uso:

```javascript
import { emitirNotaFiscal, validarCPF, isConfigurado } from './services/notaFiscalPaulista';

// Verificar se está configurado
if (isConfigurado()) {
  console.log('Empresa configurada para emitir NF-e');
}

// Validar CPF
if (validarCPF('123.456.789-09')) {
  console.log('CPF válido');
}

// Emitir nota fiscal
const dadosVenda = {
  carrinho: [
    { codigo: '1', descricao: 'PÃO FRANCÊS', qtd: 2, vUnit: 0.80 },
    { codigo: '2', descricao: 'LEITE 1L', qtd: 1, vUnit: 4.80 },
  ],
  total: 6.40,
  subtotal: 6.40,
  desconto: 0,
  metodo: 'Dinheiro',
};

try {
  const nota = await emitirNotaFiscal(dadosVenda, '123.456.789-09');
  console.log(`NF-e emitida: ${nota.numeroNota}`);
  console.log(`Chave: ${nota.chaveAcesso}`);
  console.log(`Protocolo: ${nota.protocolo}`);
} catch (error) {
  console.error('Erro:', error.message);
}
```

---

## 🚢 Deploy e Produção

### Build

```bash
npm run build
```

Os arquivos otimizados serão gerados em `dist/`.

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

**Exemplo de configuração Nginx:**

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/sistema-pdv/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### Padrões de Código

- Utilize componentes funcionais com hooks
- Prefira CSS utilitário (Tailwind)
- Mantenha a consistência com o código existente
- Documente funções complexas

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Carvalho Systems**

- GitHub: [@CarvalhoSystems](https://github.com/CarvalhoSystems)
- Projeto: [Sistema_Simples](https://github.com/CarvalhoSystems/Sistema_Simples)

---

## 🙏 Agradecimentos

- [React](https://reactjs.org)
- [Vite](https://vitejs.dev)
- [SweetAlert2](https://sweetalert2.github.io)
- [Chart.js](https://www.chartjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Font Awesome](https://fontawesome.com)
- [SEFAZ-SP](https://www.fazenda.sp.gov.br)

---

<div align="center">
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!</p>
  <p>
    <a href="https://github.com/CarvalhoSystems/Sistema_Simples">
      <img src="https://img.shields.io/github/stars/CarvalhoSystems/Sistema_Simples?style=social" alt="Stars">
    </a>
  </p>
</div>