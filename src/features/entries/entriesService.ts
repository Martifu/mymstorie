import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc, deleteField, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';
import type { EntrySpotifyData } from '../spotify/spotifyService';

export async function createMemory(spaceId: string, form: FormData, onProgress?: (fileName: string, progress: number) => void, spotifyData?: EntrySpotifyData | null) {
  const title = String(form.get('title') || '');
  const dateStr = String(form.get('date'));
  const date = (() => {
    // Parseo local YYYY-MM-DD para evitar desfases por zona horaria (UTC)
    const [y, m, d] = dateStr.split('-').map((n) => Number(n));
    return new Date(y, (m || 1) - 1, d || 1);
  })();
  const description = String(form.get('description') || '');
  const tags = String(form.get('tags') || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const media: { id: string; url: string; type: 'image' | 'video'; width?: number; height?: number; storagePath: string; }[] = [];
  const files = form.getAll('media') as File[];

  for (const file of files.slice(0, 10)) {
    const id = crypto.randomUUID();
    const path = `spaces/${spaceId}/entries/${id}/${file.name}`;
    const refPath = ref(storage, path);

    const uploadTask = uploadBytesResumable(refPath, file);

    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(file.name, Math.round(progress));
        },
        (error) => reject(error),
        () => resolve()
      );
    });

    const url = await getDownloadURL(refPath);
    media.push({ id, url, type: file.type.startsWith('video/') ? 'video' : 'image', storagePath: path });
  }

  const entry: any = {
    spaceId,
    type: 'memory' as const,
    title,
    description,
    date,
    tags,
    media,
    mediaCount: media.length,
    hasVideo: media.some((m) => m.type === 'video'),
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Añadir información de Spotify si está disponible
  if (spotifyData) {
    entry.spotify = spotifyData;
  }

  // Remover campos undefined/vacíos
  Object.keys(entry).forEach(key => {
    if (entry[key] === undefined || entry[key] === '') {
      delete entry[key];
    }
  });

  await addDoc(collection(db, `spaces/${spaceId}/entries`), entry);
}

export async function createGoal(spaceId: string, form: FormData, spotifyData?: EntrySpotifyData | null) {
  const title = String(form.get('title') || '');
  const goalCategory = String(form.get('goalCategory') || 'logro');
  const goalIcon = String(form.get('goalIcon') || '🎯');
  const status = String(form.get('status') || 'pending');
  const description = String(form.get('description') || '');

  // Para objetivos completados, manejar multimedia
  const files = form.getAll('media') as File[];
  const media: { id: string; url: string; type: 'image' | 'video'; storagePath: string }[] = [];

  if (status === 'completed' && files.length > 0) {
    for (const file of files.slice(0, 10)) {
      const id = crypto.randomUUID();
      const path = `spaces/${spaceId}/entries/${id}/${file.name}`;
      const refPath = ref(storage, path);
      await uploadBytesResumable(refPath, file);
      const url = await getDownloadURL(refPath);
      media.push({ id, url, type: file.type.startsWith('video/') ? 'video' : 'image', storagePath: path });
    }
  }

  const entry: any = {
    spaceId,
    type: 'goal' as const,
    title,
    goalCategory,
    goalIcon,
    status, // 'pending' o 'completed'
    date: new Date(),
    media,
    mediaCount: media.length,
    hasVideo: media.some((m) => m.type === 'video'),
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Añadir información de Spotify si está disponible
  if (spotifyData) {
    entry.spotify = spotifyData;
  }

  // Agregar descripción solo si existe (para objetivos completados)
  if (description.trim()) {
    entry.description = description;
  }

  // Si es completado, agregar fecha de completado
  if (status === 'completed') {
    entry.completedAt = serverTimestamp();
  }

  // Remover campos undefined/vacíos
  Object.keys(entry).forEach(key => {
    if (entry[key] === undefined || entry[key] === '') {
      delete entry[key];
    }
  });

  await addDoc(collection(db, `spaces/${spaceId}/entries`), entry);
}

export async function createChildEvent(spaceId: string, form: FormData, onProgress?: (fileName: string, progress: number) => void, onBirthEvent?: (name: string, gender: 'male' | 'female', birthDate: Date) => Promise<void>, spotifyData?: EntrySpotifyData | null) {
  console.log('createChildEvent iniciado');
  const title = String(form.get('title') || '');
  const milestoneType = String(form.get('milestoneType') || 'custom');
  const milestoneLabel = String(form.get('milestoneLabel') || '');
  const childCategory = String(form.get('childCategory') || 'milestone');
  const dateStr = String(form.get('date'));
  const date = (() => {
    const [y, m, d] = dateStr.split('-').map((n) => Number(n));
    return new Date(y, (m || 1) - 1, d || 1);
  })();
  const description = String(form.get('description') || '');
  const files = form.getAll('media') as File[];

  console.log('Archivos a subir:', files.length, files.map(f => ({ name: f.name, size: f.size, type: f.type })));

  const media: { id: string; url: string; type: 'image' | 'video'; storagePath: string }[] = [];

  for (const file of files.slice(0, 10)) {
    try {
      console.log(`Subiendo archivo: ${file.name} (${file.size} bytes)`);
      const id = crypto.randomUUID();
      const path = `spaces/${spaceId}/entries/${id}/${file.name}`;
      const refPath = ref(storage, path);

      const uploadTask = uploadBytesResumable(refPath, file);

      // Esperar a que se complete la subida
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress}%`);
            onProgress?.(file.name, Math.round(progress));
          },
          (error) => {
            console.error('Error durante la subida:', error);
            reject(error);
          },
          () => {
            console.log('Subida completada para:', file.name);
            onProgress?.(file.name, 100);
            resolve(uploadTask.snapshot);
          }
        );
      });

      const url = await getDownloadURL(refPath);
      console.log('URL obtenida:', url);
      media.push({ id, url, type: file.type.startsWith('video/') ? 'video' : 'image', storagePath: path });
    } catch (error) {
      console.error(`Error subiendo archivo ${file.name}:`, error);
      throw new Error(`Error al subir el archivo ${file.name}: ${error}`);
    }
  }

  // Manejar evento de nacimiento
  if (childCategory === 'birth') {
    const childName = String(form.get('childName') || '');
    const childGender = String(form.get('childGender') || 'male') as 'male' | 'female';

    if (childName && onBirthEvent) {
      try {
        await onBirthEvent(childName, childGender, date);
      } catch (error) {
        console.error('Error updating child profile:', error);
        throw new Error('Error al actualizar el perfil del hijo');
      }
    }
  }

  const entry: any = {
    spaceId,
    type: 'child_event' as const,
    title: title || milestoneLabel,
    description,
    date,
    childCategory, // 'birthday' | 'milestone' | 'memory' | 'birth' (para UI)
    milestoneType,
    media,
    mediaCount: media.length,
    hasVideo: media.some((m) => m.type === 'video'),
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Añadir información de Spotify si está disponible
  if (spotifyData) {
    entry.spotify = spotifyData;
  }

  // Agregar campos específicos del nacimiento
  if (childCategory === 'birth') {
    const childName = String(form.get('childName') || '');
    const childGender = String(form.get('childGender') || 'male');
    if (childName) {
      entry.childName = childName;
      entry.childGender = childGender;
      entry.milestoneType = 'birth';
    }
  }

  // Solo añadir milestoneLabel si tiene valor
  if (milestoneType === 'custom' && milestoneLabel && milestoneLabel.trim()) {
    entry.milestoneLabel = milestoneLabel;
  }

  // Remover campos undefined/vacíos
  Object.keys(entry).forEach(key => {
    if (entry[key] === undefined || entry[key] === '') {
      delete entry[key];
    }
  });

  console.log('Guardando entrada en Firestore:', entry);
  await addDoc(collection(db, `spaces/${spaceId}/entries`), entry);
  console.log('Entrada guardada exitosamente');
}

export async function toggleFavorite(spaceId: string, entryId: string, uid: string, makeFav: boolean) {
  const refDoc = doc(db, `spaces/${spaceId}/entries/${entryId}`);
  if (makeFav) {
    await setDoc(refDoc, { favorites: { [uid]: true } }, { merge: true });
  } else {
    await updateDoc(refDoc, { [`favorites.${uid}`]: deleteField() as any });
  }
}

export async function toggleHeart(spaceId: string, entryId: string, uid: string, makeHeart: boolean) {
  const refDoc = doc(db, `spaces/${spaceId}/entries/${entryId}`);
  if (makeHeart) {
    await setDoc(refDoc, { reactions: { [uid]: 'heart' } }, { merge: true });
  } else {
    await updateDoc(refDoc, { [`reactions.${uid}`]: deleteField() as any });
  }
}

export async function updateGoalStatus(
  spaceId: string,
  goalId: string,
  status: 'completed' | 'pending',
  description?: string,
  media?: File[],
  onProgress?: (fileName: string, progress: number) => void
) {
  const refDoc = doc(db, `spaces/${spaceId}/entries/${goalId}`);

  // Verificar que el documento existe
  const docSnap = await getDoc(refDoc);
  if (!docSnap.exists()) {
    throw new Error('El objetivo no existe');
  }

  const updateData: any = {
    status,
    updatedAt: serverTimestamp()
  };

  // Solo agregar descripción y multimedia si se está completando
  if (status === 'completed') {
    updateData.completedAt = serverTimestamp();

    if (description) {
      updateData.description = description;
    }

    // Procesar multimedia si hay archivos
    if (media && media.length > 0) {
      const mediaUrls: { id: string; url: string; type: 'image' | 'video'; storagePath: string; }[] = [];

      for (const file of media.slice(0, 10)) {
        const id = crypto.randomUUID();
        const path = `spaces/${spaceId}/entries/${goalId}/${file.name}`;
        const refPath = ref(storage, path);

        const uploadTask = uploadBytesResumable(refPath, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress?.(file.name, progress);
            },
            reject,
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              mediaUrls.push({
                id,
                url,
                type: file.type.startsWith('video/') ? 'video' : 'image',
                storagePath: path
              });
              resolve();
            }
          );
        });
      }

      updateData.media = mediaUrls;
    }
  }

  await updateDoc(refDoc, updateData);
}
