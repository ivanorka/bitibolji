import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <Link href="/" className="brand brand--footer" aria-label="Biti bolji, početna">
            <span className="brand-mark" aria-hidden="true">B</span>
            <span className="brand-words">
              <strong>Biti bolji</strong>
              <small>by Vladimir</small>
            </span>
          </Link>
          <p className="footer-statement">
            Gradimo generaciju koja ne čeka budućnost, nego je stvara.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h2>Istraži</h2>
            <Link href="/blog">Sve priče</Link>
            <Link href="/o-nama">O projektu</Link>
            <Link href="/ukljuci-se">Uključi se</Link>
          </div>
          <div>
            <h2>Javi se</h2>
            <a href="mailto:bitibolji4@gmail.com">bitibolji4@gmail.com</a>
            <a href="tel:+385917675999">091 767 5999</a>
            <span>Osijek, Hrvatska</span>
          </div>
        </div>
      </div>
      <div className="site-shell footer-bottom">
        <span>© {new Date().getFullYear()} Udruga Biti Bolji</span>
        <span>Znanje. Prilika. Odgovornost.</span>
      </div>
    </footer>
  );
}

