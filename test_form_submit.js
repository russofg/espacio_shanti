// Script para forzar el envío del formulario
(function () {
  console.log("🚀 Script de test iniciado");

  // Verificar que la aplicación existe
  if (window.app) {
    console.log("✅ window.app encontrada");

    // Crear evento simulado
    const fakeEvent = {
      preventDefault: () => console.log("preventDefault llamado"),
    };

    // Llamar directamente al manejador
    console.log("🎯 Ejecutando handleReservation...");
    window.app.handleReservation(fakeEvent);
  } else {
    console.log("❌ window.app no encontrada");

    // Intentar enviar el formulario directamente
    const form = document.getElementById("reservation-form");
    if (form) {
      console.log("📋 Formulario encontrado, enviando evento submit");
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    } else {
      console.log("❌ Formulario no encontrado");
    }
  }
})();
