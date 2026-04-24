import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import "../../styles/global.css";
import "../../styles/mainPage.css";

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
                const res = await api.get('/competitions');

                if(res.status === 200) {
                    setCompetitions(res.data.data);
                } else {
                    setError(res.data.message || "Не вдалося завантажити змагання");
                }
            } catch (error: any) {
                console.error(error);
                const errorMessage = error.response?.data?.message || error.message || "Невідома помилка";
                setError(errorMessage);
            }
        }

        getCompetitions();
    }, []);

    return (
        <div className="main-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Плавання Лозової</h1>
                    <p className="page-subtitle">Результати змагань та протоколи</p>
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="competitions-grid">
                    {competitions.map((el: CompetitionType) => (
                        <div className="competition-card" key={el.id}>
                            <h2 className="competition-name">{el.name}</h2>
                            <div className="competition-date">{el.date}</div>
                            <div className="competition-info">
                                <span className="competition-info-text">
                                    Кількість дистанцій: {el.distances.length}
                                </span>
                            </div>
                            <div className="competition-actions">
                                <a href={`/distances?id=${el.id}`} className="competition-link">
                                    Дивитись дистанції
                                </a>
                                <a href={`/protocols?id=${el.id}`} className="competition-link competition-link-secondary">
                                    Протокол
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}