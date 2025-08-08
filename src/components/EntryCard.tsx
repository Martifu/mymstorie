type Media = { url: string; type: 'image' | 'video'; width?: number; height?: number; };
type Entry = {
  id: string; type: 'memory' | 'goal' | 'child_event';
  title: string; description?: string; date: string; media?: Media[];
  favorites?: Record<string, true>; reactions?: Record<string, 'heart'>;
};

export function EntryCard({ entry, onClick }: { entry: Entry; onClick?: () => void }) {
  const hasMedia = (entry.media?.length || 0) > 0;
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-brand-cosmos/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2">
        <h3 className="text-white text-sm font-semibold line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{entry.title}</h3>
        {entry.description && (
          <p className="text-white/90 text-[11px] mt-0.5 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{entry.description}</p>
        )}
      </div>
    </article>
  );
}


