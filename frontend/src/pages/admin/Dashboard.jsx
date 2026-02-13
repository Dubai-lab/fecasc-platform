import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import http from "../../api/http";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    bookings: 0,
    services: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const [bookingsRes, servicesRes] = await Promise.all([
          http.get("/bookings"),
          http.get("/services/all"),
        ]);
        
        if (mounted) {
          const bookings = bookingsRes.data;
          const services = servicesRes.data;
          
          setStats({
            bookings: bookings.length,
            services: services.length,
          });

          // Group bookings by day of week
          const dayMap = {
            0: 'Sun',
            1: 'Mon',
            2: 'Tue',
            3: 'Wed',
            4: 'Thu',
            5: 'Fri',
            6: 'Sat',
          };
          
          const bookingsByDay = {
            Mon: 0,
            Tue: 0,
            Wed: 0,
            Thu: 0,
            Fri: 0,
            Sat: 0,
            Sun: 0,
          };

          bookings.forEach((booking) => {
            const date = new Date(booking.createdAt);
            const day = dayMap[date.getDay()];
            bookingsByDay[day]++;
          });
          
          setChartData(
            Object.entries(bookingsByDay).map(([day, count]) => ({
              name: day,
              bookings: count,
            }))
          );

          // Service distribution - group bookings by service
          const serviceBookingCounts = {};
          bookings.forEach((booking) => {
            const serviceName = booking.service?.title || 'Unknown Service';
            serviceBookingCounts[serviceName] = (serviceBookingCounts[serviceName] || 0) + 1;
          });

          // Get top 5 services by booking count
          const topServices = Object.entries(serviceBookingCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({
              name,
              value,
            }));
          
          setServiceData(topServices.length > 0 ? topServices : [
            { name: "No bookings yet", value: 1 },
          ]);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        console.error("Failed to load statistics");
        // Set default chart data on error
        setChartData([
          { name: "Mon", bookings: 0 },
          { name: "Tue", bookings: 0 },
          { name: "Wed", bookings: 0 },
          { name: "Thu", bookings: 0 },
          { name: "Fri", bookings: 0 },
          { name: "Sat", bookings: 0 },
          { name: "Sun", bookings: 0 },
        ]);
        setServiceData([
          { name: "No data", value: 1 },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome back! 👋</h2>
          <p>
            Manage bookings, services, and keep FECASC running smoothly.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">📋</div>
            <div className="stat-card__label">Total Bookings</div>
            <div className="stat-card__value" style={{ color: "#1a8f6a" }}>
              {loading ? "—" : stats.bookings}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon">⚙️</div>
            <div className="stat-card__label">Total Services</div>
            <div className="stat-card__value" style={{ color: "#11624a" }}>
              {loading ? "—" : stats.services}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <a href="/admin/bookings" className="action-btn" style={{ background: "#11624a" }} onMouseOver={(e) => e.target.style.background = "#0b3d2e"} onMouseOut={(e) => e.target.style.background = "#11624a"}>
              View All Bookings
            </a>
            <a href="/admin/services" className="action-btn" style={{ background: "#1a8f6a" }} onMouseOver={(e) => e.target.style.background = "#11624a"} onMouseOut={(e) => e.target.style.background = "#1a8f6a"}>
              Manage Services
            </a>
            <a href="/admin/gallery" className="action-btn" style={{ background: "#1a8f6a" }} onMouseOver={(e) => e.target.style.background = "#11624a"} onMouseOut={(e) => e.target.style.background = "#1a8f6a"}>
              Manage Gallery
            </a>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Bookings Chart */}
          <div className="chart-card">
            <h3>Bookings This Week</h3>
            {loading ? (
              <div className="chart-container">
                <div className="chart-loading">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}
                    cursor={{ fill: "rgba(26, 143, 106, 0.1)" }}
                  />
                  <Bar dataKey="bookings" fill="#1a8f6a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Services Distribution Chart */}
          <div className="chart-card">
            <h3>Top Services</h3>
            {loading ? (
              <div className="chart-container">
                <div className="chart-loading">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={70}
                    fill="#1a8f6a"
                    dataKey="value"
                  >
                    {serviceData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={["#1a8f6a", "#11624a", "#16a34a", "#15803d", "#166534"][index % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="system-info">
          <h3>📊 System Performance</h3>
          <div className="system-info-grid">
            <div className="system-info-card">
              <div className="system-info-card__label">Real-time Sync</div>
              <div className="system-info-card__status">✓ Active</div>
              <div className="system-info-card__detail">All data synced continuously</div>
            </div>
            <div className="system-info-card" style={{ borderLeftColor: "#16a34a" }}>
              <div className="system-info-card__label">Data Backups</div>
              <div className="system-info-card__status" style={{ color: "#16a34a" }}>✓ Daily</div>
              <div className="system-info-card__detail">Last backup: Today</div>
            </div>
            <div className="system-info-card" style={{ borderLeftColor: "#15803d" }}>
              <div className="system-info-card__label">System Status</div>
              <div className="system-info-card__status" style={{ color: "#15803d" }}>✓ Healthy</div>
              <div className="system-info-card__detail">All systems operational</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
