import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { SimpleImage } from './';
import { useUserProfile } from '../hooks/useUserProfile';

type Media = {
    url: string;
    type: 'image' | 'video';
    width?: number;
    height?: number;
};

type FeedEntry = {
    id: string;
    type: 'memory' | 'goal' | 'child_event';
    title: string;
    description?: string;
    date: string | Date;
    createdBy?: string; // uid del usuario que creó la entry
    media?: Media[];
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

interface FeedPostProps {
    entry: FeedEntry;
    onClick?: () => void;
}

export function FeedPost({ entry, onClick }: FeedPostProps) {

    // Obtener perfil del usuario creador
    const { profile: creatorProfile, loading: creatorLoading } = useUserProfile(entry.createdBy);

    const hasSpotify = !!entry.spotify;

    // Buscar la primera imagen para usar como thumbnail
    const thumbnailImage = entry.media?.find(item => item.type === 'image');

    // Formatear tiempo relativo
    const getTimeAgo = () => {
        const date = entry.date instanceof Date ? entry.date :
            (entry.date as any)?.toDate?.() || new Date(entry.date);
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
    };

    // Obtener emoji y color según tipo
    const getTypeInfo = () => {
        switch (entry.type) {
            case 'memory':
                return { emoji: '📸', color: 'text-purple-600', label: 'Recuerdo' };
            case 'goal':
                return { emoji: '🎯', color: 'text-blue-600', label: 'Objetivo' };
            case 'child_event':
                return { emoji: '👶', color: 'text-yellow-600', label: 'Hito del hijo' };
            default:
                return { emoji: '📝', color: 'text-gray-600', label: 'Post' };
        }
    };

    const typeInfo = getTypeInfo();
    const userName = creatorProfile?.displayName || 'Familia';
    const userAvatar = creatorProfile?.photoURL;




    return (
        <article
            className="relative overflow-hidden rounded-3xl shadow-xl cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
            onClick={onClick}
        >
            {/* Fondo de imagen */}
            {thumbnailImage ? (
                <div className="aspect-[4/5] relative">
                    <SimpleImage
                        src={thumbnailImage.url}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                        fallback={
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500" />
                        }
                    />

                    {/* Overlay gradient para legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                </div>
            ) : (
                <div className="aspect-[4/5] bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
            )}

            {/* Header flotante con avatar y opciones */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-white shadow-lg border-2 border-white/50 flex items-center justify-center overflow-hidden">
                            {creatorLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <SimpleImage
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-full h-full object-cover"
                                    priority={true}
                                    fallback={
                                        <span className="text-gray-700 font-bold text-xs">
                                            {userName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                                        </span>
                                    }
                                />
                            )}
                        </div>

                        {/* Info del usuario */}
                        <div>
                            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{userName}</h3>
                            <p className="text-white/80 text-xs drop-shadow-lg">{getTimeAgo()}</p>
                        </div>
                    </div>

                    {/* Opciones */}

                </div>
            </div>

            {/* Indicadores superiores */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Tipo de entrada */}
                <div className="px-2 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full">
                    <span className="text-white text-xs font-medium flex items-center gap-1">
                        {typeInfo.emoji} {typeInfo.label}
                    </span>
                </div>
            </div>


            {/* Contenido inferior superpuesto */}
            <div className="absolute inset-x-0 bottom-0 p-6">
                {/* Título */}
                <h4 className="text-white font-bold text-lg mb-2 leading-tight drop-shadow-lg line-clamp-2">
                    {entry.title}
                </h4>

                {/* Descripción */}
                {entry.description && (
                    <div className="text-white/90 text-sm leading-relaxed drop-shadow-lg">
                        <p className="line-clamp-2">{entry.description}</p>
                    </div>
                )}

                {/* Indicador de música en texto */}
                {hasSpotify && (
                    <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <p className="text-green-400 text-xs font-medium truncate drop-shadow-lg">
                            {entry.spotify?.name} • {entry.spotify?.artists}
                        </p>
                    </div>
                )}
            </div>
        </article>
    );
}
