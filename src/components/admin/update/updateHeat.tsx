import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../../api/axios";

type ParticipantType = {
    id: number;
    name: string;
    surname: string;
    declaredTime: string;
    actualTime: string;
    lane: number;
}

export default function UpdateHeat() {
    const [searchParam] = useSearchParams();
    const distanceId = searchParam.get("distanceId");
    const oldHeatNumber = searchParam.get("heatNumber");
    const [newHeatNumber, setNewHeatNumber] = useState<string>("");
    const [participants, setParticipants] = useState<ParticipantType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useAdminAuth();

    useEffect(() => {
        const fetchHeatData = async () => {
            try {
                const res = await api.get('/heats', {
                    params: { id: distanceId }
                });

                if (res.status === 200) {
                    const heat = res.data.data.find((h: any) => h.heatNumber === Number(oldHeatNumber));
                    if (heat) {
                        setParticipants(heat.participants);
                    } else {
                        setError("Заплив не знайдено");
                    }
                }
            } catch (e) {
                console.error(e);
                setError("Помилка завантаження даних");
            } finally {
                setLoading(false);
            }
        };

        fetchHeatData();
    }, [distanceId, oldHeatNumber]);

    function validateTimeFormat(time: string): boolean {
        if (!time || time === "Справжнього часу це нема") return true;
        const timeRegex = /^\d{1,2}:[0-5]\d\.\d{2}$/;
        return timeRegex.test(time);
    }

    function updateActualTime(participantId: number, value: string) {
        setParticipants(participants.map(p =>
            p.id === participantId ? { ...p, actualTime: value } : p
        ));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        for (const participant of participants) {
            if (!validateTimeFormat(participant.actualTime)) {
                setError(`Неправильний формат часу для ${participant.name} ${participant.surname}. Використовуйте формат мм:сс.мс`);
                return;
            }
        }

        try {
            const updateData: any = {
                participants: participants.map(p => ({
                    id: p.id,
                    actualTime: p.actualTime
                }))
            };

            if (newHeatNumber && newHeatNumber !== "") {
                updateData.newHeatNumber = Number(newHeatNumber);
            }

            const res = await api.put('/heats/update',
                updateData,
                {
                    params: {
                        heatNumber: oldHeatNumber,
                        distanceId: distanceId
                    }
                }
            );

            if (res.data.success) {
                setSuccess("Заплив успішно оновлено");
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || "Невідома помилка");
        }
    }

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <div className="loading">Завантаження даних запливу</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                <a href={`/heats?id=${distanceId}`} className="back-link">← Назад до запливів</a>

                <div className="page-header">
                    <h1 className="page-title">✏️ Оновити заплив #{oldHeatNumber}</h1>
                    <p className="page-subtitle">Редагуйте номер запливу та результати учасників</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Новий номер запливу (необов'язково):</label>
                            <input
                                type="number"
                                className="form-input"
                                value={newHeatNumber}
                                onChange={(e) => setNewHeatNumber(e.target.value)}
                                placeholder={`Поточний: ${oldHeatNumber}`}
                            />
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Залиште порожнім, щоб не змінювати номер запливу
                            </p>
                        </div>

                        <div className="card-header">
                            <h3 className="card-title">Оновити результати учасників</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                ⏱️ Формат часу: мм:сс.мс (наприклад: 1:23.45)
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            {participants.sort((a, b) => a.lane - b.lane).map((participant) => (
                                <div key={participant.id} className="card" style={{ background: 'var(--gray-50)', borderLeft: '4px solid var(--water-medium)' }}>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--water-deep)', marginBottom: '1rem' }}>
                                        🏊 Доріжка {participant.lane}: {participant.name} {participant.surname}
                                    </h4>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        <strong>Заявлений час:</strong> {participant.declaredTime}
                                    </p>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Справжній час:</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={participant.actualTime}
                                            onChange={(e) => updateActualTime(participant.id, e.target.value)}
                                            placeholder="мм:сс.мс"
                                            pattern="^\d{1,2}:[0-5]\d\.\d{2}$"
                                            title="Формат: мм:сс.мс (наприклад 1:43.89)"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }}>
                            Оновити заплив
                        </button>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    )
}
