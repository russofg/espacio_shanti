// Script para limpiar y crear entradas de blog válidas
console.log("🧹 Limpiando localStorage y creando entradas válidas...");

// Limpiar localStorage
localStorage.removeItem("blogEntries");

// Crear entradas válidas
const validEntries = [
  {
    id: "valid-1",
    title: "Beneficios del Reiki",
    content:
      "El Reiki es una técnica japonesa de sanación que utiliza la energía universal para promover la relajación y el bienestar. En esta entrada exploraremos sus principales beneficios y cómo puede ayudarte en tu día a día.",
    author: "ana.martinez@espacioshanti.com",
    createdAt: "2025-07-20T10:30:00.000Z",
    category: "terapias",
    emoji: "✨",
    summary: "Descubre cómo el Reiki puede transformar tu bienestar",
  },
  {
    id: "valid-2",
    title: "Técnicas de Meditación para Principiantes",
    content:
      "La meditación es una herramienta poderosa para encontrar la paz interior. Te enseñamos técnicas simples que puedes practicar desde casa, sin necesidad de experiencia previa.",
    author: "Dr. Carlos Mendoza",
    createdAt: "2025-07-19T14:15:00.000Z",
    category: "meditacion",
    emoji: "🧘",
    summary: "Comienza tu viaje hacia la serenidad",
  },
  {
    id: "valid-3",
    title: "El Poder de los Cristales",
    content:
      "Los cristales han sido utilizados durante milenios por sus propiedades energéticas. Aprende cómo incorporar estas gemas en tu práctica espiritual diaria.",
    author: "lucia.sanchez@espacioshanti.com",
    createdAt: "2025-07-18T09:45:00.000Z",
    category: "espiritualidad",
    emoji: "💎",
    summary: "Conecta con la energía de la naturaleza",
  },
];

// Guardar en localStorage
localStorage.setItem("blogEntries", JSON.stringify(validEntries));

console.log("✅ Entradas válidas creadas:", validEntries.length);
console.log("📋 Entradas guardadas:", validEntries);

// Verificar que se guardaron correctamente
const saved = JSON.parse(localStorage.getItem("blogEntries") || "[]");
console.log("🔍 Verificación - entradas recuperadas:", saved.length);

// Instrucciones
console.log("\n📖 INSTRUCCIONES:");
console.log("1. Ejecuta este script en la consola del navegador");
console.log("2. Recarga la página para ver las entradas del blog");
console.log(
  "3. Las entradas deberían mostrar emojis, fechas y nombres correctos"
);

// Auto-ejecutar si estamos en el navegador
if (typeof window !== "undefined") {
  // Esperar un momento y recargar la página
  setTimeout(() => {
    if (typeof generateBlogCards === "function") {
      generateBlogCards();
    } else {
      location.reload();
    }
  }, 1000);
}
