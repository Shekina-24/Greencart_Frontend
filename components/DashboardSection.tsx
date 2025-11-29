import type { DashboardMetrics } from "@/lib/types";

interface DashboardSectionProps {
  metrics: DashboardMetrics;
  onSimulateWeek: () => void;
}

export default function DashboardSection({
  metrics,
  onSimulateWeek
}: DashboardSectionProps) {
  return (
    <section id="dashboard" className="section">
      <h2>Mon impact (mode demo)</h2>
      <div className="cols">
        <article className="card">
          <h3>Resume chiffre</h3>
          <table className="table">
            <tbody>
              <tr>
                <th>Commandes traitees</th>
                <td>{metrics.orders}</td>
              </tr>
              <tr>
                <th>CO2e evite</th>
                <td>{metrics.co2.toFixed(1)} kg</td>
              </tr>
              <tr>
                <th>Economies realisees</th>
                <td>{metrics.savings.toFixed(2)} EUR</td>
              </tr>
            </tbody>
          </table>
          <p className="muted">
            Les donnees sont simulees pour le MVP. La version connectee fournira des rapports mensuels et des alertes
            DLC automatiques.
          </p>
        </article>
        <article className="card">
          <h3>Economies hebdomadaires estimees</h3>
          <p className="muted">
            Objectif sobriete : depasser 25 kg de CO2e evites ce mois-ci avec les lots anti-gaspi de votre region.
          </p>
          <div className="badge badge--impact">Badge Explorateur anti-gaspi</div>
          <p>
            Semaine en cours : <strong>{metrics.weeklySavings.toFixed(2)} EUR</strong>
          </p>
          <button className="btn btn--secondary" type="button" onClick={onSimulateWeek}>
            Simuler une semaine
          </button>
        </article>
      </div>
    </section>
  );
}

