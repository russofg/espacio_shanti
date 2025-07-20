#!/bin/bash

echo "🔧 Restaurando reglas de seguridad de Firebase..."

# Este script restaura las reglas de producción después de las pruebas

# Hacer backup de las reglas actuales
cp firestore.rules firestore.rules.backup

# Crear reglas de producción
cat > firestore.rules << 'EOF'
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
    
    // Reglas para la colección de entradas del blog
    match /blogEntries/{document} {
      // Permitir lectura a todos (para mostrar los artículos públicamente)
      allow read: if true;
      
      // Permitir escritura solo a usuarios autenticados (terapeutas)
      allow write: if request.auth != null 
        && request.auth.token.email_verified == true
        && (request.auth.token.email == 'lorena@espacioshanti.com' 
            || request.auth.token.email == 'betsabe@espacioshanti.com');
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
EOF

# Desplegar las reglas
firebase deploy --only firestore:rules

echo "✅ Reglas de seguridad restauradas exitosamente!"
echo "📝 Las reglas temporales fueron guardadas en firestore.rules.backup"
