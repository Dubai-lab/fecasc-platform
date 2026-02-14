import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Contact from "../pages/Contact";

// Admin pages
import Login from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import Bookings from "../pages/admin/Bookings";
import AdminServices from "../pages/admin/Services";
import Team from "../pages/admin/Team";
import Gallery from "../pages/admin/Gallery";
import Quotes from "../pages/admin/Quotes";
import Invoices from "../pages/admin/Invoices";
import BookServices from "../pages/BookServices";

// Consultant pages
import ConsultantDashboard from "../pages/consultant/ConsultantDashboard";
import ConsultantQuotes from "../pages/consultant/ConsultantQuotes";
import ConsultantInvoices from "../pages/consultant/ConsultantInvoices";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/book" element={<BookServices />} />

      {/* Unified Login */}
      <Route path="/admin/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute requiredRole="admin">
            <Bookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/services"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminServices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/team"
        element={
          <ProtectedRoute requiredRole="admin">
            <Team />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/gallery"
        element={
          <ProtectedRoute requiredRole="admin">
            <Gallery />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/quotes"
        element={
          <ProtectedRoute requiredRole="admin">
            <Quotes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/invoices"
        element={
          <ProtectedRoute requiredRole="admin">
            <Invoices />
          </ProtectedRoute>
        }
      />

      {/* Consultant/Staff Routes */}
      <Route
        path="/consultant/dashboard"
        element={
          <ProtectedRoute requiredRole="staff">
            <ConsultantDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/consultant/quotes"
        element={
          <ProtectedRoute requiredRole="staff">
            <ConsultantQuotes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/consultant/invoices"
        element={
          <ProtectedRoute requiredRole="staff">
            <ConsultantInvoices />
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}
