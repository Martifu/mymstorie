import { useState, useEffect } from 'react';
import { getUserProfile } from '../features/spaces/spacesService';
import type { UserProfile } from '../features/spaces/spacesService';

// Cache simple para evitar múltiples llamadas a Firebase
const userProfileCache = new Map<string, UserProfile | null>();

export function useUserProfile(uid: string | null | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!uid) {
            setProfile(null);
            return;
        }

        // Verificar cache primero
        if (userProfileCache.has(uid)) {
            setProfile(userProfileCache.get(uid) || null);
            return;
        }

        setLoading(true);

        getUserProfile(uid)
            .then((userProfile) => {
                // Guardar en cache
                userProfileCache.set(uid, userProfile);
                setProfile(userProfile);
            })
            .catch((error) => {
                console.error('Error fetching user profile:', error);
                userProfileCache.set(uid, null);
                setProfile(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [uid]);

    return { profile, loading };
}

// Hook para obtener múltiples perfiles de usuario de una vez
export function useMultipleUserProfiles(uids: (string | null | undefined)[]) {
    const [profiles, setProfiles] = useState<Map<string, UserProfile | null>>(new Map());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const validUids = uids.filter((uid): uid is string => !!uid);

        if (validUids.length === 0) {
            setProfiles(new Map());
            return;
        }

        setLoading(true);

        // Filtrar uids que no están en cache
        const uncachedUids = validUids.filter(uid => !userProfileCache.has(uid));

        if (uncachedUids.length === 0) {
            // Todos los uids están en cache
            const cachedProfiles = new Map<string, UserProfile | null>();
            validUids.forEach(uid => {
                cachedProfiles.set(uid, userProfileCache.get(uid) || null);
            });
            setProfiles(cachedProfiles);
            setLoading(false);
            return;
        }

        // Fetch perfiles no cacheados
        Promise.all(uncachedUids.map(uid =>
            getUserProfile(uid)
                .then(profile => ({ uid, profile }))
                .catch(() => ({ uid, profile: null }))
        ))
            .then((results) => {
                // Actualizar cache
                results.forEach(({ uid, profile }) => {
                    userProfileCache.set(uid, profile);
                });

                // Crear mapa final con todos los perfiles (cacheados + nuevos)
                const allProfiles = new Map<string, UserProfile | null>();
                validUids.forEach(uid => {
                    allProfiles.set(uid, userProfileCache.get(uid) || null);
                });

                setProfiles(allProfiles);
            })
            .catch((error) => {
                console.error('Error fetching multiple user profiles:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [JSON.stringify(uids)]); // Use JSON.stringify for array comparison

    return { profiles, loading };
}

