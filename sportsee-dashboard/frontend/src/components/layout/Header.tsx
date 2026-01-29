// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { useAppContext } from "@/context/AppContext";
import "@/styles/header.css";




export default function Header() {
  const { logout } = useAppContext();

  return (
    <header className="dashHeader">
      <div className="dashHeaderInner">
      <div className="dashLogoWrapper">
        <img src="/Logo.svg" alt="logo" className="dashLogo" />
        <img src="/SPORTSEE.svg" alt="Sportsee" className="dashLogoText" />
      </div>

        {/* Navigation */}
        <nav className="dashNav">
          <Link href={ROUTES.dashboard} className="dashNavLink">
            Dashboard
          </Link>

          <span className="dashNavLink">Coach AI</span>

          <Link href={ROUTES.profile} className="dashNavLink">
            Mon profil
          </Link>

          <div className="dashNavSeparator" />

          <button
            type="button"
            onClick={logout}
            className="dashNavLink dashNavLinkLogout">
            Se déconnecter
          </button>
        </nav>
      </div> {/* ✅ ICI : fermeture de dashHeaderInner */}
    </header>
  );
}
