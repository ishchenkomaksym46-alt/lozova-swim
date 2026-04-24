import {useSearchParams} from "react-router-dom";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useEffect, useState} from "react";
import {api} from "../../../api/axios";
import "../../../styles/global.css";
import "../../../styles/admin.css";

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
    const [success, setSuccess] = useState<boolean>(false);
    const [laneCount, setLaneCount] = useState<number>(6);

    useAdminAuth();

    useEffect(() => {
        const fetchLaneCount = async () => {
            try {
                const res = await api.get(`${process.env.REACT_APP_API_URL}/distances/lane-count`, {
                    params: { id }
                });
                if (res.status === 200) {
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
        if (participants.length > 1 && !window.confirm(`Видалити учасника ${index + 1}?`)) {
            return;
        }
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
        setSuccess(false);

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

            if(res.status === 200) {
                setSuccess(true);
                setParticipants([{ name: "", surname: "", declared_time: "" }]);
                setHeatNumber(heatNumber + 1);
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || e.message || "Невідома помилка");
        }
    }

    return (
        <div className="admin-page">
            <div className="container">
                <a href="/admin" className="back-link">Повернутися до консолі</a>

                <div className="admin-header">
                    <h1 className="form-title">Додати заплив</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="heatNumber" className="form-label">Номер запливу</label>
                            <input
                                type="number"
                                name="heatNumber"
                                id="heatNumber"
                                className="form-input"
                                value={heatNumber}
                                onChange={(e) => setHeatNumber(Number(e.target.value))}
                                placeholder="1"
                                required/>
                        </div>

                        <div className="participant-selector">
                            <h3>Учасники (максимум {laneCount})</h3>
                            {participants.map((participant, index) => (
                                <div key={index} className="heat-group">
                                    <h4>Учасник {index + 1}</h4>
                                    <div className="form-group">
                                        <label className="form-label">Ім'я</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={participant.name}
                                            onChange={(e) => updateParticipant(index, "name", e.target.value)}
                                            placeholder="Введіть ім'я"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Прізвище</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={participant.surname}
                                            onChange={(e) => updateParticipant(index, "surname", e.target.value)}
                                            placeholder="Введіть прізвище"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Заявлений час</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={participant.declared_time}
                                            onChange={(e) => updateParticipant(index, "declared_time", e.target.value)}
                                            placeholder="Формат: мм:сс.мс (наприклад 1:43.89)"
                                            pattern="^\d{1,2}:[0-5]\d\.\d{2}$"
                                            title="Формат: мм:сс.мс (наприклад 1:43.89)"
                                            required
                                        />
                                    </div>
                                    {participants.length > 1 && (
                                        <button type="button" className="btn-delete" onClick={() => removeParticipant(index)}>
                                            Видалити учасника
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button type="button" className="form-button" style={{marginTop: '1rem', background: 'var(--success)'}} onClick={addParticipant}>
                                + Додати учасника
                            </button>
                        </div>

                        <button type="submit" className="form-button">Створити заплив</button>
                    </form>

                    {success && <p className="form-message success">Заплив успішно створено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}
