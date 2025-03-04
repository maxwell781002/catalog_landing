import type { APIRoute } from "astro";
import sharp from "sharp";
import ico from "sharp-ico";
import path from "node:path";

// Ruta de la imagen fuente
const faviconSrc = path.resolve("src/images/logo-peque.png");

export const GET: APIRoute = async () => {
  // Tamaños para el favicon
  const sizes = [16, 32];

  // Redimensionar la imagen a los tamaños especificados
  const buffers = await Promise.all(
    sizes.map(async (size) => {
      return await sharp(faviconSrc)
        .resize(size)
        .toFormat("png")
        .toBuffer();
    })
  );

  // Convertir las imágenes a un archivo ICO
  const icoBuffer = ico.encode(buffers);

  // Devolver la respuesta con el favicon en formato ICO
  return new Response(icoBuffer, {
    headers: { "Content-Type": "image/x-icon" },
  });
};