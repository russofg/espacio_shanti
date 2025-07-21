// Script de prueba para verificar el sistema de blog corregido
console.log("🧪 INICIANDO PRUEBAS DEL SISTEMA DE BLOG");

// Limpiar localStorage para empezar desde cero
localStorage.removeItem("blogEntries");

// Crear entradas de prueba con diferentes escenarios
const testEntries = [
  {
    id: "test-email-author",
    title: "Prueba con Autor Email",
    content:
      "Esta entrada tiene un autor con email para probar la extracción del nombre.",
    author: "ana.martinez@espacioshanti.com",
    createdAt: new Date().toISOString(),
    category: "bienestar",
    emoji: "🌿",
    summary: "Prueba de autor con email",
  },
  {
    id: "test-name-author",
    title: "Prueba con Nombre de Autor",
    content: "Esta entrada tiene un autor con nombre directo.",
    author: "Dr. Carlos Mendoza",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    category: "terapias",
    emoji: "✨",
    summary: "Prueba de autor con nombre",
  },
  {
    id: "test-no-emoji",
    title: "Prueba Sin Emoji",
    content: "Esta entrada no tiene emoji para probar el fallback.",
    author: "María González",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    category: "meditacion",
    // Sin emoji ni summary
  },
  {
    id: "test-invalid-date",
    title: "Prueba con Fecha Inválida",
    content:
      "Esta entrada tiene una fecha inválida para probar el manejo de errores.",
    author: "luis.rodriguez@test.com",
    createdAt: "fecha-invalida",
    category: "salud-mental",
    emoji: "🕯️",
    summary: "Prueba de fecha inválida",
  },
  {
    id: "test-empty-fields",
    title: "", // Título vacío
    content: "", // Contenido vacío
    author: "", // Autor vacío
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    category: "",
    emoji: "",
    summary: "",
  },
];

// Guardar entradas de prueba
localStorage.setItem("blogEntries", JSON.stringify(testEntries));

console.log("✅ Entradas de prueba creadas:", testEntries.length);

// Función para ejecutar pruebas
function runBlogTests() {
  console.log("🔄 Ejecutando pruebas del sistema de blog...");

  // Simular la llamada a generateBlogCards
  if (typeof generateBlogCards === "function") {
    generateBlogCards();
    console.log("✅ generateBlogCards ejecutada");
  } else {
    console.log("❌ generateBlogCards no encontrada");
  }

  // Probar apertura de modal
  setTimeout(() => {
    if (typeof openBlogModal === "function") {
      openBlogModal("test-email-author");
      console.log("✅ openBlogModal ejecutada");
    } else {
      console.log("❌ openBlogModal no encontrada");
    }
  }, 2000);

  console.log(
    "🎯 Pruebas completadas. Revisa la consola y la interfaz para ver los resultados."
  );
}

// Ejecutar pruebas cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runBlogTests);
} else {
  runBlogTests();
}
