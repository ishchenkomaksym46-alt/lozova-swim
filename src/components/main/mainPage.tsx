import {useEffect, useState} from "react";
import {api} from "../../api/axios";

type DistancesType = {
    id: number,
    name: string
}

type CompetitionType = {
    id: number,
    name: string,
    date: string,
    distances: DistancesType[]
}

export default function MainPage() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const getCompetitions = async () => {
            setLoading(true);
            try {
                const res = await api.get('/competitions');

                if(res.data.success) {
                    setCompetitions(res.data.data);
                } else {
                    setError(res.data.message || "Failed to fetch competitions");
                }
            } catch (error: any) {
                console.error(error);
                setError("Unknown error");
            } finally {
                setLoading(false);
            }
        }

        getCompetitions();
    }, []);

    return (
        <div>
            <h1>Плавання Лозової</h1>

            <nav>
                <a href="/sportmens">Спортсмени</a>
            </nav>
            <hr />
            {loading && <p>Завантаження...</p>}
            <div className="competitions">
                {!loading && competitions.map((el: CompetitionType) => (
                    <div className="competition" key={el.id}>
                        <h2>{el.name}</h2>
                        <h3>Дата проведення: {el.date}</h3>
                        <div className="distancesNumber">
                            <h4>Кількість дистанцій: {el.distances.length}</h4>
                        </div>
                        <a href={`/distances?id=${el.id}`}>Дивитись дистанції</a>
                    </div>
                ))}
                <p>{error}</p>
            </div>
        </div>
    )
}