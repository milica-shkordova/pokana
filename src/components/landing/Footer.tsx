export default function Footer() {
  return (
    <footer className="landing__footer">
      <div className="landing__container landing__footer-row">
        <img className="landing__footer-logo" src="/assets/logo-transparent.png" alt="Invy" />
        <p className="landing__footer-copy">
          © {new Date().getFullYear()} Invy. Digital invitations, personalized for you.
        </p>
      </div>
    </footer>
  );
}
