// CONFIGURACIÓN DE PRODUCCIÓN
// ==========================

// INSTRUCCIONES PARA SUBIR A PRODUCCIÓN:
// 1. Cambiar PRODUCTION_MODE a true
// 2. Verificar que la URL del sitio sea correcta
// 3. Remover este archivo del servidor si no es necesario

// Configuración automática de producción
(function () {
  // Detectar automáticamente si estamos en producción
  const isHTTPS = window.location.protocol === "https:";
  const isNotLocalhost =
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1") &&
    !window.location.hostname.includes("file://");

  // Activar modo producción automáticamente si detectamos servidor real
  if (isHTTPS || isNotLocalhost) {
    window.PRODUCTION_MODE = true;

    // Log único para confirmar modo producción
    console.log("🔒 Modo Producción Activado - Logs limitados");

    // Opcional: Desactivar completamente console.log en producción
    // Descomenta las siguientes líneas para desactivar TODOS los logs:
    /*
    console.log = function() {};
    console.info = function() {};
    console.warn = function() {};
    // Mantener console.error para errores críticos
    */
  }
})();

// Configuración específica del sitio
window.SITE_CONFIG = {
  // URL del sitio en producción
  production_url: "https://espacioshanti.com",

  // Configuración de logging por nivel
  logging: {
    production: {
      level: "WARN", // Solo advertencias y errores
      console: false, // Desactivar console.log
    },
    development: {
      level: "DEBUG", // Todos los logs
      console: true,
    },
  },
};
