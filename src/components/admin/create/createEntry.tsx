import {useSearchParams} from "react-router-dom";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useState, useEffect} from "react";
import {api} from "../../../api/axios";

interface Competition {
    id: number;
    name: string;
    date: string;
}

export default function CreateEntry() {
    const [searchParam] = useSearchParams();
    const urlCompetitionId = searchParam.get("id");
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<number>(urlCompetitionId ? Number(urlCompetitionId) : 0);
    const [entryName, setEntryName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useAdminAuth();

    useEffect(() => {
        const fetchCompetitions = async () => {
            try {
                const res = await api.get('/competitions');
                if (res.data.success) {
                    setCompetitions(res.data.data);
                    // If URL has competition ID, use it
                    if (urlCompetitionId) {
                        setSelectedCompetitionId(Number(urlCompetitionId));
                    }
                }
            } catch (e) {
                console.error(e);
                setError("Помилка при завантаженні змагань");
            } finally {
                setLoading(false);
            }
        };
        fetchCompetitions();
    }, [urlCompetitionId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedCompetitionId || selectedCompetitionId === 0) {
            setError("Оберіть змагання");
            return;
        }

        try {
            const res = await api.post('/entries/create', {
                competitionId: selectedCompetitionId,
                name: entryName
            });

            if (res.data.success) {
                setSuccess(`Заявку створено! ID: ${res.data.data.id}`);
                setEntryName("");
                // Redirect to add participants
                setTimeout(() => {
                    window.location.href = `/admin/entries/items/add?id=${res.data.data.id}`;
                }, 1500);
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || "Невідома помилка");
        }
    }

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <div className="loading">Завантаження змагань</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: '600px' }}>
                <a href="/admin" className="back-link">← Назад до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">📝 Створити заявку</h1>
                    <p className="page-subtitle">Спочатку створіть заявку, потім додайте до неї учасників</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="competition">Оберіть змагання:</label>
                            <select
                                id="competition"
                                className="form-input"
                                value={selectedCompetitionId}
                                onChange={(e) => setSelectedCompetitionId(Number(e.target.value))}
                                required
                            >
                                <option value={0}>-- Оберіть змагання --</option>
                                {competitions.map(comp => (
                                    <option key={comp.id} value={comp.id}>
                                        {comp.name} ({comp.date})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="entryName">Назва заявки:</label>
                            <input
                                id="entryName"
                                type="text"
                                className="form-input"
                                value={entryName}
                                onChange={(e) => setEntryName(e.target.value)}
                                placeholder="Назва заявки (наприклад, назва команди)"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full">Створити заявку</button>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    );
}
