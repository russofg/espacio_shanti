// Sistema de Email para Recordatorios de Clientes
class EmailService {
  constructor() {
    // Configuración segura desde production-config.js
    this.config = null;
    this.isConfigured = false;
    this.init();
  }

  async init() {
    try {
      // Obtener configuración segura
      this.config = window.getEmailJSConfig?.() || null;
      
      if (!this.config) {
        window.secureLogger?.error("❌ No se pudo cargar configuración EmailJS segura");
        return;
      }

      // Cargar EmailJS desde CDN
      if (!window.emailjs) {
        await this.loadEmailJS();
      }

      // Inicializar con public key segura
      if (this.config.publicKey && this.config.publicKey !== "YOUR_PUBLIC_KEY") {
        window.emailjs.init(this.config.publicKey);
        this.isConfigured = true;
        window.secureLogger?.system("✅ EmailJS configurado correctamente con credenciales seguras");
      } else {
        window.secureLogger?.warn("⚠️ EmailJS no configurado. Verificar configuración en production-config.js");
      }
    } catch (error) {
      window.secureLogger?.error("❌ Error inicializando EmailJS:", error.message);
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
    // Verificar configuración antes del envío
    if (!this.isConfigured || !this.config) {
      window.secureLogger?.error("❌ EmailJS no configurado para envío de confirmación");
      return false;
    }

    window.secureLogger?.debug("📧 Preparando envío de confirmación");

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
        this.config.serviceId,
        this.config.templates.confirmacion,
        templateParams
      );
      window.secureLogger?.info("✅ Email de confirmación enviado exitosamente");
      return true;
    } catch (error) {
      window.secureLogger?.error("❌ Error enviando email de confirmación:", error.message);
      return false;
    }
  }

  async sendReminderEmail(reservationData, reminderType = "24h") {
    // Verificar configuración antes del envío
    if (!this.isConfigured || !this.config) {
      window.secureLogger?.error("❌ EmailJS no configurado para envío de recordatorio");
      return false;
    }

    window.secureLogger?.debug(`📧 Preparando recordatorio ${reminderType}`);

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
      // Usar el template específico para el tipo de recordatorio
      const templateId = reminderType === "24h" 
        ? this.config.templates.recordatorio_24h 
        : this.config.templates.recordatorio_2h;

      const result = await window.emailjs.send(
        this.config.serviceId,
        templateId,
        templateParams
      );
      window.secureLogger?.info(`✅ Email recordatorio ${reminderType} enviado exitosamente`);
      return true;
    } catch (error) {
      window.secureLogger?.error(`❌ Error enviando recordatorio ${reminderType}:`, error.message);
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

  // Método para reconfigurar EmailJS (ahora usa configuración segura)
  reconfigure() {
    this.config = window.getEmailJSConfig?.() || null;
    
    if (!this.config) {
      window.secureLogger?.error("❌ No se pudo recargar configuración EmailJS");
      return false;
    }

    if (window.emailjs && this.config.publicKey) {
      window.emailjs.init(this.config.publicKey);
      this.isConfigured = true;
      window.secureLogger?.system("✅ EmailJS reconfigurado con credenciales seguras");
      return true;
    }
    
    return false;
  }

  // Función de prueba para diagnóstico (ahora segura)
  async testEmail() {
    if (!this.isConfigured || !this.config) {
      window.secureLogger?.error("❌ EmailJS no configurado. No se puede realizar prueba.");
      alert("EmailJS no está configurado. Verificar configuración en production-config.js");
      return;
    }

    const testEmail = prompt("Ingresa tu email para la prueba:");
    if (!testEmail) {
      window.secureLogger?.info("Prueba de email cancelada por el usuario");
      return;
    }

    const testData = {
      clientName: "Usuario de Prueba",
      clientEmail: testEmail,
      date: new Date().toISOString().split("T")[0],
      time: "15:30",
      serviceName: "Reiki Energético - Prueba",
      therapistId: "betsabe",
    };

    window.secureLogger?.info("🧪 Iniciando prueba de email");

    // Probar confirmación
    const result = await this.sendConfirmationEmail(testData);
    
    if (result) {
      alert(`✅ Email de prueba enviado exitosamente a: ${testEmail}`);
    } else {
      alert(`❌ Error enviando email de prueba. Ver logs para más detalles.`);
    }
  }

  // Función de diagnóstico segura
  diagnoseConfiguration() {
    window.secureLogger?.info("🔍 DIAGNÓSTICO EMAILJS - MODO SEGURO");
    
    const isProduction = window.PRODUCTION_MODE || false;
    const environment = isProduction ? 'PRODUCCIÓN' : 'DESARROLLO';
    
    if (!this.config) {
      window.secureLogger?.error("❌ Configuración no cargada");
      return {
        configured: false,
        environment: environment,
        error: "Configuración no disponible"
      };
    }

    // En producción, no mostrar credenciales
    if (isProduction) {
      window.secureLogger?.info(`🔒 Entorno: ${environment}`);
      window.secureLogger?.info(`✅ Configurado: ${this.isConfigured ? "SÍ" : "NO"}`);
      window.secureLogger?.info(`📦 EmailJS cargado: ${window.emailjs ? "SÍ" : "NO"}`);
    } else {
      // En desarrollo, mostrar información limitada
      window.secureLogger?.info(`🔧 Entorno: ${environment}`);
      window.secureLogger?.info(`📧 Service ID: ${this.config.serviceId?.substring(0, 12)}...`);
      window.secureLogger?.info(`📧 Templates disponibles: ${Object.keys(this.config.templates || {}).join(', ')}`);
      window.secureLogger?.info(`📧 Public Key: ${this.config.publicKey?.substring(0, 12)}...`);
      window.secureLogger?.info(`✅ Configurado: ${this.isConfigured ? "SÍ" : "NO"}`);
      window.secureLogger?.info(`📦 EmailJS cargado: ${window.emailjs ? "SÍ" : "NO"}`);
    }

    if (this.isConfigured) {
      window.secureLogger?.success("🎯 Sistema EmailJS funcionando correctamente");
      window.secureLogger?.info("💡 Ejecuta: testEmails() para probar el envío");
    } else {
      window.secureLogger?.warn("❌ Problema con la configuración EmailJS");
      window.secureLogger?.info("🔧 Verificar configuración en production-config.js");
    }

    return {
      configured: this.isConfigured,
      environment: environment,
      emailjsLoaded: !!window.emailjs,
      templates: Object.keys(this.config.templates || {}),
    };
  }
}

// Inicializar servicio globalmente
window.emailService = new EmailService();

// Funciones de diagnóstico seguras
window.testEmails = function () {
  window.emailService.testEmail();
};

window.diagnoseEmailJS = function () {
  return window.emailService.diagnoseConfiguration();
};

window.secureLogger?.system("✅ Servicio de Email cargado con configuración segura");
window.secureLogger?.info("🧪 Funciones de diagnóstico disponibles:");
window.secureLogger?.info("  - testEmails() - Probar sistema con tu email");
window.secureLogger?.info("  - diagnoseEmailJS() - Verificar configuración");

// Mensaje de estado del sistema
const isProduction = window.PRODUCTION_MODE || false;
if (isProduction) {
  window.secureLogger?.system("🔒 SISTEMA EMAILJS - MODO PRODUCCIÓN ACTIVADO");
} else {
  window.secureLogger?.system(`
📧 SISTEMA DE EMAILS CONFIGURADO (DESARROLLO):

✅ EmailJS configurado con credenciales seguras
✅ Configuración protegida en production-config.js
✅ Los recordatorios automáticos envían emails REALES
✅ Los emails de confirmación envían emails REALES

🔒 Las credenciales están protegidas por el sistema de seguridad.
🔄 Si falla el envío real, hace fallback a modo simulación.
`);
}
