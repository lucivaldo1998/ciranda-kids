# CIRANDA — Moda infantil

Loja online de roupas infantis + ateliê sob medida (festa, fantasia, personagem), com painel administrativo completo e checkout integrado (Mercado Pago, Stripe e Cielo). Pronto para publicar na **Vercel** com banco **Supabase (Postgres)**.

## Publicando na web (Vercel + Supabase) — passo a passo

1. **Supabase**: crie um projeto novo (um para cada loja). Em *Connect* → copie a URL do **Transaction pooler** (porta 6543) e coloque a senha do banco nela.
2. **Vercel**: dentro desta pasta, rode `npx vercel` (a primeira vez pede login) e depois `npx vercel --prod`. Alternativa: suba a pasta para um repositório GitHub e importe na Vercel.
3. **Variáveis de ambiente** (Vercel → Settings → Environment Variables):
   - `DATABASE_URL` = URL do pooler do Supabase
   - `ADMIN_PASSWORD` = senha forte para o painel
   - `SETTINGS_ENCRYPTION_KEY` = string longa e aleatória
   - `NEXT_PUBLIC_SITE_URL` = https://SEU-DOMINIO.vercel.app
   - `BLOB_READ_WRITE_TOKEN` = crie em Vercel → Storage → **Blob** (necessário para upload de fotos pelo painel)
   - Depois de criar/alterar variáveis, faça um redeploy.
4. **Banco**: acesse `https://SEU-DOMINIO.vercel.app/api/admin/bootstrap?senha=SUA_SENHA_ADMIN` — cria as tabelas e os dados iniciais sozinho (pode rodar mais de uma vez sem risco).
5. Pronto: o site está no ar. Entre em `/admin`, configure marca, produtos e as chaves de pagamento (comece em **modo de teste**).

## Rodando localmente

```bash
npm install
# aponte DATABASE_URL no .env para o seu Postgres (Supabase serve)
npm run db:init        # cria as tabelas (sem depender do Prisma CLI)
npm run db:seed        # produtos de demonstração + configurações
npm run dev            # http://localhost:3000
```

> `npm run db:push` (Prisma CLI) também funciona no lugar de `db:init`, se preferir.

## Painel administrativo

- Acesse `/admin` — senha em `ADMIN_PASSWORD`.
- **Pedidos**: acompanhe vendas, mude status (pago → em preparo → enviado → entregue).
- **Ateliê sob medida**: fila de encomendas com ficha de medidas, envio de orçamento e link de pagamento automático.
- **Produtos / Categorias**: catálogo com fotos, tamanhos e estoque.
- **Conteúdo do site**: textos e imagens da home, do Sobre e do Ateliê.
- **Pagamentos**: chaves do Mercado Pago, Stripe e Cielo (criptografadas com AES-256-GCM).
- **Configurações**: marca, cores, logo, frete, SEO e chave de IA (croquis do Ateliê).

## Pagamentos

| Gateway | O que habilita no checkout | Chaves necessárias |
| --- | --- | --- |
| Mercado Pago | PIX na tela + cartão via Checkout Pro | Public Key + Access Token |
| Stripe | Cartão internacional (Stripe Checkout) | Publishable + Secret + Webhook signing secret |
| Cielo | Cartão digitado direto no site (API 3.0) | MerchantId + MerchantKey |

Cadastre os **webhooks** no painel de cada provedor apontando para:

- `https://SEU-DOMINIO/api/webhooks/mercadopago`
- `https://SEU-DOMINIO/api/webhooks/stripe`
- `https://SEU-DOMINIO/api/webhooks/cielo`

Use primeiro o **modo de teste** (sandbox) com credenciais de teste; troque para produção quando estiver tudo validado.

## Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `DATABASE_URL` | Postgres (Supabase — URL do Transaction pooler) |
| `ADMIN_PASSWORD` | Senha do painel `/admin` |
| `SETTINGS_ENCRYPTION_KEY` | Criptografa as chaves de pagamento/IA no banco; se trocar depois, recadastre as chaves |
| `NEXT_PUBLIC_SITE_URL` | URL pública (redirects de pagamento e webhooks) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — uploads de fotos em produção |

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Prisma 7 + Postgres · TypeScript. Sem SDKs de pagamento: integrações via REST puro, fáceis de auditar em `src/lib/payments/`. Uploads: Vercel Blob em produção, disco local em dev.
