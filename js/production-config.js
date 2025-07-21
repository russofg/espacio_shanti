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

  // CONFIGURACIÓN EMAILJS (OCULTA)
  // ================================
  emailjs: {
    production: {
      // PRODUCCIÓN: Configurar con valores reales antes del deploy
      serviceId: process.env.EMAILJS_SERVICE_ID || "service_PROD_ID",
      publicKey: process.env.EMAILJS_PUBLIC_KEY || "PROD_PUBLIC_KEY",
      templates: {
        confirmacion: process.env.EMAILJS_TEMPLATE_CONFIRM || "template_PROD_CONFIRM",
        recordatorio_24h: process.env.EMAILJS_TEMPLATE_24H || "template_PROD_24H",
        recordatorio_2h: process.env.EMAILJS_TEMPLATE_2H || "template_PROD_2H",
      }
    },
    development: {
      // DESARROLLO: Valores actuales (cambiar antes de producción)
      serviceId: "service_6gdc5d9",
      publicKey: "coMY9H78vxBJ2e8AV", 
      templates: {
        confirmacion: "template_fc7edbq",
        recordatorio_24h: "template_fc7edbq",
        recordatorio_2h: "template_fc7edbq",
      }
    }
  },

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

// FUNCIÓN PARA OBTENER CONFIGURACIÓN EMAILJS SEGURA
// ==================================================
window.getEmailJSConfig = function() {
  const isProduction = window.PRODUCTION_MODE || false;
  const environment = isProduction ? 'production' : 'development';
  
  const config = window.SITE_CONFIG?.emailjs?.[environment];
  
  if (!config) {
    window.secureLogger?.error('❌ No se pudo obtener configuración EmailJS');
    return null;
  }

  // En producción, ocultar las credenciales de los logs
  if (isProduction) {
    window.secureLogger?.debug('📧 Configuración EmailJS cargada (PRODUCCIÓN)');
  } else {
    window.secureLogger?.debug('📧 Configuración EmailJS cargada (DESARROLLO)', {
      serviceId: config.serviceId?.substring(0, 8) + '...',
      publicKey: config.publicKey?.substring(0, 8) + '...',
      templates: Object.keys(config.templates || {})
    });
  }

  return config;
};

console.log("🔒 Configuración EmailJS segura inicializada");
