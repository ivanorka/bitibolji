import Link from "next/link";

type HeaderProps = {
  inverted?: boolean;
  locale?: "hr" | "en";
  languageHref?: string;
};

export function SiteHeader({ inverted = false, locale = "hr", languageHref }: HeaderProps) {
  const english = locale === "en";
  const homeHref = english ? "/en" : "/";
  const links = english
    ? [
        { href: "/en/blog", label: "Stories" },
        { href: "/en/about", label: "About" },
        { href: "/en/get-involved", label: "Get involved" },
      ]
    : [
        { href: "/blog", label: "Priče" },
        { href: "/o-nama", label: "O projektu" },
        { href: "/ukljuci-se", label: "Uključi se" },
      ];
  const switchHref = languageHref ?? (english ? "/" : "/en");

  return (
    <header className={`site-header${inverted ? " site-header--inverted" : ""}`}>
      <div className="site-shell header-inner">
        <Link href={homeHref} className="brand" aria-label={english ? "Biti bolji, home" : "Biti bolji, početna"}>
          <span className="brand-mark" aria-hidden="true">B</span>
          <span className="brand-words">
            <strong>Biti bolji</strong>
            <small>by Vladimir</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label={english ? "Main navigation" : "Glavna navigacija"}>
          {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          <Link
            href={switchHref}
            className="language-switch"
            hrefLang={english ? "hr" : "en"}
            lang={english ? "hr" : "en"}
            aria-label={english ? "Prikaži stranicu na hrvatskom" : "View this page in English"}
          >
            {english ? "HR" : "EN"}
          </Link>
        </nav>

        <Link href={english ? "/en/get-involved" : "/ukljuci-se"} className="header-cta">
          {english ? "Start an idea" : "Pokrenimo ideju"} <span aria-hidden="true">↗</span>
        </Link>

        <details className="mobile-menu">
          <summary aria-label={english ? "Open menu" : "Otvori izbornik"}>{english ? "Menu" : "Izbornik"}</summary>
          <nav aria-label={english ? "Mobile navigation" : "Mobilna navigacija"}>
            {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
            <Link href={switchHref} hrefLang={english ? "hr" : "en"} lang={english ? "hr" : "en"}>
              {english ? "Hrvatski" : "English"}
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
