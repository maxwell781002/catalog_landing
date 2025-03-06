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

// Cargar variables de entorno solo en desarrollo local
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const app = express();

// Habilitar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", 
  methods: ["GET", "POST"],
  credentials: true, 
}));

// Configura body-parser para manejar solicitudes JSON y URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de la base de datos (PostgreSQL en Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false,
  },
});

// Prueba la conexión a la base de datos
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
  } else {
    console.log("Conexión a la base de datos exitosa:", res.rows[0]);
  }
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.NODEMAILER_USER, 
    clientId: process.env.NODEMAILER_CLIENT_ID, 
    clientSecret: process.env.NODEMAILER_CLIENT_SECRET, 
    refreshToken: process.env.NODEMAILER_REFRESH_TOKEN, 
  },
});

// Ruta para manejar el formulario de lista de espera
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
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
      from: process.env.NODEMAILER_USER, 
      to: process.env.NODEMAILER_DEST, 
      subject: "Nuevo cliente en la lista de espera",
      text: `Nombre: ${name}\nNegocio: ${business}\nTeléfono: ${phone}\nCorreo: ${email}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo enviado correctamente");

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error al insertar en la base de datos:", error);
    res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
  }
});

// Ruta para obtener la lista de clientes en la lista de espera
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
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

// Ruta para manejar el formulario de contacto
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
app.post("/enviar-formulario", (req, res) => {
  const { nombre, apellido, email, telefono, detalles } = req.body;

  // Configura el correo electrónico
  const mailOptions = {
    from: process.env.NODEMAILER_USER, 
    to: process.env.NODEMAILER_DEST, 
    subject: "Nuevo formulario de contacto",
    text: `
      Nombre: ${nombre}
      Apellido: ${apellido}
      Email: ${email}
      Teléfono: ${telefono}
      Detalles: ${detalles}
    `,
  };

  // Envía el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Error al enviar el correo" });
    }
    console.log("Correo enviado: " + info.response);
    res.status(200).json({ success: true, message: "Correo enviado correctamente" });
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001; // Usar variable de entorno
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});