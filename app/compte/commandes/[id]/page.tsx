import OrderDetailPage from "@/components/OrderDetailPage";

export const metadata = {
  title: "Détail commande | GreenCart",
  description: "Consultez le détail de votre commande."
};

export default function OrderDetailRoute({ params }: { params: { id: string } }) {
  const orderId = Number(params.id);
  return <OrderDetailPage orderId={Number.isFinite(orderId) ? orderId : 0} />;
}

