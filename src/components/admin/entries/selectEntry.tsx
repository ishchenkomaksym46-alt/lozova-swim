import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useState, useEffect} from "react";
import {api} from "../../../api/axios";

interface Competition {
    id: number;
    name: string;
    date: string;
}

interface Entry {
    id: number;
    name: string;
    createdAt: string;
    _count: {
        entryItems: number;
    };
}

export default function SelectEntryToAddParticipants() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useAdminAuth();

    useEffect(() => {
        const fetchCompetitions = async () => {
            try {
                const res = await api.get('/competitions');
                if (res.data.success) {
                    setCompetitions(res.data.data);
                }
            } catch (e) {
                console.error(e);
                setError("Помилка при завантаженні змагань");
            }
        };
        fetchCompetitions();
    }, []);

    useEffect(() => {
        if (selectedCompetitionId === 0) {
            setEntries([]);
            return;
        }

        const fetchEntries = async () => {
            setLoading(true);
            try {
                const res = await api.get('/entries', {
                    params: { id: selectedCompetitionId }
                });
                if (res.data.success) {
                    setEntries(res.data.data);
                } else {
                    setError(res.data.message);
                }
            } catch (e) {
                console.error(e);
                setError("Помилка при завантаженні заявок");
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, [selectedCompetitionId]);

    return (
        <div className="page-wrapper">
            <div className="container">
                <a href="/admin" className="back-link">← Назад до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">👥 Додати учасників до заявки</h1>
                    <p className="page-subtitle">Оберіть змагання та заявку для додавання учасників</p>
                </div>

                <div className="card">
                    <div className="form-group">
                        <label className="form-label" htmlFor="competition">Оберіть змагання:</label>
                        <select
                            id="competition"
                            className="form-input"
                            value={selectedCompetitionId}
                            onChange={(e) => setSelectedCompetitionId(Number(e.target.value))}
                        >
                            <option value={0}>-- Оберіть змагання --</option>
                            {competitions.map(comp => (
                                <option key={comp.id} value={comp.id}>
                                    {comp.name} ({comp.date})
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading && <div className="loading">Завантаження заявок</div>}

                    {error && <div className="alert alert-error">{error}</div>}

                    {selectedCompetitionId !== 0 && !loading && entries.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3 className="empty-state-title">Немає заявок</h3>
                            <p className="empty-state-text">
                                Для цього змагання ще не створено заявок. <a href="/admin/entries/create" style={{ color: 'var(--water-medium)', textDecoration: 'underline' }}>Створити нову заявку</a>
                            </p>
                        </div>
                    )}

                    {entries.length > 0 && (
                        <>
                            <h3 className="card-title" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Оберіть заявку:</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--gray-100)' }}>
                                            <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Назва заявки</th>
                                            <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Учасників</th>
                                            <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Дата створення</th>
                                            <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Дія</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map((entry, idx) => (
                                            <tr key={entry.id} style={{ background: idx % 2 === 0 ? 'var(--white)' : 'var(--gray-50)' }}>
                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>{entry.name}</td>
                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center' }}>{entry._count?.entryItems || 0}</td>
                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem' }}>{new Date(entry.createdAt).toLocaleString('uk-UA')}</td>
                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center' }}>
                                                    <a href={`/admin/entries/items/add?id=${entry.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                                        ➕ Додати учасників
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
