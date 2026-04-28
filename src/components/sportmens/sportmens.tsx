import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import {useSearchParams, useNavigate} from "react-router-dom";

type SwimmerType = {
    id: number;
    name: string;
    surname: string;
    birthYear: number;
}

type CompetitionType = {
    id: number;
    name: string;
    date: string;
}

export default function Sportmens() {
    const [searchParams, setSearchParams] = useSearchParams();
    const competitionId = searchParams.get("competitionId");
    const [swimmers, setSwimmers] = useState<SwimmerType[]>([]);
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchSurname, setSearchSurname] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getCompetitions = async () => {
            try {
                const res = await api.get('/competitions');
                if(res.status === 200) {
                    setCompetitions(res.data.data);
                } else {
                    setError(res.data.message);
                }
            } catch (e) {
                console.error(e);
                setError("Помилка завантаження змагань");
            }
        }

        getCompetitions();
    }, []);

    useEffect(() => {
        if (!competitionId) return;

        const getSwimmers = async () => {
            setError(null);
            setLoading(true);

            try {
                const endpoint = searchSurname
                    ? '/search/swimmers'
                    : '/swimmers';

                const res = await api.get(endpoint, {
                    params: {
                        competitionId,
                        page,
                        ...(searchSurname && { searchSurname })
                    }
                });

                if(res.status === 200) {
                    setSwimmers(res.data.swimmers);
                } else {
                    setError(res.data.message || "Не вдалося завантажити спортсменів");
                }
            } catch (e) {
                console.error(e);
                setError("Невідома помилка");
            } finally {
                setLoading(false);
            }
        }

        getSwimmers();
    }, [competitionId, page, searchSurname]);

    const handleCompetitionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCompId = e.target.value;
        setSearchParams({ competitionId: newCompId });
        setPage(1);
        setSearchSurname("");
        setSwimmers([]);
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    }

    return (
        <div>
            <a href="/">Назад</a>
            <h1>Спортсмени</h1>

            <div>
                <label>Оберіть змагання: </label>
                <select value={competitionId || ""} onChange={handleCompetitionChange}>
                    <option value="">-- Оберіть змагання --</option>
                    {competitions.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                            {comp.name} ({comp.date})
                        </option>
                    ))}
                </select>
            </div>

            {competitionId && (
                <>
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Пошук за прізвищем"
                            value={searchSurname}
                            onChange={(e) => setSearchSurname(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>Шукати</button>
                        {searchSurname && (
                            <button type="button" onClick={() => {
                                setSearchSurname("");
                                setPage(1);
                            }} disabled={loading}>
                                Очистити
                            </button>
                        )}
                    </form>

                    {loading && <p>Завантаження...</p>}

                    <div className="swimmers">
                        {!loading && swimmers.length === 0 && <p>Спортсменів не знайдено</p>}
                        {!loading && swimmers.map((swimmer) => (
                            <div
                                key={swimmer.id}
                                className="swimmer"
                                onClick={() => navigate(`/sportmens/${swimmer.id}?competitionId=${competitionId}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <h3>{swimmer.surname} {swimmer.name}</h3>
                                <p>Рік народження: {swimmer.birthYear}</p>
                            </div>
                        ))}
                    </div>

                    {swimmers.length > 0 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                Попередня
                            </button>
                            <span>Сторінка {page}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={swimmers.length < 10 || loading}
                            >
                                Наступна
                            </button>
                        </div>
                    )}
                </>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}
