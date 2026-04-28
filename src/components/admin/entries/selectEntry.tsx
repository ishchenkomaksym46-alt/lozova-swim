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
        <div>
            <a href="/admin">Повернутися до консолі</a>
            <h2>Додати учасників до заявки</h2>

            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="competition">Оберіть змагання:</label>
                <br />
                <select
                    id="competition"
                    value={selectedCompetitionId}
                    onChange={(e) => setSelectedCompetitionId(Number(e.target.value))}
                    style={{ padding: "5px", minWidth: "300px" }}
                >
                    <option value={0}>-- Оберіть змагання --</option>
                    {competitions.map(comp => (
                        <option key={comp.id} value={comp.id}>
                            {comp.name} ({comp.date})
                        </option>
                    ))}
                </select>
            </div>

            {loading && <p>Завантаження заявок...</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {selectedCompetitionId !== 0 && !loading && entries.length === 0 && (
                <p>Немає заявок для цього змагання. <a href="/admin/entries/create">Створити нову заявку</a></p>
            )}

            {entries.length > 0 && (
                <div>
                    <h3>Оберіть заявку:</h3>
                    <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th>Назва заявки</th>
                                <th>Кількість учасників</th>
                                <th>Дата створення</th>
                                <th>Дія</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(entry => (
                                <tr key={entry.id}>
                                    <td>{entry.name}</td>
                                    <td>{entry._count.entryItems}</td>
                                    <td>{new Date(entry.createdAt).toLocaleString('uk-UA')}</td>
                                    <td>
                                        <a href={`/admin/entries/items/add?id=${entry.id}`}>
                                            <button>Додати учасників</button>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
