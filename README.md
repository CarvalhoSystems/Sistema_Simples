# 🏪 System PDV - Sistema de Gestão Comercial

Sistema completo de ponto de venda (PDV) com painel administrativo, controle de estoque, relatórios, integração com Nota Fiscal Paulista e fluxo de assinatura, desenvolvido em React + Vite para uso rápido em produção.

---

## ✅ Status do projeto

Esta versão já está preparada para:
- funcionar localmente em desenvolvimento;
- compilar para produção;
- ser publicada na Vercel;
- ser apresentada a clientes com fluxo de login, cadastro, estoque e vendas já protegidos.

---

## ✨ O que o sistema oferece

- PDV com carrinho, subtotal, desconto, total e formas de pagamento;
- controle de estoque com prevenção de vendas sem disponibilidade;
- login e cadastro com autenticação e proteção de rotas;
- dashboard administrativo e páginas de inventário, relatórios e configurações;
- integração com Nota Fiscal Paulista e fluxo de emissão de notas;
- suporte a deploy em Vercel com fallback de rotas SPA.

---

## 🔧 Requisitos

- Node.js 18+;
- npm 9+;
- navegador moderno.

---

## ▶️ Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Acesse:

```text
http://localhost:5173/
```

4. Para gerar a build de produção:

```bash
npm run build
```

---

## 🌐 Deploy na Vercel

1. Faça o push do projeto para o GitHub.
2. Acesse o painel da Vercel e importe o repositório.
3. Defina o framework como Vite.
4. O projeto já inclui o arquivo de configuração de rota para SPA em [vercel.json](vercel.json).
5. Clique em Deploy.

### Variáveis de ambiente (opcional)

Se quiser habilitar Firebase para autenticação persistente, crie um arquivo .env na raiz com algo como:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

Sem essas variáveis, o sistema funciona em modo local/demo.

---

## 📁 Estrutura principal

```text
src/
  components/      # componentes reutilizáveis
  pages/           # páginas do sistema
  services/        # integração com Firebase, NFP, planos e tenants
  utils/           # utilitários e regras de negócio
  PDV.jsx          # ponto de venda principal
```

---

## 🧪 Validação realizada

Os seguintes checks foram executados com sucesso:
- build de produção com npm run build;
- testes das regras de estoque e login;
- validação da aplicação para uso local e deploy.

---

## 🚀 Próximo passo

Com o projeto já compilando e preparado para deploy, o próximo passo é apenas:
- conectar o repositório na Vercel;
- publicar;
- compartilhar o link com os clientes.
