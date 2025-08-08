import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './ui/RootLayout';
import { Home } from './screens/Home';
import { Memories } from './screens/Memories';
import { Goals } from './screens/Goals';
import { Child } from './screens/Child';
import { Profile } from './screens/Profile';
import NewMemory from './screens/NewMemory';
import NewGoal from './screens/NewGoal';
import NewChildEvent from './screens/NewChildEvent';
import MemoryDetail from './screens/MemoryDetail';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'memories', element: <Memories /> },
            { path: 'memories/new', element: <NewMemory /> },
            { path: 'goals', element: <Goals /> },
            { path: 'goals/new', element: <NewGoal /> },
            { path: 'child', element: <Child /> },
            { path: 'child/new', element: <NewChildEvent /> },
            { path: 'profile', element: <Profile /> },
            { path: '*', element: <Navigate to="/" replace /> }
        ]
    },
    // Páginas de detalle sin FAB/navbar
    {
        path: '/memories/:spaceId/:entryId',
        element: <MemoryDetail />
    }
]);


