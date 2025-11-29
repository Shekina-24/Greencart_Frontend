import OrdersPage from "@/components/OrdersPage";

export const metadata = {
  title: "Mes commandes | GreenCart",
  description: "Consultez l'\''historique de vos commandes GreenCart et mesurez l'\''impact carbone evite."
};

export default function OrdersRoute({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const successOrder = typeof searchParams?.order === 'string' ? searchParams.order as string : null;
  return <OrdersPage successOrder={successOrder} />;
}
