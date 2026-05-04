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

    function sortParticipantsByAge() {
        const sorted = [...participants].sort((a, b) => b.birthYear - a.birthYear); // youngest first (higher year = younger)
        setParticipants(sorted);
        setSuccess("Учасників відсортовано за віком (від молодших до старших)");
    }

    function blockDuplicates() {
        const seen = new Map<string, number>();
        const duplicates: string[] = [];
        const unique: Participant[] = [];

        participants.forEach((participant, index) => {
            const key = `${participant.name.trim().toLowerCase()}_${participant.surname.trim().toLowerCase()}_${participant.birthYear}_${participant.distanceId}`;

            if (seen.has(key)) {
                duplicates.push(`${participant.name} ${participant.surname} (${participant.birthYear}) - дистанція ${distances.find(d => d.id === participant.distanceId)?.name || participant.distanceId}`);
            } else {
                seen.set(key, index);
                unique.push(participant);
            }
        });

        if (duplicates.length > 0) {
            setParticipants(unique);
            setError(`Видалено ${duplicates.length} дублікатів: ${duplicates.join(', ')}`);
        } else {
            setSuccess("Дублікатів не знайдено");
        }
    }

    function removeParticipant(index: number) {
        setParticipants(participants.filter((_, i) => i !== index));
    }

    function updateParticipant(index: number, field: keyof Participant, value: string | number) {
        const updated = [...participants];
        updated[index] = { ...updated[index], [field]: value } as Participant;
        setParticipants(updated);
    }

    // Перевірка на дублікати
    function checkForDuplicates(): { hasDuplicates: boolean; duplicatesList: string[] } {
        const seen = new Map<string, number>();
        const duplicates: string[] = [];

        participants.forEach((participant, index) => {
            if (!participant.name || !participant.surname || !participant.distanceId) {
                return; // Пропускаємо незаповнені поля
            }

            const key = `${participant.name.trim().toLowerCase()}_${participant.surname.trim().toLowerCase()}_${participant.birthYear}_${participant.distanceId}`;

            if (seen.has(key)) {
                const distanceName = distances.find(d => d.id === participant.distanceId)?.name || `ID ${participant.distanceId}`;
                duplicates.push(`${participant.name} ${participant.surname} (${participant.birthYear}) - ${distanceName}`);
            } else {
                seen.set(key, index);
            }
        });

        return { hasDuplicates: duplicates.length > 0, duplicatesList: duplicates };
    }

    const duplicateCheck = checkForDuplicates();

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
        <div className="page-wrapper">
            <div className="container">
                <a href="/admin" className="back-link">← Назад до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">👥 Додати учасників до заявки</h1>
                    <p className="page-subtitle">Заповніть дані учасників для заявки</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="card-header">
                            <h3 className="card-title">Учасники</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                ⏱️ Формат часу: мм:сс.мс (наприклад: 1:23.45)
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            {participants.map((participant, index) => (
                                <div key={index} className="card" style={{ background: 'var(--gray-50)', borderLeft: '4px solid var(--water-medium)' }}>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--water-deep)', marginBottom: '1rem' }}>
                                        🏊 Учасник {index + 1}
                                    </h4>
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Ім'я:</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={participant.name}
                                                onChange={(e) => updateParticipant(index, "name", e.target.value)}
                                                placeholder="Ім'я"
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Прізвище:</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={participant.surname}
                                                onChange={(e) => updateParticipant(index, "surname", e.target.value)}
                                                placeholder="Прізвище"
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Рік народження:</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={participant.birthYear}
                                                onChange={(e) => updateParticipant(index, "birthYear", Number(e.target.value))}
                                                placeholder="Рік народження"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Дистанція:</label>
                                            <select
                                                className="form-input"
                                                value={participant.distanceId}
                                                onChange={(e) => updateParticipant(index, "distanceId", Number(e.target.value))}
                                                required
                                            >
                                                <option value={0}>Оберіть дистанцію</option>
                                                {distances.map(distance => (
                                                    <option key={distance.id} value={distance.id}>{distance.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Заявлений час:</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={participant.seedTime}
                                                onChange={(e) => updateParticipant(index, "seedTime", e.target.value)}
                                                placeholder="1:23.45"
                                                pattern="^\d{1,2}:[0-5]\d\.\d{2}$"
                                                title="Формат: мм:сс.мс (наприклад 1:43.89)"
                                                required
                                            />
                                        </div>
                                        {participants.length > 1 && (
                                            <button type="button" className="btn btn-danger" onClick={() => removeParticipant(index)} style={{ marginTop: '0.5rem' }}>
                                                🗑️ Видалити учасника
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-secondary" onClick={addParticipant}>
                                ➕ Додати учасника
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={sortParticipantsByAge}>
                                🔄 Сортувати за віком
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={blockDuplicates}>
                                🔍 Видалити дублікати
                            </button>
                        </div>

                        {duplicateCheck.hasDuplicates && (
                            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                                <strong>⚠️ Знайдено дублікати:</strong>
                                <ul style={{ marginTop: '0.5rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                                    {duplicateCheck.duplicatesList.map((dup, idx) => (
                                        <li key={idx}>{dup}</li>
                                    ))}
                                </ul>
                                <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>Видаліть дублікати перед збереженням.</p>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-full" disabled={duplicateCheck.hasDuplicates} style={{ marginTop: '1rem' }}>
                            {duplicateCheck.hasDuplicates ? '⚠️ Видаліть дублікати' : '💾 Зберегти учасників'}
                        </button>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    );
}
