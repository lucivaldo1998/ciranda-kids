// DDL do Postgres — espelho fiel de prisma/schema.prisma (mantenha os dois em sincronia).
// Usado pela rota /api/admin/bootstrap e pelo script prisma/init-db.ts.

export const PG_DDL = `
CREATE TABLE IF NOT EXISTS "Setting" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "brandName" TEXT NOT NULL DEFAULT 'CIRANDA',
  "tagline" TEXT NOT NULL DEFAULT 'Moda infantil feita com carinho',
  "whatsapp" TEXT NOT NULL DEFAULT '5592999999999',
  "email" TEXT,
  "phone" TEXT,
  "instagram" TEXT,
  "address" TEXT,
  "cnpj" TEXT,
  "announcement" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#2A6F63',
  "accentColor" TEXT NOT NULL DEFAULT '#F2803B',
  "backgroundColor" TEXT NOT NULL DEFAULT '#FFF7EC',
  "logoUrl" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "shippingFlatCents" INTEGER NOT NULL DEFAULT 1800,
  "freeShippingAboveCents" INTEGER NOT NULL DEFAULT 30000,
  "shippingNote" TEXT DEFAULT 'Prazo de produção e envio combinados via WhatsApp após a compra.',
  "openaiKeyCiphertext" TEXT,
  "openaiKeyIv" TEXT,
  "openaiKeyTag" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PaymentGateway" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "testMode" BOOLEAN NOT NULL DEFAULT true,
  "publicKey" TEXT,
  "secretCiphertext" TEXT,
  "secretIv" TEXT,
  "secretTag" TEXT,
  "webhookSecretCiphertext" TEXT,
  "webhookSecretIv" TEXT,
  "webhookSecretTag" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "fabric" TEXT NOT NULL DEFAULT 'algodao',
  "priceCents" INTEGER NOT NULL,
  "compareAtCents" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "allowCustomOrder" BOOLEAN NOT NULL DEFAULT true,
  "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "url" TEXT NOT NULL,
  "alt" TEXT NOT NULL DEFAULT '',
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "ProductVariant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "size" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '',
  "stock" INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "CustomOrder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'nova',
  "type" TEXT NOT NULL,
  "baseProductId" TEXT REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "referenceImageUrl" TEXT,
  "aiPrompt" TEXT,
  "aiImageUrl" TEXT,
  "fabric" TEXT,
  "colorNotes" TEXT,
  "details" TEXT,
  "measurementsJson" TEXT NOT NULL DEFAULT '{}',
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerCity" TEXT,
  "quoteCents" INTEGER,
  "quoteNotes" TEXT,
  "adminNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "CustomOrder_code_key" ON "CustomOrder"("code");

CREATE TABLE IF NOT EXISTS "Order" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "publicCode" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'aguardando_pagamento',
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerCpf" TEXT,
  "shipCep" TEXT NOT NULL,
  "shipStreet" TEXT NOT NULL,
  "shipNumber" TEXT NOT NULL,
  "shipComplement" TEXT,
  "shipDistrict" TEXT NOT NULL,
  "shipCity" TEXT NOT NULL,
  "shipState" TEXT NOT NULL,
  "subtotalCents" INTEGER NOT NULL,
  "shippingCents" INTEGER NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "paymentProvider" TEXT,
  "paymentMethod" TEXT,
  "paymentRef" TEXT,
  "pixQrCode" TEXT,
  "pixQrCodeB64" TEXT,
  "checkoutUrl" TEXT,
  "customOrderId" TEXT REFERENCES "CustomOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Order_publicCode_key" ON "Order"("publicCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_customOrderId_key" ON "Order"("customOrderId");

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" INTEGER NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "productId" TEXT REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "size" TEXT NOT NULL DEFAULT '',
  "color" TEXT NOT NULL DEFAULT '',
  "unitCents" INTEGER NOT NULL,
  "qty" INTEGER NOT NULL,
  "imageUrl" TEXT
);

CREATE TABLE IF NOT EXISTS "ContentBlock" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "json" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
