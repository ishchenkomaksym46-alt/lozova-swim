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

export default function DeleteSportmen() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [swimmers, setSwimmers] = useState<SwimmerType[]>([]);
    const [competitionId, setCompetitionId] = useState<string>("");
    const [swimmerId, setSwimmerId] = useState<string>("");
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

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if(!swimmerId) {
            setError("Оберіть спортсмена");
            setLoading(false);
            return;
        }

        try {
            const res = await api.delete('/swimmers/delete', {
                params: {
                    id: Number(swimmerId)
                }
            });

            if(res.status === 200) {
                setSuccess("Спортсмена успішно видалено");
                setSwimmers(swimmers.filter(s => s.id !== Number(swimmerId)));
                setSwimmerId("");
            } else {
                setError(res.data.message || "Помилка при видаленні спортсмена");
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
            <h1>Видалити спортсмена</h1>

            <form onSubmit={handleDelete}>
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

                <button type="submit" disabled={loading || !swimmerId}>
                    {loading ? "Видалення..." : "Видалити спортсмена"}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    )
}
