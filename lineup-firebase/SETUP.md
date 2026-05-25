# 🚀 Lineup Manager — Guía Firebase Studio

## PASO 1 — Abrir Firebase Studio
1. Ve a **studio.firebase.google.com**
2. Inicia sesión con tu Google
3. Clic en **"New project"** → nombre: `lineup-manager`

## PASO 2 — Activar Authentication
1. Menú izquierdo → **Authentication**
2. Clic **"Get started"**
3. **Email/Password** → Activar → Guardar

## PASO 3 — Activar Firestore
1. Menú izquierdo → **Firestore Database**
2. Clic **"Create database"**
3. Selecciona **"Start in production mode"**
4. Elige región → **Done**

## PASO 4 — Pegar las Reglas de Firestore
1. Firestore → pestaña **"Rules"**
2. Borra todo y pega el contenido de `firestore.rules`
3. Clic **"Publish"**

## PASO 5 — Obtener credenciales
1. ⚙️ → **Project settings**
2. Baja hasta **"Your apps"** → clic **"</>"** (Web)
3. Nombre: `lineup-web` → **Register**
4. Copia el objeto `firebaseConfig`
5. Abre `src/firebase.js` y pega tus valores reales

## PASO 6 — Importar y correr en Firebase Studio
1. En Firebase Studio → **"Import"** → sube esta carpeta (o pega el código)
2. Terminal integrada:
   ```
   npm install
   npm run dev
   ```
3. Abre el preview — ¡listo!

## PASO 7 — Deploy (opcional)
```
npm run build
firebase deploy --only hosting
```

## ¿Cómo funciona el sistema de roles?

### Usuario normal:
- Se registra con email + contraseña + nombre del equipo
- Gestiona solo su plantilla (26 jugadores, alineaciones A/B/C...)
- Nadie más ve su equipo excepto los admins

### Admin (tú — el primero en registrarse):
- El primer usuario que crea cuenta queda como **super admin automáticamente**
- Ve un panel con todos los equipos registrados
- Puede ver la plantilla y alineación de cualquier equipo (solo lectura)
- Para agregar más admins: en Firestore → colección `admins` → agrega documento con el UID del usuario

### Estructura en Firestore:
```
admins/
  {uid}: { email, uid, superAdmin: true }

teams/
  {uid}: {
    teamName: "Mi Equipo",
    squad: [...],        // máx 26 jugadores
    lineups: [...]       // alineaciones A, B, C...
  }
```
