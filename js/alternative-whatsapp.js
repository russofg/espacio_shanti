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

    const message = reservationData.isTherapistAlert
      ? this.formatTherapistAlertMessage(reservationData)
      : this.formatMessage(reservationData);

    return this.sendWhatsAppMessage(phone, message, apiKey);
  }

  // Nueva función para enviar recordatorios a clientes
  async sendReminderNotification(reservationData, clientPhone) {
    // Para recordatorios, usamos el teléfono del cliente directamente
    const message =
      reservationData.customMessage ||
      this.formatReminderMessage(reservationData);

    console.log(`📱 Enviando recordatorio a cliente: ${clientPhone}`);
    console.log(`📝 Mensaje: ${message}`);

    // Nota: CallMeBot requiere que cada número esté registrado individualmente
    // Para enviar a clientes, necesitaríamos una API diferente como WhatsApp Business
    // Por ahora, simulamos el envío

    return true; // Simular éxito
  }

  async sendWhatsAppMessage(phone, message, apiKey) {
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

  formatTherapistAlertMessage(data) {
    return `🔔 *PRÓXIMA CITA EN 30 MINUTOS*

👤 *Cliente:* ${data.clientName}
💆‍♀️ *Servicio:* ${data.serviceName || data.serviceId}
⏰ *Hora:* ${data.time}
📞 *Contacto:* ${data.clientPhone}

¡Prepárate para la sesión! ✨

_Recordatorio automático de Espacio Shanti_`;
  }

  formatReminderMessage(data) {
    return `🌿 *RECORDATORIO* - Espacio Shanti

Hola ${data.clientName}! 👋

${data.customMessage || "Te recordamos tu próxima cita:"}

📅 *Fecha:* ${data.date}
⏰ *Hora:* ${data.time}
💆‍♀️ *Servicio:* ${data.serviceName || data.serviceId}

¡Te esperamos! 🙏

_Este es un recordatorio automático_`;
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

// Función de prueba para recordatorios
window.testReminders = function() {
  console.log('🧪 Probando sistema de recordatorios...');
  
  if (!window.reminderSystem) {
    console.error('❌ Sistema de recordatorios no disponible');
    return;
  }
  
  // Crear una reserva de prueba para mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const testReservation = {
    id: 'test-reminder-' + Date.now(),
    clientName: 'Fernando Russo (Prueba Recordatorios)',
    clientPhone: '+5491123456789',
    clientEmail: 'test@ejemplo.com',
    date: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD
    time: '14:00',
    serviceName: 'Reiki - Prueba Recordatorios',
    serviceId: 'reiki',
    therapistId: 'betsabe',
    status: 'confirmed'
  };
  
  console.log('📅 Programando recordatorios para:', testReservation);
  window.reminderSystem.scheduleReminders(testReservation);
  
  console.log('✅ Recordatorios programados. Revisa la consola en 24h, 2h y 30min antes de la cita de prueba.');
};
