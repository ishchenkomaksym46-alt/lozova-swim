import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import {useParams, useSearchParams} from "react-router-dom";

type ParticipationType = {
    id: number;
    declaredTime: string;
    actualTime: string;
    lane: number;
    heat: {
        heatNumber: number;
        distance: {
            name: string;
        }
    }
    results: Array<{
        time: string;
        place: number;
        placeInHeat: number;
    }>;
}

type SwimmerDetailsType = {
    id: number;
    name: string;
    surname: string;
    birthYear: number;
    participations: ParticipationType[];
}

export default function SportmenDetails() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const competitionId = searchParams.get("competitionId");
    const [swimmer, setSwimmer] = useState<SwimmerDetailsType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id || !competitionId) return;

        const getSwimmerDetails = async () => {
            setError(null);
            setLoading(true);

            try {
                const res = await api.get('/swimmers/details', {
                    params: {
                        swimmerId: id,
                        competitionId
                    }
                });

                if(res.status === 200) {
                    setSwimmer(res.data.swimmer);
                } else {
                    setError(res.data.message || "Не вдалося завантажити дані спортсмена");
                }
            } catch (e) {
                console.error(e);
                setError("Невідома помилка");
            } finally {
                setLoading(false);
            }
        }

        getSwimmerDetails();
    }, [id, competitionId]);

    if (!competitionId) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <a href="/sportmens" className="back-link">← Назад до списку</a>
                    <div className="alert alert-error">Не вказано змагання</div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                <a href={`/sportmens?competitionId=${competitionId}`} className="back-link">← Назад до списку</a>

                {loading && <div className="loading">Завантаження даних спортсмена</div>}

                {error && <div className="alert alert-error">{error}</div>}

                {!loading && swimmer && (
                    <>
                        <div className="page-header">
                            <h1 className="page-title">{swimmer.surname} {swimmer.name}</h1>
                            <p className="page-subtitle">📅 Рік народження: {swimmer.birthYear}</p>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">🏊 Участь у запливах</h2>
                            </div>

                            {swimmer.participations.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🏊</div>
                                    <h3 className="empty-state-title">Немає участі</h3>
                                    <p className="empty-state-text">Спортсмен ще не брав участі у запливах</p>
                                </div>
                            ) : (
                                <div className="stack-lg" style={{ marginTop: '1rem' }}>
                                    {swimmer.participations.map((participation) => (
                                        <div key={participation.id} className="card card-muted accent-card">
                                            <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                                                🏁 {participation.heat.distance.name}
                                            </h3>

                                            <div className="detail-grid" style={{ marginBottom: '1rem' }}>
                                                <p className="detail-value">
                                                    <strong>Заплив/Доріжка:</strong> {participation.heat.heatNumber}/{participation.lane}
                                                </p>
                                                <p className="detail-value">
                                                    <strong>Заявлений час:</strong> {participation.declaredTime}
                                                </p>
                                                <p className="detail-value">
                                                    <strong>Фактичний час:</strong> {participation.actualTime}
                                                </p>
                                            </div>

                                            {participation.results.length > 0 && (
                                                <div className="card card-highlight">
                                                    <h4 className="section-title" style={{ marginBottom: '0.75rem' }}>
                                                        🏆 Результати:
                                                    </h4>
                                                    {participation.results.map((result, idx) => (
                                                        <div key={idx} style={{ display: 'grid', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                                            <p><strong>⏱️ Час:</strong> {result.time}</p>
                                                            <p><strong>🥇 Місце в запливі:</strong> {result.placeInHeat}</p>
                                                            <p><strong>🏅 Загальне місце:</strong> {result.place}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
