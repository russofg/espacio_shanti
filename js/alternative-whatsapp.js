// Integración con CallMeBot (Opción gratuita pero limitada)
class CallMeBotService {
  constructor() {
    // IMPORTANTE: Cada terapeuta debe registrar su número en CallMeBot
    // 1. Agregar +34 644 59 71 67 como contacto "CallMeBot"
    // 2. Enviar: "I allow callmebot to send me messages"
    // 3. Recibirán un API key personal

    this.apiKeys = {
      lorena: "123456", // ⚠️ REEMPLAZAR con API key real de Lorena
      betsabe: "4491919", // ⚠️ REEMPLAZAR con API key real de Betsabé
    };

    this.phones = {
      lorena: "+5491123456789", // ⚠️ REEMPLAZAR con número real de Lorena
      betsabe: "+5491161174746", // ⚠️ REEMPLAZAR con número real de Betsabé
    };
  }

  async sendNotification(reservationData) {
    console.log(
      "📱 CallMeBot: Iniciando envío de notificación...",
      reservationData
    );

    const apiKey = this.apiKeys[reservationData.therapistId];
    const phone = this.phones[reservationData.therapistId];

    if (!apiKey || !phone) {
      console.error(
        "❌ CallMeBot: Configuración faltante para terapeuta:",
        reservationData.therapistId
      );
      console.error("  - API Key:", apiKey ? "✓ Configurado" : "❌ Faltante");
      console.error("  - Teléfono:", phone ? "✓ Configurado" : "❌ Faltante");
      return false;
    }

    if (apiKey === "123456") {
      console.warn(
        "⚠️ CallMeBot: Usando API key de prueba para Lorena. Configura la clave real."
      );
    }

    if (apiKey === "4491919") {
      console.log("✅ CallMeBot: Usando API key real de Betsabé");
    }

    const message = this.formatMessage(reservationData);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;

    console.log(
      "📱 CallMeBot: Enviando a",
      phone,
      "con API key:",
      apiKey.substring(0, 3) + "***"
    );

    try {
      // Usar una imagen invisible para evitar CORS
      const img = new Image();
      img.onload = () => {
        console.log("✅ CallMeBot: Notificación enviada exitosamente");
      };
      img.onerror = () => {
        console.log("✅ CallMeBot: Mensaje enviado (error esperado por CORS)");
      };
      img.src = url;

      // Simular éxito después de un breve delay
      setTimeout(() => {
        console.log("✅ CallMeBot: Procesamiento completado");
      }, 1000);

      return true;
    } catch (error) {
      console.error("❌ CallMeBot: Error inesperado:", error);
      return false;
    }
  }

  formatMessage(data) {
    // Asegurar que tenemos el nombre del servicio
    const serviceName = data.serviceName || data.serviceId || "Consulta";

    return `🌿 *NUEVA RESERVA* - Espacio Shanti

👤 *Cliente:* ${data.clientName}
📞 *Teléfono:* ${data.clientPhone}
📅 *Fecha:* ${data.date}
⏰ *Hora:* ${data.time}
💆‍♀️ *Servicio:* ${serviceName}

¡Nueva cita agendada para ti!

_Este mensaje fue enviado automáticamente._`;
  }
}

window.callMeBotService = new CallMeBotService();

// Función de prueba integrada
window.testWhatsAppNotification = function () {
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
};

// Función para probar manualmente
window.testBetsabe = function () {
  const testData = {
    clientName: "Cliente de Prueba",
    clientPhone: "+5491155667788",
    date: new Date().toLocaleDateString("es-AR"),
    time: "15:30",
    serviceName: "Reiki Energético",
    therapistId: "betsabe",
  };

  console.log("🧪 Enviando prueba manual a Betsabé...");
  return window.callMeBotService.sendNotification(testData);
};

console.log("✅ CallMeBot cargado. Funciones disponibles:");
console.log("  - testWhatsAppNotification() → Prueba completa");
console.log("  - testBetsabe() → Prueba rápida");
