import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(3, "Informe seu nome completo."),
  customerEmail: z.string().trim().email("E-mail inválido."),
  customerPhone: z.string().trim().min(10, "Informe um telefone com DDD."),
  customerCpf: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 0 || v.length === 11, "CPF inválido.")
    .optional()
    .or(z.literal("")),
  shipCep: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 8, "CEP inválido."),
  shipStreet: z.string().trim().min(2, "Informe a rua."),
  shipNumber: z.string().trim().min(1, "Informe o número."),
  shipComplement: z.string().trim().optional().or(z.literal("")),
  shipDistrict: z.string().trim().min(2, "Informe o bairro."),
  shipCity: z.string().trim().min(2, "Informe a cidade."),
  shipState: z.string().trim().length(2, "UF com 2 letras."),
});

export type CheckoutData = z.infer<typeof checkoutSchema>;

export const customOrderSchema = z.object({
  type: z.enum(["modelo", "referencia", "ia"]),
  baseProductId: z.string().optional().or(z.literal("")),
  referenceImageUrl: z.string().optional().or(z.literal("")),
  aiPrompt: z.string().optional().or(z.literal("")),
  aiImageUrl: z.string().optional().or(z.literal("")),
  fabric: z.string().optional().or(z.literal("")),
  colorNotes: z.string().optional().or(z.literal("")),
  details: z.string().optional().or(z.literal("")),
  measurements: z.record(z.string(), z.string()),
  customerName: z.string().trim().min(3, "Informe seu nome completo."),
  customerEmail: z.string().trim().email("E-mail inválido."),
  customerPhone: z.string().trim().min(10, "Informe um telefone com DDD."),
  customerCity: z.string().trim().optional().or(z.literal("")),
});

export type CustomOrderData = z.infer<typeof customOrderSchema>;

export const cardSchema = z.object({
  number: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 13 && v.length <= 19, "Número de cartão inválido."),
  holder: z.string().trim().min(3, "Nome impresso no cartão."),
  expMonth: z.string().refine((v) => /^\d{2}$/.test(v) && Number(v) >= 1 && Number(v) <= 12, "Mês inválido."),
  expYear: z.string().refine((v) => /^\d{4}$/.test(v), "Ano inválido."),
  cvv: z.string().refine((v) => /^\d{3,4}$/.test(v), "CVV inválido."),
  installments: z.coerce.number().int().min(1).max(12).default(1),
});

export type CardData = z.infer<typeof cardSchema>;
