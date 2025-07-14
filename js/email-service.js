// Sistema de Email para Recordatorios de Clientes
class EmailService {
  constructor() {
    // EmailJS configuración (servicio gratuito)
    this.serviceId = "service_6gdc5d9"; // Reemplazar con tu Service ID

    // Templates separados para cada tipo de email
    this.templates = {
      confirmacion: "template_fc7edbq", // Tu template actual
      recordatorio_24h: "template_fc7edbq", // Por ahora el mismo, pero puedes crear otro
      recordatorio_2h: "template_fc7edbq", // Por ahora el mismo, pero puedes crear otro
    };

    // Template ID principal (para compatibilidad)
    this.templateId = "template_fc7edbq";

    this.publicKey = "coMY9H78vxBJ2e8AV"; // Reemplazar con tu Public Key

    this.isConfigured = false;
    this.init();
  }

  async init() {
    try {
      // Cargar EmailJS desde CDN
      if (!window.emailjs) {
        await this.loadEmailJS();
      }

      // Inicializar con public key
      if (this.publicKey !== "YOUR_PUBLIC_KEY") {
        window.emailjs.init(this.publicKey);
        this.isConfigured = true;
        console.log("✅ EmailJS configurado correctamente");
        console.log(`📧 Service ID: ${this.serviceId}`);
        console.log(`📧 Templates:`, this.templates);
        console.log(`📧 Public Key: ${this.publicKey.substring(0, 8)}...`);
      } else {
        console.warn(
          "⚠️ EmailJS no configurado. Configurar en js/email-service.js"
        );
      }
    } catch (error) {
      console.error("❌ Error inicializando EmailJS:", error);
    }
  }

  async loadEmailJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async sendConfirmationEmail(reservationData) {
    if (!this.isConfigured) {
      console.log(
        "📧 Email simulado - Confirmación enviada a:",
        reservationData.clientEmail
      );
      return this.simulateEmail("confirmacion", reservationData);
    }

    const templateParams = {
      email: reservationData.clientEmail,
      client_name: reservationData.clientName,
      service_name: reservationData.serviceName || reservationData.serviceId,
      appointment_date: this.formatDate(reservationData.date),
      appointment_time: reservationData.time,
      therapist_name: this.getTherapistName(reservationData.therapistId),
      message_type: "confirmacion",
      // Contenido específico para confirmación
      email_subject: "¡Tu reserva ha sido confirmada! ✅",
      main_message: `Hola ${reservationData.clientName}, nos complace confirmar tu reserva en Espacio Shanti.`,
      instructions: `Por favor llega 10 minutos antes de tu cita. Trae ropa cómoda para la sesión. Mantente hidratado antes y después. Si necesitas reprogramar, contactanos con 24hs de anticipación.`,
      closing_message: "¡Esperamos verte pronto! 🙏",
    };

    try {
      const result = await window.emailjs.send(
        this.serviceId,
        this.templateId, // Usar template ID directo en lugar de this.templates.confirmacion
        templateParams
      );
      console.log("✅ Email de confirmación enviado:", result);
      return true;
    } catch (error) {
      console.error("❌ Error enviando email de confirmación:", error);
      return false;
    }
  }

  async sendReminderEmail(reservationData, reminderType = "24h") {
    if (!this.isConfigured) {
      console.log(
        `📧 Email simulado - Recordatorio ${reminderType} enviado a:`,
        reservationData.clientEmail
      );
      return this.simulateEmail(
        `recordatorio_${reminderType}`,
        reservationData
      );
    }

    // Contenido específico según el tipo de recordatorio
    let emailContent = {};

    if (reminderType === "24h") {
      emailContent = {
        email_subject: "Recordatorio: Tu cita es mañana 📅",
        main_message: `Hola ${reservationData.clientName}, te recordamos que tienes una cita programada para mañana.`,
        instructions:
          "Llega 10 minutos antes. Viste ropa cómoda y holgada. Mantente bien hidratado. Ven con mente abierta y relajada. Pon tu teléfono en silencio.",
        closing_message:
          "¿Necesitas reprogramar? Contáctanos lo antes posible. ¡Nos vemos mañana! ✨",
      };
    } else if (reminderType === "2h") {
      emailContent = {
        email_subject: "¡Tu cita es en 2 horas! ⏰",
        main_message: `Hola ${reservationData.clientName}, tu sesión es en 2 horas.`,
        instructions:
          "Te recomendamos salir ahora para llegar puntual. Tómate unos minutos para relajarte antes de llegar.",
        closing_message: "¡Te esperamos! 🌿",
      };
    }

    const templateParams = {
      email: reservationData.clientEmail,
      client_name: reservationData.clientName,
      service_name: reservationData.serviceName || reservationData.serviceId,
      appointment_date: this.formatDate(reservationData.date),
      appointment_time: reservationData.time,
      therapist_name: this.getTherapistName(reservationData.therapistId),
      message_type: `recordatorio_${reminderType}`,
      custom_message:
        reservationData.customMessage ||
        this.getDefaultReminderMessage(reminderType),
      ...emailContent,
    };

    try {
      const result = await window.emailjs.send(
        this.serviceId,
        this.templateId, // Usar template ID directo
        templateParams
      );
      console.log(`✅ Email recordatorio ${reminderType} enviado:`, result);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando recordatorio ${reminderType}:`, error);
      return false;
    }
  }

  simulateEmail(type, data) {
    // Simulación visual del email
    const emailContent = this.generateEmailHTML(type, data);

    // Mostrar en consola
    console.log(
      `📧 =============== EMAIL ${type.toUpperCase()} ===============`
    );
    console.log(`Para: ${data.clientEmail}`);
    console.log(`Asunto: ${this.getEmailSubject(type, data)}`);
    console.log("Contenido:");
    console.log(emailContent);
    console.log("================================================");

    // Mostrar notificación visual
    this.showEmailPreview(type, data, emailContent);

    return true;
  }

  generateEmailHTML(type, data) {
    const baseTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8FA68E, #A4B494); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #E8F5E8; padding: 15px; border-left: 4px solid #8FA68E; margin: 20px 0; }
        .button { display: inline-block; background: #8FA68E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .icon { font-size: 24px; margin: 0 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Espacio Shanti</h1>
            <p>Centro de Terapias Holísticas</p>
        </div>
        <div class="content">
            ${this.getEmailContentByType(type, data)}
        </div>
        <div class="footer">
            <p>📍 Av. Corrientes 1234, CABA | 📞 +54 11 1234-5678</p>
            <p>🌐 www.espacioshanti.com | 📧 info@espacioshanti.com</p>
            <p><small>Este es un mensaje automático, por favor no responder a este email.</small></p>
        </div>
    </div>
</body>
</html>`;
    return baseTemplate;
  }

  getEmailContentByType(type, data) {
    switch (type) {
      case "confirmacion":
        return `
          <h2>¡Tu reserva ha sido confirmada! ✅</h2>
          <p>Hola <strong>${data.clientName}</strong>,</p>
          <p>Nos complace confirmar tu reserva en Espacio Shanti:</p>
          
          <div class="highlight">
            <p><strong>📅 Fecha:</strong> ${this.formatDate(data.date)}</p>
            <p><strong>⏰ Hora:</strong> ${data.time}</p>
            <p><strong>💆‍♀️ Servicio:</strong> ${
              data.serviceName || data.serviceId
            }</p>
            <p><strong>👩‍⚕️ Terapeuta:</strong> ${this.getTherapistName(
              data.therapistId
            )}</p>
          </div>
          
          <h3>📍 Información importante:</h3>
          <ul>
            <li>Por favor llega 10 minutos antes de tu cita</li>
            <li>Trae ropa cómoda para la sesión</li>
            <li>Mantente hidratado antes y después</li>
            <li>Si necesitas reprogramar, contactanos con 24hs de anticipación</li>
          </ul>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>¡Esperamos verte pronto! 🙏</p>
        `;

      case "recordatorio_24h":
        return `
          <h2>Recordatorio: Tu cita es mañana 📅</h2>
          <p>Hola <strong>${data.clientName}</strong>,</p>
          <p>Te recordamos que tienes una cita programada para mañana:</p>
          
          <div class="highlight">
            <p><strong>📅 Fecha:</strong> ${this.formatDate(data.date)}</p>
            <p><strong>⏰ Hora:</strong> ${data.time}</p>
            <p><strong>💆‍♀️ Servicio:</strong> ${
              data.serviceName || data.serviceId
            }</p>
            <p><strong>👩‍⚕️ Terapeuta:</strong> ${this.getTherapistName(
              data.therapistId
            )}</p>
          </div>
          
          <h3>💡 Recomendaciones para tu sesión:</h3>
          <ul>
            <li>🕘 Llega 10 minutos antes</li>
            <li>👕 Viste ropa cómoda y holgada</li>
            <li>💧 Mantente bien hidratado</li>
            <li>🧘‍♀️ Ven con mente abierta y relajada</li>
            <li>📱 Pon tu teléfono en silencio</li>
          </ul>
          
          <p>¿Necesitas reprogramar? Contáctanos lo antes posible.</p>
          <p>¡Nos vemos mañana! ✨</p>
        `;

      case "recordatorio_2h":
        return `
          <h2>¡Tu cita es en 2 horas! ⏰</h2>
          <p>Hola <strong>${data.clientName}</strong>,</p>
          <p>Tu sesión de <strong>${
            data.serviceName || data.serviceId
          }</strong> es a las <strong>${data.time}</strong></p>
          
          <div class="highlight">
            <p><strong>📍 Espacio Shanti</strong></p>
            <p>Av. Corrientes 1234, CABA</p>
            <p><strong>⏰ En 2 horas (${data.time})</strong></p>
            <p><strong>👩‍⚕️ ${this.getTherapistName(
              data.therapistId
            )}</strong></p>
          </div>
          
          <p>🚗 <strong>Te recomendamos salir ahora</strong> para llegar puntual.</p>
          <p>🧘‍♀️ Tómate unos minutos para relajarte antes de llegar.</p>
          
          <p>¡Te esperamos! 🌿</p>
        `;

      default:
        return `<p>Tipo de email no reconocido: ${type}</p>`;
    }
  }

  getEmailSubject(type, data) {
    switch (type) {
      case "confirmacion":
        return `✅ Reserva Confirmada - Espacio Shanti - ${this.formatDate(
          data.date
        )}`;
      case "recordatorio_24h":
        return `📅 Recordatorio: Tu cita es mañana - Espacio Shanti`;
      case "recordatorio_2h":
        return `⏰ ¡Tu cita es en 2 horas! - Espacio Shanti`;
      default:
        return `🌿 Espacio Shanti - Información de tu reserva`;
    }
  }

  showEmailPreview(type, data, content) {
    // Crear modal de preview del email
    const previewModal = document.createElement("div");
    previewModal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    previewModal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold">📧 Preview del Email Enviado</h3>
            <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                    class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="border-b pb-4 mb-4">
            <p><strong>Para:</strong> ${data.clientEmail}</p>
            <p><strong>Asunto:</strong> ${this.getEmailSubject(type, data)}</p>
            <p><strong>Tipo:</strong> ${type}</p>
          </div>
          
          <div class="border rounded p-4 max-h-96 overflow-y-auto" style="background: #f9f9f9;">
            ${content}
          </div>
          
          <div class="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <i class="fas fa-info-circle mr-2"></i>
            <strong>Nota:</strong> Este es un email simulado para desarrollo. 
            Para envío real, configura EmailJS en js/email-service.js
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(previewModal);

    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
      if (previewModal.parentElement) {
        previewModal.remove();
      }
    }, 10000);
  }

  getDefaultReminderMessage(type) {
    switch (type) {
      case "24h":
        return "Te recordamos tu cita para mañana. ¡Te esperamos!";
      case "2h":
        return "Tu cita es en 2 horas. Es momento de prepararte para salir.";
      default:
        return "Recordatorio de tu próxima cita en Espacio Shanti.";
    }
  }

  formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  getTherapistName(therapistId) {
    const therapists = {
      lorena: "Lorena Murua Bosquero",
      betsabe: "Betsabé Murua Bosquero",
    };
    return therapists[therapistId] || "Terapeuta";
  }

  // Método para configurar EmailJS desde el panel
  configure(serviceId, templateId, publicKey) {
    this.serviceId = serviceId;
    this.templateId = templateId;
    this.publicKey = publicKey;

    if (window.emailjs) {
      window.emailjs.init(publicKey);
      this.isConfigured = true;
      console.log("✅ EmailJS reconfigurado");
    }
  }

  // Función de prueba
  async testEmail() {
    const testData = {
      clientName: "Fernando Russo (Prueba)",
      clientEmail: "fernando.test@gmail.com", // Cambiar a email que funcione
      date: new Date().toISOString().split("T")[0],
      time: "15:30",
      serviceName: "Reiki Energético - Prueba",
      therapistId: "betsabe",
    };

    console.log("🧪 Probando sistema de emails...");
    console.log("📧 NOTA: Los emails se enviarán a fernando.test@gmail.com");
    console.log(
      "💡 Para cambiar el email de prueba, usa: testRealEmail('tu@email.com')"
    );

    // Probar confirmación
    await this.sendConfirmationEmail(testData);

    // Probar recordatorio 24h (con delay)
    setTimeout(() => {
      this.sendReminderEmail(testData, "24h");
    }, 2000);

    // Probar recordatorio 2h (con delay)
    setTimeout(() => {
      this.sendReminderEmail(testData, "2h");
    }, 4000);
  }

  // Nueva función de diagnóstico
  diagnoseConfiguration() {
    console.log("🔍 DIAGNÓSTICO DE EMAILJS");
    console.log("========================");
    console.log(`📧 Service ID: ${this.serviceId}`);
    console.log(`📧 Templates:`, this.templates);
    console.log(`📧 Public Key: ${this.publicKey.substring(0, 8)}...`);
    console.log(`✅ Configurado: ${this.isConfigured ? "SÍ" : "NO"}`);
    console.log(`📦 EmailJS cargado: ${window.emailjs ? "SÍ" : "NO"}`);

    if (this.isConfigured) {
      console.log("🎯 ¡Todo parece estar bien configurado!");
      console.log("💡 Ejecuta: testEmails() para probar el envío");
    } else {
      console.log("❌ Hay un problema con la configuración");
      console.log("🔧 Verifica los IDs en EmailJS");
    }

    return {
      serviceId: this.serviceId,
      templates: this.templates,
      publicKey: this.publicKey,
      isConfigured: this.isConfigured,
      emailjsLoaded: !!window.emailjs,
    };
  } // Función para probar envío real con template forzado
  async testRealEmailForced(recipientEmail) {
    if (!recipientEmail) {
      console.error("❌ Necesitas proporcionar un email para la prueba");
      console.log(
        "💡 Uso: window.emailService.testRealEmailForced('tu@email.com')"
      );
      return;
    }

    // Forzar los datos exactos que necesita el template
    const templateParams = {
      email: recipientEmail,
      client_name: "Usuario de Prueba FORZADO",
      service_name: "Reiki Energético - Prueba Template",
      appointment_date: "lunes, 15 de julio de 2025",
      appointment_time: "15:30",
      therapist_name: "Betsabé Murua Bosquero",
      message_type: "confirmacion",

      // Variables NUEVAS que agregamos
      email_subject: "¡Tu reserva ha sido confirmada! ✅ NUEVO TEMPLATE",
      main_message:
        "Hola Usuario de Prueba FORZADO, nos complace confirmar tu reserva en Espacio Shanti. ESTE ES EL NUEVO MENSAJE DINÁMICO.",
      instructions:
        "Por favor llega 10 minutos antes de tu cita. Trae ropa cómoda para la sesión. Mantente hidratado antes y después. NUEVAS INSTRUCCIONES DINÁMICAS.",
      closing_message: "¡Esperamos verte pronto! 🙏 MENSAJE DE CIERRE DINÁMICO",
    };

    console.log(`🧪 FORZANDO envío con nuevo template a: ${recipientEmail}`);
    console.log("📝 Variables enviadas:", templateParams);

    try {
      const result = await window.emailjs.send(
        this.serviceId,
        this.templateId, // Usar template ID directo
        templateParams
      );

      if (result.status === 200) {
        console.log("✅ ¡Email FORZADO enviado exitosamente!");
        console.log(
          "📬 Revisa tu bandeja de entrada - debería tener contenido DIFERENTE"
        );
        console.log(
          "🔍 Si sigue igual, el template en EmailJS no se actualizó correctamente"
        );
      } else {
        console.log("❌ Error enviando email forzado");
      }
      return result;
    } catch (error) {
      console.error("❌ Error en prueba forzada:", error);
      return false;
    }
  }

  // Función para probar envío real
  async testRealEmail(recipientEmail) {
    if (!recipientEmail) {
      console.error("❌ Necesitas proporcionar un email para la prueba");
      console.log("💡 Uso: window.emailService.testRealEmail('tu@email.com')");
      return;
    }

    const testData = {
      clientName: "Usuario de Prueba",
      clientEmail: recipientEmail,
      date: new Date().toISOString().split("T")[0],
      time: "15:30",
      serviceName: "Reiki Energético - Prueba Real",
      therapistId: "betsabe",
    };

    console.log(`🧪 Enviando email de prueba REAL a: ${recipientEmail}`);

    try {
      const result = await this.sendConfirmationEmail(testData);
      if (result) {
        console.log("✅ ¡Email enviado exitosamente!");
        console.log("📬 Revisa tu bandeja de entrada (y spam)");
      } else {
        console.log("❌ Error enviando email");
      }
      return result;
    } catch (error) {
      console.error("❌ Error en prueba real:", error);
      return false;
    }
  }
}

// Inicializar servicio globalmente
window.emailService = new EmailService();

// Funciones de prueba globales
window.testEmails = function () {
  window.emailService.testEmail();
};

window.diagnoseEmailJS = function () {
  return window.emailService.diagnoseConfiguration();
};

window.testRealEmail = function (email) {
  if (!email) {
    console.log("💡 Uso: testRealEmail('tu@email.com')");
    return;
  }
  return window.emailService.testRealEmail(email);
};

window.testRealEmailForced = function (email) {
  if (!email) {
    console.log("💡 Uso: testRealEmailForced('tu@email.com')");
    return;
  }
  return window.emailService.testRealEmailForced(email);
};

console.log("✅ Servicio de Email cargado correctamente");
console.log("🧪 Funciones disponibles:");
console.log("  - testEmails() - Probar en modo simulación");
console.log("  - diagnoseEmailJS() - Verificar configuración");
console.log("  - testRealEmail('tu@email.com') - Enviar email real");

// Instrucciones de configuración
console.log(`
📧 INSTRUCCIONES PARA CONFIGURAR EMAILJS (GRATIS):

1. Ir a: https://www.emailjs.com/
2. Crear cuenta gratuita
3. Crear un servicio (Gmail, Outlook, etc.)
4. Crear template con variables:
   - {{to_email}}
   - {{client_name}}
   - {{service_name}}
   - {{appointment_date}}
   - {{appointment_time}}
   - {{therapist_name}}
   - {{message_type}}
   - {{custom_message}}

5. Copiar IDs y configurar en js/email-service.js:
   - serviceId: 'tu_service_id'
   - templateId: 'tu_template_id'  
   - publicKey: 'tu_public_key'

6. ¡Listo! El sistema enviará emails reales gratuitos.

Por ahora funciona en modo simulación para desarrollo.
`);
