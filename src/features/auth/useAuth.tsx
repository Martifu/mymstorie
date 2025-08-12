import { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { getUserProfile } from '../spaces/spacesService';

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

            try {
                await setPersistence(auth, browserLocalPersistence);
            } catch (error) {
                console.error('Error setting auth persistence:', error);
            }

            // Manejar resultado de redirect para PWAs en iOS
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log('Redirect result received:', result.user);
                    // El usuario ya se manejará en onAuthStateChanged
                }
            } catch (error) {
                console.error('Error handling redirect result:', error);
            }

            const unsub = onAuthStateChanged(auth, async (u) => {
                try {
                    console.log('Auth state changed - iOS PWA Debug:', u ? { uid: u.uid, displayName: u.displayName } : null);
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
                        // Setup FCM and store token - TEMPORALMENTE COMENTADO PARA iOS PWA
                        // try {
                        //     console.log('Solicitando permisos de notificación...');
                        //     const token = await setupMessaging();
                        //     if (token) {
                        //         console.log('Token FCM obtenido:', token);
                        //         await updateDoc(userRef, { 
                        //             fcmTokens: arrayUnion(token),
                        //             lastFCMTokenUpdate: serverTimestamp()
                        //         });
                        //         console.log('Token FCM guardado exitosamente');
                        //     } else {
                        //         console.warn('No se pudo obtener el token FCM');
                        //     }
                        // } catch (fcmError) {
                        //     console.error('Error configurando FCM:', fcmError);
                        // }
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

        // Detectar si está corriendo como PWA (instalada en iOS)
        const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        console.log('Sign in method detection:', { isStandalone, isIOS });

        try {
            if (isStandalone && isIOS) {
                // Usar redirect para PWAs en iOS
                console.log('Using signInWithRedirect for iOS PWA');
                await signInWithRedirect(auth, provider);
            } else {
                // Usar popup para navegadores normales
                console.log('Using signInWithPopup for normal browser');
                await signInWithPopup(auth, provider);
            }
        } catch (error) {
            console.error('Sign in error:', error);
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


