// src/components/layout/Footer.tsx
import "@/styles/footer.css";

export default function Footer() {
  return (
    <footer className="Footer">
      <div className="FooterInner">
        <div className="FooterLeft">
          <span>© Sportsee</span>
          <span>Tous droits réservés</span>
        </div>

        <div className="FooterRight">
          <a href="#" className="FooterLink">Conditions générales</a>
          <a href="#" className="FooterLink">Contact</a>
          <img src="/Logo.svg" alt="Sportsee" className="FooterLogo" />
        </div>
      </div>
    </footer>
  );
}
