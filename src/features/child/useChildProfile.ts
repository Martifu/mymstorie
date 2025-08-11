import { useState, useEffect } from 'react';
import { getChildProfile, type ChildProfile } from './childProfileService';

export function useChildProfile(spaceId: string | null) {
    const [profile, setProfile] = useState<ChildProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!spaceId) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const profileData = await getChildProfile(spaceId);
                setProfile(profileData);
            } catch (err) {
                console.error('Error fetching child profile:', err);
                setError('Error al cargar el perfil del hijo');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [spaceId]);

    const refreshProfile = async () => {
        if (!spaceId) return;

        try {
            setError(null);
            const profileData = await getChildProfile(spaceId);
            setProfile(profileData);
        } catch (err) {
            console.error('Error refreshing child profile:', err);
            setError('Error al actualizar el perfil del hijo');
        }
    };

    return {
        profile,
        loading,
        error,
        refreshProfile,
        isChildBorn: profile?.isborn || false,
    };
}
