interface ProducersSectionProps {
  onBecomeProducer: () => void;
}

export default function ProducersSection({ onBecomeProducer }: ProducersSectionProps) {
  return (
    <section id="producteurs" className="section">
      <h2>Espace producteur</h2>
      <div className="banner">
        <div>
          <p className="muted">
            Publiez vos lots, pilotez vos stocks et accedez aux analyses IA pour anticiper les ventes saisonnieres.
          </p>
        </div>
        <div>
          <button className="btn btn--primary" type="button" onClick={onBecomeProducer}>
            Devenir producteur partenaire
          </button>
        </div>
      </div>
      <div className="grid cards-2">
        <article className="card">
          <h3>Publication guidee</h3>
          <p className="muted">
            Formulaire pas a pas avec controle DLC, compression des visuels et apercu instantane du rendu client.
          </p>
        </article>
        <article className="card">
          <h3>Recommandations IA</h3>
          <p className="muted">
            Projection ventes 4 semaines, clustering clients (Decouverte, Fideles eco, Grands paniers, Locavores) et
            alertes prix justes.
          </p>
        </article>
      </div>
    </section>
  );
}
