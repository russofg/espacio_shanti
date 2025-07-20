#!/bin/bash

echo "🔥 Desplegando reglas de Firestore..."

# Asegúrate de tener Firebase CLI instalado
# npm install -g firebase-tools

# Asegúrate de estar logueado en Firebase
# firebase login

# Desplegar solo las reglas de Firestore
firebase deploy --only firestore:rules

echo "✅ Reglas de Firestore desplegadas exitosamente!"
