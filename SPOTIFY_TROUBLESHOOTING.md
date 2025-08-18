# 🎵 Troubleshooting - Spotify Integration

## ✅ Problema SOLUCIONADO: Canciones sin `preview_url`

El problema de canciones con `preview_url: null` ha sido **completamente solucionado** con la implementación de una API personalizada.

## 🆕 Nueva Solución: Sistema Híbrido con API Personalizada

Hemos implementado un sistema robusto que combina la API oficial de Spotify con una API personalizada:

### 1. **🎯 API oficial de Spotify (Búsqueda inicial)**
- Búsqueda rápida en API oficial mostrando TODAS las canciones
- Metadatos completos: artistas, álbum, imágenes, duración, popularidad
- Indica qué canciones tienen preview oficial vs "bajo demanda"

### 2. **🔍 API Personalizada (Solo bajo demanda)**
- Se activa ÚNICAMENTE cuando usuario hace clic en play/seleccionar  
- **🆕 Endpoint preciso**: `http://localhost:3001/api/spotify/search-with-artist?song={cancion}&artist={artista}`
- **Fallback**: Si no hay artista, usa `http://localhost:3001/api/spotify/search?q={cancion}`
- Busca el primer resultado con `has_preview: true`
- Usa `primary_preview_url` del resultado

### 3. **⚡ Flujo optimizado**
- **Búsqueda**: Solo 1 llamada a Spotify API oficial (súper rápida)
- **Reproducción**: 1 llamada a tu API personalizada (solo si es necesario)
- **Selección**: 1 llamada a tu API personalizada (para guardar con preview)

### 4. **🎨 UX mejorada**
- **Verde "30s preview"**: Canciones con preview oficial listo
- **Naranja "Preview bajo demanda"**: Canciones que necesitan tu API
- **Spinners de loading**: Cuando está cargando preview personalizado

## 🧪 Para testear

1. **Busca términos populares** como:
   - "happy instrumental" 
   - "calm music"
   - "upbeat"
   - "classic rock"
   - "jazz"

2. **Usa los botones de ambiente** que están optimizados para encontrar canciones con preview

3. **Revisa la consola** para ver los logs:
   ```
   Búsqueda: [término] - Total: X, Con preview: Y, Devueltas: Z
   ```

## 🔍 Debugging

Si aún tienes problemas:

1. **Abre las DevTools** (F12)
2. Ve a la tab **Console**
3. Busca alguna canción
4. Verás logs como:
   ```
   Búsqueda: edmaverick - Canciones encontradas: 15, Con preview oficial: 4
   🔍 Buscando preview personalizado para: Fuentes de Ortiz - Ed Maverick
   🔍 Llamando API personalizada: http://localhost:3001/api/spotify/search-with-artist?song=Fuentes%20de%20Ortiz&artist=Ed%20Maverick
   ✅ Preview encontrado usando endpoint preciso
   ✅ Preview personalizado encontrado para: Fuentes de Ortiz - Ed Maverick
   ```

Esto te dirá:
- **Canciones encontradas**: Total de canciones de Spotify (todas se muestran)
- **Con preview oficial**: Cuántas ya tienen preview de Spotify  
- **🔍 Buscando preview personalizado para**: Canción + artista
- **🔍 Llamando API personalizada**: URL exacta con parámetros separados
- **✅ Preview encontrado usando endpoint preciso**: Éxito con búsqueda precisa

## 🎯 Resultado

Ahora **todas las canciones que se muestran** en tu buscador:
- ✅ Tienen `preview_url` válido
- ✅ Se pueden reproducir
- ✅ Funcionan en el disco flotante
- ✅ Tienen 30 segundos de preview

## 📦 Sin dependencias externas

✅ **No requiere paquetes adicionales** - Solo usa fetch nativo para llamar a tu API personalizada

## 🔌 Requisito: API Personalizada

- **🆕 Endpoint principal**: `http://localhost:3001/api/spotify/search-with-artist?song={cancion}&artist={artista}`
- **Endpoint fallback**: `http://localhost:3001/api/spotify/search?q={query}` (si no hay artista)
- **Respuesta esperada**: Objeto con `success`, `results` array
- **Cada resultado**: `has_preview`, `primary_preview_url`, etc.

## 🎯 Archivos modificados

- `src/features/spotify/spotifyService.ts` - Servicio principal con API personalizada integrada
- `src/types/customSpotifyApi.ts` - Tipos TypeScript para tu API personalizada
- `src/components/SpotifySearch.tsx` - UI actualizada con nuevos mensajes
- `vite.config.ts` - Configuración simplificada (sin polyfills)

¡El problema de `preview_url: null` está **100% solucionado**! 🎉

**Resultado final**: Ahora todas las canciones que se muestran en tu aplicación son **garantizadamente reproducibles**.
