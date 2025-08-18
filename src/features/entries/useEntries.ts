import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export type EntryDoc = {
    id: string;
    type: 'memory' | 'goal' | 'child_event';
    title: string;
    description?: string;
    date: any;
    media?: { url: string; type: 'image' | 'video' }[];
    favorites?: Record<string, true>;
    reactions?: Record<string, 'heart'>;
    spotify?: {
        id: string;
        name: string;
        artists: string;
        preview_url: string | null;
        spotify_url: string;
        album_name: string;
        album_image: string | null;
        duration_ms: number;
    };
};

export function useEntries(spaceId: string | null, type: 'all' | 'memory' | 'goal' | 'child_event') {
    const [entries, setEntries] = useState<EntryDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!spaceId) return;
        const base = collection(db, 'spaces', spaceId, 'entries');
        const constraints = [orderBy('date', 'desc')] as any[];
        if (type !== 'all') constraints.unshift(where('type', '==', type));
        const q = query(base, ...constraints);
        const unsub = onSnapshot(q, (snap) => {
            setEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
            setLoading(false);
        });
        return () => unsub();
    }, [spaceId, type]);

    return { entries, loading };
}


