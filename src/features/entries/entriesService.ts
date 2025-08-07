import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';

export async function createMemory(spaceId: string, form: FormData) {
  const title = String(form.get('title') || '');
  const date = new Date(String(form.get('date')));
  const description = String(form.get('description') || '');
  const tags = String(form.get('tags') || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const media: { id: string; url: string; type: 'image'|'video'; width?: number; height?: number; storagePath: string; }[] = [];
  const files = form.getAll('media') as File[];

  for (const file of files.slice(0, 10)) {
    const id = crypto.randomUUID();
    const path = `spaces/${spaceId}/entries/${id}/${file.name}`;
    const refPath = ref(storage, path);
    await uploadBytesResumable(refPath, file);
    const url = await getDownloadURL(refPath);
    media.push({ id, url, type: file.type.startsWith('video/') ? 'video' : 'image', storagePath: path });
  }

  const entry = {
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

  await addDoc(collection(db, `spaces/${spaceId}/entries`), entry);
}
