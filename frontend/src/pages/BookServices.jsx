import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import http from "../api/http";
import "./BookService.css";

export default function BookService() {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceId: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await http.get("/services");
        setServices(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setError("Failed to load services. Make sure backend is running.");
      } finally {
        setLoadingServices(false);
      }
    }
    load();
  }, []);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBookingRef("");

    if (!form.serviceId) {
      setError("Please select a service.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await http.post("/bookings", form);
      const ref = response.data.booking?.bookingRef || "";
      setBookingRef(ref);
      setSuccess(
        `✅ Booking submitted successfully!\n\n` +
        `Your booking reference: ${ref}\n\n` +
        `A confirmation email has been sent to ${form.clientEmail}.\n` +
        `Our team will contact you within 48 hours.`
      );
      setForm({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        serviceId: "",
        message: "",
      });
    } catch (e2) {
      setError(e2?.response?.data?.message || "Failed to submit booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="book">
      <Navbar />
      <div className="book__top">
        <div className="container">
          <h1>Book a Service</h1>
          <p>
            Fill the form below to request a service. Our team will respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="container book__wrap">
        <div className="book__card">
          {error ? <div className="alert alert--error">{error}</div> : null}
          
          {success && bookingRef ? (
            <div className="booking-success-card">
              <div className="success-header">✅ Booking Submitted Successfully!</div>
              <div className="success-details">
                <p>Your booking reference:</p>
                <div className="booking-reference">{bookingRef}</div>
                <p className="confirmation-text">
                  A confirmation email has been sent to <strong>{form.clientEmail}</strong>
                </p>
                <p className="response-timeline">
                  Our team will contact you within <strong>48 hours</strong> to discuss your project.
                </p>
                <p className="urgent-contact">
                  <strong>Need immediate assistance?</strong><br/>
                  Call us: <strong>+231 0776069037 / 0772719271</strong>
                </p>
              </div>
            </div>
          ) : success ? (
            <div className="alert alert--success">{success}</div>
          ) : null}

          <form className="form" onSubmit={onSubmit}>
            <div className="grid2">
              <label>
                Full Name*
                <input
                  value={form.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>

              <label>
                Email*
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => updateField("clientEmail", e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </label>

              <label>
                Phone
                <input
                  value={form.clientPhone}
                  onChange={(e) => updateField("clientPhone", e.target.value)}
                  placeholder="+231 / +250 ..."
                />
              </label>

              <label>
                Service*
                <select
                  value={form.serviceId}
                  onChange={(e) => updateField("serviceId", e.target.value)}
                  required
                >
                  <option value="">
                    {loadingServices ? "Loading services..." : "Select a service"}
                  </option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Message (optional)
              <textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                placeholder="Tell us about your project..."
                rows={5}
              />
            </label>

            <button className="btnPrimary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Booking"}
            </button>

            <div className="note">
              * No account is required. This is a simple service request form.
            </div>
          </form>
        </div>

        <div className="book__side">
          <div className="sideCard">
            <h3>Need urgent help?</h3>
            <p>Contact us directly:</p>
            <ul>
              <li>Email: fecascconsultants546@gmail.com</li>
              <li>Phone: +231 0776069037 / 0772719271</li>
            </ul>
          </div>

          <div className="sideCard">
            <h3>What happens next?</h3>
            <p>
              After submission, our team reviews your request and responds with next steps,
              timeline, and pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
