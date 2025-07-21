// Script temporal para limpiar datos corrompidos de localStorage
// Ejecutar en la consola del navegador

console.log("🧹 Limpiando datos corrompidos de localStorage...");

// Lista de claves que pueden tener datos corrompidos
const keysToClean = ["therapist_session", "currentTherapist", "blogEntries"];

keysToClean.forEach((key) => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      // Verificar si es JSON válido
      JSON.parse(data);
      console.log(`✅ ${key}: Datos válidos`);
    } catch (error) {
      console.log(`🗑️ ${key}: Datos corrompidos, limpiando...`);
      localStorage.removeItem(key);
    }
  } else {
    console.log(`📭 ${key}: No encontrado`);
  }
});

console.log("✅ Limpieza completada. Recarga la página.");

// Opcional: Limpiar todo el localStorage de la aplicación
// localStorage.clear();
// console.log("🧹 localStorage completamente limpiado");
