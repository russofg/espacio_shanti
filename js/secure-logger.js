// Sistema de Logging Seguro para Espacio Shanti
// ==============================================

class SecureLogger {
  constructor() {
    // Detectar entorno automáticamente
    this.isProduction = this.detectProduction();

    // En producción: solo errores críticos
    // En desarrollo: logs completos
    this.enableLogging = !this.isProduction;

    if (this.isProduction) {
      console.log("🔒 MODO PRODUCCIÓN - Logs deshabilitados por seguridad");
    }
  }

  detectProduction() {
    const isHTTPS = window.location.protocol === "https:";
    const isNotLocalhost =
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1");
    const isProductionFlag = window.PRODUCTION_MODE === true;

    return isHTTPS || isNotLocalhost || isProductionFlag;
  }

  // Logging seguro - NO muestra información sensible
  info(message, ...args) {
    if (!this.enableLogging) return;
    console.log(`ℹ️ ${message}`, ...this.sanitizeArgs(args));
  }

  debug(message, ...args) {
    if (!this.enableLogging) return;
    console.log(`🔍 ${message}`, ...this.sanitizeArgs(args));
  }

  warn(message, ...args) {
    console.warn(`⚠️ ${message}`, ...this.sanitizeArgs(args));
  }

  error(message, ...args) {
    console.error(`❌ ${message}`, ...this.sanitizeArgs(args));
  }

  // Sanitizar argumentos para remover información sensible
  sanitizeArgs(args) {
    if (!this.enableLogging) return [];

    return args.map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        return this.sanitizeObject(arg);
      }
      return arg;
    });
  }

  sanitizeObject(obj) {
    if (!this.enableLogging) return "[HIDDEN IN PRODUCTION]";

    const sanitized = { ...obj };

    // Campos sensibles a ocultar
    const sensitiveFields = [
      "email",
      "password",
      "token",
      "session",
      "auth",
      "clientEmail",
      "phone",
      "telefono",
      "uid",
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[PROTECTED]";
      }
    });

    return sanitized;
  }

  // Para migración gradual - método que acepta console.log style
  log(message, ...args) {
    this.info(message, ...args);
  }
}

// Crear instancia global
window.secureLogger = new SecureLogger();

// Para compatibilidad con código existente
window.safeLog = window.secureLogger.log.bind(window.secureLogger);
window.safeError = window.secureLogger.error.bind(window.secureLogger);
window.safeWarn = window.secureLogger.warn.bind(window.secureLogger);

// Override console.log en producción para mayor seguridad
if (window.secureLogger.isProduction) {
  const originalConsoleLog = console.log;
  console.log = function (...args) {
    // En producción, solo permitir logs que no contengan información sensible
    const hasEmailOrSensitive = args.some(
      (arg) =>
        typeof arg === "string" &&
        (arg.includes("@") ||
          arg.includes("email") ||
          arg.includes("usuario") ||
          arg.includes("currentUser") ||
          arg.includes("auth") ||
          arg.includes("session"))
    );

    if (!hasEmailOrSensitive) {
      originalConsoleLog.apply(console, args);
    }
  };

  console.log("🔒 Console.log filtrado activado en producción");
}
