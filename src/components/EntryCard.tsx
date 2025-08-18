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
  const hasMedia = (entry.media?.length || 0) > 0;
  const hasSpotify = !!entry.spotify;

  return (
    <article onClick={onClick} className="relative overflow-hidden rounded-xl shadow-soft cursor-pointer active:scale-pressed transition">
      <div className="aspect-[4/5] bg-surface-muted">
        {hasMedia ? (
          <img
            src={entry.media![0].url}
            alt={entry.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">Sin imagen</p>
            </div>
          </div>
        )}
      </div>

      {/* Spotify Music Indicator - Mini Vinyl */}
      {hasSpotify && (
        <div className="absolute top-2 right-2">
          <div
            className="w-8 h-8 rounded-full shadow-lg overflow-hidden animate-spin-slow"
            style={{
              background: entry.spotify?.album_image
                ? `url(${entry.spotify.album_image})`
                : 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animationDuration: '6s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite'
            }}
          >
            {/* Vinyl effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-black/30" />

            {/* Center hole */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full shadow-inner" />

            {/* Vinyl groove */}
            <div className="absolute inset-1 rounded-full border border-black/20" />

            {/* Music icon if no album image */}
            {!entry.spotify?.album_image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-3 h-3 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-brand-cosmos/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2">
        <h3 className="text-white text-sm font-semibold line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{entry.title}</h3>
        {entry.description && (
          <p className="text-white/90 text-[11px] mt-0.5 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{entry.description}</p>
        )}
        {hasSpotify && (
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-green-400 text-[10px] font-medium truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              {entry.spotify?.name} • {entry.spotify?.artists}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}


