// Debug script para verificar el formulario de servicios
console.log("🔍 Iniciando debug del formulario de servicios...");

// Función para debuggear el campo de imagen
function debugServiceImageField() {
  setTimeout(() => {
    const imageField = document.getElementById("service-image");

    if (imageField) {
      console.log("✅ Campo service-image encontrado:");
      console.log("- Tipo:", imageField.type);
      console.log("- Nombre:", imageField.name);
      console.log("- Placeholder:", imageField.placeholder);
      console.log("- Validación HTML5:", imageField.validity);
      console.log("- Elemento completo:", imageField.outerHTML);
    } else {
      console.log("❌ Campo service-image NO encontrado");
    }
  }, 1000);
}

// Escuchar cuando se abra el modal de servicios
document.addEventListener("click", (e) => {
  if (e.target.textContent && e.target.textContent.includes("Servicios")) {
    console.log("🔍 Modal de servicios detectado, iniciando debug...");
    debugServiceImageField();
  }
});

console.log(
  "🔍 Debug script cargado - esperando interacción con modal de servicios"
);
