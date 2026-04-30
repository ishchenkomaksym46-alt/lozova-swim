import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import {useParams, useSearchParams} from "react-router-dom";

type ParticipationType = {
    id: number;
    declaredTime: string;
    actualTime: string;
    lane: number;
    heat: {
        heatNumber: number;
        distance: {
            name: string;
        }
    }
    results: Array<{
        time: string;
        place: number;
        placeInHeat: number;
    }>;
}

type SwimmerDetailsType = {
    id: number;
    name: string;
    surname: string;
    birthYear: number;
    participations: ParticipationType[];
}

export default function SportmenDetails() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const competitionId = searchParams.get("competitionId");
    const [swimmer, setSwimmer] = useState<SwimmerDetailsType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id || !competitionId) return;

        const getSwimmerDetails = async () => {
            setError(null);
            setLoading(true);

            try {
                const res = await api.get('/swimmers/details', {
                    params: {
                        swimmerId: id,
                        competitionId
                    }
                });

                if(res.status === 200) {
                    setSwimmer(res.data.swimmer);
                } else {
                    setError(res.data.message || "Не вдалося завантажити дані спортсмена");
                }
            } catch (e) {
                console.error(e);
                setError("Невідома помилка");
            } finally {
                setLoading(false);
            }
        }

        getSwimmerDetails();
    }, [id, competitionId]);

    if (!competitionId) {
        return <div>
            <a href="/sportmens">Назад до списку</a>
            <p>Не вказано змагання</p>
        </div>
    }

    return (
        <div>
            <a href={`/sportmens?competitionId=${competitionId}`}>Назад до списку</a>

            {loading && <p>Завантаження...</p>}

            {!loading && swimmer && (
                <>
                    <h1>{swimmer.surname} {swimmer.name}</h1>
                    <h3>Рік народження: {swimmer.birthYear}</h3>

                    <h2>Участь у запливах:</h2>
                    {swimmer.participations.length === 0 && (
                        <p>Спортсмен ще не брав участі у запливах</p>
                    )}

                    <div className="participations">
                        {swimmer.participations.map((participation) => (
                            <div key={participation.id} className="participation">
                                <h3>Дистанція: {participation.heat.distance.name}</h3>
                                <p>Заплив/Доріжка: {participation.heat.heatNumber}/{participation.lane}</p>
                                <p>Заявлений час: {participation.declaredTime}</p>
                                <p>Фактичний час: {participation.actualTime}</p>

                                {participation.results.length > 0 && (
                                    <div className="results">
                                        <h4>Результати:</h4>
                                        {participation.results.map((result, idx) => (
                                            <div key={idx}>
                                                <p><strong>Час:</strong> {result.time}</p>
                                                <p><strong>Місце в запливі:</strong> {result.placeInHeat}</p>
                                                <p><strong>Загальне місце:</strong> {result.place}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}
