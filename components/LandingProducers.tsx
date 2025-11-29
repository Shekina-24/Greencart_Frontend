import Image from "next/image";
import { LANDING_PRODUCERS } from "@/data/landing";

export default function LandingProducers() {
  return (
    <section className="landing-section">
      <div className="landing-section__header">
        <h2>Rencontrez nos producteurs pilotes</h2>
        <p>
          Des exploitations familiales aux ateliers urbains, GreenCart accompagne un reseau de partenaires qui mettent
          l impact environnemental au centre de leurs decisions.
        </p>
      </div>
      <div className="landing-producers">
        {LANDING_PRODUCERS.map((producer) => (
          <article key={producer.id} className="landing-producer">
            <div className="landing-producer__media">
              <Image
                src={producer.image}
                alt={producer.imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 360px"
                priority={producer.id === 1}
              />
            </div>
            <div className="landing-producer__body">
              <h3>{producer.name}</h3>
              <p className="landing-producer__location">{producer.location}</p>
              <p>{producer.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

