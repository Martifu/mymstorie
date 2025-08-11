import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { Home2, Image, DocumentText, Profile as ProfileIcon, People } from 'iconsax-react';
import { FAB } from '../../components';
import { motion } from 'framer-motion';

export function RootLayout() {
    const { user, loading, signInWithGoogle } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isCreationPage = location.pathname.includes('/new') || location.pathname.includes('/edit');
    const isDetailPage = location.pathname.includes('/memories/') && location.pathname.split('/').length > 2;
    const showFAB = !location.pathname.startsWith('/profile') && !isCreationPage && !isDetailPage;
    const showNavbar = !isCreationPage && !isDetailPage;

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
            <div className="mx-auto max-w-screen-sm">
                <Outlet />
            </div>
            {showFAB && (
                <FAB onPick={(type) => {
                    if (type === 'memory') navigate('/memories/new');
                    else if (type === 'goal') navigate('/goals/new');
                    else navigate('/child/new');
                }} />
            )}
            {showNavbar && (
                <motion.nav
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="fixed bottom-5 left-0 right-0 mx-auto max-w-screen-sm z-50"
                >
                    <div className="mx-4 rounded-2xl border bg-white/95 backdrop-blur shadow-softer grid grid-cols-5 p-1">
                        <Tab to="/" label="Inicio" Icon={Home2} />
                        <Tab to="/memories" label="Recuerdos" Icon={Image} />
                        <Tab to="/goals" label="Objetivos" Icon={DocumentText} />
                        <Tab to="/child" label="Hijo" Icon={People} />
                        <Tab to="/profile" label="Perfil" Icon={ProfileIcon} />
                    </div>
                </motion.nav>
            )}
        </div>
    );
}

type IconProps = { size?: string | number; color?: string; variant?: any };
type IconComponent = ComponentType<IconProps>;
function Tab({ to, label, Icon }: { to: string; label: string; Icon: IconComponent }) {
    return (
        <NavLink
            to={to}
            aria-label={label}
            className={({ isActive }) =>
                `relative py-2 px-1 flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 rounded-xl ${isActive
                    ? 'text-brand-purple bg-brand-purple/10'
                    : 'text-text-muted hover:text-brand-purple hover:bg-brand-purple/5'
                }`
            }
        >
            {({ isActive }) => (
                <motion.div
                    initial={false}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center gap-1"
                >
                    <Icon size={20} variant={isActive ? "Bold" : "Outline"} color={isActive ? '#8B5CF6' : '#A3A3A3'} />
                    <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {label}
                    </span>

                </motion.div>
            )}
        </NavLink>
    );
}


