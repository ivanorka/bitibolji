import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { articles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Biti bolji — ideje koje mijenjaju budućnost",
  description:
    "Projekt Vladimira Mihajlovića koji povezuje mlade, škole i poduzetnike kroz znanje, iskustvo i stvarne prilike.",
};

const latest = articles.slice(0, 3);

export default function Home() {
  return (
    <>
      <main>
        <section className="hero">
          <SiteHeader inverted />
          <div className="hero-orbit hero-orbit--one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit--two" aria-hidden="true" />
          <div className="site-shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow eyebrow--light"><span /> Biti Bolji — Be Better</p>
              <h1>Kad mladi dobiju priliku, <em>ideje postaju budućnost.</em></h1>
              <p className="hero-lead">
                Spajamo učionice sa stvarnim svijetom. Mladi upoznaju ljude koji stvaraju,
                uče iz iskustva i otkrivaju što sve mogu postati.
              </p>
              <div className="hero-actions">
                <Link href="/blog" className="button button--light">Istraži priče <span>→</span></Link>
                <Link href="/ukljuci-se" className="button button--ghost">Uključi se</Link>
              </div>
              <div className="hero-proof" aria-label="Rezultati projekta">
                <div><strong>40k+</strong><span>mladih</span></div>
                <div><strong>200+</strong><span>programa</span></div>
                <div><strong>13</strong><span>godina</span></div>
              </div>
            </div>
            <div className="hero-portrait">
              <div className="portrait-frame">
                <img src="/media/articles/2022/07/DSC01115-VLADO.jpg" alt="Vladimir Mihajlović" />
              </div>
              <div className="portrait-note">
                <span>Osnivač & mentor</span>
                <strong>Vladimir Mihajlović</strong>
                <small>Osijek → cijela Hrvatska</small>
              </div>
              <div className="portrait-stamp" aria-hidden="true">Budi<br />bolji.</div>
            </div>
          </div>
          <div className="hero-ticker" aria-hidden="true">
            <span>ZNANJE</span><i>✦</i><span>HRABROST</span><i>✦</i><span>IDEJE</span><i>✦</i>
            <span>ODGOVORNOST</span><i>✦</i><span>BUDUĆNOST</span>
          </div>
        </section>

        <section className="belief-section section-pad">
          <div className="site-shell belief-grid">
            <p className="eyebrow"><span /> Naše uvjerenje</p>
            <div>
              <h2>Mladi nisu samo publika. Oni su <em>pokretači.</em></h2>
              <p>
                Zato im ne govorimo što trebaju misliti. Dajemo im pristup ljudima,
                iskustvima i prostorima u kojima mogu pitati, pokušati i stvoriti nešto svoje.
              </p>
            </div>
          </div>
        </section>

        <section className="programs-section section-pad">
          <div className="site-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow"><span /> Što radimo</p>
                <h2>Učenje koje se <em>pamti.</em></h2>
              </div>
              <p>Programi nastaju uz škole, poduzetnike, umjetnike i zajednicu.</p>
            </div>
            <div className="program-grid">
              <article className="program-card program-card--cobalt">
                <span className="program-number">01</span>
                <div><small>Temeljni program</small><h3>Biti Bolji<br />— Be Better</h3></div>
                <p>Susreti, radionice i posjeti koji mladima približavaju stvarne životne i poslovne priče.</p>
                <Link href="/blog">Pogledaj priče <span>↗</span></Link>
              </article>
              <article className="program-card program-card--lime">
                <span className="program-number">02</span>
                <div><small>Od učionice do tržišta</small><h3>1000<br />ideja</h3></div>
                <p>Učenički timovi razvijaju proizvod, uslugu ili brend uz mentore iz stvarnog poslovnog svijeta.</p>
                <Link href="/blog?tema=1000-ideja">Otkrij projekte <span>↗</span></Link>
              </article>
              <article className="program-card program-card--paper">
                <span className="program-number">03</span>
                <div><small>Financijska pismenost</small><h3>Novac u<br />hrvatske škole</h3></div>
                <p>Kazalište, igra i razgovor pretvaraju veliku temu novca u iskustvo koje učenici razumiju.</p>
                <Link href="/blog?tema=financijska-pismenost">Saznaj više <span>↗</span></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="latest-section section-pad">
          <div className="site-shell">
            <div className="section-heading section-heading--line">
              <div>
                <p className="eyebrow"><span /> Iz prve ruke</p>
                <h2>Najnovije <em>priče.</em></h2>
              </div>
              <Link href="/blog" className="outline-link">Svih 99 priča <span>→</span></Link>
            </div>
            <div className="latest-grid">
              <ArticleCard article={latest[0]} large />
              <div className="latest-stack">
                <ArticleCard article={latest[1]} />
                <ArticleCard article={latest[2]} />
              </div>
            </div>
          </div>
        </section>

        <section className="quote-section section-pad">
          <div className="site-shell quote-grid">
            <div className="quote-image">
              <img src="/media/articles/2022/07/DSC01120-VLADO.jpg" alt="Vladimir Mihajlović u razgovoru" loading="lazy" />
              <span>Vlado</span>
            </div>
            <figure>
              <blockquote>
                “Mladi su sposobni postići sve. Puni su energije, kreativnosti i one
                pozitivne <em>ludosti</em> koja pokreće društvo.”
              </blockquote>
              <figcaption>
                <strong>Vladimir Mihajlović</strong>
                <span>predsjednik Udruge Biti Bolji</span>
              </figcaption>
              <Link href="/o-nama" className="text-link text-link--light">Upoznaj Vladu i projekt <span>→</span></Link>
            </figure>
          </div>
        </section>

        <section className="join-section section-pad">
          <div className="site-shell join-card">
            <div>
              <p className="eyebrow"><span /> Ideja treba ljude</p>
              <h2>Imaš iskustvo koje bi mladima moglo <em>promijeniti smjer?</em></h2>
            </div>
            <div>
              <p>Postani mentor, otvori vrata svoje tvrtke, uključi školu ili podrži program.</p>
              <Link href="/ukljuci-se" className="button button--dark">Uključi se <span>→</span></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

