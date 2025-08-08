import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export async function ensureDefaultSpace(uid: string): Promise<string> {
    // Try to find an existing space where the user is a member
    const q = query(collection(db, 'spaces'), where('members', 'array-contains', uid));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].id;
    // Create a new space
    const ref = await addDoc(collection(db, 'spaces'), {
        name: 'Mi familia',
        ownerId: uid,
        members: [uid],
        roles: { [uid]: 'owner' },
        createdAt: serverTimestamp(),
    });
    // Create default childProfile doc placeholder
    await setDoc(doc(db, `spaces/${ref.id}/childProfile/profile`), {
        name: '',
        birthDate: null,
    });
    return ref.id;
}


