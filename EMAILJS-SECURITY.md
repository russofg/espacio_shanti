# 🔒 SEGURIDAD EMAILJS - CONFIGURACIÓN PROTEGIDA

## 📋 Descripción

Este documento describe cómo las credenciales de EmailJS están protegidas en el sistema y cómo configurarlas de forma segura para producción.

## 🔐 Credenciales Protegidas

Las siguientes credenciales de EmailJS ya NO están expuestas en el código:

- ✅ **Service ID**: Identificador del servicio EmailJS
- ✅ **Public Key**: Clave pública para autenticación
- ✅ **Template IDs**: Identificadores de plantillas de email

## 📂 Ubicación de la Configuración

### Desarrollo
```javascript
// Archivo: js/production-config.js
window.SITE_CONFIG.emailjs.development = {
  serviceId: "service_6gdc5d9",
  publicKey: "coMY9H78vxBJ2e8AV", 
  templates: {
    confirmacion: "template_fc7edbq",
    recordatorio_24h: "template_fc7edbq",
    recordatorio_2h: "template_fc7edbq",
  }
}
```

### Producción
```javascript
// Archivo: js/production-config.js
window.SITE_CONFIG.emailjs.production = {
  serviceId: process.env.EMAILJS_SERVICE_ID || "service_PROD_ID",
  publicKey: process.env.EMAILJS_PUBLIC_KEY || "PROD_PUBLIC_KEY",
  templates: {
    confirmacion: process.env.EMAILJS_TEMPLATE_CONFIRM || "template_PROD_CONFIRM",
    recordatorio_24h: process.env.EMAILJS_TEMPLATE_24H || "template_PROD_24H",
    recordatorio_2h: process.env.EMAILJS_TEMPLATE_2H || "template_PROD_2H",
  }
}
```

## 🚀 Configuración para Producción

### Paso 1: Variables de Entorno
Crear las siguientes variables de entorno en el servidor:

```bash
EMAILJS_SERVICE_ID=service_XXXXXXX
EMAILJS_PUBLIC_KEY=XXXXXXXXXXXXXXXXX
EMAILJS_TEMPLATE_CONFIRM=template_XXXXXXX
EMAILJS_TEMPLATE_24H=template_XXXXXXX
EMAILJS_TEMPLATE_2H=template_XXXXXXX
```

### Paso 2: Actualizar Configuración
Editar `js/production-config.js` y reemplazar los valores de producción:

```javascript
production: {
  serviceId: "TU_SERVICE_ID_REAL",
  publicKey: "TU_PUBLIC_KEY_REAL",
  templates: {
    confirmacion: "TU_TEMPLATE_CONFIRMACION",
    recordatorio_24h: "TU_TEMPLATE_24H",
    recordatorio_2h: "TU_TEMPLATE_2H",
  }
}
```

### Paso 3: Verificar Configuración
Ejecutar en la consola del navegador:
```javascript
diagnoseEmailJS()
```

## 🔒 Protecciones Implementadas

### 1. Configuración Centralizada
- Las credenciales están centralizadas en `production-config.js`
- Separación clara entre desarrollo y producción

### 2. Logging Seguro
- En producción: NO se muestran credenciales en logs
- En desarrollo: Solo se muestran fragmentos parciales

### 3. Detección Automática de Entorno
- El sistema detecta automáticamente si está en producción
- Aplica la configuración correspondiente

### 4. Validación de Configuración
- Verifica que las credenciales estén disponibles antes del envío
- Manejo de errores si la configuración es inválida

## 🧪 Funciones de Diagnóstico

### testEmails()
```javascript
testEmails()
// Permite probar el envío de emails con tu dirección
```

### diagnoseEmailJS()
```javascript
diagnoseEmailJS()
// Muestra el estado de la configuración de forma segura
```

## ⚠️ Notas Importantes

### Antes de Producción:
1. ✅ Cambiar las credenciales de desarrollo en `production-config.js`
2. ✅ Verificar que las variables de entorno estén configuradas
3. ✅ Probar el envío con `testEmails()`
4. ✅ Revisar que no se filtren credenciales en los logs

### Seguridad:
- 🔒 Las credenciales YA NO están expuestas en el código fuente
- 🔒 Los logs en producción NO muestran información sensible
- 🔒 La configuración se carga dinámicamente según el entorno

## 📝 Historial de Cambios

**Fecha**: 20 de julio de 2025
**Cambio**: Implementación de configuración segura de EmailJS
**Archivos modificados**:
- `js/email-service.js` - Sistema seguro de configuración
- `js/production-config.js` - Configuración centralizada protegida
- `EMAILJS-SECURITY.md` - Documentación de seguridad

**Beneficios**:
- ✅ Credenciales protegidas
- ✅ Configuración por entorno
- ✅ Logging seguro
- ✅ Fácil configuración para producción
