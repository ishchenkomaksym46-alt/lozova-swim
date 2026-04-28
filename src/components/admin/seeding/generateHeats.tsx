import {useSearchParams} from "react-router-dom";
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

export default function GenerateHeats() {
    const [searchParam] = useSearchParams();
    const urlEntryId = searchParam.get("id");
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<number>(0);
    const [selectedEntryId, setSelectedEntryId] = useState<number>(urlEntryId ? Number(urlEntryId) : 0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [generatedHeats, setGeneratedHeats] = useState<any[]>([]);

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
            try {
                const res = await api.get('/entries', {
                    params: { id: selectedCompetitionId }
                });
                if (res.data.success) {
                    setEntries(res.data.data);
                }
            } catch (e) {
                console.error(e);
                setError("Помилка при завантаженні заявок");
            }
        };
        fetchEntries();
    }, [selectedCompetitionId]);

    async function handleGenerate() {
        setError(null);
        setSuccess(null);

        if (!selectedEntryId || selectedEntryId === 0) {
            setError("Оберіть заявку");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/seeding/generate', {}, {
                params: { id: selectedEntryId }
            });

            if (res.data.success) {
                setSuccess(res.data.message);
                setGeneratedHeats(res.data.data || []);
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || "Невідома помилка");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <a href="/admin">Повернутися до консолі</a>
            <h2>Автоматичне формування заплавів</h2>
            <p>Ця функція автоматично створить заплави на основі заявок для обраної заявки.</p>
            <p>Учасники будуть згруповані за віковими категоріями, відсортовані за роком народження (молодші першими) та заявленим часом.</p>

            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="competition">Оберіть змагання:</label>
                <br />
                <select
                    id="competition"
                    value={selectedCompetitionId}
                    onChange={(e) => {
                        setSelectedCompetitionId(Number(e.target.value));
                        setSelectedEntryId(0);
                        setError(null);
                        setSuccess(null);
                    }}
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

            {selectedCompetitionId !== 0 && (
                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="entry">Оберіть заявку:</label>
                    <br />
                    <select
                        id="entry"
                        value={selectedEntryId}
                        onChange={(e) => {
                            setSelectedEntryId(Number(e.target.value));
                            setError(null);
                            setSuccess(null);
                        }}
                        style={{ padding: "5px", minWidth: "300px" }}
                    >
                        <option value={0}>-- Оберіть заявку --</option>
                        {entries.map(entry => (
                            <option key={entry.id} value={entry.id}>
                                {entry.name} (Учасників: {entry._count.entryItems})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <button onClick={handleGenerate} disabled={loading || selectedEntryId === 0}>
                {loading ? "Формування..." : "Сформувати заплави"}
            </button>

            {success && (
                <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#d4edda", border: "1px solid #c3e6cb" }}>
                    <p className="success">{success}</p>
                    {generatedHeats.length > 0 && (
                        <div>
                            <h3>Створені заплави:</h3>
                            <ul>
                                {generatedHeats.map((heat, index) => (
                                    <li key={index}>
                                        Заплив #{heat.heatNumber} - Вікова група: {heat.ageGroup} - Учасників: {heat.participantCount}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <a href={`/start-list?id=${selectedEntryId}`}>Переглянути стартові протоколи</a>
                </div>
            )}

            {error && (
                <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb" }}>
                    <p style={{ color: "red" }}>{error}</p>
                </div>
            )}
        </div>
    );
}
