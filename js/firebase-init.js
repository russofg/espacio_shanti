// Configuración e inicialización de Firebase para Espacio Shanti
// Este archivo debe ser cargado después de firebase.js

document.addEventListener("DOMContentLoaded", async function () {
  console.log("🔥 Iniciando configuración de Firebase...");

  try {
    // Configuración de Firebase para el proyecto "espacio-shanti"
    const firebaseConfig = {
      projectId: "espacio-shanti",
      appId: "1:212141397656:web:ed8340624ff822f24b22ed",
      storageBucket: "espacio-shanti.firebasestorage.app",
      apiKey: "AIzaSyDwotkdQ98N9nJNaZeqUxi672VwLSUB7Lo",
      authDomain: "espacio-shanti.firebaseapp.com",
      messagingSenderId: "212141397656",
      measurementId: "G-CP9TXJPGJV",
    };

    // Nota: Configuración obtenida de Firebase Console para proyecto espacio-shanti

    // Crear instancia de FirebaseManager
    if (typeof FirebaseManager !== "undefined") {
      window.firebaseManager = new FirebaseManager();

      // Inicializar Firebase
      await window.firebaseManager.init(firebaseConfig);

      console.log("✅ Firebase inicializado correctamente");
      console.log("🔍 Firebase Manager:", window.firebaseManager);
      console.log("🔍 Initialized:", window.firebaseManager.initialized);

      // Disparar evento personalizado para notificar que Firebase está listo
      const firebaseReadyEvent = new CustomEvent("firebaseReady", {
        detail: { firebaseManager: window.firebaseManager },
      });
      window.dispatchEvent(firebaseReadyEvent);
    } else {
      console.error("❌ FirebaseManager class not found");
    }
  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error);

    // En caso de error, mostrar instrucciones para configurar Firebase
    console.log(`
📋 INSTRUCCIONES PARA CONFIGURAR FIREBASE:

1. Ve a https://console.firebase.google.com/project/espacio-shanti/settings/general/web
2. Copia la configuración de Firebase
3. Reemplaza firebaseConfig en este archivo con la configuración real
4. Asegúrate de que las reglas de Firestore estén desplegadas

🔧 Para desplegar reglas: firebase deploy --only firestore:rules
    `);
  }
});

// Configuración temporal para desarrollo local (sin Firebase)
if (!window.firebaseManager) {
  console.log("⚠️ Firebase no disponible, usando localStorage como fallback");
}
