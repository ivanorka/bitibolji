import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Vlado and the Biti Bolji story",
  description: "Meet Vladimir Mihajlović and the initiative that has connected young people with the real world for more than thirteen years.",
  alternates: {
    canonical: "/en/about",
    languages: { "hr-HR": "/o-nama", "en-US": "/en/about" },
  },
};

export default function EnglishAboutPage() {
  return (
    <div lang="en">
      <SiteHeader locale="en" languageHref="/o-nama" />
      <main>
        <section className="about-hero section-pad">
          <div className="site-shell about-hero-grid">
            <div>
              <p className="eyebrow"><span /> About us</p>
              <h1>One conversation can change <em>someone's direction.</em></h1>
              <p>
                Biti Bolji is a story about believing in young people. About listening before teaching.
                About experience leaving business offices and entering classrooms.
              </p>
            </div>
            <div className="about-collage">
              <img className="about-main-image" src="/media/articles/2022/07/DSC01115-VLADO.jpg" alt="Vladimir Mihajlović" />
              <img className="about-detail-image" src="/media/articles/2022/07/DSC02969-PODUZETNICKI-STOL.jpg" alt="A meeting between students and entrepreneurs" />
              <span>Since 2013</span>
            </div>
          </div>
        </section>

        <section className="vlado-section section-pad">
          <div className="site-shell vlado-grid">
            <div>
              <p className="eyebrow eyebrow--light"><span /> Vladimir Mihajlović</p>
              <h2>Editor. Entrepreneur. <em>Initiator.</em></h2>
            </div>
            <div className="vlado-copy">
              <p className="lead-paragraph">
                Vlado is the founder and long-time editor-in-chief of Poduzetnik magazine and
                president of the Biti Bolji Association in Osijek.
              </p>
              <p>
                For years, he listened to entrepreneurial stories, recognised people with valuable
                experience to share and connected them with young people seeking real answers. He believes
                entrepreneurship is not learned from books alone, but through encounters, questions,
                attempts and responsibility.
              </p>
              <p>
                His words “young people are capable of achieving anything” are not a slogan. They describe
                a way of working: give students a choice, include them in the conversation and open the doors
                to the world ahead of them.
              </p>
              <a href="https://www.facebook.com/vlado.mihajlovic.7/" target="_blank" rel="noreferrer" className="text-link text-link--light">
                Follow Vlado on Facebook <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <section className="timeline-section section-pad">
          <div className="site-shell">
            <div className="section-heading">
              <div><p className="eyebrow"><span /> How we grew</p><h2>From an idea to <em>a movement.</em></h2></div>
            </div>
            <ol className="timeline">
              <li><span>2013</span><div><h3>Biti Bolji begins</h3><p>The first school meetings connect young people with people from entrepreneurship, culture and sport.</p></div></li>
              <li><span>2021</span><div><h3>Every student an entrepreneur</h3><p>Poduzetnik magazine enters hundreds of schools as a tool for conversation and learning.</p></div></li>
              <li><span>2023</span><div><h3>Ten years of impact</h3><p>The initiative celebrates a decade of work, more than 40,000 young people and hundreds of encounters.</p></div></li>
              <li><span>2025</span><div><h3>1000 Ideas</h3><p>Students develop their own products, services and brands with real mentors.</p></div></li>
              <li><span>Today</span><div><h3>A new independent story</h3><p>Biti Bolji continues to expand knowledge, opportunities and belief in the generations to come.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="about-cta section-pad">
          <div className="site-shell join-card">
            <div><p className="eyebrow"><span /> The next chapter</p><h2>The best idea is one we <em>set in motion together.</em></h2></div>
            <div><p>If you know a school, mentor or company ready to open its doors to young people, get in touch.</p><Link href="/en/get-involved" className="button button--dark">Contact us <span>→</span></Link></div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </div>
  );
}
