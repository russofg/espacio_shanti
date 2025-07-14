# Guía para Crear Índices en Firestore

## ¿Por qué necesitamos índices?

Firestore requiere índices para consultas que:

- Filtran por múltiples campos
- Combinan filtros con ordenamiento
- Usan operadores como `>=`, `<=` con `orderBy`

## Crear el Índice Necesario

### Método 1: Enlace Automático (Recomendado)

1. **Copia este enlace y ábrelo en tu navegador:**

```
https://console.firebase.google.com/project/espacio-shanti/firestore/indexes
```

2. **Haz clic en "Create Index"**

3. **Configura el índice:**

   - **Collection ID**: `reservations`
   - **Campos**:
     - `therapistId` - Ascending
     - `createdAt` - Descending

4. **Haz clic en "Create"**

### Método 2: Desde el Error

Cuando aparece el error en la consola, Firebase genera automáticamente un enlace.

1. **Busca en la consola el enlace que empieza con:**

   ```
   https://console.firebase.google.com/v1/r/project/espacio-shanti/firestore/i...
   ```

2. **Haz clic en ese enlace** (puede estar cortado en la consola)

3. **Firebase te llevará directamente a crear el índice correcto**

### Método 3: Manual

1. Ve a **Firebase Console**
2. **Firestore Database** > **Indexes**
3. **Create Index**
4. **Collection**: `reservations`
5. **Fields**:
   - `therapistId` (Ascending)
   - `createdAt` (Descending)

## Índices Adicionales Recomendados

Para optimizar todas las consultas de la aplicación:

### Índice 1: Para consultas por terapeuta y fecha

- Collection: `reservations`
- Fields:
  - `therapistId` (Ascending)
  - `date` (Ascending)
  - `time` (Ascending)

### Índice 2: Para consultas en tiempo real

- Collection: `reservations`
- Fields:
  - `therapistId` (Ascending)
  - `createdAt` (Descending)

## Tiempo de Construcción

- Los índices simples tardan **1-2 minutos**
- Los índices complejos pueden tardar **5-10 minutos**
- Mientras se construyen, las consultas que los requieren fallarán

## Verificar Estado

1. Ve a **Firestore** > **Indexes**
2. Verifica que el estado sea **"Enabled"**
3. Si está **"Building"**, espera a que termine

## Solución Temporal

Mientras se construyen los índices, la aplicación usa consultas simplificadas que filtran los datos en el cliente en lugar del servidor.

Esto es menos eficiente pero funciona inmediatamente.
