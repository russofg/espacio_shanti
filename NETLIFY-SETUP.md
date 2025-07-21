# 🚀 GUÍA PARA DEPLOY MANUAL EN NETLIFY

## PASO 1: ARRASTRAR CARPETA

✅ Arrastra TODA la carpeta `espacio_shanti` a Netlify (como siempre haces)

## PASO 2: CONFIGURAR VARIABLES DE ENTORNO

⚠️ IMPORTANTE: Después del deploy, ve a tu sitio en Netlify:

### Navegación en Netlify:

1. Tu sitio → **Site settings** → **Environment variables**
2. Click **"Add variable"** para cada una:

### Variables que DEBES agregar:

```bash
# === FIREBASE ===
FIREBASE_PROJECT_ID = espacio-shanti
FIREBASE_APP_ID = [OBTENER_DE_FIREBASE_CONSOLE]
FIREBASE_API_KEY = [OBTENER_DE_FIREBASE_CONSOLE]
FIREBASE_AUTH_DOMAIN = espacio-shanti.firebaseapp.com
FIREBASE_STORAGE_BUCKET = espacio-shanti.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID = [OBTENER_DE_FIREBASE_CONSOLE]
FIREBASE_MEASUREMENT_ID = [OBTENER_DE_FIREBASE_CONSOLE]

# === WHATSAPP (Opcionales - solo si quieres notificaciones) ===
CALLMEBOT_API_KEY_LORENA = [TU_CLAVE_CALLMEBOT_AQUI]
CALLMEBOT_API_KEY_BETSABE = [TU_CLAVE_CALLMEBOT_AQUI]
THERAPIST_PHONE_LORENA = +5491151414220
THERAPIST_PHONE_BETSABE = +5491151414220

# === SEGURIDAD ===
APP_SECRET_TOKEN = [GENERAR_TOKEN_ALEATORIO_SEGURO]
DEBUG_MODE = false
```

## 🔥 IMPORTANTE - CÓMO OBTENER LAS CLAVES REALES:

### Para Firebase:

1. Ve a: https://console.firebase.google.com/project/espacio-shanti/settings/general/web
2. Busca la sección "Your apps"
3. Copia los valores reales de:
   - `FIREBASE_APP_ID`
   - `FIREBASE_API_KEY`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_MEASUREMENT_ID`

### Para WhatsApp (opcional):

1. Agrega +34 644 59 71 67 como contacto "CallMeBot"
2. Envía: "I allow callmebot to send me messages"
3. Te responderán con tu API key personal

### Para APP_SECRET_TOKEN:

Genera un token aleatorio, por ejemplo: `EspacioShanti2024_TuTokenSeguro123`

## PASO 3: REDEPLOY

Después de agregar las variables, haz click en **"Redeploy"** en Netlify

## ✅ RESULTADO:

Tu sitio funcionará igual que localmente, pero de forma segura!

---

## 📋 NOTAS IMPORTANTES:

### ¿Se sube este archivo NETLIFY-SETUP.md?

✅ **SÍ, se puede subir** - NO contiene credenciales reales, solo plantillas

### ¿Qué archivos NO se suben nunca?

- `.env` (si existiera)
- `.git/` (Netlify lo ignora automáticamente)
- `node_modules/` (si existiera)

### ¿Funciona sin configurar WhatsApp?

✅ **SÍ** - El sistema funciona perfecto sin WhatsApp, solo no enviará notificaciones
