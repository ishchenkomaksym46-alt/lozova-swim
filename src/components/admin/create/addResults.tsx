import {useEffect, useState} from "react";
import {api} from "../../../api/axios";
import {useSearchParams, useNavigate} from "react-router-dom";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

type ParticipantType = {
    id: number;
    name: string;
    surname: string;
    birthYear: number | null;
    declaredTime: string;
    actualTime: string;
    lane: number;
}

type HeatType = {
    id: number;
    heatNumber: number;
    participants: ParticipantType[];
}

type ResultInput = {
    participantId: number;
    time: string;
}

export default function AddResults() {
    const [searchParams] = useSearchParams();
    const distanceId = searchParams.get("distanceId");
    const navigate = useNavigate();

    const [heats, setHeats] = useState<HeatType[]>([]);
    const [results, setResults] = useState<ResultInput[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!distanceId) return;

        const getAllHeats = async () => {
            setError(null);
            setLoading(true);

            try {
                const res = await api.get('/heats', {
                    params: { id: distanceId }
                });

                if (res.data.success) {
                    setHeats(res.data.data);
                    // Initialize results array with existing actual times or empty
                    const allParticipants = res.data.data.flatMap((heat: HeatType) =>
                        heat.participants.map((p: ParticipantType) => ({
                            participantId: p.id,
                            time: p.actualTime === "Справжнього часу ще нема" ? "" : p.actualTime
                        }))
                    );
                    setResults(allParticipants);
                } else {
                    setError(res.data.message || "Не вдалося завантажити запливи");
                }
            } catch (e) {
                console.error(e);
                setError("Невідома помилка");
            } finally {
                setLoading(false);
            }
        }

        getAllHeats();
    }, [distanceId]);

    useAdminAuth();

    const handleTimeChange = (participantId: number, time: string) => {
        setResults(prev => prev.map(r =>
            r.participantId === participantId ? { ...r, time } : r
        ));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        // Filter only participants with filled times
        const filledResults = results.filter(r => r.time.trim());

        if (filledResults.length === 0) {
            setError("Будь ласка, заповніть час хоча б для одного учасника");
            setSubmitting(false);
            return;
        }

        try {
            // Submit each result
            const promises = filledResults.map(result =>
                api.post('/results/add', {
                    participantId: result.participantId,
                    time: result.time
                })
            );

            const responses = await Promise.all(promises);

            // Check if all succeeded
            const failed = responses.filter(res => !res.data.success);
            if (failed.length > 0) {
                setError(`Не вдалося додати ${failed.length} результат(ів)`);
            } else {
                alert(`Результати успішно додано для ${filledResults.length} учасників!`);
                navigate(`/heats?id=${distanceId}`);
            }
        } catch (e) {
            console.error(e);
            setError("Помилка при додаванні результатів");
        } finally {
            setSubmitting(false);
        }
    }

    if (!distanceId) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <a href="/" className="back-link">← Головна</a>
                    <div className="alert alert-error">Не вказано ID дистанції</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                <a href={`/heats?id=${distanceId}`} className="back-link">← Назад до запливів</a>

                <div className="page-header">
                    <h1 className="page-title">📝 Додати результати</h1>
                    <p className="page-subtitle">Введіть фактичний час для учасників запливів</p>
                </div>

                {loading && <div className="loading">Завантаження запливів</div>}

                {!loading && heats.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏊</div>
                        <h3 className="empty-state-title">Немає запливів</h3>
                        <p className="empty-state-text">Для цієї дистанції ще не створено запливів</p>
                    </div>
                )}

                {!loading && heats.length > 0 && (
                    <div className="card">
                        <div style={{ background: 'var(--water-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                                ⏱️ <strong>Формат часу:</strong> мм:сс.мс (наприклад: 1:23.45)<br/>
                                💡 Заповніть час тільки для тих учасників, які фінішували
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {heats.map((heat) => (
                                    <div key={heat.id} className="card" style={{ background: 'var(--gray-50)' }}>
                                        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Заплив #{heat.heatNumber}</h2>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ background: 'var(--gray-100)' }}>
                                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Доріжка</th>
                                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Ім'я</th>
                                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Прізвище</th>
                                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Рік</th>
                                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Заявлений час</th>
                                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Фактичний час</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {heat.participants.map((participant, idx) => {
                                                        const result = results.find(r => r.participantId === participant.id);
                                                        return (
                                                            <tr key={participant.id} style={{ background: idx % 2 === 0 ? 'var(--white)' : 'var(--gray-50)' }}>
                                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>
                                                                    {participant.lane}
                                                                </td>
                                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem' }}>
                                                                    {participant.name}
                                                                </td>
                                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem' }}>
                                                                    {participant.surname}
                                                                </td>
                                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center' }}>
                                                                    {participant.birthYear || 'Н/Д'}
                                                                </td>
                                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem' }}>
                                                                    {participant.declaredTime}
                                                                </td>
                                                                <td style={{ border: '1px solid var(--gray-300)', padding: '0.5rem' }}>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        placeholder="1:23.45"
                                                                        value={result?.time || ""}
                                                                        onChange={(e) => handleTimeChange(participant.id, e.target.value)}
                                                                        pattern="\d{1,2}:[0-5]\d\.\d{2}"
                                                                        title="Формат: мм:сс.мс"
                                                                        disabled={submitting}
                                                                        style={{ margin: 0, width: '100%', minWidth: '100px' }}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: '1.5rem' }}>
                                {submitting ? "Додавання..." : "💾 Зберегти результати"}
                            </button>
                        </form>

                        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
