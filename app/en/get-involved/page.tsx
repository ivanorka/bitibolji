import type { Metadata } from "next";
import { ContactModal } from "@/components/ContactModal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Get involved",
  description: "Become a mentor, involve a school, open your company's doors or support the programmes of the Biti Bolji Association.",
  alternates: {
    canonical: "/en/get-involved",
    languages: { "hr-HR": "/ukljuci-se", "en-US": "/en/get-involved" },
  },
};

export default function EnglishGetInvolvedPage() {
  return (
    <div lang="en">
      <SiteHeader inverted locale="en" languageHref="/ukljuci-se" />
      <main className="join-page">
        <section className="join-hero section-pad">
          <div className="site-shell join-hero-grid">
            <div>
              <p className="eyebrow eyebrow--light"><span /> Get involved</p>
              <h1>Young people do not need one more piece of advice. They need <em>a real opportunity.</em></h1>
            </div>
            <p>
              One meeting, company visit or honest experience can give a student a new view of
              what they might become. Perhaps yours can do exactly that.
            </p>
          </div>
        </section>

        <section className="ways-section section-pad">
          <div className="site-shell ways-grid">
            <article><span>01</span><h2>Become a mentor</h2><p>Share your experience honestly — both the successes and the mistakes that taught you the most.</p></article>
            <article><span>02</span><h2>Open your doors</h2><p>Invite students into your company, workshop or studio and show them what the work really looks like.</p></article>
            <article><span>03</span><h2>Involve a school</h2><p>Connect us with teachers and students who want more practice, conversation and new challenges.</p></article>
            <article><span>04</span><h2>Support a programme</h2><p>A donation or sponsorship helps quality programmes reach more young people.</p></article>
          </div>
        </section>

        <section className="contact-section section-pad">
          <div className="site-shell contact-grid">
            <div className="contact-intro">
              <p className="eyebrow"><span /> Let's talk</p>
              <h2>Have an idea?<br /><em>Vlado is listening.</em></h2>
              <p>Reach out directly. The best collaborations often begin with a short message and a concrete proposal.</p>
            </div>
            <div className="contact-card">
              <div><span>Phone</span><a href="tel:+385917675999">+385 91 767 5999</a></div>
              <div><span>Address</span><strong>Stonska 14, Osijek, Croatia</strong></div>
              <ContactModal locale="en" />
            </div>
          </div>
        </section>

        <section className="donation-section section-pad">
          <div className="site-shell donation-grid">
            <div><p className="eyebrow eyebrow--light"><span /> Support our work</p><h2>Every contribution reaches <em>a real student.</em></h2></div>
            <div className="iban-card">
              <span>Biti Bolji Association</span>
              <small>IBAN for donations and sponsorships</small>
              <strong>HR78 2360 0001 1024 3617 0</strong>
              <em>Zagrebačka banka d.d.</em>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </div>
  );
}
