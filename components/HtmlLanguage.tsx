"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function HtmlLanguage() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "hr";
  }, [pathname]);

  return null;
}
