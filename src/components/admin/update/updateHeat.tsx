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
        return <div>Завантаження...</div>;
    }

    return (
        <div>
            <a href={`/heats?id=${distanceId}`}>Назад до запливів</a>
            <h1>Оновити заплив #{oldHeatNumber}</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="newHeatNumber">Новий номер запливу (залиште порожнім, щоб не змінювати):</label>
                    <input
                        type="number"
                        id="newHeatNumber"
                        value={newHeatNumber}
                        onChange={(e) => setNewHeatNumber(e.target.value)}
                        placeholder={`Поточний: ${oldHeatNumber}`}
                    />
                </div>

                <h3>Оновити результати учасників</h3>
                {participants.sort((a, b) => a.lane - b.lane).map((participant) => (
                    <div key={participant.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
                        <h4>Доріжка {participant.lane}: {participant.name} {participant.surname}</h4>
                        <p>Заявлений час: {participant.declaredTime}</p>
                        <label>
                            Справжній час:
                            <input
                                type="text"
                                value={participant.actualTime}
                                onChange={(e) => updateActualTime(participant.id, e.target.value)}
                                placeholder="мм:сс.мс"
                                pattern="^\d{1,2}:[0-5]\d\.\d{2}$"
                                title="Формат: мм:сс.мс (наприклад 1:43.89)"
                            />
                        </label>
                    </div>
                ))}

                <button type="submit">Оновити заплив</button>
            </form>
            {success && <p className="success">{success}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    )
}