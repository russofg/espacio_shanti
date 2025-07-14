// Integración con CallMeBot (Opción gratuita pero limitada)
class CallMeBotService {
  constructor() {
    // IMPORTANTE: Cada terapeuta debe registrar su número en CallMeBot
    // 1. Agregar +34 644 59 71 67 como contacto "CallMeBot"
    // 2. Enviar: "I allow callmebot to send me messages"
    // 3. Recibirán un API key personal

    this.apiKeys = {
      lorena: "123456", // ⚠️ REEMPLAZAR con API key real de Lorena
      betsabe: "9569005", // ⚠️ REEMPLAZAR con API key real de Betsabé
    };

    this.phones = {
      lorena: "+5491123456789", // ⚠️ REEMPLAZAR con número real de Lorena
      betsabe: "+5491151414220", // ⚠️ REEMPLAZAR con número real de Betsabé
    };
  }

  async sendNotification(reservationData) {
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

    const message = this.formatMessage(reservationData);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;

    try {
      // Usar una imagen invisible para evitar CORS
      const img = new Image();
      img.onload = () => {
        // Mensaje enviado exitosamente
      };
      img.onerror = () => {
        // Mensaje enviado (error esperado por CORS)
      };
      img.src = url;

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
          console.log(
            "✅ ¡Prueba exitosa! Betsabé debería recibir el WhatsApp en 1-5 minutos."
          );
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

  return window.callMeBotService.sendNotification(testData);
};
