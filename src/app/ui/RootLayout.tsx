import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { Home2, Image, DocumentText, Profile as ProfileIcon, People } from 'iconsax-react';
import { FAB } from '../../components';

export function RootLayout() {
    const { user, loading, signInWithGoogle } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const showFAB = !location.pathname.startsWith('/profile');

    if (loading) return <div className="p-6">Cargando…</div>;
    if (!user) {
        return (
            <div className="min-h-dvh grid place-items-center p-6">
                <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-soft">
                    <h1 className="text-xl font-bold mb-2">mymstorie</h1>
                    <p className="text-text-muted mb-4">Tu rincón familiar privado ✨</p>
                    <button onClick={signInWithGoogle} className="w-full rounded-pill bg-brand-blue text-white py-3 font-semibold active:scale-pressed transition">Continuar con Google</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-surface text-text pb-20">
            <div className="mx-auto max-w-screen-sm p-4">
                <Outlet />
            </div>
            {showFAB && (
                <FAB onPick={(type) => {
                    if (type === 'memory') navigate('/memories/new');
                    else if (type === 'goal') navigate('/goals/new');
                    else navigate('/child/new');
                }} />
            )}
            <nav className="fixed bottom-5 left-0 right-0 mx-auto max-w-screen-sm">
                <div className="mx-4 rounded-2xl border bg-white/90 backdrop-blur shadow-softer grid grid-cols-5">
                    <Tab to="/" ariaLabel="Inicio" Icon={Home2} />
                    <Tab to="/memories" ariaLabel="Recuerdos" Icon={Image} />
                    <Tab to="/goals" ariaLabel="Objetivos" Icon={DocumentText} />
                    <Tab to="/child" ariaLabel="Hijo" Icon={People} />
                    <Tab to="/profile" ariaLabel="Perfil" Icon={ProfileIcon} />
                </div>
            </nav>
        </div>
    );
}

type IconProps = { size?: string | number; color?: string; variant?: any };
type IconComponent = ComponentType<IconProps>;
function Tab({ to, ariaLabel, Icon }: { to: string; ariaLabel: string; Icon: IconComponent }) {
    return (
        <NavLink
            to={to}
            aria-label={ariaLabel}
            className={({ isActive }) => `py-3 grid place-items-center text-sm ${isActive ? 'text-brand-purple' : 'text-text-muted'}`}
        >
            {({ isActive }) => <Icon size={24} variant="Bold" color={isActive ? '#8B5CF6' : '#A3A3A3'} />}
        </NavLink>
    );
}


