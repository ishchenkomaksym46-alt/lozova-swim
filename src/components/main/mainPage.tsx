import {useEffect, useState} from "react";
import axios from "axios";

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

    useEffect(() => {
        const getCompetitions = async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/competitions`);

                if(res.data.success) {
                    setCompetitions(res.data.data);
                } else {
                    setError(res.data.message || "Failed to fetch competitions");
                }
            } catch (error: any) {
                console.error(error);
                setError("Unknown error");
            }
        }

        getCompetitions();
    }, []);

    return (
        <div>
            <h1>Плавання Лозової</h1>
            <hr />
            <div className="competitions">
                {competitions.map((el: any) => (
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