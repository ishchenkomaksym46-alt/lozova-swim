import {useSearchParams} from "react-router-dom";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useEffect, useState} from "react";
import {api} from "../../../api/axios";

interface Distance {
    id: number;
    name: string;
}

interface Participant {
    name: string;
    surname: string;
    birthYear: number;
    distanceId: number;
    seedTime: string;
}

export default function AddEntryItems() {
    const [searchParam] = useSearchParams();
    const entryId = searchParam.get("id");
    const [participants, setParticipants] = useState<Participant[]>([
        { name: "", surname: "", birthYear: new Date().getFullYear() - 10, distanceId: 0, seedTime: "" }
    ]);
    const [distances, setDistances] = useState<Distance[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useAdminAuth();

    useEffect(() => {
        // Fetch entry details to get competition ID, then fetch distances
        const fetchEntryAndDistances = async () => {
            try {
                // Get the entry's competition ID
                const entryRes = await api.get('/entries/details', {
                    params: { id: entryId }
                });

                if (entryRes.data.success) {
                    const competitionId = entryRes.data.data.competitionId;

                    // Now fetch distances for this competition
                    const distRes = await api.get('/distances', {
                        params: { id: competitionId }
                    });

                    if (distRes.data.success && distRes.data.distances) {
                        setDistances(distRes.data.distances);
                    }
                }
            } catch (e) {
                console.error(e);
                setError("Помилка при завантаженні дистанцій");
            }
        };

        if (entryId) {
            fetchEntryAndDistances();
        }
    }, [entryId]);

    function validateTimeFormat(time: string): boolean {
        const timeRegex = /^\d{1,2}:[0-5]\d\.\d{2}$/;
        return timeRegex.test(time);
    }

    function addParticipant() {
        setParticipants([...participants, { name: "", surname: "", birthYear: new Date().getFullYear() - 10, distanceId: 0, seedTime: "" }]);
        setError(null);
    }

    function removeParticipant(index: number) {
        setParticipants(participants.filter((_, i) => i !== index));
    }

    function updateParticipant(index: number, field: keyof Participant, value: string | number) {
        const updated = [...participants];
        updated[index] = { ...updated[index], [field]: value } as Participant;
        setParticipants(updated);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validate time format
        for (let i = 0; i < participants.length; i++) {
            const participant = participants[i];
            if (!participant) continue;

            if (!validateTimeFormat(participant.seedTime)) {
                setError(`Неправильний формат часу для учасника ${i + 1}. Використовуйте формат мм:сс.мс`);
                return;
            }
            if (!participant.distanceId || participant.distanceId === 0) {
                setError(`Оберіть дистанцію для учасника ${i + 1}`);
                return;
            }
        }

        try {
            let successCount = 0;
            for (const participant of participants) {
                const res = await api.post('/entries/items/add', {
                    entryId: Number(entryId),
                    name: participant.name,
                    surname: participant.surname,
                    birthYear: participant.birthYear,
                    distanceId: participant.distanceId,
                    seedTime: participant.seedTime
                });

                if (res.data.success) {
                    successCount++;
                }
            }

            if (successCount === participants.length) {
                setSuccess(`Успішно додано ${successCount} учасників`);
                setParticipants([{ name: "", surname: "", birthYear: new Date().getFullYear() - 10, distanceId: 0, seedTime: "" }]);
            } else {
                setError(`Додано ${successCount} з ${participants.length} учасників`);
            }
        } catch (e: any) {
            console.error(e);
            setError("Невідома помилка");
        }
    }

    return (
        <div>
            <a href="/admin">Повернутися до консолі</a>
            <h2>Додати учасників до заявки</h2>
            <form onSubmit={handleSubmit}>
                <h3>Додати учасників</h3>
                {participants.map((participant, index) => (
                    <div key={index} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
                        <h4>Учасник {index + 1}</h4>
                        <input
                            type="text"
                            value={participant.name}
                            onChange={(e) => updateParticipant(index, "name", e.target.value)}
                            placeholder="Ім'я"
                            required
                        />
                        <input
                            type="text"
                            value={participant.surname}
                            onChange={(e) => updateParticipant(index, "surname", e.target.value)}
                            placeholder="Прізвище"
                            required
                        />
                        <input
                            type="number"
                            value={participant.birthYear}
                            onChange={(e) => updateParticipant(index, "birthYear", Number(e.target.value))}
                            placeholder="Рік народження"
                            min="1900"
                            max={new Date().getFullYear()}
                            required
                        />
                        <select
                            value={participant.distanceId}
                            onChange={(e) => updateParticipant(index, "distanceId", Number(e.target.value))}
                            required
                        >
                            <option value={0}>Оберіть дистанцію</option>
                            {distances.map(distance => (
                                <option key={distance.id} value={distance.id}>{distance.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={participant.seedTime}
                            onChange={(e) => updateParticipant(index, "seedTime", e.target.value)}
                            placeholder="Заявлений час (мм:сс.мс)"
                            pattern="^\d{1,2}:[0-5]\d\.\d{2}$"
                            title="Формат: мм:сс.мс (наприклад 1:43.89)"
                            required
                        />
                        {participants.length > 1 && (
                            <button type="button" onClick={() => removeParticipant(index)}>Видалити</button>
                        )}
                    </div>
                ))}

                <button type="button" onClick={addParticipant}>+ Додати учасника</button>
                <br />
                <button type="submit">Зберегти учасників</button>
            </form>
            <p className="success">{success}</p>
            <p>{error}</p>
        </div>
    );
}
