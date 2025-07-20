#!/bin/bash

# 🎨 Script de Optimización de Imágenes para Espacio Shanti
# Este script te ayuda a optimizar las imágenes PNG para la web

echo "🎯 Optimizador de Imágenes - Espacio Shanti"
echo "========================================="

# Colores para el terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📁 Imágenes encontradas en /images/services/:${NC}"
ls -la images/services/*.png 2>/dev/null || echo "No se encontraron imágenes PNG"

echo ""
echo -e "${YELLOW}💡 Para optimizar tus imágenes PNG, sigue estos pasos:${NC}"
echo ""
echo "1. 🌐 Opción Online (Recomendada):"
echo "   • Ve a https://tinypng.com/"
echo "   • Arrastra tus archivos PNG"
echo "   • Descarga las versiones optimizadas"
echo "   • Reemplaza los archivos originales"
echo ""
echo "2. 🛠️ Opción con ImageMagick (si tienes instalado):"
echo "   brew install imagemagick  # En Mac"
echo "   convert imagen.png -resize 300x200^ -gravity center -extent 300x200 -quality 85 imagen-optimizada.jpg"
echo ""
echo "3. 📱 Opción con herramientas online:"
echo "   • Squoosh.app (Google)"
echo "   • Optimizilla.com"
echo "   • Compressor.io"
echo ""
echo -e "${GREEN}🎯 Especificaciones ideales para Espacio Shanti:${NC}"
echo "   • Tamaño: 300x200 píxeles"
echo "   • Formato: JPG o WebP"
echo "   • Calidad: 80-85%"
echo "   • Peso: < 50KB por imagen"
echo ""
echo -e "${RED}⚠️  Nombres sugeridos para tus imágenes:${NC}"
echo "   flores-bach.png → flores-de-bach.jpg"
echo "   registros-akashicos.png → registros-akashicos.jpg"
echo "   reiki-cuencos-tibetanos.png → reiki-cuencos.jpg"
echo "   reiki.usui.png → reiki-usui.jpg"
