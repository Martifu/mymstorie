import { Plus } from 'phosphor-react';
import { useState } from 'react';
import clsx from 'clsx';

export function FAB({ onPick }: { onPick: (type: 'memory'|'goal'|'child_event') => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 grid gap-2">
          <button className="px-3 py-2 rounded-pill bg-surface shadow-soft text-text hocus:shadow-softer transition"
            onClick={() => { setOpen(false); onPick('memory'); }}>Nuevo recuerdo</button>
          <button className="px-3 py-2 rounded-pill bg-surface shadow-soft text-text hocus:shadow-softer transition"
            onClick={() => { setOpen(false); onPick('goal'); }}>Nueva meta</button>
          <button className="px-3 py-2 rounded-pill bg-surface shadow-soft text-text hocus:shadow-softer transition"
            onClick={() => { setOpen(false); onPick('child_event'); }}>Nuevo hito</button>
        </div>
      )}
      <button
        className={clsx(
          'h-14 w-14 rounded-full bg-brand-ochre text-white shadow-softer transition duration-fast active:scale-pressed'
        )}
        onClick={() => setOpen((v) => !v)}
        aria-label="Crear"
      >
        <Plus size={28} className="m-auto" />
      </button>
    </div>
  );
}


