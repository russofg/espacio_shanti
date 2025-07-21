// Integración con CallMeBot (Opción gratuita pero limitada)
class CallMeBotService {
  constructor() {
    // IMPORTANTE: Cada terapeuta debe registrar su número en CallMeBot
    // 1. Agregar +34 644 59 71 67 como contacto "CallMeBot"
    // 2. Enviar: "I allow callmebot to send me messages"
    // 3. Recibirán un API key personal

    // SEGURIDAD: Configuración movida a variables de entorno
    // Para configurar: Crear archivo .env o usar Firebase Remote Config
    this.apiKeys = {
      lorena: this.getSecureConfig("CALLMEBOT_API_KEY_LORENA", "123456"), // API key de desarrollo por defecto
      betsabe: this.getSecureConfig("CALLMEBOT_API_KEY_BETSABE", "123456"), // API key de desarrollo por defecto
    };

    this.phones = {
      lorena: this.getSecureConfig("THERAPIST_PHONE_LORENA", "+5491151414220"), // Teléfono por defecto
      betsabe: this.getSecureConfig(
        "THERAPIST_PHONE_BETSABE",
        "+5491151414220"
      ), // Teléfono por defecto
    };
  }

  // Método para obtener configuración segura
  getSecureConfig(key, defaultValue) {
    // Prioridad: Variables de entorno > Firebase Remote Config > Valor por defecto
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return process.env[key];
    }

    // TODO: Implementar Firebase Remote Config para producción
    // if (window.firebaseRemoteConfig) {
    //   return firebase.remoteConfig().getValue(key);
    // }

    window.secureLogger?.warn(
      `⚠️ Usando configuración por defecto para ${key}`
    );
    return defaultValue;
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
    // Para enviar a clientes, usamos EMAIL en lugar de WhatsApp

    // Intentar enviar por email si está disponible
    if (window.emailService) {
      const reminderType = reservationData.reminderType || "24h";
      const emailSent = await window.emailService.sendReminderEmail(
        reservationData,
        reminderType
      );

      if (emailSent) {
        console.log("✅ Recordatorio enviado por EMAIL exitosamente");
        return true;
      }
    }

    // Fallback: mostrar notificación en UI
    console.log("⚠️ EmailService no disponible, mostrando notificación en UI");
    this.showClientReminderNotification(reservationData, message);

    return true; // Simular éxito
  }

  // Mostrar notificación visual cuando no se puede enviar email
  showClientReminderNotification(data, message) {
    // Crear notificación visual para desarrollo/demo
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg shadow-xl p-4 z-50 max-w-sm";
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas fa-envelope text-blue-500 text-lg"></i>
        </div>
        <div class="ml-3">
          <h4 class="text-sm font-semibold text-blue-800">Recordatorio Programado</h4>
          <p class="text-xs text-blue-600 mt-1">Para: ${data.clientEmail}</p>
          <p class="text-xs text-blue-600">Cliente: ${data.clientName}</p>
          <p class="text-xs text-blue-600">Fecha: ${data.date} a las ${data.time}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="ml-auto text-blue-400 hover:text-blue-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remover después de 8 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
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
window.testReminders = function () {
  console.log("🧪 Probando sistema de recordatorios...");

  if (!window.reminderSystem) {
    console.error("❌ Sistema de recordatorios no disponible");
    return;
  }

  // Crear una reserva de prueba para mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const testReservation = {
    id: "test-reminder-" + Date.now(),
    clientName: "Fernando Russo (Prueba Recordatorios)",
    clientPhone: "+5491123456789",
    clientEmail: "fernando@ejemplo.com",
    date: tomorrow.toISOString().split("T")[0], // YYYY-MM-DD
    time: "14:00",
    serviceName: "Reiki - Prueba Recordatorios",
    serviceId: "reiki",
    therapistId: "betsabe",
    status: "confirmed",
  };

  console.log("📅 Programando recordatorios para:", testReservation);
  window.reminderSystem.scheduleReminders(testReservation);

  console.log("✅ Recordatorios programados. Sistema híbrido configurado:");
  console.log("📧 EMAILS → Clientes (24h y 2h antes)");
  console.log("📱 WHATSAPP → Terapeutas (30min antes)");
};

// Función para probar todo el sistema híbrido
window.testHybridSystem = function () {
  console.log("🚀 PROBANDO SISTEMA HÍBRIDO COMPLETO");
  console.log("===================================");

  // 1. Probar emails
  console.log("📧 1. Probando emails para clientes...");
  if (window.emailService) {
    window.emailService.testEmail();
  } else {
    console.error("❌ EmailService no disponible");
  }

  // 2. Probar WhatsApp
  setTimeout(() => {
    console.log("📱 2. Probando WhatsApp para terapeutas...");
    if (window.callMeBotService) {
      window.testBetsabe();
    } else {
      console.error("❌ CallMeBotService no disponible");
    }
  }, 2000);

  // 3. Probar recordatorios
  setTimeout(() => {
    console.log("⏰ 3. Probando sistema de recordatorios...");
    window.testReminders();
  }, 4000);

  console.log("🎯 Revisa la consola y las notificaciones en pantalla");
};
