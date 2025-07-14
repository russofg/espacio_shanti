// Sistema de Recordatorios Automáticos para Espacio Shanti
class ReminderSystem {
  constructor() {
    this.reminders = new Map(); // Store active reminders
    this.checkInterval = null;
    this.isActive = false;

    // Configuración de recordatorios
    this.reminderConfig = {
      // Para clientes
      client24h: {
        offset: 24 * 60 * 60 * 1000, // 24 horas en milliseconds
        enabled: true,
        template: "client24h",
      },
      client2h: {
        offset: 2 * 60 * 60 * 1000, // 2 horas
        enabled: true,
        template: "client2h",
      },
      // Para terapeutas
      therapist30min: {
        offset: 30 * 60 * 1000, // 30 minutos
        enabled: true,
        template: "therapist30min",
      },
    };

    this.init();
  }

  init() {
    console.log("🔔 Inicializando Sistema de Recordatorios...");
    this.startReminderChecker();
  }

  // Programar recordatorios para una nueva reserva
  scheduleReminders(reservation) {
    try {
      const appointmentDateTime = this.parseAppointmentDateTime(
        reservation.date,
        reservation.time
      );

      if (!appointmentDateTime || appointmentDateTime <= new Date()) {
        console.log(
          "⚠️ Cita en el pasado o fecha inválida, no se programan recordatorios"
        );
        return;
      }

      // Programar cada tipo de recordatorio
      Object.entries(this.reminderConfig).forEach(([type, config]) => {
        if (config.enabled) {
          const reminderTime = new Date(
            appointmentDateTime.getTime() - config.offset
          );

          if (reminderTime > new Date()) {
            const reminderId = `${reservation.id}_${type}`;

            this.reminders.set(reminderId, {
              id: reminderId,
              reservationId: reservation.id,
              type: type,
              scheduledTime: reminderTime,
              appointmentTime: appointmentDateTime,
              reservation: reservation,
              sent: false,
            });

            console.log(
              `📅 Recordatorio ${type} programado para ${reminderTime.toLocaleString()}`
            );
          }
        }
      });

      console.log(`✅ ${this.reminders.size} recordatorios activos en total`);
    } catch (error) {
      console.error("❌ Error programando recordatorios:", error);
    }
  }

  // Cancelar recordatorios de una reserva
  cancelReminders(reservationId) {
    let cancelled = 0;

    for (const [key, reminder] of this.reminders.entries()) {
      if (reminder.reservationId === reservationId) {
        this.reminders.delete(key);
        cancelled++;
      }
    }

    if (cancelled > 0) {
      console.log(
        `🗑️ Cancelados ${cancelled} recordatorios para reserva ${reservationId}`
      );
    }
  }

  // Verificador continuo de recordatorios pendientes
  startReminderChecker() {
    if (this.isActive) return;

    this.isActive = true;

    // Verificar cada 30 segundos
    this.checkInterval = setInterval(() => {
      this.checkPendingReminders();
    }, 30000);

    console.log("🔄 Verificador de recordatorios iniciado (cada 30s)");
  }

  stopReminderChecker() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.isActive = false;
      console.log("⏹️ Verificador de recordatorios detenido");
    }
  }

  // Verificar y enviar recordatorios pendientes
  checkPendingReminders() {
    const now = new Date();
    const remindersSent = [];

    for (const [key, reminder] of this.reminders.entries()) {
      if (!reminder.sent && reminder.scheduledTime <= now) {
        this.sendReminder(reminder);
        reminder.sent = true;
        remindersSent.push(key);
      }
    }

    // Limpiar recordatorios ya enviados
    remindersSent.forEach((key) => {
      this.reminders.delete(key);
    });

    if (remindersSent.length > 0) {
      console.log(`📤 Enviados ${remindersSent.length} recordatorios`);
    }
  }

  // Enviar recordatorio individual
  async sendReminder(reminder) {
    try {
      const message = this.generateReminderMessage(reminder);
      const recipient = this.getReminderRecipient(reminder);

      console.log(`🔔 Enviando recordatorio ${reminder.type}:`, message);

      // Determinar método de envío según el tipo de recordatorio
      if (reminder.type.includes("client")) {
        // Para clientes: usar EMAIL
        await this.sendEmailReminder(reminder, message, recipient);
      } else if (reminder.type.includes("therapist")) {
        // Para terapeutas: usar WhatsApp (CallMeBot)
        await this.sendWhatsAppReminder(reminder, message, recipient);
      }

      // Guardar en historial
      this.logReminderSent(reminder, message);
    } catch (error) {
      console.error(`❌ Error enviando recordatorio ${reminder.type}:`, error);
    }
  }

  // Enviar recordatorio por email (para clientes)
  async sendEmailReminder(reminder, message, recipient) {
    if (window.emailService) {
      // Mapear correctamente el tipo de recordatorio
      let reminderType;
      if (reminder.type === "client24h") {
        reminderType = "24h";
      } else if (reminder.type === "client2h") {
        reminderType = "2h";
      } else {
        // Para otros tipos (como therapist30min), usar tipo por defecto
        console.log(
          `⚠️ Tipo de recordatorio ${reminder.type} no es para email, usando fallback`
        );
        reminderType = "2h";
      }

      const emailData = {
        ...reminder.reservation,
        reminderType: reminderType,
        customMessage: message,
      };

      const success = await window.emailService.sendReminderEmail(
        emailData,
        reminderType
      );

      if (success) {
        console.log(
          `✅ Recordatorio ${reminder.type} enviado por EMAIL a ${recipient.email}`
        );
      } else {
        console.log(`⚠️ Error enviando email, mostrando notificación en UI`);
        this.showUINotification(reminder, message);
      }
    } else {
      console.log(
        `⚠️ EmailService no disponible, mostrando notificación en UI`
      );
      this.showUINotification(reminder, message);
    }
  }

  // Enviar recordatorio por WhatsApp (para terapeutas)
  async sendWhatsAppReminder(reminder, message, recipient) {
    if (window.callMeBotService && recipient.whatsapp) {
      const notificationData = {
        clientName: recipient.name,
        clientPhone: recipient.phone,
        ...reminder.reservation,
        customMessage: message,
        isTherapistAlert: true,
      };

      const success = await window.callMeBotService.sendNotification(
        notificationData
      );

      if (success) {
        console.log(
          `✅ Recordatorio ${reminder.type} enviado por WhatsApp a ${recipient.whatsapp}`
        );
      } else {
        console.log(`⚠️ Error enviando WhatsApp, mostrando notificación en UI`);
        this.showUINotification(reminder, message);
      }
    } else {
      console.log(
        `⚠️ CallMeBotService no disponible para terapeuta, mostrando notificación en UI`
      );
      this.showUINotification(reminder, message);
    }
  }

  // Generar mensaje según tipo de recordatorio
  generateReminderMessage(reminder) {
    const { reservation, type } = reminder;
    const appointmentDate = this.formatDate(reminder.appointmentTime);
    const appointmentTime = this.formatTime(reminder.appointmentTime);

    const templates = {
      client24h: `🌿 *Recordatorio - Espacio Shanti*

Hola ${reservation.clientName}! 👋

Te recordamos que tienes una cita agendada para *mañana*:

📅 *Fecha:* ${appointmentDate}
⏰ *Hora:* ${appointmentTime}
💆‍♀️ *Servicio:* ${reservation.serviceName || reservation.service}
👩‍⚕️ *Terapeuta:* ${this.getTherapistName(reservation.therapistId)}

📍 *Ubicación:* Espacio Shanti
🗺️ Dirección completa en nuestro sitio web

¿Necesitas reagendar? Responde a este mensaje.

¡Te esperamos! 🙏`,

      client2h: `🔔 *Recordatorio Urgente*

Hola ${reservation.clientName}!

Tu cita es en *2 horas*:

⏰ ${appointmentTime} - ${reservation.serviceName || reservation.service}
👩‍⚕️ Con ${this.getTherapistName(reservation.therapistId)}

📍 Te esperamos en Espacio Shanti

¡Nos vemos pronto! 🌿`,

      therapist30min: `👩‍⚕️ *Recordatorio Terapeuta*

Hola ${this.getTherapistName(reservation.therapistId)}!

Tu próxima cita es en *30 minutos*:

👤 *Cliente:* ${reservation.clientName}
📞 *Teléfono:* ${reservation.clientPhone}
💆‍♀️ *Servicio:* ${reservation.serviceName || reservation.service}
⏰ *Hora:* ${appointmentTime}

${reservation.comments ? `📝 *Comentarios:* ${reservation.comments}` : ""}

¡Prepárate para la sesión! 🙏`,
    };

    return (
      templates[type] ||
      `Recordatorio: Tienes una cita programada para ${appointmentDate} a las ${appointmentTime}`
    );
  }

  // Obtener destinatario del recordatorio
  getReminderRecipient(reminder) {
    const { reservation, type } = reminder;

    if (type.startsWith("client")) {
      return {
        name: reservation.clientName,
        phone: reservation.clientPhone,
        email: reservation.clientEmail,
        whatsapp: reservation.clientPhone, // Usar teléfono del cliente
      };
    } else if (type.startsWith("therapist")) {
      const therapistData = this.getTherapistData(reservation.therapistId);
      return {
        name: therapistData.name,
        phone: therapistData.phone,
        email: therapistData.email,
        whatsapp: therapistData.apiKey, // Usar configuración de terapeuta
      };
    }

    return null;
  }

  // Obtener datos de terapeuta
  getTherapistData(therapistId) {
    const therapists = {
      lorena: {
        name: "Lorena Murua Bosquero",
        phone: "+5491123456789",
        email: "lorena@espacioshanti.com",
        apiKey: "lorena",
      },
      betsabe: {
        name: "Betsabé Murua Bosquero",
        phone: "+5491151414220",
        email: "betsabe@espacioshanti.com",
        apiKey: "betsabe",
      },
    };

    return (
      therapists[therapistId] || {
        name: "Terapeuta",
        phone: "",
        email: "",
        apiKey: "",
      }
    );
  }

  getTherapistName(therapistId) {
    return this.getTherapistData(therapistId).name;
  }

  // Mostrar notificación en UI como fallback
  showUINotification(reminder, message) {
    console.log("💬 Mostrando notificación en UI:", message);

    // Si estamos en el panel de terapeuta, mostrar notificación
    if (
      window.therapistPanel &&
      typeof window.therapistPanel.showNotification === "function"
    ) {
      window.therapistPanel.showNotification(
        `Recordatorio enviado: ${reminder.type}`,
        "info"
      );
    }
  }

  // Enviar por email como fallback
  sendEmailReminder(reminder, message, recipient) {
    console.log("📧 Fallback a email (simulado):", {
      to: recipient.email,
      subject: "Recordatorio de Cita - Espacio Shanti",
      message: message,
    });
  }

  // Log de recordatorios enviados
  logReminderSent(reminder, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      reservationId: reminder.reservationId,
      type: reminder.type,
      recipient: reminder.reservation.clientName,
      messageSent: message.substring(0, 100) + "...",
    };

    // Guardar en localStorage para historial
    const logs = JSON.parse(localStorage.getItem("reminderLogs") || "[]");
    logs.push(logEntry);

    // Mantener solo los últimos 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }

    localStorage.setItem("reminderLogs", JSON.stringify(logs));
  }

  // Utilidades de fecha y hora
  parseAppointmentDateTime(dateStr, timeStr) {
    try {
      // Convertir fecha YYYY-MM-DD y hora HH:MM a Date object
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hours, minutes] = timeStr.split(":").map(Number);

      return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
      console.error("Error parseando fecha/hora:", error);
      return null;
    }
  }

  formatDate(date) {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  formatTime(date) {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Métodos de gestión
  getActiveReminders() {
    return Array.from(this.reminders.values());
  }

  getReminderStats() {
    const logs = JSON.parse(localStorage.getItem("reminderLogs") || "[]");
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentLogs = logs.filter(
      (log) => new Date(log.timestamp) > last7Days
    );

    return {
      totalSent: logs.length,
      last7Days: recentLogs.length,
      byType: recentLogs.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  // Configuración
  updateConfig(newConfig) {
    this.reminderConfig = { ...this.reminderConfig, ...newConfig };
    console.log("⚙️ Configuración de recordatorios actualizada");
  }
}

// Extender CallMeBotService para recordatorios
if (window.callMeBotService) {
  window.callMeBotService.sendReminderNotification = function (
    data,
    therapistKey
  ) {
    // Usar mensaje personalizado si existe
    const originalMessage = this.formatMessage;

    if (data.customMessage) {
      // Temporalmente reemplazar el formateador de mensajes
      this.formatMessage = () => data.customMessage;
    }

    // Enviar con la configuración del destinatario correcto
    const result = this.sendNotification({
      ...data,
      therapistId: therapistKey,
    });

    // Restaurar el formateador original
    this.formatMessage = originalMessage;

    return result;
  };
}

// Inicializar sistema global
window.reminderSystem = new ReminderSystem();

// Función de prueba
window.testReminderSystem = function () {
  const testReservation = {
    id: "test-" + Date.now(),
    clientName: "Fernando Russo",
    clientPhone: "+5491123456789",
    clientEmail: "russofg@gmail.com", // Email real para pruebas
    date: new Date(Date.now() + 60000).toISOString().split("T")[0], // En 1 minuto
    time: new Date(Date.now() + 60000).toTimeString().slice(0, 5),
    serviceName: "Reiki de Prueba",
    therapistId: "betsabe",
    status: "confirmed",
  };

  window.reminderSystem.scheduleReminders(testReservation);
  console.log("🧪 Recordatorio de prueba programado para 1 minuto");
  console.log("📧 Email de prueba: russofg@gmail.com");
};

// Función de prueba con recordatorios visibles (cita en 3 horas)
window.testReminderSystemFull = function () {
  const futureTime = new Date(Date.now() + 3 * 60 * 60 * 1000); // En 3 horas
  const testReservation = {
    id: "test-full-" + Date.now(),
    clientName: "Fernando Russo",
    clientPhone: "+5491123456789",
    clientEmail: "russofg@gmail.com",
    date: futureTime.toISOString().split("T")[0],
    time: futureTime.toTimeString().slice(0, 5),
    serviceName: "Reiki de Prueba Completa",
    therapistId: "betsabe",
    status: "confirmed",
  };

  window.reminderSystem.scheduleReminders(testReservation);
  console.log("🧪 Recordatorio COMPLETO programado para 3 horas");
  console.log("📧 Email de prueba: russofg@gmail.com");
  console.log("⏰ Se programarán recordatorios de 2h y 30min antes");
};

console.log("✅ Sistema de Recordatorios cargado exitosamente");
