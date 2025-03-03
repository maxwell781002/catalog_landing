import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors'; // Importa el paquete cors
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

// Habilita CORS para todas las rutas
app.use(cors());

// Configura body-parser para manejar solicitudes JSON y URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configura el transporte de Nodemailer con OAuth2
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.NODEMAILER_USER, // Usar variable de entorno
    clientId: process.env.NODEMAILER_CLIENT_ID, // Usar variable de entorno
    clientSecret: process.env.NODEMAILER_CLIENT_SECRET, // Usar variable de entorno
    refreshToken: process.env.NODEMAILER_REFRESH_TOKEN, // Usar variable de entorno
  },
});

// Endpoint para manejar el formulario
app.post('/enviar-formulario', (req, res) => {
  const { nombre, apellido, email, telefono, detalles } = req.body;

  // Configura el correo electrónico
  const mailOptions = {
    from: process.env.NODEMAILER_USER, // Usar variable de entorno
    to: process.env.NODEMAILER_USER, // Usar variable de entorno
    subject: 'Nuevo formulario de contacto',
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
      return res.status(500).json({ success: false, message: 'Error al enviar el correo' });
    }
    console.log('Correo enviado: ' + info.response);
    res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
  });
});

// Inicia el servidor
const MAILER_PORT = process.env.MAILER_PORT || 3001; // Usar variable de entorno
app.listen(MAILER_PORT, () => {
  console.log(`Servidor de correo escuchando en http://localhost:${MAILER_PORT}`);
});