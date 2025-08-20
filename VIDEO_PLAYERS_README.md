# Reproductores de Video - mymstorie

Este proyecto ahora incluye dos opciones de reproductores de video mejorados para manejar mejor las reproducciones y el rendimiento:

## 🎬 VideoPlayer (con Video.js)

Reproductor avanzado basado en Video.js que ofrece mejor rendimiento y funcionalidades adicionales.

### Características
- **Streaming adaptativo**: Mejor manejo de diferentes calidades de video
- **Controles avanzados**: Botones personalizables, velocidad de reproducción, etc.
- **Mejor rendimiento**: Optimizado para videos largos y múltiples reproductores
- **Soporte para plugins**: Extensible con plugins de Video.js
- **Responsive**: Se adapta automáticamente al contenedor

### Uso básico
```tsx
import { VideoPlayer } from '../components/VideoPlayer';

<VideoPlayer
  src="https://example.com/video.mp4"
  poster="https://example.com/thumbnail.jpg"
  className="aspect-video"
  showControls={true}
  preload="metadata"
  muted={true}
/>
```

### Props disponibles
- `src`: URL del video (requerido)
- `poster`: URL de la imagen de vista previa
- `className`: Clases CSS adicionales
- `showControls`: Mostrar controles (default: true)
- `autoPlay`: Reproducción automática (default: false)
- `muted`: Silenciado (default: true)
- `preload`: 'auto' | 'metadata' | 'none' (default: 'metadata')
- `onError`: Callback para manejar errores

## 🎥 VideoPlayerLegacy

Reproductor ligero basado en HTML5 nativo con mejoras en la UI.

### Características
- **Más ligero**: Menor impacto en el bundle size
- **Controles personalizados**: UI mejorada sin dependencias externas
- **Generación de thumbnails**: Captura automática del primer frame
- **Indicador de duración**: Muestra la duración del video en el thumbnail
- **Responsive**: Se adapta al contenedor

### Uso básico
```tsx
import { VideoPlayerLegacy } from '../components/VideoPlayerLegacy';

<VideoPlayerLegacy
  src="https://example.com/video.mp4"
  poster="https://example.com/thumbnail.jpg"
  className="aspect-video"
  showControls={true}
  preload="metadata"
  muted={true}
/>
```

## 🔄 Migración desde VideoThumbnail

El componente `VideoThumbnail` anterior ha sido reemplazado en `MediaCarousel` por `VideoPlayer`. La migración es transparente:

### Antes
```tsx
<VideoThumbnail
  src={item.url}
  className="h-full w-full"
  onError={(e) => console.error('Error:', e)}
/>
```

### Después
```tsx
<VideoPlayer
  src={item.url}
  className="h-full w-full"
  onError={(e) => console.error('Error:', e)}
  showControls={true}
  preload="metadata"
/>
```

## 🎯 Cuándo usar cada uno

### Usa VideoPlayer (Video.js) cuando:
- Necesites reproducir videos largos (>30 segundos)
- Tengas múltiples videos en la misma página
- Requieras funcionalidades avanzadas (velocidad, calidad, plugins)
- El rendimiento sea crítico
- Quieras soporte para streaming adaptativo

### Usa VideoPlayerLegacy cuando:
- Tengas videos cortos (<30 segundos)
- El tamaño del bundle sea importante
- Necesites una solución más simple
- Tengas pocos videos por página

## 📱 Optimizaciones incluidas

### Rendimiento
- **Lazy loading**: Los videos se cargan solo cuando son necesarios
- **Preload inteligente**: Solo metadata por defecto
- **Thumbnails automáticos**: Generación eficiente del primer frame
- **Memoria optimizada**: Limpieza automática de recursos

### UX
- **Estados de carga**: Indicadores visuales mientras carga
- **Controles táctiles**: Optimizado para dispositivos móviles
- **Transiciones suaves**: Animaciones fluidas entre estados
- **Errores graceful**: Manejo elegante de errores de carga

### Accesibilidad
- **ARIA labels**: Etiquetas descriptivas para lectores de pantalla
- **Navegación por teclado**: Controles accesibles
- **Alto contraste**: Botones visibles en diferentes temas

## 🛠️ Instalación y configuración

Las dependencias ya están instaladas:
```bash
npm install video.js @types/video.js
```

Los estilos se importan automáticamente en el componente.

## 🎨 Personalización

### Estilos de Video.js
Los estilos están en `src/components/VideoPlayer.css` y pueden ser modificados para ajustarse al diseño de la app.

### Tema dark mode
Los componentes se adaptan automáticamente al tema del sistema:
```css
@media (prefers-color-scheme: dark) {
  .video-js .vjs-big-play-button {
    background-color: rgba(30, 41, 59, 0.9);
  }
}
```

## 📊 Comparativa de rendimiento

| Característica | VideoPlayer (Video.js) | VideoPlayerLegacy |
|----------------|------------------------|-------------------|
| Bundle size | ~85KB | ~5KB |
| Tiempo de carga | Medio | Rápido |
| Funcionalidades | Avanzadas | Básicas |
| Soporte streaming | ✅ | ❌ |
| Plugins | ✅ | ❌ |
| Controles nativos | ❌ | ✅ |
| Generación thumbnails | ✅ | ✅ |

## 🐛 Troubleshooting

### Error de CORS en thumbnails
Si los thumbnails no se generan, verifica que el servidor permita CORS para los videos.

### Videos no se reproducen en Safari
Safari tiene restricciones adicionales. Asegúrate de que:
- `muted={true}` para autoplay
- `playsInline={true}` está habilitado
- El formato del video es compatible

### Problemas de rendimiento
- Usa `preload="metadata"` en lugar de `"auto"`
- Limita el número de reproductores simultáneos
- Considera usar `VideoPlayerLegacy` para videos cortos

## 📚 Ejemplos adicionales

Ver `VideoPlayerExamples.tsx` para más ejemplos de uso en diferentes contextos.
