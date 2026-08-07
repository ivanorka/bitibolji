import Link from "next/link";

export function SiteHeader({ inverted = false }: { inverted?: boolean }) {
  return (
    <header className={`site-header${inverted ? " site-header--inverted" : ""}`}>
      <div className="site-shell header-inner">
        <Link href="/" className="brand" aria-label="Biti bolji, početna">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span className="brand-words">
            <strong>Biti bolji</strong>
            <small>by Vladimir</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Glavna navigacija">
          <Link href="/blog">Priče</Link>
          <Link href="/o-nama">O projektu</Link>
          <Link href="/ukljuci-se">Uključi se</Link>
        </nav>

        <Link href="/ukljuci-se" className="header-cta">
          Pokrenimo ideju <span aria-hidden="true">↗</span>
        </Link>

        <details className="mobile-menu">
          <summary aria-label="Otvori izbornik">Izbornik</summary>
          <nav aria-label="Mobilna navigacija">
            <Link href="/blog">Priče</Link>
            <Link href="/o-nama">O projektu</Link>
            <Link href="/ukljuci-se">Uključi se</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

