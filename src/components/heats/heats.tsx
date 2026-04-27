import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import {useSearchParams} from "react-router-dom";

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

                if(res.data.success) {
                    setHeats(res.data.data);
                } else {
                    setError(res.data.message);
                }
            } catch (e) {
                console.error(e);
                setError("Невідома помилка");
            }
        }

        const checkToken = async () => {
            try {
                const res = await api.get('/admin/verify');

                if(res.data.success) {
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
        } catch (e) {
            console.error(e);
            setError("Невідома помилка");
        }
    }

    return (
        <div>
            <a href="/distances">Назад</a>
            {isAdmin && (
                <nav>
                    <a href={`/admin/heats/create?id=${id}`}>Створити запливи</a>
                </nav>
            )}
            <h1>Запливи</h1>
            <div className="heats">
                {heats.length === 0 && <p>Немає запливів для цієї дистанції</p>}
                {heats.map((el: HeatType)=> (
                    <div key={el.id} className="heat">
                        {isAdmin && (
                            <nav>
                                <button onClick={() => deleteHeat(el.heatNumber)}>Видалити цей заплив</button>
                                <a href={`/admin/heats/update?heatNumber=${el.heatNumber}&distanceId=${id}`}>Оновити цей заплив</a>
                            </nav>
                        )}
                        <h2>Номер запливу: {el.heatNumber}</h2>
                        <div className="participants">
                            {el.participants.map((el: ParticipantsType) => (
                                <div className="participant" key={el.id}>
                                    <h3>{el.lane} {el.name} {el.surname} </h3>
                                    <h4>{el.declaredTime} {el.actualTime}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p>{error}</p>
        </div>
    )
}