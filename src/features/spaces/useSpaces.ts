import { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import type {
    SpaceData,
    UserProfile,
    UserRole
} from './spacesService';
import {
    createSpace,
    findSpaceByCode,
    joinSpace,
    getUserProfile,
    getUserSpaces,
    updateUserProfile,
    uploadProfilePhoto,
    getCurrentSpace,
    getSpaceCode,
    updateSpaceName
} from './spacesService';

export function useSpaces() {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userSpaces, setUserSpaces] = useState<SpaceData[]>([]);
    const [currentSpace, setCurrentSpace] = useState<SpaceData | null>(null);
    const [spaceCode, setSpaceCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar perfil del usuario
    useEffect(() => {
        if (!user) {
            setUserProfile(null);
            setUserSpaces([]);
            setCurrentSpace(null);
            setSpaceCode(null);
            setLoading(false);
            return;
        }

        loadUserData();
    }, [user]);

    const loadUserData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);

            if (profile) {
                const spaces = await getUserSpaces(user.uid);
                setUserSpaces(spaces);

                // Cargar espacio actual
                const currentSpaceData = await getCurrentSpace(user.uid);
                setCurrentSpace(currentSpaceData);

                // Cargar código del espacio actual
                if (currentSpaceData) {
                    const code = await getSpaceCode(currentSpaceData.id);
                    setSpaceCode(code);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // En caso de error, intentar recargar después de un breve delay
            setTimeout(() => {
                if (user) {
                    console.log('Retrying to load user data after error');
                    loadUserData();
                }
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    // Crear nuevo espacio
    const handleCreateSpace = async (
        spaceName: string,
        userRole: UserRole
    ): Promise<{ spaceId: string; spaceCode: string }> => {
        if (!user) throw new Error('Usuario no autenticado');

        const result = await createSpace(
            user.uid,
            user.displayName || user.email?.split('@')[0] || 'Usuario',
            spaceName,
            userRole,
            user.photoURL || userProfile?.photoURL
        );

        // Recargar datos
        await loadUserData();

        return result;
    };

    // Buscar espacio por código
    const handleFindSpace = async (code: string): Promise<SpaceData | null> => {
        return await findSpaceByCode(code);
    };

    // Unirse a espacio
    const handleJoinSpace = async (
        spaceId: string,
        userRole: UserRole
    ): Promise<void> => {
        if (!user) throw new Error('Usuario no autenticado');

        await joinSpace(
            spaceId,
            user.uid,
            user.displayName || user.email?.split('@')[0] || 'Usuario',
            userRole,
            user.photoURL || userProfile?.photoURL
        );

        // Recargar datos
        await loadUserData();
    };

    // Cambiar espacio actual
    const switchSpace = async (spaceId: string): Promise<void> => {
        if (!user) return;

        await updateUserProfile(user.uid, { currentSpaceId: spaceId });
        await loadUserData();
    };

    // Subir foto de perfil
    const handleUploadPhoto = async (file: File): Promise<string> => {
        if (!user) throw new Error('Usuario no autenticado');

        const photoURL = await uploadProfilePhoto(user.uid, file);
        await loadUserData();

        return photoURL;
    };

    // Actualizar perfil
    const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
        if (!user) return;

        await updateUserProfile(user.uid, updates);
        await loadUserData();
    };

    // Actualizar nombre del espacio
    const handleUpdateSpaceName = async (spaceId: string, newName: string): Promise<void> => {
        if (!user) throw new Error('Usuario no autenticado');

        await updateSpaceName(spaceId, newName, user.uid);
        await loadUserData();
    };

    return {
        userProfile,
        userSpaces,
        currentSpace,
        spaceCode,
        loading,
        createSpace: handleCreateSpace,
        findSpace: handleFindSpace,
        joinSpace: handleJoinSpace,
        switchSpace,
        uploadPhoto: handleUploadPhoto,
        updateProfile,
        updateSpaceName: handleUpdateSpaceName,
        refreshData: loadUserData
    };
}
