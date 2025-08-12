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
    checkAuthState: () => Promise<void>;
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
        let loadingTimeout: NodeJS.Timeout;

        // Configurar persistencia de autenticación
        const initializeAuth = async () => {
            if (initializingRef.current) return;
            initializingRef.current = true;

            // Detectar iOS PWA y evitar completamente Firebase Auth
            const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

            if (isStandalone && isIOS) {
                console.log('iOS PWA detected - completely skipping Firebase Auth initialization');
                setLoading(false);
                return;
            }

            try {
                await setPersistence(auth, browserLocalPersistence);
            } catch (error) {
                console.error('Error setting auth persistence:', error);
            }

            // Manejar resultado de redirect para PWAs en iOS con timeout
            try {
                const redirectPromise = getRedirectResult(auth);
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Redirect timeout')), 10000);
                });

                const result = await Promise.race([redirectPromise, timeoutPromise]);
                if (result && typeof result === 'object' && 'user' in result) {
                    console.log('Redirect result received:', result.user);
                    // El usuario ya se manejará en onAuthStateChanged
                }
            } catch (error: any) {
                if (error.message === 'Redirect timeout') {
                    console.warn('Redirect result timeout - continuing without redirect result');
                } else {
                    console.error('Error handling redirect result:', error);
                }
            }

            // Timeout de seguridad para evitar loading infinito
            loadingTimeout = setTimeout(() => {
                console.warn('Auth loading timeout - forcing loading to false');
                setLoading(false);
            }, 15000); // 15 segundos timeout

            const unsub = onAuthStateChanged(auth, async (u) => {
                try {
                    console.log('Auth state changed - iOS PWA Debug:', u ? { uid: u.uid, displayName: u.displayName } : null);
                    clearTimeout(loadingTimeout); // Cancelar timeout si la auth responde
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
                } catch (error: any) {
                    console.error('Error in auth state change:', error);

                    // Manejo específico de errores de red
                    if (error?.code === 'auth/network-request-failed' || error?.message?.includes('network')) {
                        console.warn('Network error in auth state - will retry on next state change');
                        // No cambiar el estado del usuario en caso de errores de red
                        setLoading(false);
                        return;
                    }

                    // Para otros errores, limpiar el estado
                    setUser(null);
                    setSpaceId(null);
                } finally {
                    setLoading(false);
                }
            });

            unsubscribeRef.current = unsub;
        };

        initializeAuth();

        // Manejar visibilidad de la página para iOS - mejorado para PWA
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('App became visible, checking auth state...');

                // Forzar verificación del estado de autenticación
                if (auth.currentUser && !user) {
                    console.log('Restoring user session after visibility change');
                    setUser(auth.currentUser);
                    setLoading(false);
                } else if (!auth.currentUser && !user) {
                    // Verificar si el usuario se autenticó en otra pestaña
                    setTimeout(() => {
                        if (auth.currentUser && !user) {
                            console.log('User authenticated in another tab, updating state');
                            setUser(auth.currentUser);
                            setLoading(false);
                        }
                    }, 1000);
                }
            }
        };

        const handleFocus = () => {
            console.log('App gained focus, checking auth state...');
            if (auth.currentUser && !user) {
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
            clearTimeout(loadingTimeout);
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

        // Para iOS PWA, no intentar autenticación automática - solo verificar estado actual
        if (isStandalone && isIOS) {
            console.log('iOS PWA detected - checking current auth state only');

            // Solo verificar si ya hay una sesión activa, no intentar crear una nueva
            const currentUser = auth.currentUser;
            if (currentUser) {
                console.log('Found existing auth session in iOS PWA');
                setUser(currentUser);
                setLoading(false);
                return;
            }

            console.log('No existing session found in iOS PWA - user needs Safari');
            // No hacer nada más - el UI mostrará IOSPWAAuth
            return;
        }

        // Para navegadores normales y no-iOS PWA
        try {
            console.log('Using signInWithPopup for normal browser');
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error('Sign in error:', error);

            // Si falla popup, intentar redirect como fallback
            if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
                console.log('Popup failed, trying redirect...');
                try {
                    await signInWithRedirect(auth, provider);
                } catch (redirectError) {
                    console.error('Redirect also failed:', redirectError);
                    alert('Error al iniciar sesión. Por favor, desbloquea los popups o intenta desde un navegador.');
                }
                return;
            }

            // Para otros errores de red
            if (error?.code === 'auth/network-request-failed') {
                alert('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
                return;
            }

            throw error;
        }
    };

    const signOutApp = async () => {
        await signOut(auth);
    };

    const checkAuthState = async () => {
        console.log('Manual auth state check requested');
        const currentUser = auth.currentUser;
        if (currentUser && !user) {
            console.log('Found user in manual check:', currentUser.displayName);
            setUser(currentUser);

            // Cargar el perfil del usuario para obtener el spaceId
            try {
                const userProfile = await getUserProfile(currentUser.uid);
                setSpaceId(userProfile?.currentSpaceId || null);
            } catch (profileError) {
                console.error('Error loading user profile:', profileError);
                setSpaceId(null);
            }

            setLoading(false);
        } else if (!currentUser) {
            console.log('No user found in manual check');
        } else {
            console.log('User already set in state');
        }
    };

    const value = useMemo(() => ({ user, loading, signInWithGoogle, signOutApp, checkAuthState, spaceId }), [user, loading, spaceId]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}


