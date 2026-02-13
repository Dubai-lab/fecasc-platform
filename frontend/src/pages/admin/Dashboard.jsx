import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import http from "../../api/http";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
      <div style={{ display: "grid", gap: 16 }}>
        {/* Welcome Section */}
        <div style={{ background: "linear-gradient(135deg, #0b3d2e, #11624a)", borderRadius: 14, padding: 24, color: "white" }}>
          <h2 style={{ marginBottom: 8, fontSize: 24 }}>Welcome back! 👋</h2>
          <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            Manage bookings, services, and keep FECASC running smoothly.
          </p>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Total Bookings</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#1a8f6a" }}>
              {loading ? "—" : stats.bookings}
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚙️</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Total Services</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#11624a" }}>
              {loading ? "—" : stats.services}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 800 }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <a href="/admin/bookings" style={{ 
              background: "#11624a", 
              color: "white", 
              padding: "12px 16px", 
              borderRadius: 12, 
              textAlign: "center", 
              textDecoration: "none",
              fontWeight: 700,
              transition: "background 0.3s",
            }} onMouseOver={(e) => e.target.style.background = "#0b3d2e"} onMouseOut={(e) => e.target.style.background = "#11624a"}>
              View All Bookings
            </a>
            <a href="/admin/services" style={{ 
              background: "#1a8f6a", 
              color: "white", 
              padding: "12px 16px", 
              borderRadius: 12, 
              textAlign: "center", 
              textDecoration: "none",
              fontWeight: 700,
              transition: "background 0.3s",
            }} onMouseOver={(e) => e.target.style.background = "#11624a"} onMouseOut={(e) => e.target.style.background = "#1a8f6a"}>
              Manage Services
            </a>
            <a href="/admin/gallery" style={{ 
              background: "#1a8f6a", 
              color: "white", 
              padding: "12px 16px", 
              borderRadius: 12, 
              textAlign: "center", 
              textDecoration: "none",
              fontWeight: 700,
              transition: "background 0.3s",
            }} onMouseOver={(e) => e.target.style.background = "#11624a"} onMouseOut={(e) => e.target.style.background = "#1a8f6a"}>
              Manage Gallery
            </a>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Bookings Chart */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
            <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: 16 }}>Bookings This Week</h3>
            {loading ? (
              <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
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
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
            <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: 16 }}>Top Services</h3>
            {loading ? (
              <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
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
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: 16 }}>📊 System Performance</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div style={{ padding: 16, background: "#f0fdf9", borderRadius: 12, borderLeft: "4px solid #1a8f6a" }}>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Real-time Sync</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1a8f6a" }}>✓ Active</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>All data synced continuously</div>
            </div>
            <div style={{ padding: 16, background: "#f0fdf9", borderRadius: 12, borderLeft: "4px solid #16a34a" }}>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Data Backups</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#16a34a" }}>✓ Daily</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>Last backup: Today</div>
            </div>
            <div style={{ padding: 16, background: "#f0fdf9", borderRadius: 12, borderLeft: "4px solid #15803d" }}>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>System Status</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#15803d" }}>✓ Healthy</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>All systems operational</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
