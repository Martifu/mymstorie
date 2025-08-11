import { useState } from 'react';
import clsx from 'clsx';
import { Add, Image, DocumentText, Profile2User } from 'iconsax-react';

export function FAB({ onPick }: { onPick: (type: 'memory' | 'goal' | 'child_event') => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-20 right-6 z-50">
      {open && (
        <>
          <button
            aria-label="Cerrar menú"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className={clsx('absolute right-0 bottom-full mb-3 transition-all duration-300 translate-y-0 opacity-100')}>
            <div className="rounded-2xl bg-white shadow-softer border overflow-hidden min-w-[220px]">
              <button className="w-full flex items-center gap-3 px-4 py-3 hocus:bg-brand-purple/10"
                onClick={() => { setOpen(false); onPick('memory'); }}>
                <Image size={20} variant="Bold" color="#8B5CF6" />
                <div>
                  <div className="text-sm font-semibold">Nuevo recuerdo</div>
                  <div className="text-xs text-text-muted">Sube fotos o video</div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hocus:bg-brand-blue/10"
                onClick={() => { setOpen(false); onPick('goal'); }}>
                <DocumentText size={20} variant="Bold" color="#3B82F6" />
                <div>
                  <div className="text-sm font-semibold">Nuevo objetivo</div>
                  <div className="text-xs text-text-muted">Metas familiares</div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hocus:bg-brand-gold/10"
                onClick={() => { setOpen(false); onPick('child_event'); }}>
                <Profile2User size={20} variant="Bold" color="#F59E0B" />
                <div>
                  <div className="text-sm font-semibold">Nuevo hito</div>
                  <div className="text-xs text-text-muted">Momentos del peque</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      <button
        className={clsx(
          'h-14 w-14 rounded-full bg-brand-purple text-white shadow-softer transition duration-300 active:scale-pressed'
        )}
        onClick={() => setOpen((v) => !v)}
        aria-label="Crear"
      >
        <Add size={28} variant="Bold" color="#FFFFFF" className="m-auto" />
      </button>
    </div>
  );
}


