import express from "express";
import cors from "cors";
import eventRoutes from "./routes/events.js";
import categoryRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// konfiguruojame cors ir json parseri
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sukuriame api marsrutus
app.use("/api/events", eventRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// pagrindinis marsrutas 
app.get("/", (req, res) => {
  res.send("API is running. Try /api/events");
});

// paleidziame serveri
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
