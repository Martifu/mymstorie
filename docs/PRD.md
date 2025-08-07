# mymstorie — Product & Engineering Spec

All documentation is in English. All in‑app UI copy is in Spanish (ES‑LATAM).

## 1) PRD (Product Requirements Document)

- Scope
  - A private, mobile-first PWA for a couple to capture and relive: Memories, Goals, and Child timeline events in a single modern feed.
  - Users: 2 authenticated adults (Google Sign-In), in a single private “space”.
  - Content types:
    - Memories: title, description, date, media, tags.
    - Goals: title, description, due date, status, media, tags, reminders (24h before due).
    - Child events: date-ordered timeline; predefined or custom milestone labels; optional media; age computed from `birthDate`.
  - Interactions: reactions (heart), favorites, filter chips, date range filter, client-side search, share an entry as an image card.
  - Offline: read-only offline (cached shell, feed, detail, and media). No offline creation queue in MVP.
  - Notifications: push for new entries and goal reminders (24h before due).
  - Privacy: personal use; minimal, privacy-respecting analytics; optional export.

- Out of scope (MVP)
  - Public profiles, comments/threads, multi-family spaces, advanced search, media editing, long videos, offline writes/queues.

- Non-functional requirements
  - Performance: LCP < 2.5s on 4G; TTI < 3s; CLS < 0.1; 60 FPS scroll. Initial JS < ~200KB gzip (excl. Firebase SDK).
  - Accessibility: WCAG 2.1 AA; min touch target 44x44px; screen reader labels; color contrast AA for both themes.
  - Reliability: data integrity via Firestore rules; Cloud Functions with retries; Storage download tokens only.
  - Security: Firebase Auth; Firestore rules enforce space membership; upload validation; Storage public disabled.
  - Compatibility: modern mobile browsers; iOS PWA (iOS 16.4+ for web push); graceful fallbacks for camera/file.

- Acceptance criteria (key flows)
  - Create Memory: required title/date; 1–10 media (<=10MB each); images compressed to ~1440px long edge; appears in Home feed instantly on save; read-only offline; push to partner.
  - Goal Reminder: if `dueDate` and `status=active`, reminder 24h before; toggle off in Settings stops reminders.
  - Child Milestone: selecting predefined milestone fills label; age from `childProfile.birthDate`; appears on timeline by date.

## 2) Information Architecture & Navigation

- Tabs (mobile): Home, Memories, Goals, Child, Profile.
- Screens: Onboarding (intro → sign-in → create/join space → child profile); Lists; Detail; Create/Edit forms; Settings.
- Responsive: Mobile (bottom tabs, sheets, sticky FAB) → Tablet (two-column where useful) → Desktop (centered, read/management only).

## 3) User Stories & Backlog (MoSCoW)

- Must
  - Sign in with Google; access private space enforced by rules.
  - Unified feed with filters by type/date; client-side search.
  - Create Memory with media; appears in feed; push sent.
  - Create Goal with due date; reminder 24h before; settings toggles.
  - Add Child milestone; age computed; timeline by date.
  - Favorite/react per user; instant UI.
  - Offline read (Firestore persistence + Workbox caching).
- Should
  - Share entry as image card; Settings (theme, notifications, export/backup).
- Could
  - Tag chips quick filters; goal progress ring.
- Won’t
  - Offline writes; comments; multiple spaces.

## 4) Data Model & Firebase Architecture

- Collections & documents
  - `users/{uid}`: uid, displayName, email, photoURL, createdAt, lastLoginAt, spaceIds[], fcmTokens[], notificationPrefs.
  - `spaces/{spaceId}`: name, ownerId, members[], roles{ uid: role }, createdAt.
  - `spaces/{spaceId}/childProfile/profile`: name, birthDate (Timestamp).
  - `spaces/{spaceId}/entries/{entryId}`: id, spaceId, type, title, description, date (Timestamp), tags[], media[], createdBy, createdAt, updatedAt, goal fields (dueDate, status), child fields (milestoneType, milestoneLabel), engagement (favorites, reactions), helpers (mediaCount, hasVideo).
- Indexes
  - Feed by type+date desc; goals by status+dueDate asc.
- Storage
  - `spaces/{spaceId}/entries/{entryId}/{mediaId}.{jpg|mp4}`; optional thumbs in `thumbs/`.
- Cloud Functions
  - onEntryCreate → send FCM to space members (opt-out via prefs).
  - goalReminder (scheduled every 15m) → send T-24h reminders.
- FCM topics/tokens
  - Store tokens in `users/{uid}.fcmTokens`; optionally subscribe to `space_{spaceId}`.
- Security rules (draft)
  - Space membership gated reads/writes; users can read/write only their own user doc; validation for fields and limits. See rules draft below.

## 5) Offline & Caching Strategy

- Firestore: enable persistence for reads.
- Workbox: precache shell; NetworkFirst for HTML; SWR for assets; CacheFirst for Storage media with expiration.
- Media optimization: client-side compression to 1440px long edge (JPEG ~0.82), EXIF auto-rotate, lazy-load, thumbnails.

## 6) Notifications Plan

- Events: new entry; goal reminder T-24h.
- Payloads: see examples below.
- Frequency & controls: immediate for entries; once for reminders; toggles in Settings.

## 7) UX/UI Design System

- Design tokens: colors, typography, spacing, radii, shadows, motion.
- Tailwind config: themed palette and tokens (see code block below).
- Components: buttons, inputs, FAB, cards, lists, chips, tabs, modals, toasts, skeletons, empty/error states.
- Microinteractions: 180–240ms; press scale 0.98; slide-up sheets; haptics if available.

### Tailwind theme extension
```ts
// tailwind.config.js (excerpt already applied)
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: { extend: { /* palette & tokens as in repo */ } },
}
```

## 8) Wireframes (described)

- Onboarding: friendly intro → Google sign-in → create space → child profile.
- Home: search + chips; feed with cards; FAB → action sheet.
- Memories/Goals/Child: lists with filters; forms with sticky save bar.
- Settings: profile, space, child info, theme, notifications, export.

## 9) Example UI Copy (Spanish, warm, “tú”)

- Onboarding
  - Title: “Bienvenido a tu rincón familiar ✨”
  - Button: “Continuar con Google”
  - Space name: “Nombre de tu familia” (placeholder “Familia García”)
- Home
  - Search: “Buscar por título, descripción o etiquetas…”
  - Chips: “Todos”, “Recuerdos”, “Objetivos”, “Hijo”
  - Empty: “Aún no hay nada por aquí. ¡Crea tu primer recuerdo! 📸”
- Forms
  - Memory: “Nuevo recuerdo” — “Título (obligatorio)”, “Fecha (obligatoria)”, “Agregar fotos o video”
  - Goal: “Nueva meta” — “Fecha límite (opcional)”, “Recordarme 24 h antes”
  - Child: “Nuevo hito” — “Tipo de hito”, “Etiqueta”, “Fecha”
- Actions
  - “Me gusta”, “Favorito”, “Compartir tarjeta”, success: “¡Guardado! 💾”
- Errors
  - “Ups, algo salió mal. Intenta de nuevo.”; Offline: “Estás sin conexión.”

## 10) Quality Plan

- Analytics: minimal, opt-in counters only.
- Testing: Vitest/RTL unit; Playwright e2e for onboarding, create memory, filter, reminder simulation.
- Performance budgets: JS < 200KB (excl. Firebase), images ~1440px.
- Release checklist: manifest, SW, iOS PWA, safe areas, rules, indexes.

## 11) Implementation Plan

- Tech: Vite + React + TS + Tailwind; Firebase (Auth, Firestore, Storage, Functions, FCM); Workbox via PWA plugin; Hosting on Firebase Hosting.
- Structure: `src/app`, `src/components`, `src/features`, `src/lib`, `public`, `functions`, `docs`.
- Roadmap: MVP (auth/space, entries CRUD, feed, offline read, push) → v1.0 (share card, thumbnails, reminders scheduler, export) → v1.x (enhancements).

## 12) Optional starter snippets

### Firestore rules (draft)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isSpaceMember(spaceId) {
      return isSignedIn() && exists(/databases/$(database)/documents/spaces/$(spaceId)) &&
        get(/databases/$(database)/documents/spaces/$(spaceId)).data.members.hasAny([request.auth.uid]);
    }

    match /users/{uid} {
      allow read, create, update, delete: if isOwner(uid);
    }

    match /spaces/{spaceId} {
      allow read: if isSpaceMember(spaceId);
      allow create: if isSignedIn();
      allow update, delete: if isSpaceMember(spaceId);
    }

    match /spaces/{spaceId}/childProfile/{docId} {
      allow read: if isSpaceMember(spaceId);
      allow create, update, delete: if isSpaceMember(spaceId);
    }

    match /spaces/{spaceId}/entries/{entryId} {
      allow read: if isSpaceMember(spaceId);
      allow create: if isSpaceMember(spaceId)
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.type in ['memory','goal','child_event']
        && request.resource.data.media.size() <= 10
        && (request.resource.data.title is string && request.resource.data.title.size() > 0)
        && (request.resource.data.date is timestamp);
      allow update: if isSpaceMember(spaceId) && resource.data.createdBy == request.auth.uid;
      allow delete: if isSpaceMember(spaceId) && resource.data.createdBy == request.auth.uid;
    }
  }
}
```

### Firestore indexes
```json
{
  "indexes": [
    { "collectionGroup": "entries", "queryScope": "COLLECTION", "fields": [
      { "fieldPath": "type", "order": "ASCENDING" },
      { "fieldPath": "date", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "entries", "queryScope": "COLLECTION", "fields": [
      { "fieldPath": "type", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "dueDate", "order": "ASCENDING" }
    ]}
  ],
  "fieldOverrides": []
}
```

### Cloud Functions (FCM)
```ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

export const onEntryCreate = functions.firestore
  .document('spaces/{spaceId}/entries/{entryId}')
  .onCreate(async (snap, context) => {
    const entry = snap.data() as any;
    const spaceId = context.params.spaceId as string;
    const space = (await db.doc(`spaces/${spaceId}`).get()).data() as any;
    if (!space) return;
    const memberIds: string[] = space.members || [];
    const targetUserIds = memberIds.filter((uid) => uid !== entry.createdBy);
    const tokens = new Set<string>();
    await Promise.all(targetUserIds.map(async (uid) => {
      const user = (await db.doc(`users/${uid}`).get()).data() as any;
      if (!user?.notificationPrefs?.entries) return;
      (user.fcmTokens || []).forEach((t: string) => tokens.add(t));
    }));
    if (!tokens.size) return;
    await messaging.sendMulticast({
      tokens: [...tokens],
      notification: { title: 'Nuevo recuerdo ✨', body: `${entry.title || 'Nueva publicación'}` },
      data: { spaceId, entryId: context.params.entryId, type: entry.type },
    });
  });
```

### Workbox service worker (outline)
```ts
// Configured via vite-plugin-pwa in vite.config.ts (runtimeCaching + precache)
```

### React components (examples)
```tsx
// EntryCard and FAB are included under src/components/
```

### Example Spanish UI copy
- “Bienvenido a tu rincón familiar ✨”
- “Buscar por título, descripción o etiquetas…”
- “Aún no hay nada por aquí. ¡Crea tu primer recuerdo! 📸”
- “Nuevo recuerdo”; “Guardar”; “¡Guardado! 💾”
- Notificaciones: “Nuevo recuerdo ✨”; “Recordatorio de objetivo ⏰”
