# COMPIA Editora - Loja Virtual & Painel Administrativo

Loja virtual acadêmica completa para a **COMPIA Editora**, especializada em livros físicos e digitais (e-books) sobre Inteligência Artificial, Engenharia de Software e Tecnologia.

---

## 🚀 Tecnologias Utilizadas

- **Next.js 16** (App Router com Turbopack)
- **React 18** (Context API, Hooks)
- **Vanilla CSS** (Design responsivo, tema escuro, glassmorphism e animações)
- **MySQL / TiDB** (Via `mysql2/promise` com suporte a SSL TLSv1.2)
- **Autenticação & RBAC**:
  - JWT assinado via `jose` armazenado em cookies seguros `HttpOnly`
  - Hash de senhas com `bcryptjs`
  - Next.js `middleware.js` para proteção dinâmica de rotas administrativas por papel
- **Deploy**: Vercel

---

## 🔐 Controle de Acesso por Perfis (RBAC)

O sistema possui controle de acesso com 3 perfis distintos para os membros da equipe:

| Perfil | Descrição | Permissões |
| :--- | :--- | :--- |
| 👑 **Admin** | Administrador Geral | Acesso total: Gerenciar usuários e equipe (`/admin/usuarios`), cadastrar/editar/excluir produtos, alterar status de pedidos e visualizar métricas. |
| 📝 **Editor** | Gestor de Conteúdo / Catálogo | Gerenciamento de produtos e categorias (`/admin/produtos`). Visualização de pedidos em modo leitura. Sem permissão para alterar status de pedidos ou gerenciar equipe. |
| 🏷️ **Vendedor** | Operador de Vendas & Atendimento | Gestão e atualização de status de pedidos (`/admin/pedidos`). Consulta ao catálogo de produtos. Sem permissão para cadastrar/editar produtos ou gerenciar equipe. |

---

## ✨ Funcionalidades

### Área Pública (E-Commerce)
- **Home**: Banner de destaques, vitrine de lançamentos e produtos em evidência.
- **Catálogo (`/produtos`)**: Busca por título/autor, filtros por categoria, tag e formato (Físico vs. Digital).
- **Detalhes do Produto (`/produtos/[id]`)**: Galeria de capas, resumo de especificações (ISBN, Páginas, Ano) e indicação de e-book.
- **Carrinho (`/cart`)**: Cálculo dinâmico de subtotal, controle de quantidades e botão de limpeza.
- **Checkout (`/checkout`)**: Cálculo de frete (Correios, Retirada ou Frete Grátis para E-book), dados de entrega e forma de pagamento (Pix ou Cartão).
- **Meus Pedidos (`/meus-pedidos`)**: Rastreamento de pedidos por e-mail/CPF e link de download automático para e-books.

### Painel Administrativo (`/admin`)
- **Login com RBAC (`/admin/login`)**: Autenticação por e-mail/senha com atalhos de teste dos papéis.
- **Gestão de Produtos (`/admin/produtos`)**: Listagem, criação e edição com upload/link de capas e arquivos digitais PDF/ePub.
- **Gestão de Pedidos (`/admin/pedidos`)**: Filtro por status (`pendente`, `pago`, `enviado`, `entregue`, `cancelado`), visão detalhada do cliente/itens e atualização de status.
- **Gestão da Equipe (`/admin/usuarios`)**: Área exclusiva de administradores para criar e editar acessos de novos membros da equipe.

---

## 🛠️ Configuração Local

### 1. Clonar e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd projeto_web
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie o arquivo `.env.local` na raiz do projeto baseado em `.env.example`:

```env
MYSQL_HOST=seu-servidor-mysql-ou-tidb.com
MYSQL_PORT=4000
MYSQL_DATABASE=compia_editora
MYSQL_USER=seu-usuario
MYSQL_PASSWORD=sua-senha

ADMIN_PASSWORD=aluno001
JWT_SECRET=sua-chave-secreta-jwt-super-segura
```

### 3. Inicializar o Banco de Dados e Usuários
Execute o schema SQL base no seu banco de dados (ou use os scripts de inicialização):

```bash
# Criar/atualizar a estrutura de tabelas no banco de dados
node update-schema.js

# Criar a tabela de usuários e popular com as contas padrão RBAC
node seed-users.js

# (Opcional) Popular o banco com livros de exemplo
node seed-books.js
```

> **Contas Padrão de Teste (Senha: `aluno001`):**
> - **Admin**: `admin@compia.com.br`
> - **Editor**: `editor@compia.com.br`
> - **Vendedor**: `vendedor@compia.com.br`

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```

Acesse a aplicação no navegador:
- **Loja Virtual**: [http://localhost:3000](http://localhost:3000)
- **Painel Administrativo**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 📁 Estrutura de Diretórios

```txt
projeto_web/
├── app/
│   ├── admin/               # Páginas do painel administrativo (login, produtos, pedidos, usuarios)
│   ├── api/                 # Endpoints REST (auth, products, orders, categories, tags, users)
│   ├── cart/                # Página do carrinho de compras
│   ├── checkout/            # Fluxo de finalização de compra e confirmação
│   ├── meus-pedidos/        # Consulta pública de pedidos por cliente
│   ├── produtos/            # Listagem e detalhe de produtos
│   ├── globals.css          # Design system e folhas de estilo globais
│   └── layout.js            # Layout raiz da aplicação
├── components/              # Componentes reutilizáveis (Header, Footer, ProductList, AdminLayout, etc)
├── contexts/                # Contextos globais (CartContext, AdminAuthContext)
├── database/                # Schema SQL de criação do banco de dados (schema.sql)
├── lib/                     # Conexão com DB (db.js) e utilitários de segurança (auth.js)
├── repositories/            # Camada de acesso a dados (productsRepository, ordersRepository, usersRepository)
├── seed-users.js            # Script para criação da tabela de usuários e contas de teste
├── seed-books.js            # Script para povoamento de catálogo inicial
└── middleware.js            # Middleware Next.js para interceptação e proteção RBAC de rotas
```

---

## 🔌 Principais Endpoints da API

- `POST /api/admin/auth/login`: Autenticação e emissão do cookie JWT.
- `POST /api/admin/auth/logout`: Revogação do cookie de sessão.
- `GET /api/admin/auth/me`: Retorna os dados e perfil do usuário logado.
- `GET | POST /api/admin/users`: Listagem e criação de usuários da equipe (Restrito ao Admin).
- `PUT /api/admin/users/[id]`: Edição de usuário/papel (Restrito ao Admin).
- `GET | POST /api/products`: Listagem pública de produtos e cadastro (Restrito a Admin/Editor).
- `PUT | DELETE /api/products/[id]`: Edição e exclusão de produto (Restrito a Admin/Editor).
- `GET | POST /api/orders`: Listagem e criação de pedidos.
- `PUT /api/orders/[id]`: Atualização de status de pedido (Restrito a Admin/Vendedor).
