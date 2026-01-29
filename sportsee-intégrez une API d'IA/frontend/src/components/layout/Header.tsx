// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useAppContext } from "@/context/AppContext";

import "@/styles/header.css";

export default function Header() {
  const { logout } = useAppContext();
  const pathname = usePathname();

  const isDashboardActive = pathname === ROUTES.dashboard;
  const isProfileActive = pathname === ROUTES.profile;

  return (
    <header>
      <div className="HeaderInner">
        <div className="dashLogoWrapper">
          <img src="/Logo.svg" alt="logo" className="dashLogo" />
          <img src="/SPORTSEE.svg" alt="Sportsee" className="dashLogoText" />
        </div>

        {/* Navigation */}
        <nav className="dashNav">
          <Link
            href={ROUTES.dashboard}
            className={`dashNavLink ${isDashboardActive ? "is-active" : ""}`}
          >
            Dashboard
          </Link>

          <span className="dashNavLink">Coach AI</span>

          <Link
            href={ROUTES.profile}
            className={`dashNavLink ${isProfileActive ? "is-active" : ""}`}
          >
            Mon profil
          </Link>

          <div className="dashNavSeparator" />

          <button
            type="button"
            onClick={logout}
            className="dashNavLink dashNavLinkLogout"
          >
            Se déconnecter
          </button>
        </nav>
      </div>
    </header>
  );
}
