type Media = { url: string; type: 'image' | 'video'; width?: number; height?: number; };
type Entry = {
  id: string; type: 'memory' | 'goal' | 'child_event';
  title: string; description?: string; date: string; media?: Media[];
  favorites?: Record<string, true>; reactions?: Record<string, 'heart'>;
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

export function EntryCard({ entry, onClick }: { entry: Entry; onClick?: () => void }) {
  const hasSpotify = !!entry.spotify;

  // Buscar la primera imagen para usar como thumbnail
  const thumbnailImage = entry.media?.find(item => item.type === 'image');

  return (
    <article
      onClick={onClick}
      className="relative overflow-hidden rounded-3xl shadow-xl cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Fondo de imagen */}
      <div className="aspect-[4/5] relative">
        {thumbnailImage ? (
          <>
            <img
              src={thumbnailImage.url}
              alt={entry.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />

            {/* Overlay gradient para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/60">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Sin imagen</p>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Contenido inferior superpuesto */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-white font-bold text-base leading-tight line-clamp-2 drop-shadow-lg mb-1">
          {entry.title}
        </h3>
        {entry.description && (
          <p className="text-white/90 text-sm mt-1 line-clamp-2 drop-shadow-lg">
            {entry.description}
          </p>
        )}
        {hasSpotify && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-green-400 text-xs font-medium truncate drop-shadow-lg">
              {entry.spotify?.name} • {entry.spotify?.artists}
            </p>
          </div>
        )}
      </div>

      {/* Efecto de hover sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/0 group-hover:to-white/5 transition-all duration-300" />
    </article>
  );
}


