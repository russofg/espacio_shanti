// Script de debug para probar el botón de logout
// Ejecutar en la consola del navegador

console.log("🔍 DEBUG: Probando botón de logout");

// 1. Verificar si el botón existe
const logoutBtn = document.getElementById("logout-btn-mobile");
console.log("📍 Botón encontrado:", !!logoutBtn);
if (logoutBtn) {
  console.log("📍 Botón elemento:", logoutBtn);
  console.log("📍 Botón visible:", logoutBtn.offsetParent !== null);
  console.log("📍 Botón clases:", logoutBtn.className);
}

// 2. Verificar si TherapistPanel existe
console.log(
  "📍 TherapistPanel existe:",
  typeof window.therapistPanel !== "undefined"
);
if (window.therapistPanel) {
  console.log(
    "📍 handleLogout existe:",
    typeof window.therapistPanel.handleLogout === "function"
  );
}

// 3. Agregar listener temporal para debug
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    console.log("🎯 CLICK en logout detectado!");
    console.log("🎯 Event:", e);

    if (window.therapistPanel && window.therapistPanel.handleLogout) {
      console.log("🎯 Llamando a handleLogout...");
      window.therapistPanel.handleLogout();
    } else {
      console.log("❌ handleLogout no disponible");
    }
  });

  console.log("✅ Listener de debug agregado al botón logout");
}

// 4. Test manual
console.log("🧪 Para probar manualmente, ejecuta: logoutBtn.click()");
