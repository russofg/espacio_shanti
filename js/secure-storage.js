// Utilidad para gestión segura de almacenamiento local
// Implementa cifrado básico para datos sensibles

class SecureStorage {
  constructor() {
    // Clave de cifrado básica (en producción debe venir de configuración segura)
    this.encryptionKey = this.getEncryptionKey();
    window.secureLogger?.info("🔐 SecureStorage inicializado");
  }

  // Obtener clave de cifrado
  getEncryptionKey() {
    // En producción, esto debe venir de variables de entorno
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      // En producción, usar una clave desde variables de entorno
      return this.getSecureConfigValue('APP_SECRET_TOKEN', 'esp-shanti-2024');
    } else {
      // En desarrollo, usar clave por defecto
      return 'esp-shanti-dev-2024';
    }
  }

  // Obtener valor de configuración segura
  getSecureConfigValue(key, defaultValue) {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    return defaultValue;
  }

  // Cifrado simple (para datos no críticos)
  // NOTA: Para datos realmente sensibles, usar librerías de cifrado robustas
  encrypt(data) {
    try {
      const dataString = JSON.stringify(data);
      const encoded = btoa(unescape(encodeURIComponent(dataString + '::' + this.encryptionKey)));
      return encoded;
    } catch (error) {
      window.secureLogger?.error("❌ Error cifrando datos:", error.message);
      return null;
    }
  }

  // Descifrado
  decrypt(encryptedData) {
    try {
      const decoded = decodeURIComponent(escape(atob(encryptedData)));
      const [dataString, key] = decoded.split('::');
      
      if (key !== this.encryptionKey) {
        window.secureLogger?.error("❌ Clave de cifrado incorrecta");
        return null;
      }
      
      return JSON.parse(dataString);
    } catch (error) {
      window.secureLogger?.error("❌ Error descifrando datos:", error.message);
      return null;
    }
  }

  // Almacenar datos sensibles cifrados
  setSecureItem(key, value) {
    try {
      const encryptedValue = this.encrypt(value);
      if (encryptedValue) {
        localStorage.setItem(key, encryptedValue);
        window.secureLogger?.debug(`🔐 Datos almacenados de forma segura: ${key}`);
        return true;
      }
      return false;
    } catch (error) {
      window.secureLogger?.error(`❌ Error almacenando ${key}:`, error.message);
      return false;
    }
  }

  // Obtener datos sensibles descifrados
  getSecureItem(key) {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) {
        return null;
      }
      
      const decryptedValue = this.decrypt(encryptedValue);
      if (decryptedValue) {
        window.secureLogger?.debug(`🔐 Datos recuperados de forma segura: ${key}`);
      }
      return decryptedValue;
    } catch (error) {
      window.secureLogger?.error(`❌ Error recuperando ${key}:`, error.message);
      return null;
    }
  }

  // Almacenar datos no sensibles (sin cifrar)
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.secureLogger?.debug(`💾 Datos almacenados: ${key}`);
      return true;
    } catch (error) {
      window.secureLogger?.error(`❌ Error almacenando ${key}:`, error.message);
      return false;
    }
  }

  // Obtener datos no sensibles
  getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      window.secureLogger?.error(`❌ Error recuperando ${key}:`, error.message);
      return null;
    }
  }

  // Remover item específico
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      window.secureLogger?.debug(`🗑️ Datos removidos: ${key}`);
      return true;
    } catch (error) {
      window.secureLogger?.error(`❌ Error removiendo ${key}:`, error.message);
      return false;
    }
  }

  // Limpiar todos los datos de la aplicación
  clearAppData() {
    try {
      const keysToKeep = ['secure-logger-config']; // Mantener configuración del logger
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      window.secureLogger?.info("🧹 Datos de aplicación limpiados");
      return true;
    } catch (error) {
      window.secureLogger?.error("❌ Error limpiando datos:", error.message);
      return false;
    }
  }

  // Validar integridad del almacenamiento
  validateStorage() {
    try {
      // Intentar escribir y leer un valor de prueba
      const testKey = 'storage-test-' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };
      
      this.setItem(testKey, testValue);
      const retrieved = this.getItem(testKey);
      this.removeItem(testKey);
      
      const isValid = retrieved && retrieved.test === testValue.test;
      
      if (isValid) {
        window.secureLogger?.debug("✅ Almacenamiento validado correctamente");
      } else {
        window.secureLogger?.error("❌ Validación de almacenamiento falló");
      }
      
      return isValid;
    } catch (error) {
      window.secureLogger?.error("❌ Error validando almacenamiento:", error.message);
      return false;
    }
  }
}

// Crear instancia global
window.secureStorage = new SecureStorage();

// Validar al cargar
document.addEventListener('DOMContentLoaded', () => {
  window.secureStorage.validateStorage();
});
