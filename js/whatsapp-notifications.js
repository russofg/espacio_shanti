// WhatsApp Business API Integration
class WhatsAppNotificationService {
  constructor() {
    this.apiUrl =
      "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages";
    this.accessToken = "YOUR_WHATSAPP_ACCESS_TOKEN";

    // Números de teléfono de las terapeutas
    this.therapistPhones = {
      lorena: "+5411XXXXXXXX", // Reemplazar con número real
      betsabe: "+5411YYYYYYYY", // Reemplazar con número real
    };
  }

  async sendReservationNotification(reservationData) {
    const therapistPhone = this.therapistPhones[reservationData.therapistId];

    if (!therapistPhone) {
      console.error("Número de terapeuta no encontrado");
      return false;
    }

    const message = this.formatReservationMessage(reservationData);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: therapistPhone,
          type: "text",
          text: {
            body: message,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Notificación WhatsApp enviada exitosamente");
        return true;
      } else {
        console.error("❌ Error enviando notificación:", result);
        return false;
      }
    } catch (error) {
      console.error("❌ Error en WhatsApp API:", error);
      return false;
    }
  }

  formatReservationMessage(data) {
    const therapistName = data.therapistId === "lorena" ? "Lorena" : "Betsabé";

    return `🌿 *NUEVA RESERVA - Espacio Shanti*

📅 *Cliente:* ${data.clientName}
📞 *Teléfono:* ${data.clientPhone}
📧 *Email:* ${data.clientEmail}

🗓️ *Fecha:* ${this.formatDate(data.date)}
⏰ *Hora:* ${data.time}
💆‍♀️ *Servicio:* ${data.serviceName}
👩‍⚕️ *Terapeuta:* ${therapistName}

💬 *Comentarios:*
${data.comments || "Sin comentarios adicionales"}

---
Confirma tu disponibilidad respondiendo a este mensaje.

_Espacio Shanti - Terapias Holísticas_`;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Notificación de cancelación
  async sendCancellationNotification(reservationData) {
    const therapistPhone = this.therapistPhones[reservationData.therapistId];

    const message = `❌ *RESERVA CANCELADA - Espacio Shanti*

Cliente: ${reservationData.clientName}
Fecha: ${this.formatDate(reservationData.date)}
Hora: ${reservationData.time}
Servicio: ${reservationData.serviceName}

El horario ahora está disponible nuevamente.`;

    return this.sendMessage(therapistPhone, message);
  }

  async sendMessage(phone, message) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      return false;
    }
  }
}

// Exportar para usar en la aplicación
window.whatsappService = new WhatsAppNotificationService();
