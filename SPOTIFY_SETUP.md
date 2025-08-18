# Configuración de Spotify API

Para habilitar la funcionalidad de música de fondo con Spotify, necesitas configurar las credenciales de la API de Spotify.

## Pasos para obtener las credenciales

1. Ve a [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Inicia sesión con tu cuenta de Spotify
3. Haz clic en "Create an app"
4. Completa los campos:
   - **App name**: MyMStorie
   - **App description**: Aplicación para agregar música de fondo a memorias
   - **Website**: (opcional)
   - **Redirect URIs**: No necesario para este caso
5. Acepta los términos y condiciones
6. Una vez creada la app, verás tu **Client ID** y **Client Secret**

## Configuración en el proyecto

Crea un archivo `.env.local` in la raíz del proyecto con:

```bash
VITE_SPOTIFY_CLIENT_ID=tu_client_id_aqui
VITE_SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
```

**⚠️ Importante**: 
- Nunca commits estos valores a Git
- El archivo `.env.local` ya está en el `.gitignore`
- Estas credenciales son para desarrollo/demo únicamente

## Funcionalidades implementadas

✅ **Servicio de conexión a Spotify API con API Personalizada** (`src/features/spotify/spotifyService.ts`)
- Autenticación automática usando Client Credentials Flow
- **🆕 Integración con API personalizada** (`localhost:3001/api/spotify/search`) para encontrar más previews
- **🆕 Sistema híbrido**: API oficial de Spotify + API personalizada para previews  
- **🆕 Metadatos oficiales** (imágenes, artistas, álbum) + Preview URLs garantizados
- Búsqueda por "mood" (estado de ánimo)
- **🆕 Procesamiento inteligente** canción por canción
- **🆕 Fallback robusto** si falla la API personalizada

✅ **Buscador de canciones** (`src/components/SpotifySearch.tsx`)
- Input de búsqueda con debounce
- Sugerencias por categoría/mood (Alegre, Tranquilo, Nostálgico, etc.)
- Preview de canciones de 30 segundos
- Interfaz moderna y responsive

✅ **Reproductor de música** (`src/components/SpotifyPlayer.tsx`)
- Controles modernos (play/pausa, progreso, volumen)
- Versión compacta y completa
- Indicador de tiempo y progreso
- Control de volumen con slider

✅ **Integración en formularios**
- Integrado en `EntryForm` para todas las entries
- Datos de Spotify se guardan en Firebase
- Limpieza automática al enviar el formulario

✅ **Visualización en entries**
- Indicador visual de música en `EntryCard`
- Muestra nombre de canción y artista
- Icono de música en las cards

## Tipos de datos

La información de Spotify se almacena con este formato:

```typescript
{
  id: string;
  name: string;
  artists: string;
  preview_url: string | null;
  spotify_url: string;
  album_name: string;
  album_image: string | null;
  duration_ms: number;
}
```

## Uso

1. En cualquier formulario de entry, encontrarás la sección "Buscar música de fondo"
2. Puedes buscar por nombre de canción, artista o álbum
3. O seleccionar una categoría de estado de ánimo
4. Escucha el preview de 30 segundos antes de seleccionar
5. La canción se guardará junto con la entry

## 🆕 **Nuevo: Sistema Híbrido con API Personalizada**

Hemos implementado un sistema inteligente que combina lo mejor de ambos mundos:

### ¿Cómo funciona?
1. **Paso 1**: Búsqueda oficial en Spotify API - muestra TODAS las canciones encontradas
2. **Paso 2**: Si una canción tiene preview oficial, se muestra "30s preview"
3. **Paso 3**: Si no tiene preview oficial, se muestra "Preview bajo demanda" 
4. **Paso 4**: Solo cuando el usuario hace clic en play/seleccionar → llamar API personalizada
5. **Resultado**: Metadatos oficiales + preview URL obtenido bajo demanda

### Beneficios:
- ✅ **Búsquedas súper rápidas**: No hace múltiples llamadas durante la búsqueda
- ✅ **Muestra más resultados**: Todas las canciones de Spotify, no solo las con preview
- ✅ **Preview bajo demanda**: Solo llama tu API cuando realmente se necesita  
- ✅ **Mejor UX**: Indicadores claros de qué canciones tienen preview oficial vs bajo demanda
- ✅ **Control total**: Usas tu propia API de forma eficiente

¡La música de fondo estará disponible en todas tus memorias, objetivos y eventos del hijo! 🎵
