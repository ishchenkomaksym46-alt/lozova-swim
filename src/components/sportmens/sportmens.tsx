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
        <div className="page-wrapper">
            <div className="container">
                <a href="/" className="back-link">← Назад на головну</a>

                <div className="page-header">
                    <h1 className="page-title">👤 Спортсмени</h1>
                    <p className="page-subtitle">Пошук учасників змагань</p>
                </div>

                <div className="card section-spacing">
                    <div className="form-group">
                        <label className="form-label">Оберіть змагання:</label>
                        <select
                            className="form-select"
                            value={competitionId || ""}
                            onChange={handleCompetitionChange}
                        >
                            <option value="">-- Оберіть змагання --</option>
                            {competitions.map((comp) => (
                                <option key={comp.id} value={comp.id}>
                                    {comp.name} ({comp.date})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {competitionId && (
                    <>
                        <div className="card section-spacing">
                            <form onSubmit={handleSearch}>
                                <div className="form-group">
                                    <label className="form-label">Пошук за прізвищем:</label>
                                    <div className="action-bar">
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Введіть прізвище"
                                            value={searchSurname}
                                            onChange={(e) => setSearchSurname(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            🔍 Шукати
                                        </button>
                                        {searchSurname && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setSearchSurname("");
                                                    setPage(1);
                                                }}
                                                disabled={loading}
                                            >
                                                ✕ Очистити
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {loading && <div className="loading">Завантаження спортсменів</div>}

                        {error && <div className="alert alert-error">{error}</div>}

                        {!loading && swimmers.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">👤</div>
                                <h3 className="empty-state-title">Спортсменів не знайдено</h3>
                                <p className="empty-state-text">
                                    {searchSurname ? 'Спробуйте інший запит' : 'Для цього змагання немає спортсменів'}
                                </p>
                            </div>
                        )}

                        <div className="cards-grid">
                            {!loading && swimmers.map((swimmer) => (
                                <div
                                    key={swimmer.id}
                                    className="card card-hover accent-card click-card"
                                    onClick={() => navigate(`/sportmens/${swimmer.id}?competitionId=${competitionId}`)}
                                >
                                    <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                                        {swimmer.surname} {swimmer.name}
                                    </h3>
                                    <p className="detail-value">
                                        📅 Рік народження: {swimmer.birthYear}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {swimmers.length > 0 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                >
                                    ← Попередня
                                </button>
                                <span className="pagination-info">Сторінка {page}</span>
                                <button
                                    className="pagination-btn"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={swimmers.length < 10 || loading}
                                >
                                    Наступна →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
