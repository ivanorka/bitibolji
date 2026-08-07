import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { englishArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Biti bolji — ideas that shape the future",
  description:
    "Vladimir Mihajlović's initiative connects young people, schools and entrepreneurs through knowledge, experience and real opportunities.",
  alternates: {
    canonical: "/en",
    languages: { "hr-HR": "/", "en-US": "/en" },
  },
};

const latest = englishArticles.slice(0, 3);

export default function EnglishHome() {
  return (
    <div lang="en">
      <main>
        <section className="hero">
          <SiteHeader inverted locale="en" languageHref="/" />
          <div className="hero-orbit hero-orbit--one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit--two" aria-hidden="true" />
          <div className="site-shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow eyebrow--light"><span /> Biti Bolji — Be Better</p>
              <h1>When young people get an opportunity, <em>ideas become the future.</em></h1>
              <p className="hero-lead">
                We connect classrooms with the real world. Young people meet those who create,
                learn from experience and discover what they can become.
              </p>
              <div className="hero-actions">
                <Link href="/en/blog" className="button button--light">Explore stories <span>→</span></Link>
                <Link href="/en/get-involved" className="button button--ghost">Get involved</Link>
              </div>
              <div className="hero-proof" aria-label="Project results">
                <div><strong>40k+</strong><span>young people</span></div>
                <div><strong>200+</strong><span>programmes</span></div>
                <div><strong>13</strong><span>years</span></div>
              </div>
            </div>
            <div className="hero-portrait">
              <div className="portrait-frame">
                <img src="/media/articles/2022/07/DSC01115-VLADO.jpg" alt="Vladimir Mihajlović" />
              </div>
              <div className="portrait-note">
                <span>Founder &amp; mentor</span>
                <strong>Vladimir Mihajlović</strong>
                <small>Osijek → all of Croatia</small>
              </div>
              <div className="portrait-stamp" aria-hidden="true">Be<br />better.</div>
            </div>
          </div>
          <div className="hero-ticker" aria-hidden="true">
            <span>KNOWLEDGE</span><i>✦</i><span>COURAGE</span><i>✦</i><span>IDEAS</span><i>✦</i>
            <span>RESPONSIBILITY</span><i>✦</i><span>FUTURE</span>
          </div>
        </section>

        <section className="belief-section section-pad">
          <div className="site-shell belief-grid">
            <p className="eyebrow"><span /> What we believe</p>
            <div>
              <h2>Young people are not just an audience. They are <em>the driving force.</em></h2>
              <p>
                We do not tell them what to think. We give them access to people,
                experiences and spaces where they can ask, try and create something of their own.
              </p>
            </div>
          </div>
        </section>

        <section className="programs-section section-pad">
          <div className="site-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow"><span /> What we do</p>
                <h2>Learning that <em>stays with you.</em></h2>
              </div>
              <p>Our programmes are created with schools, entrepreneurs, artists and the community.</p>
            </div>
            <div className="program-grid">
              <article className="program-card program-card--cobalt">
                <span className="program-number">01</span>
                <div><small>Core programme</small><h3>Biti Bolji<br />— Be Better</h3></div>
                <p>Meetings, workshops and visits that bring real life and business stories closer to young people.</p>
                <Link href="/en/blog">See the stories <span>↗</span></Link>
              </article>
              <article className="program-card program-card--lime">
                <span className="program-number">02</span>
                <div><small>From classroom to market</small><h3>1000<br />Ideas</h3></div>
                <p>Student teams develop a product, service or brand with mentors from the real business world.</p>
                <Link href="/en/blog?topic=1000-ideas">Discover the projects <span>↗</span></Link>
              </article>
              <article className="program-card program-card--paper">
                <span className="program-number">03</span>
                <div><small>Financial literacy</small><h3>Money in<br />Croatian schools</h3></div>
                <p>Theatre, play and conversation turn the big topic of money into an experience students understand.</p>
                <Link href="/en/blog?topic=financial-literacy">Learn more <span>↗</span></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="latest-section section-pad">
          <div className="site-shell">
            <div className="section-heading section-heading--line">
              <div>
                <p className="eyebrow"><span /> First-hand</p>
                <h2>Latest <em>stories.</em></h2>
              </div>
              <Link href="/en/blog" className="outline-link">All 99 stories <span>→</span></Link>
            </div>
            <div className="latest-grid">
              <ArticleCard article={latest[0]} large locale="en" />
              <div className="latest-stack">
                <ArticleCard article={latest[1]} locale="en" />
                <ArticleCard article={latest[2]} locale="en" />
              </div>
            </div>
          </div>
        </section>

        <section className="quote-section section-pad">
          <div className="site-shell quote-grid">
            <div className="quote-image">
              <img src="/media/articles/2022/07/DSC01120-VLADO.jpg" alt="Vladimir Mihajlović in conversation" loading="lazy" />
              <span>Vlado</span>
            </div>
            <figure>
              <blockquote>
                “Young people are capable of achieving anything. They are full of energy,
                creativity and that positive <em>madness</em> that moves society forward.”
              </blockquote>
              <figcaption>
                <strong>Vladimir Mihajlović</strong>
                <span>president of the Biti Bolji Association</span>
              </figcaption>
              <Link href="/en/about" className="text-link text-link--light">Meet Vlado and the initiative <span>→</span></Link>
            </figure>
          </div>
        </section>

        <section className="join-section section-pad">
          <div className="site-shell join-card">
            <div>
              <p className="eyebrow"><span /> Ideas need people</p>
              <h2>Do you have experience that could <em>change a young person's direction?</em></h2>
            </div>
            <div>
              <p>Become a mentor, open the doors of your company, involve a school or support a programme.</p>
              <Link href="/en/get-involved" className="button button--dark">Get involved <span>→</span></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </div>
  );
}
