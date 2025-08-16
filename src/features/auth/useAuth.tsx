import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { getUserProfile } from '../spaces/spacesService';
import { setupMessaging } from '../../lib/firebase';

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    signOutApp: () => Promise<void>;
    spaceId: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [spaceId, setSpaceId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            try {
                setUser(u);
                if (u) {
                    // Ensure user doc exists
                    const userRef = doc(db, 'users', u.uid);
                    const snap = await getDoc(userRef);
                    if (!snap.exists()) {
                        await setDoc(userRef, {
                            uid: u.uid,
                            displayName: u.displayName,
                            email: u.email,
                            photoURL: u.photoURL,
                            createdAt: serverTimestamp(),
                            lastLoginAt: serverTimestamp(),
                            fcmTokens: [],
                            notificationPrefs: { entries: true, goals: true, reminders: true },
                            spaceIds: [],
                        });
                    } else {
                        // Verificar si la información de Firebase Auth ha cambiado
                        const existingData = snap.data();
                        const updates: any = { lastLoginAt: serverTimestamp() };

                        // Detectar cambios en displayName o photoURL desde Firebase Auth
                        if (u.displayName && u.displayName !== existingData.displayName) {
                            updates.displayName = u.displayName;
                        }
                        if (u.photoURL && u.photoURL !== existingData.photoURL) {
                            updates.photoURL = u.photoURL;
                        }

                        await updateDoc(userRef, updates);

                        // Si hay cambios en displayName o photoURL, actualizar en espacios
                        // Importar dinámicamente para evitar dependencia circular
                        if (updates.displayName || updates.photoURL) {
                            try {
                                const { updateMemberInfoInSpaces } = await import('../spaces/spacesService');
                                const memberUpdates: { displayName?: string; photoURL?: string } = {};
                                if (updates.displayName) memberUpdates.displayName = updates.displayName;
                                if (updates.photoURL) memberUpdates.photoURL = updates.photoURL;
                                await updateMemberInfoInSpaces(u.uid, memberUpdates);
                            } catch (error) {
                                console.error('Error updating member info in spaces:', error);
                            }
                        }
                    }

                    // Obtener el perfil del usuario y su espacio actual
                    try {
                        const userProfile = await getUserProfile(u.uid);
                        setSpaceId(userProfile?.currentSpaceId || null);
                    } catch (profileError) {
                        console.error('Error loading user profile:', profileError);
                        setSpaceId(null);
                    }

                    // Setup FCM and store token
                    try {
                        const token = await setupMessaging();
                        if (token) {
                            await updateDoc(userRef, { fcmTokens: arrayUnion(token) });
                        }
                    } catch (fcmError) {
                        console.error('FCM setup error:', fcmError);
                    }
                } else {
                    setSpaceId(null);
                }
            } catch (error) {
                console.error('Error in auth state change:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error('Error en inicio de sesión:', error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Actualizar el perfil con el nombre
            await updateProfile(result.user, {
                displayName: displayName
            });

        } catch (error: any) {
            console.error('Error en registro:', error);
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.error('Error enviando email de recuperación:', error);
            throw error;
        }
    };

    const signOutApp = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error cerrando sesión:', error);
        }
    };

    const value = useMemo(() => ({
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOutApp,
        spaceId
    }), [user, loading, spaceId]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}


