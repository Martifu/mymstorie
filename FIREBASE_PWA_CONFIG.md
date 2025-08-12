# Configuración de Firebase para PWA - Autenticación Google

## Problemas Solucionados en el Código

✅ **Cambio de signInWithPopup a signInWithRedirect** para PWA móviles
✅ **Configuración de initializeAuth** con `indexedDBLocalPersistence`
✅ **Manejo de getRedirectResult** para procesar autenticación después del redirect
✅ **Detección automática de PWA/iOS** para usar el método apropiado

## Configuración Requerida en Firebase Console

### 1. Authorized Domains (Dominios Autorizados)

Asegúrate de agregar TODOS estos dominios en Firebase Console > Authentication > Settings > Authorized domains:

- `localhost` (para desarrollo)
- `tu-dominio.com` (tu dominio principal)
- `www.tu-dominio.com` (con www si aplica)
- Si usas subdominios específicos para la PWA, agrégalos también

### 2. OAuth Redirect URIs

En Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs:

Agregar estos URIs de redirección:
- `https://tu-proyecto.firebaseapp.com/__/auth/handler`
- `https://tu-dominio.com/__/auth/handler`
- `http://localhost:3000/__/auth/handler` (para desarrollo)

### 3. AuthDomain Verification

Verifica que el `authDomain` en tu `.env` coincida exactamente con:
```
VITE_FB_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
```

### 4. Configuración de Service Worker

Asegúrate de que tu service worker en `public/firebase-messaging-sw.js` esté correctamente configurado.

## Cómo Funciona Ahora

### En Escritorio (Navegador)
- Usa `signInWithPopup()` - abre ventana emergente
- Funciona como antes, sin cambios para el usuario

### En PWA Móvil (iOS/Android)
- Detecta automáticamente que es PWA instalada
- Usa `signInWithRedirect()` - navega a Google Auth
- Después de autenticarse, regresa a la app
- `getRedirectResult()` procesa el resultado automáticamente

### Logs de Debugging

La app ahora muestra información útil en la consola:
- Tipo de dispositivo/plataforma detectado
- Método de autenticación utilizado
- Información del display mode
- Estados de la autenticación

## Testing

### Para probar en iOS:
1. Instala la PWA desde Safari
2. Abre la app instalada
3. Intenta hacer login - debería usar redirect

### Para probar en Android:
1. Instala la PWA desde Chrome
2. Abre la app instalada  
3. Intenta hacer login - debería usar redirect

### Verificar en DevTools:
- Revisa la consola para logs de PWA Info
- Verifica que se use el método correcto según el contexto

## Persistencia Mejorada

Ahora usa `indexedDBLocalPersistence` que es más robusto para PWAs que `browserLocalPersistence`, especialmente en iOS donde hay limitaciones de almacenamiento.
