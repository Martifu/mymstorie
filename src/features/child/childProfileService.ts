import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface ChildProfile {
    name: string;
    birthDate: Date | null;
    gender?: 'male' | 'female';
    isborn?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export async function getChildProfile(spaceId: string): Promise<ChildProfile | null> {
    try {
        const docRef = doc(db, `spaces/${spaceId}/childProfile/profile`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                name: data.name || '',
                birthDate: data.birthDate?.toDate() || null,
                gender: data.gender || undefined,
                isborn: data.isborn || false,
                createdAt: data.createdAt?.toDate() || undefined,
                updatedAt: data.updatedAt?.toDate() || undefined,
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting child profile:', error);
        return null;
    }
}

export async function updateChildProfile(spaceId: string, profile: Partial<ChildProfile>): Promise<void> {
    try {
        const docRef = doc(db, `spaces/${spaceId}/childProfile/profile`);
        const updateData = {
            ...profile,
            updatedAt: serverTimestamp(),
        };

        // Convertir Date a Timestamp si es necesario
        if (profile.birthDate) {
            updateData.birthDate = profile.birthDate;
        }

        await setDoc(docRef, updateData, { merge: true });
        console.log('Child profile updated successfully');
    } catch (error) {
        console.error('Error updating child profile:', error);
        throw error;
    }
}

export async function markChildAsBorn(spaceId: string, name: string, gender: 'male' | 'female', birthDate: Date): Promise<void> {
    try {
        await updateChildProfile(spaceId, {
            name,
            gender,
            birthDate,
            isborn: true,
        });
    } catch (error) {
        console.error('Error marking child as born:', error);
        throw error;
    }
}
