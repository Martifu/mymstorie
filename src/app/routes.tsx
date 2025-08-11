import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './ui/RootLayout';
import { Home } from './screens/Home';
import { Memories } from './screens/Memories';
import { Goals } from './screens/Goals';
import { Child } from './screens/Child';
import { Profile } from './screens/Profile';
import NewMemory from './screens/NewMemory';
import NewChildEvent from './screens/NewChildEvent';
import MemoryDetail from './screens/MemoryDetail';
import { CompleteGoal } from './screens/CompleteGoal';
import GoalDetail from './screens/GoalDetail';
import NewGoal from './screens/NewGoal';

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
            { path: 'goals/:goalId/complete', element: <CompleteGoal /> },
            { path: 'goals/:goalId', element: <GoalDetail /> },
            { path: 'child', element: <Child /> },
            { path: 'child/new', element: <NewChildEvent /> },
            { path: 'memories/:spaceId/:entryId', element: <MemoryDetail /> },
            { path: 'profile', element: <Profile /> },
            { path: '*', element: <Navigate to="/" replace /> }
        ]
    }
]);


