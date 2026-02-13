import Navbar from "../components/layout/Navbar";
import "./Page.css";
import "./Contact.css";

export default function Contact() {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <div className="contact__hero">
        <div className="container">
          <h1 className="contact__title">Get in Touch</h1>
          <p className="contact__subtitle">
            Reach out to discuss your environmental consulting needs. Our team is ready to help.
          </p>
        </div>
      </div>

      {/* Main Contact Section */}
      <div className="container contact__main">
        <div className="contact__grid">
          {/* Left Side - Contact Info */}
          <div className="contact__info-section">
            <h2 className="contact__section-title">Contact Information</h2>
            <p className="contact__section-desc">
              Have a question or ready to start your next environmental project? We'd love to hear from you.
            </p>

            {/* Contact Cards */}
            <div className="contact__cards">
              {/* Email Card */}
              <div className="contact__card">
                <div className="contact__card-icon">✉️</div>
                <div className="contact__card-content">
                  <h3>Email</h3>
                  <a href="mailto:fecascconsultants546@gmail.com">
                    fecascconsultants546@gmail.com
                  </a>
                  <p>Response time: Within 24 hours</p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="contact__card">
                <div className="contact__card-icon">📞</div>
                <div className="contact__card-content">
                  <h3>Phone</h3>
                  <div className="phone__list">
                    <a href="tel:+231776069037">+231 (0) 776-069-037</a>
                    <a href="tel:+231772719271">+231 (0) 772-719-271</a>
                    <a href="tel:+231886141440">+231 (0) 886-141-440</a>
                  </div>
                  <p>Available: Mon - Fri, 8:00 AM - 5:00 PM</p>
                </div>
              </div>

              {/* Location Card */}
              <div className="contact__card">
                <div className="contact__card-icon">📍</div>
                <div className="contact__card-content">
                  <h3>Office Location</h3>
                  <p>
                    Voinjama City<br />
                    Lofa County<br />
                    Republic of Liberia
                  </p>
                  <p className="office__hours">Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="contact__map-section">
            <h2 className="contact__section-title">Find Us on the Map</h2>
            <div className="contact__map-container">
              <iframe
                title="FECASC Location Map - Voinjama, Liberia"
                width="100%"
                height="100%"
                style={{ borderRadius: "12px", border: "none" }}
                loading="lazy"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1013.8156412345!2d-9.9899!3d8.3401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xf3d3d3d3d%3A0x0!2sVoinjama%2C%20Lofa%20County%2C%20Liberia!5e0!3m2!1sen!2sli!4v1234567890"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <section className="contact__support-section">
        <div className="container">
          <h2>Why Choose FECASC?</h2>
          <div className="support__grid">
            <div className="support__item">
              <div className="support__icon">🏆</div>
              <h3>Expert Team</h3>
              <p>Certified environmental consultants with years of industry experience</p>
            </div>
            <div className="support__item">
              <div className="support__icon">⚡</div>
              <h3>Quick Response</h3>
              <p>Get expert advice and consultations within 24 hours</p>
            </div>
            <div className="support__item">
              <div className="support__icon">✅</div>
              <h3>Certified & Accredited</h3>
              <p>EPA accredited and ISO 14001 compliant services</p>
            </div>
            <div className="support__item">
              <div className="support__icon">🌍</div>
              <h3>Local Expertise</h3>
              <p>Deep understanding of Liberian environmental regulations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
