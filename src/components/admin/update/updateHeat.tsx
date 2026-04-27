import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../../api/axios";
import "../../../styles/global.css";
import "../../../styles/admin.css";

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
    const [success, setSuccess] = useState<boolean>(false);
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
        setSuccess(false);

        // Валидация формата времени
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

            // Добавляем новый номер заплыва только если он указан
            if (newHeatNumber && newHeatNumber !== "") {
                updateData.newHeatNumber = Number(newHeatNumber);
            }

            const res = await api.put(
                `${process.env.REACT_APP_API_URL}/heats/update`,
                updateData,
                {
                    params: {
                        heatNumber: oldHeatNumber,
                        distanceId: distanceId
                    }
                }
            );

            if (res.status === 200) {
                setSuccess(true);
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
            <div className="admin-page">
                <div className="container">
                    <p style={{textAlign: 'center', padding: '2rem'}}>Завантаження...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="container">
                <a href={`/heats?id=${distanceId}`} className="back-link">Назад до запливів</a>

                <div className="admin-header">
                    <h1 className="form-title">Оновити заплив #{oldHeatNumber}</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="newHeatNumber" className="form-label">
                                Новий номер запливу (залиште порожнім, щоб не змінювати)
                            </label>
                            <input
                                type="number"
                                id="newHeatNumber"
                                className="form-input"
                                value={newHeatNumber}
                                onChange={(e) => setNewHeatNumber(e.target.value)}
                                placeholder={`Поточний: ${oldHeatNumber}`}
                            />
                        </div>

                        <div className="participant-selector">
                            <h3>Оновити результати учасників</h3>
                            {participants.sort((a, b) => a.lane - b.lane).map((participant) => (
                                <div key={participant.id} className="heat-group">
                                    <h4>Доріжка {participant.lane}: {participant.name} {participant.surname}</h4>
                                    <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                                        Заявлений час: {participant.declaredTime}
                                    </p>
                                    <div className="form-group">
                                        <label className="form-label">Фактичний час</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={participant.actualTime}
                                            onChange={(e) => updateActualTime(participant.id, e.target.value)}
                                            placeholder="Формат: мм:сс.мс (наприклад 1:43.89)"
                                            pattern="^\d{1,2}:[0-5]\d\.\d{2}$"
                                            title="Формат: мм:сс.мс (наприклад 1:43.89)"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="submit" className="form-button">Оновити заплив</button>
                    </form>

                    {success && <p className="form-message success">Заплив успішно оновлено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}