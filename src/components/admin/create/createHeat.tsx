import {useSearchParams} from "react-router-dom";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useState} from "react";
import {api} from "../../../api/axios";

interface Participant {
    name: string;
    surname: string;
    declared_time: string;
    lane: number;
}

export default function CreateHeat() {
    const [searchParam] = useSearchParams();
    const id = searchParam.get("id");
    const [participants, setParticipants] = useState<Participant[]>([
        { name: "", surname: "", declared_time: "", lane: 0 }
    ]);
    const [heatNumber, setHeatNumber] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string| null>(null);

    useAdminAuth();

    function addParticipant() {
        setParticipants([...participants, { name: "", surname: "", declared_time: "", lane: 0 }]);
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

        try {
            const res = await api.post(
                `${process.env.REACT_APP_API_URL}/heats/create`,
                { participants, heatNumber },
                { params: { id } }
            );

            if(res.data.success) {
                setSuccess("Заплив успішно створено");
                setParticipants([{ name: "", surname: "", declared_time: "", lane: 0 }]);
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
                <h3>Додати участників</h3>
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
                            placeholder="Заявлений час"
                            required
                        />
                        <input
                            type="number"
                            value={participant.lane}
                            onChange={(e) => updateParticipant(index, "lane", Number(e.target.value))}
                            placeholder="Доріжка"
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
