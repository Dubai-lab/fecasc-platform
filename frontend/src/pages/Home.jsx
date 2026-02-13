import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { fetchTeam } from "../api/team";
import "./Home.css";

export default function Home() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadTeam = async () => {
      try {
        const data = await fetchTeam();
        if (mounted) {
          setTeam(data);
        }
      } catch (error) {
        console.error("Error loading team:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTeam();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [team]);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320; // card width + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div id="home">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container hero__inner">
            <div className="hero__left">
              <div className="hero__badge">🌱 Environmental Consulting • Engineering • Sustainability</div>
              <h1 className="hero__title">
                Flomo's Environmental Consultants & Solutions Corporation
              </h1>
              <p className="hero__text">
                Delivering sustainable solutions for environmental compliance, risk management, and climate resilience. 
                From EIAs and audits to engineering projects and stakeholder training.
              </p>

              <div className="hero__highlights">
                <span className="highlight">✓ EPA Accredited & Certified</span>
                <span className="highlight">✓ ISO 14001 Compliant</span>
                <span className="highlight">✓ World Bank Standards</span>
              </div>

              <div className="hero__actions">
                <Link className="btn btn--primary" to="/book">Book a Service</Link>
                <Link className="btn btn--outline" to="/services">Explore Services</Link>
              </div>

              <div className="hero__stats">
                <div className="stat">
                  <div className="stat__num">2024</div>
                  <div className="stat__label">Established</div>
                </div>
                <div className="stat">
                  <div className="stat__num">15+</div>
                  <div className="stat__label">Specialized Services</div>
                </div>
                <div className="stat">
                  <div className="stat__num">EPA</div>
                  <div className="stat__label">Registered</div>
                </div>
              </div>
            </div>

            <div className="hero__right">
              <img 
                src="/climate-contrast.svg" 
                alt="Climate contrast"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  marginBottom: '24px',
                  height: 'auto'
                }}
              />
              <div className="hero__card">
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>📋</div>
                <h3>Request a Consultation</h3>
                <p>Tell us your project needs and we'll respond quickly with expert recommendations.</p>
                <Link className="btn btn--primary" to="/book">Start Booking</Link>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '48px',
            position: 'relative'
          }}>
            {/* Small image on left - positioned up */}
            <img 
              src="/fecasc-hero-illustration-2.svg" 
              alt="Illustration 2"
              style={{
                width: '150px',
                maxWidth: '150px',
                marginTop: '-20px',
              }}
            />
            
            {/* Large center image */}
            <img 
              src="/fecasc-hero-illustration-1.svg" 
              alt="Consultation illustration"
              style={{
                width: '300px',
                maxWidth: '300px',
              }}
            />
            
            {/* Small image on right - positioned down */}
            <img 
              src="/fecasc-hero-illustration-3.svg" 
              alt="Illustration 3"
              style={{
                width: '150px',
                maxWidth: '150px',
                marginTop: '60px',
              }}
            />
          </div>
        </section>

        {/* Certifications & Trust Section */}
        <section className="section trust-section">
          <div className="container">
            <h2 className="section__title">Trusted & Certified</h2>
            <p className="section__text">
              FECASC operates in compliance with international standards and regulatory frameworks
            </p>
            <div className="certifications__grid">
              <div className="cert-item">
                <div className="cert-icon">
                  <img src="/images/env_certificate.png" alt="EPA Accredited" />
                </div>
                <div className="cert-title">EPA Accredited</div>
                <div className="cert-text">Registered & Accredited by Environmental Protection Agency, Liberia</div>
              </div>
              <div className="cert-item">
                <div className="cert-icon">
                  <img src="/images/env_certificate.png" alt="ISO 14001" />
                </div>
                <div className="cert-title">ISO 14001</div>
                <div className="cert-text">Environmental Management Systems Certified</div>
              </div>
              <div className="cert-item">
                <div className="cert-icon">
                  <img src="/images/env_certificate.png" alt="OHSAS 18001" />
                </div>
                <div className="cert-title">OHSAS 18001</div>
                <div className="cert-text">Occupational Health & Safety Management Systems</div>
              </div>
              <div className="cert-item">
                <div className="cert-icon">
                  <img src="/images/env_certificate.png" alt="World Bank Standards" />
                </div>
                <div className="cert-title">World Bank Standards</div>
                <div className="cert-text">Compliant with Environmental & Social Framework</div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="section about-section">
          <div className="container">
            <div className="about__grid">
              <div className="about__item">
                <h3>Our Mission</h3>
                <p>
                  Help optimize organizations and initiatives through collective processes of strategy creation 
                  and implementation, so that they achieve their greatest possible impact.
                </p>
              </div>
              <div className="about__item">
                <h3>Our Vision</h3>
                <p>
                  A world where all organizations are impact-driven, efficient, and able to live within 
                  environmental boundaries while promoting teamwork and purpose-driven leadership.
                </p>
              </div>
              <div className="about__item">
                <h3>Our Values</h3>
                <p>
                  Collaboration, honesty, integrity, inclusion, diversity, innovation, responsibility, 
                  accountability and transparency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section - Organized by Category */}
        <section className="section services-section">
          <div className="container">
            <h2 className="section__title">Our Services</h2>
            <p className="section__text">Comprehensive environmental and sustainability solutions tailored to your needs</p>

            {/* Environmental Services */}
            <div className="service-category">
              <h3 className="category-title">🌿 Environmental Services</h3>
              <div className="grid">
                {[
                  { name: "Environmental Impact Assessment (EIA)", desc: "Comprehensive assessments for mining, infrastructure, and development projects" },
                  { name: "Environmental & Social Audits", desc: "Regulatory compliance and performance audits" },
                  { name: "Monitoring & Evaluation (M&E)", desc: "Healthcare, agriculture, and business performance monitoring" },
                  { name: "Climate Mitigation Projects", desc: "Carbon reduction and climate resilience strategies" },
                  { name: "Waste Management", desc: "Planning, implementation, and pollution control" },
                  { name: "Community Sensitization", desc: "Environmental awareness and stakeholder engagement" },
                ].map((s) => (
                  <div className="card" key={s.name}>
                    <div className="card__title">{s.name}</div>
                    <div className="card__text">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Compliance Services */}
            <div className="service-category">
              <h3 className="category-title">🛡️ Health, Safety & Compliance</h3>
              <div className="grid">
                {[
                  { name: "Occupational Health & Safety (OHSE)", desc: "Risk assessment and safety management for industries" },
                  { name: "Risk Assessment & Management", desc: "Mining, construction, and industrial risk evaluation" },
                  { name: "Safety Training Programs", desc: "Capacity building for government and private employees" },
                  { name: "Environmental Compliance", desc: "Regulatory adherence and reporting" },
                  { name: "Pollution Control Advisory", desc: "Mitigation strategies and best practices" },
                  { name: "Environmental Eco-Auditing", desc: "Project management and environmental audits" },
                ].map((s) => (
                  <div className="card" key={s.name}>
                    <div className="card__title">{s.name}</div>
                    <div className="card__text">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engineering & Construction Services */}
            <div className="service-category">
              <h3 className="category-title">⚡ Engineering & Construction</h3>
              <div className="grid">
                {[
                  { name: "Solar Installation & Maintenance", desc: "Renewable energy solutions and maintenance services" },
                  { name: "Solar Panel Distribution", desc: "Quality solar panels for homes and businesses" },
                  { name: "House Plan & Design", desc: "Professional residential and commercial designs" },
                  { name: "Residential Wiring", desc: "Electrical installation and safety compliance" },
                  { name: "Project Estimation", desc: "Accurate cost and resource planning for projects" },
                  { name: "Wetland Management", desc: "Conservation and sustainable wetland projects" },
                ].map((s) => (
                  <div className="card" key={s.name}>
                    <div className="card__title">{s.name}</div>
                    <div className="card__text">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link className="btn btn--primary" to="/services">View All Services</Link>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="section team-section">
          <div className="container">
            <h2 className="section__title">Our Team</h2>
            <p className="section__text">Expert professionals committed to delivering excellent environmental solutions</p>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Loading team members...
              </div>
            ) : team.length > 0 ? (
              <div className="team-carousel-container">
                {canScrollLeft && (
                  <button 
                    className="carousel-nav carousel-nav--left"
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                  >
                    ‹
                  </button>
                )}
                
                <div 
                  className="team-carousel"
                  ref={carouselRef}
                  onScroll={checkScroll}
                >
                  {team.map((member) => {
                    const imageUrl = member.imageUrl ? `http://localhost:5000${member.imageUrl}` : null;
                    return (
                      <div className="team-card" key={member.id}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={member.name} className="team-card__image" />
                        ) : (
                          <div className="team-card__avatar">👤</div>
                        )}
                        <h3 className="team-card__name">{member.name}</h3>
                        <div className="team-card__title">{member.title}</div>
                        {member.credentials && (
                          <div className="team-card__credentials">{member.credentials}</div>
                        )}
                        {member.bio && (
                          <p className="team-card__bio">{member.bio}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {canScrollRight && (
                  <button 
                    className="carousel-nav carousel-nav--right"
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                  >
                    ›
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Meet our team of experts. Team members coming soon.
              </div>
            )}
          </div>
        </section>

        {/* Partnership & Market Segments */}
        <section className="section partners-section">
          <div className="container">
            <h2 className="section__title">We Serve</h2>
            <p className="section__text">FECASC partners with diverse sectors to drive sustainable development</p>
            <div className="partners__grid">
              <div className="partner-item">🏭 Mining & Extractive Industries</div>
              <div className="partner-item">🏗️ Infrastructure & Construction</div>
              <div className="partner-item">🌾 Agriculture & Agro-processing</div>
              <div className="partner-item">🏢 Government Agencies</div>
              <div className="partner-item">💼 Manufacturing & Industries</div>
              <div className="partner-item">🤝 NGOs & Development Partners</div>
            </div>
          </div>
        </section>

        {/* Environmental Commitment */}
        <section className="section commitment-section">
          <div className="container">
            <h2 className="section__title">Environmental Commitment</h2>
            <p className="section__text">
              We are dedicated to reducing environmental impact and promoting sustainable practices
            </p>
            <div className="commitment__grid">
              <div className="commitment-item">
                <div className="commitment-num">1</div>
                <div className="commitment-text">Climate Awareness & Action</div>
              </div>
              <div className="commitment-item">
                <div className="commitment-num">2</div>
                <div className="commitment-text">Resource Efficiency</div>
              </div>
              <div className="commitment-item">
                <div className="commitment-num">3</div>
                <div className="commitment-text">Waste Reduction & Recycling</div>
              </div>
              <div className="commitment-item">
                <div className="commitment-num">4</div>
                <div className="commitment-text">Stakeholder Collaboration</div>
              </div>
              <div className="commitment-item">
                <div className="commitment-num">5</div>
                <div className="commitment-text">Community Engagement</div>
              </div>
              <div className="commitment-item">
                <div className="commitment-num">6</div>
                <div className="commitment-text">Continuous Improvement</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="section contact-section">
          <div className="container">
            <h2 className="section__title">Get In Touch</h2>
            <p className="section__text">Ready to discuss your environmental or sustainability project?</p>
            <div className="contact">
              <div className="card">
                <div className="card__title">📧 Email</div>
                <div className="card__text">fecascconsultants546@gmail.com</div>
              </div>
              <div className="card">
                <div className="card__title">📱 Phone</div>
                <div className="card__text">+231 0776069037<br/>+231 0772719271<br/>+231 0886141440</div>
              </div>
              <div className="card">
                <div className="card__title">📍 Location</div>
                <div className="card__text">Voinjama City<br/>Lofa County, Liberia</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link className="btn btn--primary" to="/book">Book a Consultation</Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          {/* Wave SVG */}
          <svg 
            className="footer-wave" 
            viewBox="0 0 1200 100" 
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: -1, left: 0, width: '100%', height: '100px' }}
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: 'white', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'white', stopOpacity: 0.95}} />
              </linearGradient>
            </defs>
            <path
              d="M0,60 C150,20 300,20 450,60 C600,100 750,100 900,60 C1050,20 1150,20 1200,60 L1200,100 L0,100 Z"
              fill="white"
            />
          </svg>

          <div className="container">
            <div className="footer__top">
              <div className="footer__inner">
                {/* About Us */}
                <div className="footer-column">
                  <div className="footer-brand">
                    <div className="footer-brand__logo" title="Flomo's Environmental Consultants and Solutions Corporation (FECASC)">FECASC</div>
                    <div className="footer-brand__tagline">Green Thinking, Brighter Future</div>
                  </div>
                </div>

                {/* Contact Us */}
                <div className="footer-column">
                  <div className="footer-column__title">Contact Us</div>
                  <div className="footer__contact-info">
                    <div className="footer__contact-item">
                      <span className="footer__contact-icon">📧</span>
                      <a href="mailto:fecascconsultants546@gmail.com">fecascconsultants546@gmail.com</a>
                    </div>
                    <div className="footer__contact-item">
                      <span className="footer__contact-icon">📞</span>
                      <a href="tel:+231886141440">+231 0886141440</a>
                    </div>
                    <div className="footer__contact-item">
                      <span className="footer__contact-icon">📍</span>
                      <span>Voinjama City<br/>Lofa County, Liberia</span>
                    </div>
                  </div>
                </div>

                {/* Our Services */}
                <div className="footer-column">
                  <div className="footer-column__title">Our Services</div>
                  <div className="footer-column__links">
                    <Link to="/services" className="footer-column__link">Environmental Impact Assessments</Link>
                    <Link to="/services" className="footer-column__link">Waste Management</Link>
                    <Link to="/services" className="footer-column__link">Compliance Monitoring</Link>
                    <Link to="/services" className="footer-column__link">Training Programs</Link>
                  </div>
                </div>

                {/* Useful Links */}
                <div className="footer-column">
                  <div className="footer-column__title">Useful Links</div>
                  <div className="footer-column__links">
                    <Link to="/" className="footer-column__link">Home</Link>
                    <Link to="/about" className="footer-column__link">About Us</Link>
                    <Link to="/services" className="footer-column__link">Services</Link>
                    <Link to="/contact" className="footer-column__link">Contact</Link>
                  </div>
                </div>

                {/* Social Links */}
                <div className="footer-column">
                  <div className="footer-column__title">Follow Us</div>
                  <div className="footer__social">
                    <a href="https://facebook.com" className="footer__social-link" title="Facebook" target="_blank" rel="noopener noreferrer">
                      <img src="/images/fb.png" alt="Facebook" />
                    </a>
                    <a href="https://x.com" className="footer__social-link" title="X" target="_blank" rel="noopener noreferrer">
                      <img src="/images/x.png" alt="X" />
                    </a>
                    <a href="https://linkedin.com" className="footer__social-link" title="LinkedIn" target="_blank" rel="noopener noreferrer">
                      <img src="/images/in.png" alt="LinkedIn" />
                    </a>
                    <a href="https://youtube.com" className="footer__social-link" title="YouTube" target="_blank" rel="noopener noreferrer">
                      <img src="/images/ytube.png" alt="YouTube" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer__bottom">
              <div className="footer__copyright">© {new Date().getFullYear()} Flomo's Environmental Consultants & Solutions Corporation. All rights reserved.</div>
              <div className="footer__muted" style={{ marginTop: '8px' }}>
                Building a sustainable future through environmental excellence and innovation.
              </div>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/231886141440?text=Hello%20FECASC%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float"
          title="Contact us on WhatsApp"
        >
          <img src="/images/whatsapp.png" alt="WhatsApp" className="whatsapp-icon" />
        </a>
      </main>
    </div>
  );
}
