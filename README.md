# COMPIA Editora - Loja Virtual

Loja virtual acadêmica para a COMPIA Editora, especializada em livros físicos e e-books sobre Inteligência Artificial.

## Stack

- Next.js com App Router
- JavaScript
- CSS puro
- Context API
- API Routes
- MySQL com `mysql2`
- Deploy único na Vercel

## Funcionalidades desta fase

- Página inicial com destaques
- Catálogo público com busca, filtro por categoria e filtro por formato
- Página de detalhes do produto
- Login administrativo simples por senha
- CRUD de produtos no painel admin
- Integração com MySQL/Aiven usando SSL
- Camada de repositories para isolar SQL das rotas API

## Estrutura

```txt
app/
  api/
  admin/
  produtos/
components/
contexts/
database/
lib/
repositories/
```

## Configuração local

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env.local` baseado em `.env.example`:

```env
MYSQL_HOST=your-aiven-host.aivencloud.com
MYSQL_PORT=12345
MYSQL_DATABASE=compia_editora
MYSQL_USER=avnadmin
MYSQL_PASSWORD=your-password
MYSQL_SSL_CA="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"

ADMIN_PASSWORD=change-this-password
```

Execute o schema em `database/schema.sql` no banco MySQL da Aiven antes de iniciar a aplicação.

Depois rode:

```bash
npm run dev
```

Acesse:

- Área pública: `http://localhost:3000`
- Catálogo: `http://localhost:3000/produtos`
- Admin: `http://localhost:3000/admin/login`

## Banco de dados

O arquivo `database/schema.sql` cria:

- `products`
- `categories`
- `product_categories`
- `tags`
- `product_tags`

Também insere categorias e tags iniciais com `INSERT IGNORE`.

## API

- `GET /api/products`
- `GET /api/products/[id]`
- `POST /api/products`
- `PUT /api/products/[id]`
- `DELETE /api/products/[id]`
- `GET /api/categories`
- `GET /api/tags`
- `POST /api/admin/login`

As rotas de escrita exigem o header `x-admin-password` com a senha configurada em `ADMIN_PASSWORD`.

## Deploy na Vercel

1. Suba o projeto para um repositório Git.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente da Aiven e `ADMIN_PASSWORD`.
4. Garanta que o schema foi aplicado no banco.
5. Faça o deploy.

## Observações

Esta fase não inclui carrinho, checkout, pagamentos, pedidos ou autenticação avançada.
