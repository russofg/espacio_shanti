// Sistema de Logging Condicional para Espacio Shanti
class Logger {
  constructor() {
    // Detectar si estamos en producción
    this.isProduction = this.detectProduction();

    // Configurar niveles de log
    this.levels = {
      ERROR: 0, // Siempre mostrar errores críticos
      WARN: 1, // Advertencias importantes
      INFO: 2, // Información general
      DEBUG: 3, // Detalles de debugging
    };

    // Nivel actual (en producción solo ERROR y WARN)
    this.currentLevel = this.isProduction
      ? this.levels.WARN
      : this.levels.DEBUG;

    if (this.isProduction) {
      console.log("🔒 Modo Producción - Logs limitados activados");
    } else {
      console.log("🔧 Modo Desarrollo - Logs completos activados");
    }
  }

  detectProduction() {
    // Detectar si estamos en producción basado en:
    // 1. Protocolo HTTPS
    // 2. Hostname no localhost
    // 3. Variable global de producción

    const isHTTPS = window.location.protocol === "https:";
    const isNotLocalhost =
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1") &&
      !window.location.hostname.includes("file://");

    // También verificar si hay una variable global definida
    const isProductionFlag = window.PRODUCTION_MODE === true;

    return isHTTPS || isNotLocalhost || isProductionFlag;
  }

  // Método principal de logging
  log(level, message, ...args) {
    if (this.levels[level] <= this.currentLevel) {
      const timestamp = new Date().toLocaleTimeString();
      const prefix = `[${timestamp}] [${level}]`;

      switch (level) {
        case "ERROR":
          console.error(prefix, message, ...args);
          break;
        case "WARN":
          console.warn(prefix, message, ...args);
          break;
        case "INFO":
          console.info(prefix, message, ...args);
          break;
        case "DEBUG":
          console.log(prefix, message, ...args);
          break;
      }
    }
  }

  // Métodos de conveniencia
  error(message, ...args) {
    this.log("ERROR", message, ...args);
  }

  warn(message, ...args) {
    this.log("WARN", message, ...args);
  }

  info(message, ...args) {
    this.log("INFO", message, ...args);
  }

  debug(message, ...args) {
    this.log("DEBUG", message, ...args);
  }

  // Para recordatorios específicos
  reminder(message, ...args) {
    this.debug(`🔔 ${message}`, ...args);
  }

  email(message, ...args) {
    this.debug(`📧 ${message}`, ...args);
  }

  system(message, ...args) {
    this.info(`⚙️ ${message}`, ...args);
  }

  // Método para logs críticos que siempre deben mostrarse
  critical(message, ...args) {
    console.error(`🚨 [CRITICAL] ${message}`, ...args);
  }
}

// Instancia global
window.logger = new Logger();

// Función de conveniencia para migración gradual
window.safeLog = function (message, ...args) {
  window.logger.debug(message, ...args);
};

// Función para logs de producción (solo errores críticos)
window.prodLog = function (message, ...args) {
  window.logger.info(message, ...args);
};
