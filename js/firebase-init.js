// Configuración e inicialización de Firebase para Espacio Shanti
// Este archivo debe ser cargado después de firebase.js

// Configuración e inicialización de Firebase para Espacio Shanti
// Este archivo debe ser cargado después de firebase.js

document.addEventListener("DOMContentLoaded", async function () {
  window.secureLogger?.info("🔥 Iniciando configuración de Firebase...");

  try {
    // SEGURIDAD: Configuración de Firebase con detección de entorno
    const firebaseConfig = getFirebaseConfig();

    // Validar configuración antes de inicializar
    if (!validateFirebaseConfig(firebaseConfig)) {
      throw new Error("Configuración de Firebase inválida o incompleta");
    }

    // Crear instancia de FirebaseManager
    if (typeof FirebaseManager !== "undefined") {
      window.firebaseManager = new FirebaseManager();

      // Inicializar Firebase
      await window.firebaseManager.init(firebaseConfig);

      window.secureLogger?.info("✅ Firebase inicializado correctamente");
      window.secureLogger?.debug("🔍 Firebase Manager:", window.firebaseManager);
      window.secureLogger?.debug("🔍 Initialized:", window.firebaseManager.initialized);

      // Disparar evento personalizado para notificar que Firebase está listo
      const firebaseReadyEvent = new CustomEvent("firebaseReady", {
        detail: { firebaseManager: window.firebaseManager },
      });
      window.dispatchEvent(firebaseReadyEvent);
    } else {
      throw new Error("FirebaseManager class not found");
    }
  } catch (error) {
    window.secureLogger?.error("❌ Error inicializando Firebase:", error.message);
    showFirebaseSetupInstructions();
  }
});

// Función para obtener configuración según el entorno
function getFirebaseConfig() {
  // Detectar entorno
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1' &&
                      !window.location.hostname.includes('github.io');

  if (isProduction) {
    // En producción, usar configuración de variables de entorno o Firebase Remote Config
    return {
      projectId: getSecureConfigValue('FIREBASE_PROJECT_ID', 'espacio-shanti'),
      appId: getSecureConfigValue('FIREBASE_APP_ID', ''),
      storageBucket: getSecureConfigValue('FIREBASE_STORAGE_BUCKET', ''),
      apiKey: getSecureConfigValue('FIREBASE_API_KEY', ''),
      authDomain: getSecureConfigValue('FIREBASE_AUTH_DOMAIN', ''),
      messagingSenderId: getSecureConfigValue('FIREBASE_MESSAGING_SENDER_ID', ''),
      measurementId: getSecureConfigValue('FIREBASE_MEASUREMENT_ID', ''),
    };
  } else {
    // En desarrollo, usar configuración local (pero sin exponer claves reales)
    window.secureLogger?.warn("🚧 Usando configuración de desarrollo");
    return {
      projectId: "espacio-shanti",
      appId: "1:212141397656:web:ed8340624ff822f24b22ed",
      storageBucket: "espacio-shanti.firebasestorage.app",
      apiKey: "AIzaSyDwotkdQ98N9nJNaZeqUxi672VwLSUB7Lo", // OK para desarrollo
      authDomain: "espacio-shanti.firebaseapp.com",
      messagingSenderId: "212141397656",
      measurementId: "G-CP9TXJPGJV",
    };
  }
}

// Función para obtener valores de configuración seguros
function getSecureConfigValue(key, defaultValue) {
  // Intentar obtener de variables de entorno primero
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // TODO: Implementar Firebase Remote Config para producción
  // if (window.firebaseRemoteConfig) {
  //   return firebase.remoteConfig().getValue(key);
  // }
  
  return defaultValue;
}

// Función para validar configuración de Firebase
function validateFirebaseConfig(config) {
  const requiredKeys = ['projectId', 'appId', 'apiKey', 'authDomain'];
  
  for (const key of requiredKeys) {
    if (!config[key] || config[key].trim() === '') {
      window.secureLogger?.error(`❌ Configuración Firebase faltante: ${key}`);
      return false;
    }
  }
  
  return true;
}

// Función para mostrar instrucciones de configuración
function showFirebaseSetupInstructions() {
  const instructions = `
📋 INSTRUCCIONES PARA CONFIGURAR FIREBASE:

PARA DESARROLLO:
1. Verificar que las claves de desarrollo estén configuradas
2. Verificar reglas de Firestore para desarrollo

PARA PRODUCCIÓN:
1. Configurar variables de entorno:
   - FIREBASE_PROJECT_ID
   - FIREBASE_APP_ID  
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_STORAGE_BUCKET
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_MEASUREMENT_ID

2. O implementar Firebase Remote Config
3. Verificar reglas de seguridad de Firestore para producción
`;

  window.secureLogger?.info(instructions);
}

// Configuración temporal para desarrollo local (sin Firebase)
if (!window.firebaseManager) {
  window.secureLogger?.warn("⚠️ Firebase no disponible, usando localStorage como fallback");
}
