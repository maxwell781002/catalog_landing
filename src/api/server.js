import express from "express";
import bodyParser from "body-parser";
import pkg from "pg";
const { Pool } = pkg;
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Depuración: Verificar que DATABASE_URL esté cargada correctamente
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();

// Habilitar CORS
app.use(cors());

app.use(bodyParser.json());

// Configuración de la base de datos (PostgreSQL en Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usar variable de entorno
  ssl: {
    rejectUnauthorized: false,
  },
});

// Validar la conexión a la base de datos
pool.connect((err, client, done) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
  } else {
    console.log("Conexión a la base de datos exitosa");
    done();
  }
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.NODEMAILER_USER, // Usar variable de entorno
    clientId: process.env.NODEMAILER_CLIENT_ID, // Usar variable de entorno
    clientSecret: process.env.NODEMAILER_CLIENT_SECRET, // Usar variable de entorno
    refreshToken: process.env.NODEMAILER_REFRESH_TOKEN, // Usar variable de entorno
  },
});

// Ruta para manejar el formulario
app.post("/api/waitlist", async (req, res) => {
  const { name, business, phone, email } = req.body;

  console.log("Datos recibidos:", { name, business, phone, email });

  try {
    // Guardar en la base de datos
    const result = await pool.query(
      "INSERT INTO waitlist (name, business, phone, email) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, business, phone, email]
    );

    console.log("Datos insertados en la base de datos:", result.rows[0]);

    // Enviar notificación por correo
    const mailOptions = {
      from: process.env.NODEMAILER_USER, // Usar variable de entorno
      to: process.env.NODEMAILER_USER, // Usar variable de entorno
      subject: "Nuevo cliente en la lista de espera",
      text: `Nombre: ${name}\nNegocio: ${business}\nTeléfono: ${phone}\nCorreo: ${email}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo enviado correctamente");

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
  }
});

// Nuevo endpoint para obtener la lista de clientes en la lista de espera
app.get("/api/waitlist", async (req, res) => {
  try {
    const result = await pool.query("SELECT business FROM waitlist");
    console.log("Resultados de la consulta:", result.rows);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Error al obtener la lista de espera" });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000; // Usar variable de entorno
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});