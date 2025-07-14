// Script de prueba para CallMeBot
// Abrir la consola del navegador y ejecutar: testWhatsAppNotification()

function testWhatsAppNotification() {
  console.log("🧪 Iniciando prueba de CallMeBot...");

  // Datos de prueba para Betsabé (tiene configuración real)
  const testReservation = {
    clientName: "Fernando Russo (Prueba)",
    clientPhone: "+5491123456789",
    date: "15/01/2024",
    time: "14:00",
    serviceName: "Reiki - Prueba",
    therapistId: "betsabe", // Usando Betsabé que ya está configurada
  };

  console.log("📱 Probando con datos:", testReservation);

  if (window.callMeBotService) {
    console.log("📱 Enviando notificación de prueba a Betsabé...");
    window.callMeBotService
      .sendNotification(testReservation)
      .then((result) => {
        if (result) {
          console.log(
            "✅ ¡Prueba exitosa! Betsabé debería recibir el WhatsApp en 1-5 minutos."
          );
          console.log("📱 Revisa el WhatsApp de Betsabé: +5491161174746");
        } else {
          console.log(
            "❌ Prueba falló. Revisa los logs anteriores para más detalles."
          );
        }
      })
      .catch((error) => {
        console.error("❌ Error en la prueba:", error);
      });
  } else {
    console.error("❌ CallMeBotService no está disponible");
  }
}

// Función para probar Lorena cuando esté configurada
function testLorena() {
  const testReservation = {
    clientName: "Prueba para Lorena",
    clientPhone: "+5491123456789",
    date: "16/01/2024",
    time: "15:00",
    serviceName: "Masajes - Prueba",
    therapistId: "lorena",
  };

  console.log("🧪 Probando notificación para Lorena...");
  window.callMeBotService.sendNotification(testReservation);
}

// Exponer funciones globalmente
window.testWhatsAppNotification = testWhatsAppNotification;
window.testLorena = testLorena;

console.log("🧪 Scripts de prueba cargados:");
console.log("  - testWhatsAppNotification() → Prueba Betsabé");
console.log("  - testLorena() → Prueba Lorena (cuando esté configurada)");
