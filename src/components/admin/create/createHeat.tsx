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
                const res = await api.get('/distances/lane-count', {
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

        for (let i = 0; i < participants.length; i++) {
            const participant = participants[i];
            if (participant && !validateTimeFormat(participant.declared_time)) {
                setError(`Неправильний формат часу для участника ${i + 1}. Використовуйте формат мм:сс.мс`);
                return;
            }
        }

        try {
            const res = await api.post('/heats/create',
                { participants, heatNumber },
                { params: { id } }
            );

            if(res.data.success) {
                setSuccess("Заплив успішно створено");
                setParticipants([{ name: "", surname: "", declared_time: "" }]);
                setHeatNumber(heatNumber + 1);
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setError("Невідома помилка");
        }
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                <a href="/admin" className="back-link">← Повернутися до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">➕ Додати запливи</h1>
                    <p className="page-subtitle">Створіть новий заплив з учасниками</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Номер запливу:</label>
                            <input
                                type="number"
                                className="form-input"
                                value={heatNumber}
                                onChange={(e) => setHeatNumber(Number(e.target.value))}
                                placeholder="Номер запливу"
                                required
                            />
                        </div>

                        <div className="card-header">
                            <h3 className="card-title">Додати участників (максимум {laneCount})</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                ⏱️ Формат часу: мм:сс.мс (наприклад: 1:23.45)
                            </p>
                        </div>

                        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--gray-100)' }}>
                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>#</th>
                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Ім'я</th>
                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Прізвище</th>
                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Заявлений час</th>
                                        <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Дії</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((participant, index) => (
                                        <tr key={index} style={{ background: index % 2 === 0 ? 'var(--white)' : 'var(--gray-50)' }}>
                                            <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>
                                                {index + 1}
                                            </td>
                                            <td style={{ border: '1px solid var(--gray-300)', padding: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={participant.name}
                                                    onChange={(e) => updateParticipant(index, "name", e.target.value)}
                                                    placeholder="Ім'я"
                                                    required
                                                    style={{ margin: 0 }}
                                                />
                                            </td>
                                            <td style={{ border: '1px solid var(--gray-300)', padding: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={participant.surname}
                                                    onChange={(e) => updateParticipant(index, "surname", e.target.value)}
                                                    placeholder="Прізвище"
                                                    required
                                                    style={{ margin: 0 }}
                                                />
                                            </td>
                                            <td style={{ border: '1px solid var(--gray-300)', padding: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={participant.declared_time}
                                                    onChange={(e) => updateParticipant(index, "declared_time", e.target.value)}
                                                    placeholder="1:23.45"
                                                    pattern="^\d{1,2}:[0-5]\d\.\d{2}$"
                                                    title="Формат: мм:сс.мс"
                                                    required
                                                    style={{ margin: 0 }}
                                                />
                                            </td>
                                            <td style={{ border: '1px solid var(--gray-300)', padding: '0.5rem', textAlign: 'center' }}>
                                                {participants.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => removeParticipant(index)}
                                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-secondary" onClick={addParticipant}>
                                ➕ Додати участника
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Створити заплив
                            </button>
                        </div>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    )
}
