import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand" style={{ textDecoration: 'none', color: 'inherit' }} title="Flomo's Environmental Consultants and Solutions Corporation">
          <div className="nav__logo">F</div>
          <div>
            <div className="nav__name" title="Flomo's Environmental Consultants and Solutions Corporation (FECASC)">FECASC</div>
            <div className="nav__tagline">Green Thinking, Brighter Future</div>
          </div>
        </Link>

        <nav className="nav__links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link className="nav__signin" to="/admin/login">
            Sign In
          </Link>
          <Link className="nav__cta" to="/book">
            Book Service
          </Link>
        </div>
      </div>
    </header>
  );
}
