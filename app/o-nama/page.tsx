import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Vlado i priča Biti Bolji",
  description: "Upoznajte Vladimira Mihajlovića i priču projekta koji više od trinaest godina povezuje mlade sa stvarnim svijetom.",
  alternates: {
    canonical: "/o-nama",
    languages: { "hr-HR": "/o-nama", "en-US": "/en/about" },
  },
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader languageHref="/en/about" />
      <main>
        <section className="about-hero section-pad">
          <div className="site-shell about-hero-grid">
            <div>
              <p className="eyebrow"><span /> O nama</p>
              <h1>Jedan razgovor može promijeniti <em>nečiji smjer.</em></h1>
              <p>
                Biti Bolji je priča o povjerenju u mlade. O slušanju prije poučavanja.
                O iskustvu koje izlazi iz poslovnih ureda i ulazi u učionice.
              </p>
            </div>
            <div className="about-collage">
              <img className="about-main-image" src="/media/articles/2022/07/DSC01115-VLADO.jpg" alt="Vladimir Mihajlović" />
              <img className="about-detail-image" src="/media/articles/2022/07/DSC02969-PODUZETNICKI-STOL.jpg" alt="Susret učenika i poduzetnika" />
              <span>Od 2013.</span>
            </div>
          </div>
        </section>

        <section className="vlado-section section-pad">
          <div className="site-shell vlado-grid">
            <div>
              <p className="eyebrow eyebrow--light"><span /> Vladimir Mihajlović</p>
              <h2>Urednik. Poduzetnik. <em>Pokretač.</em></h2>
            </div>
            <div className="vlado-copy">
              <p className="lead-paragraph">
                Vlado je osnivač i dugogodišnji glavni urednik časopisa Poduzetnik te
                predsjednik Udruge Biti Bolji iz Osijeka.
              </p>
              <p>
                Godinama je slušao poduzetničke priče, prepoznavao ljude koji imaju što
                prenijeti i spajao ih s mladima koji trebaju stvarne odgovore. Vjeruje da
                se poduzetništvo ne uči samo iz knjige, nego kroz susret, pitanje, pokušaj
                i odgovornost.
              </p>
              <p>
                Njegova rečenica “mladi su sposobni postići sve” nije slogan. To je način rada:
                učenicima dati izbor, uključiti ih u razgovor i otvoriti im vrata svijeta koji ih čeka.
              </p>
              <a href="https://www.facebook.com/vlado.mihajlovic.7/" target="_blank" rel="noreferrer" className="text-link text-link--light">
                Prati Vladu na Facebooku <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <section className="timeline-section section-pad">
          <div className="site-shell">
            <div className="section-heading">
              <div><p className="eyebrow"><span /> Kako smo rasli</p><h2>Od ideje do <em>pokreta.</em></h2></div>
            </div>
            <ol className="timeline">
              <li><span>2013.</span><div><h3>Počinje Biti Bolji</h3><p>Prvi susreti u školama spajaju mlade s ljudima iz poduzetništva, kulture i sporta.</p></div></li>
              <li><span>2021.</span><div><h3>Svaki učenik poduzetnik</h3><p>Časopis Poduzetnik ulazi u stotine škola kao alat za razgovor i učenje.</p></div></li>
              <li><span>2023.</span><div><h3>Deset godina utjecaja</h3><p>Projekt slavi desetljeće rada, više od 40.000 mladih i stotine susreta.</p></div></li>
              <li><span>2025.</span><div><h3>1000 ideja</h3><p>Učenici razvijaju vlastite proizvode, usluge i brendove uz stvarne mentore.</p></div></li>
              <li><span>Danas</span><div><h3>Nova samostalna priča</h3><p>Biti Bolji nastavlja širiti znanje, prilike i vjeru u generacije koje dolaze.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="about-cta section-pad">
          <div className="site-shell join-card">
            <div><p className="eyebrow"><span /> Sljedeće poglavlje</p><h2>Najbolja ideja je ona koju <em>pokrenemo zajedno.</em></h2></div>
            <div><p>Ako poznaješ školu, mentora ili tvrtku koja želi otvoriti vrata mladima, javi se.</p><Link href="/ukljuci-se" className="button button--dark">Javi nam se <span>→</span></Link></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
