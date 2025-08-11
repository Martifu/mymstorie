import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { getUserProfile } from '../spaces/spacesService';
import { setupMessaging } from '../../lib/firebase';

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

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
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
                const userProfile = await getUserProfile(u.uid);
                setSpaceId(userProfile?.currentSpaceId || null);
                // Setup FCM and store token
                try {
                    const token = await setupMessaging();
                    if (token) {
                        await updateDoc(userRef, { fcmTokens: arrayUnion(token) });
                    }
                } catch { }
            } else {
                setSpaceId(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
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


