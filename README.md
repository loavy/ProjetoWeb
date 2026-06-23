# Projeto Web - Sistema de Gestão de Fornecimento

Este projeto é uma aplicação full-stack com frontend em React + Vite e backend em Node.js + Express. A aplicação gerencia empresas fornecedoras e produtos relacionados, com autenticação via login e painel administrativo.

## Estrutura do projeto

```
ProjetoWeb/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── server.js
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md
```

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e configurado
- Um arquivo `.env` na raiz do projeto com as variáveis de ambiente

## Configuração do `.env`

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PORT=3000

DB_USER=seu_usuario
DB_HOST=localhost
DB_NAME=seu_banco
DB_PASSWORD=sua_senha
DB_PORT=5432
JWT_SECRET=algumsegredoseguro
```

> O backend utiliza PostgreSQL e o arquivo `backend/config/database.js` faz a conexão com o banco.

## Instalação

Na raiz do projeto, execute:

```bash
npm install
```

## Executando o projeto

### Backend

Inicie o servidor Express:

```bash
npm run backend
```

O backend ficará disponível em:

```
http://localhost:3000
```

### Frontend

Em outro terminal, execute:

```bash
npm run dev
```

O frontend com Vite deverá ficar disponível em uma URL como:

```
http://localhost:5173
```

## Rotas de API

### Autenticação

- `POST /api/auth/login`

### Empresas

- `GET /api/companies`
- `POST /api/companies`
- `PUT /api/companies/:id`
- `DELETE /api/companies/:id`

### Produtos

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

## Funcionalidades principais

- Login de usuário via API
- Cadastro, edição e exclusão de empresas
- Cadastro, edição e exclusão de produtos vinculados a empresas
- Filtros de busca nas páginas de empresas e produtos
- Interface administrativa responsiva

## Observações

- Não existe rota de cadastro de usuário (`/register`) na API.
- A autenticação é feita com JWT usando `JWT_SECRET`.

## Comandos úteis

```bash
npm run dev
npm run backend
npm run build
npm run lint
```

## Arquivos importantes

- `backend/server.js`
- `backend/routes/authRoutes.js`
- `backend/routes/companiesRoutes.js`
- `backend/routes/productsRoutes.js`
- `backend/config/database.js`
- `src/pages/Companies/Companies.jsx`
- `src/pages/Products/Products.jsx`

## Como contribuir

1. Instale as dependências com `npm install`.
2. Inicie o backend e o frontend em terminais separados.
3. Faça as alterações necessárias no frontend ou backend.
4. Teste as rotas e a interface.

## Contato

Para ajustes de ambiente ou banco de dados, revise o arquivo `backend/config/database.js` e o `backend/server.js`.
