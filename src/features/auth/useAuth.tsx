import { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, signInWithPopup, signOut, getRedirectResult } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { getUserProfile } from '../spaces/spacesService';
import { setupMessaging } from '../../lib/firebase';
import { isPWA, isIOS, logPWAInfo } from '../../lib/pwaUtils';

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOutApp: () => Promise<void>;
    spaceId: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [spaceId, setSpaceId] = useState<string | null>(null);
    const initializingRef = useRef(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Configurar persistencia de autenticación
        const initializeAuth = async () => {
            if (initializingRef.current) return;
            initializingRef.current = true;

            // Log información de PWA para debugging
            logPWAInfo();

            // Manejar resultado del redirect (para PWA móviles)
            try {
                const result = await getRedirectResult(auth);
                if (result && result.user) {
                    console.log('Usuario autenticado via redirect:', result.user.email);
                }
            } catch (error) {
                console.error('Error handling redirect result:', error);
            }

            const unsub = onAuthStateChanged(auth, async (u) => {
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
                            await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
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
                    // En caso de error, mantener el estado actual pero marcar como no cargando
                } finally {
                    setLoading(false);
                }
            });

            unsubscribeRef.current = unsub;
        };

        initializeAuth();

        // Manejar visibilidad de la página para iOS
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && auth.currentUser && !user) {
                // Si hay un usuario autenticado en Firebase pero no en el estado local, restaurar
                console.log('Restoring user session after page visibility change');
                setUser(auth.currentUser);
                setLoading(false);
            }
        };

        const handleFocus = () => {
            if (auth.currentUser && !user) {
                // Restaurar estado de autenticación cuando la ventana recupera el foco
                console.log('Restoring user session after window focus');
                setUser(auth.currentUser);
                setLoading(false);
            }
        };

        // Listeners para manejar cambios de visibilidad y foco
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        // Cleanup
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [user]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();

        // Configurar el provider para obtener información adicional
        provider.addScope('email');
        provider.addScope('profile');

        try {
            // Usar redirect para PWA móviles (especialmente iOS) y popup para escritorio
            if (isPWA() || isIOS()) {
                console.log('Usando signInWithRedirect para PWA/iOS');
                await signInWithRedirect(auth, provider);
                // El resultado se manejará en getRedirectResult() al recargar la página
            } else {
                console.log('Usando signInWithPopup para escritorio');
                await signInWithPopup(auth, provider);
            }
        } catch (error) {
            console.error('Error en autenticación:', error);
            throw error;
        }
    };

    const signOutApp = async () => {
        await signOut(auth);
    };

    const value = useMemo(() => ({ user, loading, signInWithGoogle, signOutApp, spaceId }), [user, loading, spaceId]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}


