import AdminPublicDataPage from "@/components/AdminPublicDataPage";

export const metadata = {
  title: "Admin - Données publiques | GreenCart",
  description: "Import et prévisualisation des données publiques (producteurs, consommation, gaspillage)."
};

export default function AdminPublicDataRoute() {
  return <AdminPublicDataPage />;
}
