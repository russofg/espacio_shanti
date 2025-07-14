// Script de prueba para CallMeBot
// Abrir la consola del navegador y ejecutar: testWhatsAppNotification()

function testWhatsAppNotification() {
  // Datos de prueba para Betsabé (tiene configuración real)
  const testReservation = {
    clientName: "Fernando Russo (Prueba)",
    clientPhone: "+5491123456789",
    date: "15/01/2024",
    time: "14:00",
    serviceName: "Reiki - Prueba",
    therapistId: "betsabe", // Usando Betsabé que ya está configurada
  };

  if (window.callMeBotService) {
    window.callMeBotService
      .sendNotification(testReservation)
      .then((result) => {
        if (result) {
        } else {
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

  window.callMeBotService.sendNotification(testReservation);
}

// Exponer funciones globalmente
window.testWhatsAppNotification = testWhatsAppNotification;
window.testLorena = testLorena;
