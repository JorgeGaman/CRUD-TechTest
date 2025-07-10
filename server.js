import express from "express";
import { createServer } from "http";
import {
  connectDb,
  createTable,
  insertPromotion,
  updatePromotion,
  getPromotions,
} from "./script.js";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// API Routes
app.get("/api/promotions", async (req, res) => {
  try {
    const promotions = await getPromotions();
    res.json(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({ error: "Error fetching promotions" });
  }
});

app.post("/api/promotions", async (req, res) => {
  try {
    const promotion = {
      producto: req.body.nombre,
      importe: req.body.importe,
      moneda: req.body.moneda === "MXN" ? 1 : 2, // Convert to numeric
      fecha_inicio: req.body.fecha_inicio,
      fecha_fin: req.body.fecha_fin,
      estatus: 1, // 1 = pendiente, 2 = aprobado, 3 = rechazado
      comentario: req.body.comentario || "",
    };

    await insertPromotion(promotion);
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating promotion:", error);
    res.status(500).json({ success: false, error: "Error creating promotion" });
  }
});

app.put("/api/promotions/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { estatus, comentario } = req.body;

    // Convert status text to numeric
    let statusNumeric;
    switch (estatus) {
      case "pendiente":
        statusNumeric = 1;
        break;
      case "aprobado":
        statusNumeric = 2;
        break;
      case "rechazado":
        statusNumeric = 3;
        break;
      default:
        statusNumeric = 1;
    }

    const promotion = {
      estatus: statusNumeric,
      comentario: comentario || "",
    };

    await updatePromotion(id, promotion);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({ success: false, error: "Error updating promotion" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

connectDb()
  .then(() => createTable())
  .catch((err) => console.error("Error during database setup", err));

app.use((req, res, next) => {
  res.status(404).send("Page not found");
});
