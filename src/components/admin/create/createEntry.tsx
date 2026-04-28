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
        return <div>Завантаження...</div>;
    }

    return (
        <div>
            <a href="/admin">Повернутися до консолі</a>
            <h2>Створити заявку</h2>
            <p>Спочатку створіть заявку, потім додайте до неї учасників</p>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="competition">Оберіть змагання:</label>
                    <br />
                    <select
                        id="competition"
                        value={selectedCompetitionId}
                        onChange={(e) => setSelectedCompetitionId(Number(e.target.value))}
                        required
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
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="entryName">Назва заявки:</label>
                    <br />
                    <input
                        id="entryName"
                        type="text"
                        value={entryName}
                        onChange={(e) => setEntryName(e.target.value)}
                        placeholder="Назва заявки (наприклад, назва команди)"
                        required
                        style={{ padding: "5px", minWidth: "300px" }}
                    />
                </div>
                <button type="submit">Створити заявку</button>
            </form>
            <p className="success">{success}</p>
            <p style={{ color: "red" }}>{error}</p>
        </div>
    );
}
