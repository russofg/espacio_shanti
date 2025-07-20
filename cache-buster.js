// Simple cache buster script
// Añade timestamp a los archivos CSS y JS para forzar recarga

console.log("🔄 Cache Buster activado - Versión:", new Date().toISOString());

// Función para recargar CSS
function reloadCSS() {
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && !href.includes("?v=")) {
      link.setAttribute("href", href + "?v=" + Date.now());
    }
  });
}

// Función para recargar JS
function reloadJS() {
  const scripts = document.querySelectorAll("script[src]");
  scripts.forEach((script) => {
    const src = script.getAttribute("src");
    if (src && !src.includes("?v=") && !src.includes("cdn")) {
      script.setAttribute("src", src + "?v=" + Date.now());
    }
  });
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Forzando recarga de archivos...");
  reloadCSS();
  reloadJS();
});

// También ejecutar inmediatamente por si DOMContentLoaded ya pasó
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    reloadCSS();
    reloadJS();
  });
} else {
  reloadCSS();
  reloadJS();
}
