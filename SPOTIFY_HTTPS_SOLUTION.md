# 🔒 Solución para API Personalizada HTTPS

## 🚨 Problema
Tu aplicación en producción (HTTPS) no puede hacer peticiones a tu servidor HTTP. Los navegadores bloquean el "mixed content" por seguridad.

## ✅ Solución Implementada

### 1. **Variable de Entorno Condicional**
He modificado `spotifyService.ts` para usar una variable de entorno:
```env
VITE_CUSTOM_SPOTIFY_API_URL=http://tu-servidor:3000
```

### 2. **Comportamiento Inteligente**
- **Desarrollo**: Si configuras la variable → usa tu API personalizada
- **Producción**: Si no configuras la variable → solo usa la API oficial de Spotify
- **Sin errores**: La app funciona en ambos casos

## 🚀 Opciones para Habilitar API Personalizada en Producción

### **Opción 1: ngrok (GRATIS y FÁCIL) ⭐ RECOMENDADO**

1. **Instala ngrok:**
   ```bash
   # En tu servidor
   npm install -g ngrok
   ```

2. **Inicia tu API:**
   ```bash
   # Terminal 1: Tu servidor Node.js
   node tu-servidor.js
   ```

3. **Crear túnel HTTPS:**
   ```bash
   # Terminal 2: Crear túnel
   ngrok http 3000
   ```

4. **Copiar URL HTTPS:**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3000
   ```

5. **Configurar en Vercel:**
   - Ve a tu proyecto en Vercel
   - Variables de entorno → Agregar:
   ```
   VITE_CUSTOM_SPOTIFY_API_URL=https://abc123.ngrok.io
   ```

6. **Redeploy:**
   ```bash
   # Forzar nuevo deploy
   git commit --allow-empty -m "Update ngrok URL"
   git push
   ```

### **Opción 2: Vercel Functions (GRATIS, MÁS TRABAJO)**

1. **Crear archivo:** `api/spotify/search-with-artist.js`
   ```javascript
   export default async function handler(req, res) {
     const { song, artist } = req.query;
     // Tu lógica de búsqueda aquí
     res.json({ success: true, results: [] });
   }
   ```

2. **Configurar variable:**
   ```
   VITE_CUSTOM_SPOTIFY_API_URL=https://mymstorie.vercel.app
   ```

### **Opción 3: Proxy con Cloudflare Workers (GRATIS)**

1. Crear worker que haga proxy a tu servidor HTTP
2. El worker se ejecuta en HTTPS automáticamente

## 📱 Configuración Actual

### **Desarrollo Local:**
```env
# En tu archivo .env.local
VITE_CUSTOM_SPOTIFY_API_URL=http://localhost:3000
```

### **Producción (Vercel):**
```env
# Si usas ngrok:
VITE_CUSTOM_SPOTIFY_API_URL=https://tu-codigo.ngrok.io

# Si no quieres API personalizada:
# No agregar la variable (o dejarla vacía)
```

## 🧪 Cómo Probar

### **Con API Personalizada:**
1. Buscar canción → Ver en consola: `🔍 Llamando API personalizada`
2. Debería funcionar el preview personalizado

### **Sin API Personalizada:**
1. Buscar canción → Ver en consola: `🚫 API personalizada no configurada`
2. Solo funciona preview oficial de Spotify (sigue funcionando)

## 🎯 Recomendación

**Para resolver rápido:** Usa ngrok (Opción 1)
- ✅ 5 minutos de configuración
- ✅ Mantiene tu servidor actual
- ✅ HTTPS automático
- ✅ Gratis para uso básico
- ✅ Tu código de servidor no cambia

## 📝 Variables de Entorno Necesarias

```env
# Spotify (obligatorias)
VITE_SPOTIFY_CLIENT_ID=tu_client_id
VITE_SPOTIFY_CLIENT_SECRET=tu_client_secret

# API Personalizada (opcional)
VITE_CUSTOM_SPOTIFY_API_URL=https://tu-servidor-con-https
```

## 🔍 Status Actual
- ✅ Código actualizado para usar variables de entorno
- ✅ Funciona sin API personalizada
- ⏳ Necesitas configurar ngrok o alternativa para habilitar API personalizada
