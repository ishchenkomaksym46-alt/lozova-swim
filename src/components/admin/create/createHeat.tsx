import {useSearchParams} from "react-router-dom";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useEffect, useState} from "react";
import {api} from "../../../api/axios";

interface Participant {
    name: string;
    surname: string;
    declared_time: string;
}

export default function CreateHeat() {
    const [searchParam] = useSearchParams();
    const id = searchParam.get("id");
    const [participants, setParticipants] = useState<Participant[]>([
        { name: "", surname: "", declared_time: "" }
    ]);
    const [heatNumber, setHeatNumber] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string| null>(null);
    const [laneCount, setLaneCount] = useState<number>(6);

    useAdminAuth();

    useEffect(() => {
        const fetchLaneCount = async () => {
            try {
                const res = await api.get(`${process.env.REACT_APP_API_URL}/distances/lane-count`, {
                    params: { id }
                });
                if (res.data.success) {
                    setLaneCount(res.data.laneCount);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchLaneCount();
    }, [id]);

    function validateTimeFormat(time: string): boolean {
        // Формат мм:сс.мс (миллисекунды 00-99)
        const timeRegex = /^\d{1,2}:[0-5]\d\.\d{2}$/;
        return timeRegex.test(time);
    }

    function addParticipant() {
        if (participants.length >= laneCount) {
            setError(`Неможливо додати більше ${laneCount} участників (кількість доріжок)`);
            return;
        }
        setParticipants([...participants, { name: "", surname: "", declared_time: "" }]);
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

        // Валидация формата времени
        for (let i = 0; i < participants.length; i++) {
            const participant = participants[i];
            if (participant && !validateTimeFormat(participant.declared_time)) {
                setError(`Неправильний формат часу для участника ${i + 1}. Використовуйте формат мм:сс.мс`);
                return;
            }
        }

        try {
            const res = await api.post(
                `${process.env.REACT_APP_API_URL}/heats/create`,
                { participants, heatNumber },
                { params: { id } }
            );

            if(res.data.success) {
                setSuccess("Заплив успішно створено");
                setParticipants([{ name: "", surname: "", declared_time: "" }]);
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setError("Невідома помилка");
        }
    }

    return (
        <div>
            <a href="/admin">Повернутися до консолі</a>
            <h2>Додати запливи</h2>
            <form onSubmit={handleSubmit}>
                <input type="number" name="heatNumber" id="heatNumber"
                       onChange={(e) => setHeatNumber(Number(e.target.value))}
                       placeholder="Номер запливу"
                       required/>
                <h3>Додати участників (максимум {laneCount})</h3>
                {participants.map((participant, index) => (
                    <div key={index} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
                        <h4>Участник {index + 1}</h4>
                        <input
                            type="text"
                            value={participant.name}
                            onChange={(e) => updateParticipant(index, "name", e.target.value)}
                            placeholder="Ім'я спортсмена"
                            required
                        />
                        <input
                            type="text"
                            value={participant.surname}
                            onChange={(e) => updateParticipant(index, "surname", e.target.value)}
                            placeholder="Фамілія спортсмена"
                            required
                        />
                        <input
                            type="text"
                            value={participant.declared_time}
                            onChange={(e) => updateParticipant(index, "declared_time", e.target.value)}
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

                <button type="button" onClick={addParticipant}>+ Додати участника</button>
                <br />
                <button type="submit">Створити заплив</button>
            </form>
            <p className="success">{success}</p>
            <p>{error}</p>
        </div>
    )
}
