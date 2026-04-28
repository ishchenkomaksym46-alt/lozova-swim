import {useEffect, useState} from "react";
import {api} from "../../../api/axios";

type CompetitionType = {
    id: number;
    name: string;
    date: string;
}

export default function CreateSportmen() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [competitionId, setCompetitionId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [birthYear, setBirthYear] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const getCompetitions = async () => {
            try {
                const res = await api.get('/competitions');
                if(res.status === 200) {
                    setCompetitions(res.data.data);
                }
            } catch (e) {
                console.error(e);
                setError("Помилка завантаження змагань");
            }
        }

        getCompetitions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if(!competitionId || !name || !surname || !birthYear) {
            setError("Заповніть всі поля");
            setLoading(false);
            return;
        }

        const year = Number(birthYear);
        if(isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
            setError("Невірний рік народження");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/swimmers/create', {
                name,
                surname,
                birthYear: year,
                competitionId: Number(competitionId)
            });

            if(res.status === 200) {
                setSuccess("Спортсмена успішно додано");
                setName("");
                setSurname("");
                setBirthYear("");
            } else {
                setError(res.data.message || "Помилка при створенні спортсмена");
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
            <a href="/admin">Назад до адмін панелі</a>
            <h1>Додати спортсмена</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Змагання:</label>
                    <select
                        value={competitionId}
                        onChange={(e) => setCompetitionId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">-- Оберіть змагання --</option>
                        {competitions.map((comp) => (
                            <option key={comp.id} value={comp.id}>
                                {comp.name} ({comp.date})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Ім'я:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        placeholder="Введіть ім'я"
                    />
                </div>

                <div>
                    <label>Прізвище:</label>
                    <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        disabled={loading}
                        placeholder="Введіть прізвище"
                    />
                </div>

                <div>
                    <label>Рік народження:</label>
                    <input
                        type="number"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        disabled={loading}
                        placeholder="Наприклад: 2010"
                        min="1900"
                        max={new Date().getFullYear()}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Додавання..." : "Додати спортсмена"}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    )
}
