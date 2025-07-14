// Diagnóstico de Firebase para Espacio Shanti
// Ejecuta este script para verificar el estado de la conexión

console.log("🔍 DIAGNÓSTICO DE FIREBASE");
console.log("========================");

// 1. Verificar si window.firebaseManager existe
console.log("1. Verificando firebaseManager...");
if (window.firebaseManager) {
  console.log("✅ firebaseManager existe");
  console.log("   - initialized:", window.firebaseManager.initialized);
  console.log("   - app:", !!window.firebaseManager.app);
  console.log("   - db:", !!window.firebaseManager.db);
  console.log("   - auth:", !!window.firebaseManager.auth);
} else {
  console.log("❌ firebaseManager NO existe");
}

// 2. Verificar funciones globales
console.log("\n2. Verificando funciones globales...");
console.log(
  "   - initializeFirebaseData:",
  typeof window.initializeFirebaseData
);
console.log(
  "   - checkFirebaseConnection:",
  typeof window.checkFirebaseConnection
);
console.log("   - clearFirebaseData:", typeof window.clearFirebaseData);

// 3. Verificar si los scripts están cargados
console.log("\n3. Verificando scripts...");
const scripts = Array.from(document.querySelectorAll("script[src]"));
const firebaseScript = scripts.find((s) => s.src.includes("firebase.js"));
const initScript = scripts.find((s) => s.src.includes("init-firebase-data.js"));

console.log("   - firebase.js:", !!firebaseScript);
console.log("   - init-firebase-data.js:", !!initScript);

// 4. Verificar errores en consola
console.log("\n4. Para verificar errores, revisa la consola del navegador");

// 5. Intentar inicializar manualmente
console.log("\n5. Intentando inicializar Firebase manualmente...");

if (window.firebaseManager && !window.firebaseManager.initialized) {
  const config = {
    apiKey: "AIzaSyDwotkdQ98N9nJNaZeqUxi672VwLSUB7Lo",
    authDomain: "espacio-shanti.firebaseapp.com",
    projectId: "espacio-shanti",
    storageBucket: "espacio-shanti.firebasestorage.app",
    messagingSenderId: "212141397656",
    appId: "1:212141397656:web:ed8340624ff822f24b22ed",
    measurementId: "G-CP9TXJPGJV",
  };

  window.firebaseManager
    .init(config)
    .then((result) => {
      if (result) {
        console.log("✅ Firebase inicializado manualmente con éxito");
      } else {
        console.log("❌ Error al inicializar Firebase manualmente");
      }
    })
    .catch((error) => {
      console.error("❌ Error al inicializar Firebase:", error);
    });
}

console.log("\n🔧 INSTRUCCIONES:");
console.log("1. Si Firebase no está conectado, recarga la página (F5 o Cmd+R)");
console.log("2. Abre las Herramientas de Desarrollador (F12)");
console.log('3. Ve a la pestaña "Console" y busca mensajes de error');
console.log("4. Una vez conectado, ejecuta: initializeFirebaseData()");

// Función para recargar la página
window.reloadPage = () => {
  console.log("🔄 Recargando página...");
  location.reload();
};

console.log("\n💡 Función adicional disponible:");
console.log("- reloadPage() - Recarga la página");
