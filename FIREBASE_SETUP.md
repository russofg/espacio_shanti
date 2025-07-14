# Firebase Configuration for Espacio Shanti

## Configuración Inicial

### 1. Crear proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Crea un nuevo proyecto llamado "espacio-shanti"
3. Habilita Google Analytics (opcional)

### 2. Configurar Authentication

```javascript
// Ir a Authentication > Sign-in method
// Habilitar "Email/Password"
```

### 3. Configurar Firestore Database

```javascript
// Ir a Firestore Database > Create database
// Empezar en modo de prueba
```

### 4. Estructura de la Base de Datos

#### Colección: `reservations`

```javascript
{
  id: "auto-generated",
  clientName: "string",
  clientEmail: "string",
  clientPhone: "string",
  serviceId: "string",
  serviceName: "string",
  therapistId: "string",
  therapistName: "string",
  date: "YYYY-MM-DD",
  time: "HH:MM",
  duration: "number (minutes)",
  price: "number",
  status: "pending|confirmed|completed|cancelled",
  comments: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### Colección: `therapists`

```javascript
{
  id: "lorena|betsabe",
  name: "string",
  email: "string",
  specialties: ["array", "of", "strings"],
  bio: "string",
  image: "string (URL)",
  isActive: "boolean",
  schedule: {
    monday: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
    tuesday: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
    // ... resto de días
  }
}
```

#### Colección: `services`

```javascript
{
  id: "reiki|meditacion|masajes|aromaterapia",
  name: "string",
  description: "string",
  duration: "number (minutes)",
  price: "number",
  image: "string (URL)",
  isActive: "boolean",
  category: "string"
}
```

### 5. Reglas de Seguridad de Firestore

1. Ve a **Firestore Database** en Firebase Console
2. Haz clic en la pestaña **"Rules"**
3. Reemplaza las reglas existentes con el contenido del archivo `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Permitir lectura de servicios a todos los usuarios
    match /services/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Permitir lectura de terapeutas a todos los usuarios
    match /therapists/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == document;
    }

    // Reservas: crear para todos, leer/modificar solo para usuarios autenticados
    match /reservations/{document} {
      // Cualquiera puede crear una reserva (para que los clientes puedan reservar)
      allow create: if true;

      // Solo usuarios autenticados pueden leer y actualizar reservas
      allow read, update: if request.auth != null;

      // Solo usuarios autenticados pueden eliminar reservas
      allow delete: if request.auth != null;
    }
  }
}
```

4. Haz clic en **"Publish"** para aplicar las reglas

### 6. Cloud Functions para Notificaciones

```javascript
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.onReservationCreated = functions.firestore
  .document("reservations/{reservationId}")
  .onCreate(async (snap, context) => {
    const reservation = snap.data();

    // Enviar email al terapeuta
    // Enviar SMS/WhatsApp al cliente (opcional)

    console.log("Nueva reserva creada:", reservation);
  });
```

### 7. Configuración del SDK en el Frontend

```javascript
// Agregar a app.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "espacio-shanti.firebaseapp.com",
  projectId: "espacio-shanti",
  storageBucket: "espacio-shanti.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 8. Hosting con Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar en el proyecto
firebase init hosting

# Configurar firebase.json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Desplegar
firebase deploy
```

### 9. Variables de Entorno

```javascript
// .env (no commitear)
FIREBASE_API_KEY = tu - api - key;
FIREBASE_AUTH_DOMAIN = espacio - shanti.firebaseapp.com;
FIREBASE_PROJECT_ID = espacio - shanti;
FIREBASE_STORAGE_BUCKET = espacio - shanti.appspot.com;
FIREBASE_MESSAGING_SENDER_ID = 123456789;
FIREBASE_APP_ID = tu - app - id;
```

### 10. Usuarios Iniciales

```javascript
// Crear usuarios para las terapeutas con custom claims
const admin = require("firebase-admin");

// Agregar claim de terapeuta
await admin.auth().setCustomUserClaims(uid, { therapist: true });
```
