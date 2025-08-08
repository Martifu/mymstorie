import { useAuth } from '../../features/auth/useAuth';

export function Profile() {
    const { user, signOutApp } = useAuth();
    return (
        <div>
            <h2 className="text-xl font-semibold">Perfil</h2>
            <div className="mt-3 rounded-2xl border bg-white p-4 shadow-soft">
                <p className="text-sm">Sesión iniciada como:</p>
                <p className="font-semibold">{user?.displayName} <span className="text-text-muted text-sm">({user?.email})</span></p>
                <button onClick={signOutApp} className="mt-4 rounded-pill bg-brand-blue text-white py-2 px-4 font-semibold active:scale-pressed transition">Cerrar sesión</button>
            </div>
        </div>
    );
}


