import {useEffect, useState} from "react";
import {api} from "../../../api/axios";

type CompetitionType = {
    id: number;
    name: string;
    date: string;
}

type SwimmerType = {
    id: number;
    name: string;
    surname: string;
    birthYear: number;
}

export default function UpdateSportmen() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [swimmers, setSwimmers] = useState<SwimmerType[]>([]);
    const [competitionId, setCompetitionId] = useState<string>("");
    const [swimmerId, setSwimmerId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [birthYear, setBirthYear] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingSwimmers, setLoadingSwimmers] = useState<boolean>(false);

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

    useEffect(() => {
        if(!competitionId) {
            setSwimmers([]);
            return;
        }

        const getSwimmers = async () => {
            setLoadingSwimmers(true);
            try {
                const res = await api.get('/swimmers', {
                    params: {
                        competitionId,
                        page: 1
                    }
                });

                if(res.status === 200) {
                    setSwimmers(res.data.swimmers);
                }
            } catch (e) {
                console.error(e);
                setError("Помилка завантаження спортсменів");
            } finally {
                setLoadingSwimmers(false);
            }
        }

        getSwimmers();
    }, [competitionId]);

    useEffect(() => {
        if(!swimmerId) {
            setName("");
            setSurname("");
            setBirthYear("");
            return;
        }

        const swimmer = swimmers.find(s => s.id === Number(swimmerId));
        if(swimmer) {
            setName(swimmer.name);
            setSurname(swimmer.surname);
            setBirthYear(String(swimmer.birthYear));
        }
    }, [swimmerId, swimmers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if(!swimmerId) {
            setError("Оберіть спортсмена");
            setLoading(false);
            return;
        }

        const data: any = {};

        if(name) data.name = name;
        if(surname) data.surname = surname;
        if(birthYear) {
            const year = Number(birthYear);
            if(isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
                setError("Невірний рік народження");
                setLoading(false);
                return;
            }
            data.birthYear = year;
        }

        if(Object.keys(data).length === 0) {
            setError("Немає даних для оновлення");
            setLoading(false);
            return;
        }

        try {
            const res = await api.put('/swimmers/update', {
                id: Number(swimmerId),
                ...data
            });

            if(res.status === 200) {
                setSuccess("Дані спортсмена успішно оновлено");
                // Оновлюємо список спортсменів
                setSwimmers(swimmers.map(s =>
                    s.id === Number(swimmerId)
                        ? { ...s, ...data }
                        : s
                ));
            } else {
                setError(res.data.message || "Помилка при оновленні спортсмена");
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
            <h1>Оновити дані спортсмена</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Змагання:</label>
                    <select
                        value={competitionId}
                        onChange={(e) => {
                            setCompetitionId(e.target.value);
                            setSwimmerId("");
                        }}
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

                {loadingSwimmers && <p>Завантаження спортсменів...</p>}

                {competitionId && !loadingSwimmers && (
                    <div>
                        <label>Спортсмен:</label>
                        <select
                            value={swimmerId}
                            onChange={(e) => setSwimmerId(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">-- Оберіть спортсмена --</option>
                            {swimmers.map((swimmer) => (
                                <option key={swimmer.id} value={swimmer.id}>
                                    {swimmer.surname} {swimmer.name} ({swimmer.birthYear})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {swimmerId && (
                    <>
                        <div>
                            <label>Ім'я:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                placeholder="Введіть нове ім'я"
                            />
                        </div>

                        <div>
                            <label>Прізвище:</label>
                            <input
                                type="text"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                disabled={loading}
                                placeholder="Введіть нове прізвище"
                            />
                        </div>

                        <div>
                            <label>Рік народження:</label>
                            <input
                                type="number"
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                                disabled={loading}
                                placeholder="Введіть новий рік"
                                min="1900"
                                max={new Date().getFullYear()}
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Оновлення..." : "Оновити дані"}
                        </button>
                    </>
                )}
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    )
}
