import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import http from "../api/http";
import "./Page.css";
import "./Services.css";

export default function Services() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await http.get("/services");
        setItems(res.data);
      } catch {
        setErr("Failed to load services. Make sure backend is running.");
      }
    }
    load();
  }, []);

  // Group services by category
  const getServiceIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("environmental") || titleLower.includes("eia") || titleLower.includes("audit")) return "📋";
    if (titleLower.includes("health") || titleLower.includes("ohse") || titleLower.includes("safety")) return "🏥";
    if (titleLower.includes("risk")) return "⚠️";
    if (titleLower.includes("wetland")) return "💧";
    if (titleLower.includes("climate")) return "🌍";
    if (titleLower.includes("waste")) return "♻️";
    if (titleLower.includes("monitoring") || titleLower.includes("m&e")) return "📊";
    if (titleLower.includes("solar")) return "☀️";
    if (titleLower.includes("house") || titleLower.includes("wiring")) return "⚡";
    if (titleLower.includes("training")) return "🎓";
    return "✓";
  };

  const categorizeServices = () => {
    const categories = {
      "Environmental Assessment": [],
      "Engineering & Power": [],
      "Training & Support": []
    };

    items.forEach(service => {
      const titleLower = service.title.toLowerCase();
      if (titleLower.includes("solar") || titleLower.includes("house") || titleLower.includes("wiring")) {
        categories["Engineering & Power"].push(service);
      } else if (titleLower.includes("training")) {
        categories["Training & Support"].push(service);
      } else {
        categories["Environmental Assessment"].push(service);
      }
    });

    return categories;
  };

  const servicesByCategory = categorizeServices();

  return (
    <div>
      <Navbar />

      <div className="pageTop">
        <div className="container">
          <h1>Our Services</h1>
          <p>
            Comprehensive environmental consulting, engineering, and sustainability solutions designed to help your organization 
            meet regulatory requirements and achieve environmental impact goals.
          </p>
        </div>
      </div>

      <div className="container pageBody">
        {err && <div className="pageAlert">{err}</div>}

        {Object.entries(servicesByCategory).map(([category, services]) => (
          services.length > 0 && (
            <section key={category} className="services-section">
              <h2 className="services-category-title">{category}</h2>
              
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-card__icon">{getServiceIcon(service.title)}</div>
                    <h3 className="service-card__title">{service.title}</h3>
                    <p className="service-card__description">
                      {service.description || "Professional delivery aligned with regulatory standards and best practices."}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )
        ))}

        {/* Call to Action */}
        <section className="services-cta">
          <h2>Ready to Get Started?</h2>
          <p>
            Let's discuss which services best fit your organization's needs and how FECASC can support your sustainability goals.
          </p>
          <div className="cta-buttons">
            <Link className="btn btn--primary" to="/book">Book a Consultation</Link>
            <Link className="btn btn--outline" to="/about">Learn More About Us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
