import type { Metadata } from "next";
import { ContactModal } from "@/components/ContactModal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Uključi se",
  description: "Postanite mentor, uključite školu, otvorite vrata svoje tvrtke ili podržite programe Udruge Biti Bolji.",
};

export default function JoinPage() {
  return (
    <>
      <SiteHeader inverted />
      <main className="join-page">
        <section className="join-hero section-pad">
          <div className="site-shell join-hero-grid">
            <div>
              <p className="eyebrow eyebrow--light"><span /> Uključi se</p>
              <h1>Mladima ne treba još jedan savjet. Treba im <em>stvarna prilika.</em></h1>
            </div>
            <p>
              Jedan susret, posjet tvrtki ili iskreno iskustvo može učeniku otvoriti
              novi pogled na ono što može postati. Možda baš tvoj.
            </p>
          </div>
        </section>

        <section className="ways-section section-pad">
          <div className="site-shell ways-grid">
            <article><span>01</span><h2>Budi mentor</h2><p>Podijeli iskustvo bez uljepšavanja — i uspjehe i pogreške iz kojih se najviše uči.</p></article>
            <article><span>02</span><h2>Otvori vrata</h2><p>Pozovi učenike u svoju tvrtku, radionicu ili studio i pokaži im kako rad stvarno izgleda.</p></article>
            <article><span>03</span><h2>Uključi školu</h2><p>Poveži nas s nastavnicima i učenicima koji žele više prakse, razgovora i novih izazova.</p></article>
            <article><span>04</span><h2>Podrži program</h2><p>Donacijom ili sponzorstvom omogući da kvalitetni programi dođu do više mladih.</p></article>
          </div>
        </section>

        <section className="contact-section section-pad">
          <div className="site-shell contact-grid">
            <div className="contact-intro">
              <p className="eyebrow"><span /> Razgovarajmo</p>
              <h2>Imaš ideju?<br /><em>Vlado sluša.</em></h2>
              <p>Javi se izravno. Najbolje suradnje često počinju kratkom porukom i konkretnim prijedlogom.</p>
            </div>
            <div className="contact-card">
              <div><span>Telefon</span><a href="tel:+385917675999">+385 91 767 5999</a></div>
              <div><span>Adresa</span><strong>Stonska 14, Osijek</strong></div>
              <ContactModal />
            </div>
          </div>
        </section>

        <section className="donation-section section-pad">
          <div className="site-shell donation-grid">
            <div><p className="eyebrow eyebrow--light"><span /> Podrži rad</p><h2>Svaka podrška stiže do <em>stvarnog učenika.</em></h2></div>
            <div className="iban-card">
              <span>Udruga Biti Bolji</span>
              <small>IBAN za donacije i sponzorstva</small>
              <strong>HR78 2360 0001 1024 3617 0</strong>
              <em>Zagrebačka banka d.d.</em>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
