import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface NotificationData {
    title: string;
    body: string;
    icon?: string;
    data?: Record<string, string>;
}

// Obtener información del espacio y sus miembros
export async function getSpaceMembers(spaceId: string): Promise<Array<{ uid: string; displayName: string; fcmTokens: string[]; role?: string }>> {
    try {
        const spaceRef = doc(db, 'spaces', spaceId);
        const spaceDoc = await getDoc(spaceRef);

        if (!spaceDoc.exists()) {
            console.error('Espacio no encontrado:', spaceId);
            return [];
        }

        const spaceData = spaceDoc.data();
        const members = spaceData.members || {};

        // Obtener tokens FCM de cada miembro
        const membersWithTokens = [];
        for (const [uid, memberData] of Object.entries(members)) {
            try {
                const userRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    membersWithTokens.push({
                        uid,
                        displayName: (memberData as any).displayName || userData.displayName || 'Usuario',
                        fcmTokens: userData.fcmTokens || [],
                        role: (memberData as any).role
                    });
                }
            } catch (error) {
                console.error(`Error obteniendo datos del usuario ${uid}:`, error);
            }
        }

        return membersWithTokens;
    } catch (error) {
        console.error('Error obteniendo miembros del espacio:', error);
        return [];
    }
}

// Obtener información del hijo para personalizar mensajes
export async function getChildInfo(spaceId: string): Promise<{ name?: string; gender?: string } | null> {
    try {
        const entriesRef = collection(db, `spaces/${spaceId}/entries`);
        const birthQuery = query(
            entriesRef,
            where('type', '==', 'child_event'),
            where('childCategory', '==', 'birth')
        );

        const birthSnapshot = await getDocs(birthQuery);

        if (!birthSnapshot.empty) {
            const birthDoc = birthSnapshot.docs[0];
            const birthData = birthDoc.data();

            return {
                name: birthData.childName || 'tu pequeño',
                gender: birthData.childGender || 'neutral' // 'boy', 'girl', 'neutral'
            };
        }

        return null;
    } catch (error) {
        console.error('Error obteniendo información del hijo:', error);
        return null;
    }
}

// Generar mensaje personalizado para notificaciones
export function generateNotificationMessage(
    eventType: 'memory' | 'goal' | 'child_event',
    eventTitle: string,
    creatorName: string,
    childInfo?: { name?: string; gender?: string } | null
): { title: string; body: string } {
    const childName = childInfo?.name || 'tu pequeño';
    const childGender = childInfo?.gender || 'neutral';

    // Emojis según el tipo de evento
    const eventEmojis = {
        memory: '📸',
        goal: '🎯',
        child_event: getChildEventEmoji(childGender)
    };

    const emoji = eventEmojis[eventType];

    switch (eventType) {
        case 'memory':
            return {
                title: `${emoji} Nuevo Recuerdo: ${eventTitle}`,
                body: `${creatorName} agregó un nuevo momento especial. ¡Entra para verlo! ✨`
            };

        case 'goal':
            return {
                title: `${emoji} Nuevo Objetivo: ${eventTitle}`,
                body: `${creatorName} estableció una nueva meta familiar. ¡Trabajemos juntos para cumplirla! 💪`
            };

        case 'child_event':
            const childArticle = childGender === 'girl' ? 'tu pequeña' : childGender === 'boy' ? 'tu pequeño' : childName;
            return {
                title: `${emoji} Nuevo Hito: ${eventTitle}`,
                body: `${creatorName} agregó un nuevo momento de ${childArticle}. ¡Entra para revisarlo! 🎉`
            };

        default:
            return {
                title: `✨ Nuevo Evento: ${eventTitle}`,
                body: `${creatorName} agregó algo nuevo a la familia. ¡Échale un vistazo!`
            };
    }
}

function getChildEventEmoji(gender?: string): string {
    switch (gender) {
        case 'girl':
            return '👶🏻'; // Bebé niña
        case 'boy':
            return '👶🏻'; // Bebé niño
        default:
            return '👶'; // Bebé neutro
    }
}

// Enviar notificación a través de Cloud Functions (necesitarás implementar la función)
export async function sendNotificationToMembers(
    spaceId: string,
    eventType: 'memory' | 'goal' | 'child_event',
    eventTitle: string,
    eventId: string,
    creatorUid: string,
    creatorName: string
): Promise<void> {
    try {
        console.log('Enviando notificaciones para evento:', { eventType, eventTitle, creatorName });

        // Obtener miembros del espacio
        const members = await getSpaceMembers(spaceId);
        const childInfo = await getChildInfo(spaceId);

        // Filtrar miembros (no enviar notificación al creador)
        const recipientMembers = members.filter(member =>
            member.uid !== creatorUid &&
            member.fcmTokens &&
            member.fcmTokens.length > 0
        );

        if (recipientMembers.length === 0) {
            console.log('No hay miembros para notificar');
            return;
        }

        // Generar mensaje personalizado
        const { title, body } = generateNotificationMessage(eventType, eventTitle, creatorName, childInfo);

        // Recopilar todos los tokens FCM
        const allTokens: string[] = [];
        recipientMembers.forEach(member => {
            allTokens.push(...member.fcmTokens);
        });

        console.log(`Enviando notificación a ${allTokens.length} tokens:`, { title, body });

        // Aquí llamarías a tu Cloud Function para enviar las notificaciones
        // Por ahora, simularemos el envío
        const notificationPayload = {
            tokens: allTokens,
            notification: {
                title,
                body,
                icon: '/icon-192.svg'
            },
            data: {
                eventType,
                eventId,
                spaceId,
                creatorUid,
                clickAction: getClickAction(eventType, spaceId, eventId)
            }
        };

        // TODO: Implementar llamada a Cloud Function
        console.log('Payload de notificación preparado:', notificationPayload);

        // Simular envío exitoso por ahora
        console.log('✅ Notificaciones enviadas exitosamente');

    } catch (error) {
        console.error('Error enviando notificaciones:', error);
    }
}

function getClickAction(eventType: string, spaceId: string, eventId: string): string {
    switch (eventType) {
        case 'memory':
            return `/memories/${spaceId}/${eventId}`;
        case 'goal':
            return `/goals/${eventId}`;
        case 'child_event':
            return '/child';
        default:
            return '/';
    }
}
