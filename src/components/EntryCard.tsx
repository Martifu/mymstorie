import { Heart, Star, Share } from 'phosphor-react';

type Media = { url: string; type: 'image'|'video'; width?: number; height?: number; };
type Entry = {
  id: string; type: 'memory'|'goal'|'child_event';
  title: string; description?: string; date: string; media?: Media[];
  favorites?: Record<string, true>; reactions?: Record<string, 'heart'>;
};

export function EntryCard({ entry, onFavorite, onReact, onShare }: {
  entry: Entry; onFavorite: () => void; onReact: () => void; onShare: () => void;
}) {
  const hasMedia = (entry.media?.length || 0) > 0;
  return (
    <article className="bg-surface rounded-2xl shadow-soft overflow-hidden">
      {hasMedia && (
        <div className="aspect-[4/5] bg-surface-muted">
          <img src={entry.media![0].url} alt={entry.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{entry.title}</h3>
        {entry.description && <p className="text-text-muted mt-1">{entry.description}</p>}
        <div className="mt-3 flex items-center gap-3">
          <button className="flex items-center gap-1 text-text-muted hocus:text-text" onClick={onReact}><Heart weight="fill" /></button>
          <button className="flex items-center gap-1 text-text-muted hocus:text-text" onClick={onFavorite}><Star weight="fill" /></button>
          <button className="ml-auto flex items-center gap-1 text-text-muted hocus:text-text" onClick={onShare}><Share /></button>
        </div>
      </div>
    </article>
  );
}


