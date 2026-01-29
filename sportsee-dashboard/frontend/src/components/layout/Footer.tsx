// src/components/layout/Footer.tsx
import "@/styles/footer.css";

export default function Footer() {
  return (
    <footer className="dashFooter">
      <div className="dashFooterInner">
        <div className="dashFooterLeft">
          <span>© Sportsee</span>
          <span>Tous droits réservés</span>
        </div>

        <div className="dashFooterRight">
          <a href="#" className="dashFooterLink">Conditions générales</a>
          <a href="#" className="dashFooterLink">Contact</a>
          <img src="/Logo.svg" alt="Sportsee" className="dashFooterLogo" />
        </div>
      </div>
    </footer>
  );
}
