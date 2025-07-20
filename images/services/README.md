# 📸 Imágenes de Servicios - Espacio**📸 Imágenes Optimizadas (300x200px):**

- `flores-de-bach.jpg` - Flores de Bach (18KB)
- `perfumes-angelicos.jpg` - Perfumes Angélicos (15KB)
- `registros-akashicos.jpg` - Registros Akáshicos (21KB)
- `reiki-cuencos.jpg` - Reiki con Cuencos Tibetanos (15KB)
- `reiki-usui.jpg` - Reiki Usui (13KB)
- `yoga.jpg` - Yoga (13KB)# 🎯 Cómo Agregar Imágenes a los Servicios

### **1. Preparar la Imagen**

- **Tamaño recomendado:** 300x200 píxeles (ratio 3:2)
- **Formatos admitidos:** JPG, PNG, SVG, WebP
- **Peso máximo:** 500KB por imagen
- **Estilo:** Imágenes relajantes, colores suaves, relacionadas con bienestar

### **2. Nombrar el Archivo**

- Usar nombres descriptivos en minúsculas
- Separar palabras con guiones (-)
- Ejemplos:
  - `masajes-relajantes.jpg`
  - `reiki-sanacion.png`
  - `terapia-psicologica.svg`
  - `aromaterapia.jpg`

### **3. Subir la Imagen**

1. Copiar la imagen a la carpeta `/images/services/`
2. En el panel de administración, editar el servicio
3. En el campo "Imagen", escribir solo el nombre del archivo
4. Ejemplo: `masajes-relajantes.jpg` (sin la ruta completa)

### **4. Imágenes Disponibles**

**🎨 Imágenes SVG (Livianas):**

- `default-service.svg` - Imagen por defecto
- `masajes.svg` - Para servicios de masajes
- `reiki.svg` - Para terapias energéticas
- `terapia-psicologica.svg` - Para terapias psicológicas

**📸 Imágenes Optimizadas (300x200px):**

- `armonizacion-de-chakras.jpg` - Armonización de Chakras (20KB)
- `flores-de-bach.jpg` - Flores de Bach (18KB)
- `meditacion.jpg` - Meditación (13KB)
- `perfumes-angelicos.jpg` - Perfumes Angélicos (15KB)
- `potenciacion-de-pedido.jpg` - Potenciación de Pedido (16KB)
- `registros-akashicos.jpg` - Registros Akáshicos (21KB)
- `reiki-cuencos.jpg` - Reiki con Cuencos Tibetanos (15KB)
- `reiki-usui.jpg` - Reiki Usui (13KB)
- `yoga.jpg` - Yoga (13KB)

**� Archivos WebP (Backup/Originales):**

- `flores-bach.webp`, `perfumes-angelicos.webp`, etc. (130-191KB)

### **5. Consejos de Diseño**

- **Colores:** Tonos tierra, verdes suaves, azules tranquilos
- **Contenido:** Evitar texto en las imágenes
- **Estilo:** Minimalista, profesional, relajante
- **Contraste:** Buena legibilidad sobre fondos claros

### **6. Optimización**

**🌐 Método Recomendado - TinyPNG:**

1. Ve a https://tinypng.com/
2. Arrastra tus archivos PNG (máximo 5MB cada uno)
3. Espera a que se procesen automáticamente
4. Descarga las versiones optimizadas
5. Reemplaza los archivos originales en `/images/services/`

**📊 Resultados Esperados:**

- Reducción del 80-95% en el peso del archivo
- Misma calidad visual
- Carga mucho más rápida en la web

**🛠️ Alternativas:**

- Squoosh.app (herramienta de Google)
- Optimizilla.com
- Compressor.io
- ImageOptim (Mac) / PNGGauntlet (Windows)

**💡 Tip:** Si usas herramientas locales:

- Redimensionar a 300x200px primero
- Calidad JPG: 80-85%
- Formato recomendado: JPG para fotos, PNG para gráficos

---

## 🔧 Tecnical Notes

**Fallback System:**

- Si no se encuentra la imagen, se muestra `default-service.svg`
- El sistema verifica automáticamente la existencia del archivo
- URLs generadas: `/images/services/{filename}`

**Cache Busting:**

- Las imágenes incluyen timestamp para evitar cache
- Se actualiza automáticamente al cambiar servicios
