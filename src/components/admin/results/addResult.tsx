import {useState, useEffect} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import "../../../styles/global.css";
import "../../../styles/admin.css";

type CompetitionType = {
    id: number;
    name: string;
    distances: DistanceType[];
}

type DistanceType = {
    id: number;
    name: string;
}

type HeatType = {
    id: number;
    heatNumber: number;
    participants: ParticipantType[];
}

type ParticipantType = {
    id: number;
    name: string;
    surname: string;
    declaredTime: string;
    actualTime: string;
    lane: number;
}

export default function AddResult() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [heats, setHeats] = useState<HeatType[]>([]);
    const [selectedCompetition, setSelectedCompetition] = useState<number>(0);
    const [selectedDistance, setSelectedDistance] = useState<number>(0);
    const [selectedParticipant, setSelectedParticipant] = useState<number>(0);
    const [time, setTime] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    useAdminAuth();

    useEffect(() => {
        const getCompetitions = async () => {
            try {
                const res = await api.get('/competitions');
                if(res.status === 200) {
                    setCompetitions(res.data.data);
                }
            } catch (e: any) {
                console.error(e);
                setError("Не вдалося завантажити змагання");
            }
        }

        getCompetitions();
    }, []);

    useEffect(() => {
        if (selectedDistance === 0) {
            setHeats([]);
            return;
        }

        const getHeats = async () => {
            try {
                const res = await api.get(`/heats?id=${selectedDistance}`);
                if(res.status === 200) {
                    setHeats(res.data.data);
                }
            } catch (e: any) {
                console.error(e);
                setError("Не вдалося завантажити запливи");
            }
        }

        getHeats();
    }, [selectedDistance]);

    const selectedComp = competitions.find(c => c.id === selectedCompetition);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setError(null);
        setSuccess(false);
        e.preventDefault();

        if (!selectedParticipant) {
            return setError("Оберіть учасника");
        }

        if (!time) {
            return setError("Введіть час");
        }

        try {
            const res = await api.post('/results/add', {
                participantId: selectedParticipant,
                time
            });

            if(res.status === 200) {
                setSuccess(true);
                setTime("");
                setSelectedParticipant(0);

                // Перезавантажуємо запливи
                const resHeats = await api.get(`/heats?id=${selectedDistance}`);
                if(resHeats.status === 200) {
                    setHeats(resHeats.data.data);
                }
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);

            if(e.status === 403) {
                return setError("Доступ заборонено. Ви не є адміністратором.");
            } else if(e.status === 401) {
                return setError("Токен не надано або недійсний. Будь ласка, увійдіть знову.");
            }

            return setError(e.response?.data?.message || e.message || "Невідома помилка");
        }
    }

    return (
        <div className="admin-page">
            <div className="container">
                <a href="/admin" className="back-link">Повернутися до консолі</a>

                <div className="admin-header">
                    <h1 className="form-title">Додати результат учаснику</h1>
                </div>

                <div className="form-container">
                    <div className="form-group">
                        <label htmlFor="competition" className="form-label">Оберіть змагання</label>
                        <select
                            id="competition"
                            className="form-select"
                            value={selectedCompetition}
                            onChange={(e) => {
                                setSelectedCompetition(Number(e.target.value));
                                setSelectedDistance(0);
                                setSelectedParticipant(0);
                            }}>
                            <option value={0}>Оберіть змагання</option>
                            {competitions.map((comp) => (
                                <option key={comp.id} value={comp.id}>{comp.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCompetition > 0 && selectedComp && (
                        <div className="form-group">
                            <label htmlFor="distance" className="form-label">Оберіть дистанцію</label>
                            <select
                                id="distance"
                                className="form-select"
                                value={selectedDistance}
                                onChange={(e) => {
                                    setSelectedDistance(Number(e.target.value));
                                    setSelectedParticipant(0);
                                }}>
                                <option value={0}>Оберіть дистанцію</option>
                                {selectedComp.distances.map((dist) => (
                                    <option key={dist.id} value={dist.id}>{dist.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedDistance > 0 && heats.length > 0 && (
                        <div className="participant-selector">
                            <h3>Оберіть учасника:</h3>
                            {heats.map((heat) => (
                                <div key={heat.id} className="heat-group">
                                    <h4>Заплив №{heat.heatNumber}</h4>
                                    <div>
                                        {heat.participants.map((participant) => (
                                            <div
                                                key={participant.id}
                                                className={`participant-item ${selectedParticipant === participant.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedParticipant(participant.id)}
                                            >
                                                <div className="participant-info">
                                                    <div>
                                                        <div className="participant-name-info">
                                                            Доріжка {participant.lane}: {participant.surname} {participant.name}
                                                        </div>
                                                        <div className="participant-time-info">
                                                            Заявлений час: {participant.declaredTime}
                                                        </div>
                                                        {participant.actualTime !== "Справжнього часу це нема" && (
                                                            <div className="participant-time-info" style={{color: 'var(--water-deep)', fontWeight: 600}}>
                                                                Фактичний час: {participant.actualTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedParticipant > 0 && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="time" className="form-label">Час результату</label>
                                <input
                                    type="text"
                                    id="time"
                                    className="form-input"
                                    placeholder="Формат: мм:сс.мс (наприклад 01:23.45)"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    pattern="\d{1,2}:[0-5]\d\.\d{2}"
                                    required/>
                            </div>
                            <button className="form-button">Додати результат</button>
                        </form>
                    )}

                    {success && <p className="form-message success">Результат успішно додано! Місця автоматично перераховані.</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}
