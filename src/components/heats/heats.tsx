import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import {useSearchParams} from "react-router-dom";
import "../../styles/global.css";
import "../../styles/heats.css";

type ParticipantsType = {
    id: number,
    name: string,
    surname: string,
    declaredTime: string,
    actualTime: string,
    lane: number
}

type HeatType = {
    id: number,
    heatNumber: number,
    participants: ParticipantsType[],
}

export default function Heats() {
    const [heats, setHeats] = useState<HeatType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const getHeats = async () => {
            setError(null);

            try {
                const res = await api.get('/heats', {
                    params: { id }
                });

                if(res.status === 200) {
                    setHeats(res.data.data);
                } else {
                    setError(res.data.message);
                }
            } catch (e: any) {
                console.error(e);
                setError(e.response?.data?.message || e.message || "Невідома помилка");
            }
        }

        const checkToken = async () => {
            try {
                const res = await api.get('/admin/verify');

                if(res.status === 200) {
                    setIsAdmin(true);
                }
            } catch (e: any) {
                console.error(e);
            }
        }

        getHeats();
        checkToken();
    }, [id]);

    async function deleteHeat(heatNumber: number) {
        if (!window.confirm(`Ви впевнені, що хочете видалити заплив №${heatNumber}?`)) {
            return;
        }

        setError(null);

        try {
            const res = await api.delete(`${process.env.REACT_APP_API_URL}/heats/delete`,
                { params: {
                    heatNumber: heatNumber,
                    distanceId: id
                } });

            if(res.status === 200) {
                setHeats(heats.filter(heat => heat.heatNumber !== heatNumber).sort((a, b) => a.heatNumber - b.heatNumber));
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || e.message || "Невідома помилка");
        }
    }

    return (
        <div className="heats-page">
            <div className="container">
                <div className="heats-header">
                    <h1 className="heats-title">Запливи</h1>
                    {isAdmin && (
                        <nav className="admin-nav">
                            <a href={`/admin/heats/create?id=${id}`}>Створити запливи</a>
                        </nav>
                    )}
                </div>

                {heats.length === 0 && (
                    <div className="no-heats">
                        <p>Немає запливів для цієї дистанції</p>
                    </div>
                )}

                <div className="heats-grid">
                    {heats.map((el: HeatType)=> (
                        <div key={el.id} className="heat-card">
                            {isAdmin && (
                                <div className="heat-admin-actions">
                                    <button onClick={() => deleteHeat(el.heatNumber)} className="btn-delete">
                                        Видалити
                                    </button>
                                    <a href={`/admin/heats/update?heatNumber=${el.heatNumber}&distanceId=${id}`} className="btn-edit">
                                        Оновити
                                    </a>
                                </div>
                            )}
                            <h2 className="heat-number">Заплив №{el.heatNumber}</h2>
                            <div className="participants-list">
                                {el.participants.sort((a, b) => a.lane - b.lane).map((participant: ParticipantsType) => (
                                    <div className="participant-card" key={participant.id}>
                                        <div className="participant-lane">Доріжка {participant.lane}</div>
                                        <div className="participant-info">
                                            <h3 className="participant-name">{participant.surname} {participant.name}</h3>
                                            <div className="participant-times">
                                                <span className="time-label">Заявлений:</span>
                                                <span className="time-value">{participant.declaredTime}</span>
                                            </div>
                                            {participant.actualTime !== "Справжнього часу це нема" && (
                                                <div className="participant-times actual">
                                                    <span className="time-label">Фактичний:</span>
                                                    <span className="time-value">{participant.actualTime}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    )
}