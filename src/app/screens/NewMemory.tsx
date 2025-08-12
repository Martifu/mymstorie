import { useNavigate, useLocation } from 'react-router-dom';
import { EntryForm } from '../../components/EntryForm';
import { useAuth } from '../../features/auth/useAuth';
import { createMemory } from '../../features/entries/entriesService';

export default function NewMemory() {
    const { spaceId } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const prefilledTitle = location.state?.prefilledTitle || '';
    async function onSubmit(fd: FormData, onProgress?: (fileName: string, progress: number) => void) {
        if (!spaceId) return;
        await createMemory(spaceId, fd, onProgress);
        navigate('/');
    }
    return (
        <div className="bg-gray-50 p-4">
            <h2 className="text-xl font-semibold mb-2">Nuevo recuerdo</h2>
            <EntryForm onSubmit={onSubmit} initialTitle={prefilledTitle} />
        </div>
    );
}


