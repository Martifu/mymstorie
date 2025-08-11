import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

export type UserRole = 'mama' | 'papa';

export interface SpaceData {
    id: string;
    name: string;
    createdBy: string;
    createdAt: any;
    members: {
        [userId: string]: {
            role: UserRole;
            joinedAt: any;
            displayName: string;
            photoURL?: string;
        };
    };
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    currentSpaceId?: string;
    spaces: string[]; // IDs de espacios a los que pertenece
}

// Generar ID único para el espacio
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Generar código único para el espacio
export function generateSpaceCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Crear un nuevo espacio
export async function createSpace(
    userId: string,
    userName: string,
    spaceName: string,
    userRole: UserRole,
    userPhotoURL?: string
): Promise<{ spaceId: string; spaceCode: string }> {
    const spaceCode = generateSpaceCode();
    const spaceId = generateId();

    const spaceData: SpaceData = {
        id: spaceId,
        name: spaceName,
        createdBy: userId,
        createdAt: serverTimestamp(),
        members: {
            [userId]: {
                role: userRole,
                joinedAt: serverTimestamp(),
                displayName: userName,
                photoURL: userPhotoURL
            }
        }
    };

    // Crear el documento del espacio
    await setDoc(doc(db, 'spaces', spaceId), spaceData);

    // Crear el documento con el código para búsqueda
    await setDoc(doc(db, 'spaceCodes', spaceCode), {
        spaceId: spaceId,
        createdAt: serverTimestamp()
    });

    // Actualizar el perfil del usuario
    await updateUserProfile(userId, {
        currentSpaceId: spaceId,
        spaces: [spaceId]
    });

    return { spaceId, spaceCode };
}

// Buscar espacio por código
export async function findSpaceByCode(code: string): Promise<SpaceData | null> {
    try {
        const codeDoc = await getDoc(doc(db, 'spaceCodes', code.toUpperCase()));
        if (!codeDoc.exists()) {
            return null;
        }

        const spaceId = codeDoc.data().spaceId;
        const spaceDoc = await getDoc(doc(db, 'spaces', spaceId));

        if (!spaceDoc.exists()) {
            return null;
        }

        return spaceDoc.data() as SpaceData;
    } catch (error) {
        console.error('Error finding space by code:', error);
        return null;
    }
}

// Unirse a un espacio existente
export async function joinSpace(
    spaceId: string,
    userId: string,
    userName: string,
    userRole: UserRole,
    userPhotoURL?: string
): Promise<void> {
    const spaceRef = doc(db, 'spaces', spaceId);
    const spaceDoc = await getDoc(spaceRef);

    if (!spaceDoc.exists()) {
        throw new Error('El espacio no existe');
    }

    const spaceData = spaceDoc.data() as SpaceData;

    // Agregar el usuario al espacio
    const updatedMembers = {
        ...spaceData.members,
        [userId]: {
            role: userRole,
            joinedAt: serverTimestamp(),
            displayName: userName,
            photoURL: userPhotoURL
        }
    };

    await updateDoc(spaceRef, {
        members: updatedMembers
    });

    // Actualizar el perfil del usuario
    const userProfile = await getUserProfile(userId);
    const userSpaces = userProfile?.spaces || [];

    await updateUserProfile(userId, {
        currentSpaceId: spaceId,
        spaces: [...userSpaces, spaceId]
    });
}

// Obtener perfil del usuario
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

// Crear o actualizar perfil del usuario
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        await updateDoc(userRef, updates);
    } else {
        // Crear nuevo perfil si no existe
        await setDoc(userRef, {
            uid: userId,
            ...updates
        });
    }
}

// Subir foto de perfil
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-photos/${userId}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Actualizar el perfil del usuario con la nueva foto
    await updateUserProfile(userId, { photoURL: downloadURL });

    return downloadURL;
}

// Obtener espacios del usuario
export async function getUserSpaces(userId: string): Promise<SpaceData[]> {
    try {
        const userProfile = await getUserProfile(userId);
        if (!userProfile?.spaces) {
            return [];
        }

        const spaces: SpaceData[] = [];
        for (const spaceId of userProfile.spaces) {
            const spaceDoc = await getDoc(doc(db, 'spaces', spaceId));
            if (spaceDoc.exists()) {
                spaces.push(spaceDoc.data() as SpaceData);
            }
        }

        return spaces;
    } catch (error) {
        console.error('Error getting user spaces:', error);
        return [];
    }
}

// Obtener espacio actual del usuario
export async function getCurrentSpace(userId: string): Promise<SpaceData | null> {
    try {
        const userProfile = await getUserProfile(userId);
        if (!userProfile?.currentSpaceId) {
            return null;
        }

        const spaceDoc = await getDoc(doc(db, 'spaces', userProfile.currentSpaceId));
        if (spaceDoc.exists()) {
            return spaceDoc.data() as SpaceData;
        }

        return null;
    } catch (error) {
        console.error('Error getting current space:', error);
        return null;
    }
}

// Obtener código del espacio
export async function getSpaceCode(spaceId: string): Promise<string | null> {
    try {
        // Buscar el código en la colección spaceCodes
        const codesQuery = query(collection(db, 'spaceCodes'), where('spaceId', '==', spaceId));
        const codesSnapshot = await getDocs(codesQuery);

        if (!codesSnapshot.empty) {
            return codesSnapshot.docs[0].id; // El ID del documento es el código
        }

        return null;
    } catch (error) {
        console.error('Error getting space code:', error);
        return null;
    }
}

// Actualizar nombre del espacio (solo owner)
export async function updateSpaceName(spaceId: string, newName: string, userId: string): Promise<void> {
    try {
        const spaceRef = doc(db, 'spaces', spaceId);
        const spaceDoc = await getDoc(spaceRef);

        if (!spaceDoc.exists()) {
            throw new Error('El espacio no existe');
        }

        const spaceData = spaceDoc.data() as SpaceData;

        // Verificar que el usuario sea el creador del espacio
        if (spaceData.createdBy !== userId) {
            throw new Error('Solo el creador del espacio puede cambiar el nombre');
        }

        // Actualizar el nombre
        await updateDoc(spaceRef, {
            name: newName.trim()
        });

    } catch (error) {
        console.error('Error updating space name:', error);
        throw error;
    }
}
