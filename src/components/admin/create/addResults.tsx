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
            <div>
                <a href="/">Назад</a>
                <p>Не вказано ID дистанції</p>
            </div>
        );
    }

    return (
        <div>
            <a href={`/heats?id=${distanceId}`}>Назад до запливів</a>
            <h1>Додати результати</h1>

            {loading && <p>Завантаження...</p>}

            {!loading && heats.length === 0 && <p>Немає запливів для цієї дистанції</p>}

            {!loading && heats.length > 0 && (
                <>
                    <p style={{ marginBottom: '20px' }}>
                        Формат часу: <strong>мм:сс.мс</strong> (наприклад: 1:23.45)<br/>
                        Заповніть час тільки для тих учасників, які фінішували.
                    </p>

                    <form onSubmit={handleSubmit}>
                        {heats.map((heat) => (
                            <div key={heat.id} style={{ marginBottom: '30px' }}>
                                <h2>Заплив #{heat.heatNumber}</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Доріжка</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Ім'я</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Прізвище</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Рік народження</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Заявлений час</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Фактичний час</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {heat.participants.map((participant) => {
                                            const result = results.find(r => r.participantId === participant.id);
                                            return (
                                                <tr key={participant.id}>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                                        {participant.lane}
                                                    </td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                        {participant.name}
                                                    </td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                        {participant.surname}
                                                    </td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                                        {participant.birthYear || 'Н/Д'}
                                                    </td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                        {participant.declaredTime}
                                                    </td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="1:23.45"
                                                            value={result?.time || ""}
                                                            onChange={(e) => handleTimeChange(participant.id, e.target.value)}
                                                            pattern="\d{1,2}:[0-5]\d\.\d{2}"
                                                            title="Формат: мм:сс.мс"
                                                            disabled={submitting}
                                                            style={{ width: '100px' }}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}

                        <div style={{ marginTop: '20px' }}>
                            <button type="submit" disabled={submitting}>
                                {submitting ? "Додавання..." : "Зберегти результати"}
                            </button>
                        </div>
                    </form>
                </>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
