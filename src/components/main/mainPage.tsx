import {useEffect, useState} from "react";
import {api} from "../../api/axios";

type DistancesType = {
    id: number,
    name: string
}

type CompetitionType = {
    id: number,
    name: string,
    date: string,
    distances: DistancesType[]
}

export default function MainPage() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const getCompetitions = async () => {
            setLoading(true);
            try {
                const res = await api.get('/competitions');

                if(res.data.success) {
                    setCompetitions(res.data.data);
                } else {
                    setError(res.data.message || "Failed to fetch competitions");
                }
            } catch (error: any) {
                console.error(error);
                setError("Unknown error");
            } finally {
                setLoading(false);
            }
        }

        getCompetitions();
    }, []);

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">🏊 Плавання Лозової</h1>
                    <p className="page-subtitle">Результати змагань з плавання</p>
                </div>

                <nav className="nav-actions section-spacing">
                    <a href="/sportmens" className="btn btn-secondary">👤 Спортсмени</a>
                    <a href="/protocols" className="btn btn-secondary">📋 Протоколи</a>
                </nav>

                {loading && <div className="loading">Завантаження змагань</div>}

                {error && <div className="alert alert-error">{error}</div>}

                {!loading && competitions.length === 0 && !error && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏊</div>
                        <h3 className="empty-state-title">Змагань не знайдено</h3>
                        <p className="empty-state-text">Наразі немає доступних змагань</p>
                    </div>
                )}

                <div className="cards-grid">
                    {!loading && competitions.map((el: CompetitionType) => (
                        <div className="card card-hover accent-card" key={el.id}>
                            <div className="card-header">
                                <h2 className="card-title">{el.name}</h2>
                            </div>
                            <div className="card-body">
                                <p className="detail-value" style={{ marginBottom: '0.5rem' }}>
                                    <strong>📅 Дата:</strong> {el.date}
                                </p>
                                <p className="detail-value" style={{ marginBottom: '1rem' }}>
                                    <strong>🏁 Дистанцій:</strong> {el.distances.length}
                                </p>
                                <a href={`/distances?id=${el.id}`} className="btn btn-primary btn-full">
                                    Дивитись дистанції →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
