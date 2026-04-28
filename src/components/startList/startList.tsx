import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../api/axios";

interface Participant {
    id: number;
    name: string;
    surname: string;
    birthYear: number;
    declaredTime: string;
    lane: number;
}

interface Heat {
    id: number;
    heatNumber: number;
    participants: Participant[];
}

interface Distance {
    id: number;
    name: string;
    competition: {
        name: string;
        date: string;
        laneCount: number;
    };
}

export default function StartList() {
    const [searchParam] = useSearchParams();
    const id = searchParam.get("id");
    const [heats, setHeats] = useState<Heat[]>([]);
    const [distance, setDistance] = useState<Distance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStartList = async () => {
            try {
                const res = await api.get('/start-list', {
                    params: { id }
                });

                if (res.data.success) {
                    setDistance(res.data.data.distance);
                    setHeats(res.data.data.heats);
                } else {
                    setError(res.data.message);
                }
            } catch (e: any) {
                console.error(e);
                setError("Невідома помилка");
            } finally {
                setLoading(false);
            }
        };

        fetchStartList();
    }, [id]);

    if (loading) {
        return <div>Завантаження...</div>;
    }

    if (error) {
        return <div>Помилка: {error}</div>;
    }

    return (
        <div>
            <a href="/">Назад</a>
            <h1>Стартові протоколи</h1>
            {distance && (
                <div>
                    <h2>{distance.competition.name}</h2>
                    <p>Дата: {distance.competition.date}</p>
                    <h3>Дистанція: {distance.name}</h3>
                    <p>Кількість доріжок: {distance.competition.laneCount}</p>
                </div>
            )}

            {heats.length === 0 ? (
                <p>Заплави ще не сформовані для цієї дистанції</p>
            ) : (
                <div>
                    <p>Всього заплавів: {heats.length}</p>
                    {heats.map((heat) => (
                        <div key={heat.id} style={{ marginBottom: "40px", border: "2px solid #333", padding: "15px" }}>
                            <h3>Заплив #{heat.heatNumber}</h3>
                            <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th>Доріжка</th>
                                        <th>Ім'я</th>
                                        <th>Прізвище</th>
                                        <th>Рік народження</th>
                                        <th>Заявлений час</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {heat.participants.map((participant) => (
                                        <tr key={participant.id}>
                                            <td style={{ fontWeight: "bold", textAlign: "center" }}>{participant.lane}</td>
                                            <td>{participant.name}</td>
                                            <td>{participant.surname}</td>
                                            <td>{participant.birthYear}</td>
                                            <td>{participant.declaredTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
