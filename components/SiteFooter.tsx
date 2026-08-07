import Link from "next/link";

export function SiteFooter({ locale = "hr" }: { locale?: "hr" | "en" }) {
  const english = locale === "en";

  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <Link href={english ? "/en" : "/"} className="brand brand--footer" aria-label={english ? "Biti bolji, home" : "Biti bolji, početna"}>
            <span className="brand-mark" aria-hidden="true">B</span>
            <span className="brand-words">
              <strong>Biti bolji</strong>
              <small>by Vladimir</small>
            </span>
          </Link>
          <p className="footer-statement">
            {english
              ? "We are building a generation that does not wait for the future, but creates it."
              : "Gradimo generaciju koja ne čeka budućnost, nego je stvara."}
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h2>{english ? "Explore" : "Istraži"}</h2>
            <Link href={english ? "/en/blog" : "/blog"}>{english ? "All stories" : "Sve priče"}</Link>
            <Link href={english ? "/en/about" : "/o-nama"}>{english ? "About" : "O projektu"}</Link>
            <Link href={english ? "/en/get-involved" : "/ukljuci-se"}>{english ? "Get involved" : "Uključi se"}</Link>
          </div>
          <div>
            <h2>{english ? "Contact" : "Javi se"}</h2>
            <a href="mailto:bitibolji4@gmail.com">bitibolji4@gmail.com</a>
            <a href="tel:+385917675999">091 767 5999</a>
            <span>{english ? "Osijek, Croatia" : "Osijek, Hrvatska"}</span>
          </div>
        </div>
      </div>
      <div className="site-shell footer-bottom">
        <span>© {new Date().getFullYear()} {english ? "Biti Bolji Association" : "Udruga Biti Bolji"}</span>
        <span>{english ? "Knowledge. Opportunity. Responsibility." : "Znanje. Prilika. Odgovornost."}</span>
      </div>
    </footer>
  );
}
