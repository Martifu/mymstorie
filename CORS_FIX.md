# 🌐 Solución CORS para API Personalizada

## 🚨 Problema Actual
```
Origin https://mymstorie.vercel.app is not allowed by Access-Control-Allow-Origin
```

Tu API personalizada funciona (status 200) pero necesita configurar CORS para permitir requests desde tu dominio de producción.

## ✅ Solución: Configurar CORS en tu Servidor

### **Si usas Express.js:**

1. **Instalar cors:**
   ```bash
   npm install cors
   ```

2. **Configurar en tu servidor:**
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const app = express();

   // Opción 1: Permitir todos los orígenes (desarrollo)
   app.use(cors());

   // Opción 2: Solo permitir tu dominio (más seguro)
   app.use(cors({
     origin: [
       'http://localhost:5173',           // Desarrollo local
       'https://mymstorie.vercel.app'     // Producción
     ],
     methods: ['GET', 'POST'],
     credentials: true
   }));

   // Tus rutas Spotify
   app.get('/api/spotify/search-with-artist', (req, res) => {
     // Tu lógica aquí
   });
   ```

### **Si usas Node.js puro (sin Express):**

```javascript
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://mymstorie.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning, User-Agent');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Tu lógica de API aquí
  if (req.url.startsWith('/api/spotify/')) {
    // Procesar request
  }
});
```

### **Si usas Fastify:**

```javascript
const fastify = require('fastify')({ logger: true });

// Registrar plugin de CORS
await fastify.register(require('@fastify/cors'), {
  origin: [
    'http://localhost:5173',
    'https://mymstorie.vercel.app'
  ]
});
```

## 🎯 Headers CORS Necesarios

Tu servidor debe devolver estos headers:

```
Access-Control-Allow-Origin: https://mymstorie.vercel.app
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning, User-Agent
```

## 🚀 Pasos para Aplicar:

1. **Modifica tu servidor** con el código CORS apropiado
2. **Reinicia tu API:**
   ```bash
   # Detén tu servidor (Ctrl+C)
   # Vuelve a iniciarlo
   node tu-servidor.js
   ```
3. **Mantén ngrok corriendo** (no lo reinicies)
4. **Prueba tu app** en producción

## 🧪 Para Verificar que Funciona:

1. **Abre DevTools** en tu app de producción
2. **Busca una canción**
3. **Deberías ver:**
   - ✅ `🔍 Llamando API personalizada: https://...`
   - ✅ Sin errores de CORS
   - ✅ Preview de canciones funcionando

## ⚡ Solución Rápida (Para Probar):

Si solo quieres probar rápido, agrega esta línea al inicio de tus rutas:

```javascript
// Express
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning, User-Agent');
  next();
});

// Node.js puro
res.setHeader('Access-Control-Allow-Origin', '*');
```

## 🔒 Versión Segura (Recomendada):

```javascript
// Solo permitir tu dominio específico
res.setHeader('Access-Control-Allow-Origin', 'https://mymstorie.vercel.app');
```

## 📝 Ejemplo Completo Express:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://mymstorie.vercel.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning', 'User-Agent']
}));

// Tus rutas Spotify aquí
app.get('/api/spotify/search-with-artist', async (req, res) => {
  const { song, artist } = req.query;
  // Tu lógica de búsqueda
  res.json({ success: true, results: [] });
});

app.listen(3000, () => {
  console.log('API con CORS habilitado en puerto 3000');
});
```

Una vez que configures CORS en tu servidor, ¡todo debería funcionar perfectamente! 🎵
