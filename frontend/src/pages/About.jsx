import { useState, useEffect, useRef } from "react";
import Navbar from "../components/layout/Navbar";
import { Link } from "react-router-dom";
import { fetchTeam } from "../api/team";
import { fetchGalleryByCategory } from "../api/gallery";
import "./Page.css";
import "./About.css";

export default function About() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [projectImages, setProjectImages] = useState([]);
  const [worksiteImages, setWorksiteImages] = useState([]);
  const [serviceImages, setServiceImages] = useState([]);
  const [projectIndex, setProjectIndex] = useState(0);
  const [worksiteIndex, setWorksiteIndex] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
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
    let mounted = true;

    const loadGallery = async () => {
      try {
        const [projects, worksites, services] = await Promise.all([
          fetchGalleryByCategory("projects"),
          fetchGalleryByCategory("worksite"),
          fetchGalleryByCategory("services"),
        ]);

        if (mounted) {
          setProjectImages(projects);
          setWorksiteImages(worksites);
          setServiceImages(services);
        }
      } catch (error) {
        console.error("Error loading gallery:", error);
      } finally {
        if (mounted) {
          setGalleryLoading(false);
        }
      }
    };

    loadGallery();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [team]);

  // Auto-scroll gallery images
  useEffect(() => {
    if (projectImages.length === 0) return;
    const interval = setInterval(() => {
      setProjectIndex(prev => (prev === projectImages.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [projectImages]);

  useEffect(() => {
    if (worksiteImages.length === 0) return;
    const interval = setInterval(() => {
      setWorksiteIndex(prev => (prev === worksiteImages.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [worksiteImages]);

  useEffect(() => {
    if (serviceImages.length === 0) return;
    const interval = setInterval(() => {
      setServiceIndex(prev => (prev === serviceImages.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [serviceImages]);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="pageTop">
        <div className="container">
          <h1>About FECASC</h1>
          <p>
            Flomo’s Environmental Consultants and Solutions Corporation (FECASC) is an environmental consulting
            and sustainability solutions company headquartered in Voinjama City, Lofa County, Liberia. Founded in 2024,
            we're committed to driving sustainable development across West Africa.
          </p>
        </div>
      </div>

      <div className="container pageBody">
        
        {/* Mission, Vision, Values */}
        <section className="about-section">
          <div className="about-grid about-grid--3col">
            <div className="about-card about-card--mission">
              <div className="about-card__icon">🎯</div>
              <h2>Our Mission</h2>
              <p>
                To help optimize organizations and initiatives through collective processes of strategy creation 
                and implementation, so that they achieve their greatest possible impact on sustainable development.
              </p>
            </div>

            <div className="about-card about-card--vision">
              <div className="about-card__icon">🌍</div>
              <h2>Our Vision</h2>
              <p>
                A world where all organizations are impact-driven, effective and efficient in achieving their 
                sustainability goals, ensuring no one is left behind and human society lives within environmental boundaries.
              </p>
            </div>

            <div className="about-card about-card--values">
              <div className="about-card__icon">💎</div>
              <h2>Core Values</h2>
              <ul className="values-list">
                <li>✓ Collaboration</li>
                <li>✓ Honesty & Integrity</li>
                <li>✓ Innovation</li>
                <li>✓ Accountability</li>
                <li>✓ Transparency</li>
                <li>✓ Responsibility</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Company Profile */}
        <section className="about-section">
          <h2 className="section-title">Company Profile</h2>
          <div className="about-grid about-grid--2col">
            <div className="about-card">
              <h3>Who We Are</h3>
              <p>
                FECASC is a team of highly qualified environmental professionals, engineers, and sustainability 
                consultants dedicated to delivering world-class solutions. We're EPA-accredited and comply with 
                international standards including ISO 14001, IFC Performance Standards, and World Bank frameworks.
              </p>
            </div>
            <div className="about-card">
              <h3>Our Approach</h3>
              <p>
                We believe in participatory decision-making, purpose-driven leadership, and trust in client relationships. 
                Our virtual-first model reduces our carbon footprint while maintaining excellent service delivery to 
                clients across the region.
              </p>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="about-section">
          <h2 className="section-title">What We Do</h2>
          <p className="section-intro">
            We provide comprehensive environmental and engineering solutions for organizations across multiple sectors:
          </p>
          <div className="about-grid about-grid--4col">
            <div className="service-box">
              <div className="service-box__icon">📋</div>
              <h4>Environmental Assessment</h4>
              <p>EIA, audits & compliance monitoring</p>
            </div>
            <div className="service-box">
              <div className="service-box__icon">⚙️</div>
              <h4>Engineering & Power</h4>
              <p>Solar installations & infrastructure design</p>
            </div>
            <div className="service-box">
              <div className="service-box__icon">🏥</div>
              <h4>Occupational Health & Safety</h4>
              <p>Risk management & compliance</p>
            </div>
            <div className="service-box">
              <div className="service-box__icon">📊</div>
              <h4>Monitoring & Evaluation</h4>
              <p>Project tracking & impact assessment</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link className="btn btn--primary" to="/services">View All Services</Link>
          </div>
        </section>

        {/* Certifications & Compliance */}
        <section className="about-section">
          <h2 className="section-title">Certifications & Compliance</h2>
          <div className="about-grid about-grid--2col">
            <div className="compliance-list">
              <h3>Environmental Standards</h3>
              <ul>
                <li>✓ EPA Accredited (Liberia)</li>
                <li>✓ ISO 14001 Certified</li>
                <li>✓ IFC Performance Standards</li>
                <li>✓ World Bank Compliant</li>
              </ul>
            </div>
            <div className="compliance-list">
              <h3>Health & Safety Standards</h3>
              <ul>
                <li>✓ OHSAS 18001 / ISO 45001</li>
                <li>✓ MPW Liberia Approved</li>
                <li>✓ UN Global Compact Aligned</li>
                <li>✓ SDG Committed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sectors We Serve */}
        <section className="about-section">
          <h2 className="section-title">Sectors We Serve</h2>
          <div className="about-grid about-grid--3col">
            <div className="sector-card">
              <h4>⛏️ Mining & Extractive Industries</h4>
            </div>
            <div className="sector-card">
              <h4>🏭 Manufacturing & Industrial</h4>
            </div>
            <div className="sector-card">
              <h4>🏗️ Infrastructure & Construction</h4>
            </div>
            <div className="sector-card">
              <h4>🌾 Agriculture & Agro-processing</h4>
            </div>
            <div className="sector-card">
              <h4>🏛️ Government & Public Sector</h4>
            </div>
            <div className="sector-card">
              <h4>🤝 NGOs & Development Partners</h4>
            </div>
          </div>
        </section>

        {/* Environmental Commitment */}
        <section className="about-section about-section--highlight">
          <h2 className="section-title">Our Environmental Commitment</h2>
          <p className="section-intro">
            FECASC is dedicated to reducing environmental impact and promoting sustainable practices:
          </p>
          <div className="commitment-grid">
            <div className="commitment-item">
              <div className="commitment-icon">🌱</div>
              <h4>Carbon Footprint Reduction</h4>
              <p>Virtual-first operations and green practices</p>
            </div>
            <div className="commitment-item">
              <div className="commitment-icon">♻️</div>
              <h4>Waste Management</h4>
              <p>Recycling and waste hierarchy compliance</p>
            </div>
            <div className="commitment-item">
              <div className="commitment-icon">🔄</div>
              <h4>Continuous Improvement</h4>
              <p>Regular monitoring and process optimization</p>
            </div>
            <div className="commitment-item">
              <div className="commitment-icon">🤝</div>
              <h4>Stakeholder Collaboration</h4>
              <p>Partner engagement for environmental goals</p>
            </div>
          </div>
        </section>

        {/* Projects & Worksite Gallery */}
        <section className="about-section">
          <h2 className="section-title">Our Work</h2>
          <p className="section-intro">
            Gallery of our projects, worksites, and service implementations:
          </p>

          {galleryLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Loading gallery...
            </div>
          ) : (
            <div className="gallery-carousel-container">
              {/* Projects Carousel */}
              <div className="gallery-carousel-item">
                <h3>📸 Projects Gallery</h3>
                <p className="gallery-desc">EIA assessments, completed projects, environmental audits</p>
                {projectImages.length > 0 ? (
                  <div className="gallery-carousel-wrapper">
                    <div className="gallery-carousel-slide">
                      <img
                        src={`http://localhost:5000${projectImages[projectIndex].imageUrl}`}
                        alt={projectImages[projectIndex].title || "Project"}
                      />
                      {projectImages[projectIndex].title && (
                        <p className="carousel-title">{projectImages[projectIndex].title}</p>
                      )}
                    </div>
                    <div className="carousel-indicators">
                      {projectImages.map((_, idx) => (
                        <span
                          key={idx}
                          className={`indicator ${idx === projectIndex ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="gallery-empty">No projects yet</p>
                )}
              </div>

              {/* Worksite Carousel */}
              <div className="gallery-carousel-item">
                <h3>🏗️ Worksite Gallery</h3>
                <p className="gallery-desc">Field work, construction sites, implementation photos</p>
                {worksiteImages.length > 0 ? (
                  <div className="gallery-carousel-wrapper">
                    <div className="gallery-carousel-slide">
                      <img
                        src={`http://localhost:5000${worksiteImages[worksiteIndex].imageUrl}`}
                        alt={worksiteImages[worksiteIndex].title || "Worksite"}
                      />
                      {worksiteImages[worksiteIndex].title && (
                        <p className="carousel-title">{worksiteImages[worksiteIndex].title}</p>
                      )}
                    </div>
                    <div className="carousel-indicators">
                      {worksiteImages.map((_, idx) => (
                        <span
                          key={idx}
                          className={`indicator ${idx === worksiteIndex ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="gallery-empty">No worksites yet</p>
                )}
              </div>

              {/* Services Carousel */}
              <div className="gallery-carousel-item">
                <h3>💼 Services Gallery</h3>
                <p className="gallery-desc">Training sessions, solar installations, consulting work</p>
                {serviceImages.length > 0 ? (
                  <div className="gallery-carousel-wrapper">
                    <div className="gallery-carousel-slide">
                      <img
                        src={`http://localhost:5000${serviceImages[serviceIndex].imageUrl}`}
                        alt={serviceImages[serviceIndex].title || "Service"}
                      />
                      {serviceImages[serviceIndex].title && (
                        <p className="carousel-title">{serviceImages[serviceIndex].title}</p>
                      )}
                    </div>
                    <div className="carousel-indicators">
                      {serviceImages.map((_, idx) => (
                        <span
                          key={idx}
                          className={`indicator ${idx === serviceIndex ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="gallery-empty">No services yet</p>
                )}
              </div>
            </div>
          )}

        </section>

        {/* Team Section */}
        <section className="about-section">
          <h2 className="section-title">Our Team</h2>
          <p className="section-intro">
            Led by a multidisciplinary team of environmental consultants, engineers, and sustainability experts.
          </p>
          
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
              No team members available. Visit the admin dashboard to add team members with photos.
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="about-section about-section--cta">
          <h2>Ready to Work Together?</h2>
          <p>
            Let's discuss how FECASC can help your organization achieve its sustainability and 
            environmental impact goals.
          </p>
          <div className="cta-buttons">
            <Link className="btn btn--primary" to="/book">Book a Consultation</Link>
            <Link className="btn btn--outline" to="/services">Explore Services</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
