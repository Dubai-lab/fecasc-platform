import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import teamRoutes from "./routes/team.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import quotesRoutes from "./routes/quotes.routes.js";
import invoicesRoutes from "./routes/invoices.routes.js";
import blogRoutes from "./routes/blog.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.get("/", (_req, res) => res.send("FECASC API running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/quotes", quotesRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/blog", blogRoutes);

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => console.log(`Server running on http://localhost:${PORT}`));
