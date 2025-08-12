import { useAuth } from '../features/auth/useAuth';
import { useSpaces } from '../features/spaces/useSpaces';

export function DebugInfo() {
    const { user, loading } = useAuth();
    const { userProfile, loading: spacesLoading } = useSpaces();

    // Solo mostrar en desarrollo o cuando hay problemas
    if (import.meta.env.PROD) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-red-100 border-b-2 border-red-300 p-2 text-xs z-50 overflow-auto max-h-32">
            <div className="font-bold text-red-800 mb-1">🐛 Debug Info (iOS PWA)</div>
            <div className="grid grid-cols-2 gap-2 text-red-700">
                <div>
                    <strong>Auth:</strong><br />
                    Loading: {loading.toString()}<br />
                    User: {user ? `${user.displayName} (${user.uid.slice(0, 8)}...)` : 'null'}
                </div>
                <div>
                    <strong>Spaces:</strong><br />
                    Loading: {spacesLoading.toString()}<br />
                    Profile: {userProfile ? `SpaceID: ${userProfile.currentSpaceId?.slice(0, 8) || 'none'}...` : 'null'}
                </div>
            </div>
            <div className="mt-1">
                <strong>PWA:</strong> Standalone: {((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches).toString()},
                iOS: {(/iPad|iPhone|iPod/.test(navigator.userAgent)).toString()}
            </div>
        </div>
    );
}
