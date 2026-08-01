import { CartPageClient } from "@/components/cart/CartPageClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Carrinho" };

export default function CartPage() {
  return <CartPageClient />;
}
