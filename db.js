// mysql connection
import mysql from "mysql2/promise";
import env from "dotenv";

env.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "promotions_db",
};
const client = mysql.createPool(dbConfig);

async function connectDb() {
  try {
    await client.getConnection();
    console.log("Connected to the database successfully");
  } catch (err) {
    console.error("Error connecting to the database", err.stack);
  }
  return client;
}

async function createTable() {
  try {
    const query = `
            CREATE TABLE IF NOT EXISTS promotions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                producto VARCHAR(50) NOT NULL,
                importe DECIMAL(10, 2) NOT NULL,
                moneda INT NOT NULL,
                fecha_inicio DATETIME NOT NULL,
                fecha_fin DATETIME NOT NULL,
                estatus INT NOT NULL,
                comentario VARCHAR(255) NOT NULL
            );
        `;
    await client.query(query);
    console.log('Table "promotions" created successfully');
  } catch (err) {
    console.error("Error creating table", err.stack);
  }
  return client;
}
async function insertPromotion(promotion) {
  try {
    const query = `
            INSERT INTO promotions (producto, importe, moneda, fecha_inicio, fecha_fin, estatus, comentario)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
    const values = [
      promotion.producto,
      promotion.importe,
      promotion.moneda,
      promotion.fecha_inicio,
      promotion.fecha_fin,
      promotion.estatus,
      promotion.comentario,
    ];
    await client.query(query, values);
    console.log("Promotion inserted successfully");
  } catch (err) {
    console.error("Error inserting promotion", err.stack);
  }
}
async function updatePromotion(id, promotion) {
  try {
    const query = `
            UPDATE promotions
            SET estatus = ?, comentario = ?
            WHERE id = ?;
        `;
    const values = [promotion.estatus, promotion.comentario, id];
    await client.query(query, values);
    console.log("Promotion updated successfully");
  } catch (err) {
    console.error("Error updating promotion", err.stack);
  }
}

async function getPromotions() {
  try {
    const query = "SELECT * FROM promotions ORDER BY id DESC;";
    const [rows] = await client.query(query);

    // Convert numeric values to readable format
    const promotions = rows.map((row) => ({
      ...row,
      moneda: row.moneda === 1 ? "MXN" : "USD",
      estatus:
        row.estatus === 1
          ? "pendiente"
          : row.estatus === 2
          ? "aprobado"
          : "rechazado",
    }));

    console.log("Promociones recibidas", promotions);
    return promotions;
  } catch (err) {
    console.error("Error retrieving promotions", err.stack);
    return [];
  }
}

export {
  connectDb,
  createTable,
  insertPromotion,
  updatePromotion,
  getPromotions,
};
export default client;
