import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { DotsThree, MusicNote } from 'phosphor-react';
import { MediaCarousel, SimpleImage } from './';
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
    onOptionsClick?: () => void;
}

export function FeedPost({ entry, onClick, onOptionsClick }: FeedPostProps) {
    const [showFullDescription, setShowFullDescription] = useState(false);

    // Obtener perfil del usuario creador
    const { profile: creatorProfile, loading: creatorLoading } = useUserProfile(entry.createdBy);

    const hasMedia = entry.media && entry.media.length > 0;
    const hasMultipleMedia = hasMedia && entry.media!.length > 1;
    const hasSpotify = !!entry.spotify;

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

    // Truncar descripción si es muy larga
    const maxDescriptionLength = 150;
    const shouldTruncateDescription = entry.description && entry.description.length > maxDescriptionLength;
    const displayDescription = shouldTruncateDescription && !showFullDescription
        ? entry.description?.slice(0, maxDescriptionLength) + '...'
        : entry.description;

    return (
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header del post - Clickeable */}
            <div
                className="flex items-center justify-between p-4 pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onClick}
            >
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center overflow-hidden">
                        {creatorLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <SimpleImage
                                src={userAvatar}
                                alt={userName}
                                className="w-full h-full object-cover"
                                fallback={
                                    <span className="text-white font-bold text-sm">
                                        {userName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                                    </span>
                                }
                            />
                        )}
                    </div>

                    {/* Info del usuario */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm">{userName}</h3>
                            <span className={`${typeInfo.color} text-xs font-medium flex items-center gap-1`}>
                                {typeInfo.emoji} {typeInfo.label}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">{getTimeAgo()}</p>
                    </div>
                </div>

                {/* Opciones */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOptionsClick?.();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <DotsThree size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Contenido del post */}
            <div className="px-4 pb-3">
                {/* Título */}
                <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                    {entry.title}
                </h4>

                {/* Descripción */}
                {entry.description && (
                    <div className="text-gray-700 text-sm leading-relaxed">
                        <p className="whitespace-pre-wrap">{displayDescription}</p>
                        {shouldTruncateDescription && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFullDescription(!showFullDescription);
                                }}
                                className="text-purple-600 font-medium text-sm mt-1 hover:text-purple-700"
                            >
                                {showFullDescription ? 'Ver menos' : 'Ver más'}
                            </button>
                        )}
                    </div>
                )}

                {/* Indicador de música */}
                {hasSpotify && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <MusicNote size={12} className="text-white" weight="fill" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-green-800 font-medium text-xs truncate">
                                {entry.spotify?.name}
                            </p>
                            <p className="text-green-600 text-xs truncate">
                                {entry.spotify?.artists}
                            </p>
                        </div>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    </div>
                )}
            </div>

            {/* Media - Foto/Video/Carrusel */}
            {hasMedia && (
                <div className="relative">
                    {hasMultipleMedia ? (
                        <div className="relative">
                            <MediaCarousel
                                media={entry.media!}
                                title={entry.title}
                                className="aspect-[16/10]"
                            />
                            {/* Indicador de múltiples fotos */}
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                                {entry.media!.filter(m => m.type === 'image').length} fotos
                                {entry.media!.some(m => m.type === 'video') && ` + ${entry.media!.filter(m => m.type === 'video').length} videos`}
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-[16/10] bg-gray-100">
                            <SimpleImage
                                src={entry.media![0].url}
                                alt={entry.title}
                                className="w-full h-full object-cover"
                                fallback={
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <div className="text-center">
                                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-xs">Media no disponible</p>
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            )}


        </article>
    );
}
