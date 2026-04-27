import {useState, useEffect} from "react";
import {api} from "../../api/axios";
import {useSearchParams} from "react-router-dom";
import "../../styles/global.css";
import "../../styles/results.css";

type ResultType = {
    id: number;
    time: string;
    place: number;
    placeInHeat: number;
    participant: {
        id: number;
        name: string;
        surname: string;
        declaredTime: string;
        lane: number;
        heat: {
            heatNumber: number;
        }
    }
}

type HeatResultsType = {
    heatNumber: number;
    results: ResultType[];
}

export default function Results() {
    const [heatResults, setHeatResults] = useState<HeatResultsType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    const distanceId = searchParams.get('id');

    useEffect(() => {
        if (!distanceId) {
            setError("ID дистанції не надано");
            return;
        }

        const getResults = async () => {
            try {
                const res = await api.get(`/results?id=${distanceId}`);

                if(res.status === 200) {
                    const allResults: ResultType[] = res.data.data;

                    // Групуємо результати по запливам
                    const grouped = allResults.reduce((acc: { [key: number]: ResultType[] }, result) => {
                        const heatNum = result.participant.heat.heatNumber;
                        if (!acc[heatNum]) {
                            acc[heatNum] = [];
                        }
                        acc[heatNum].push(result);
                        return acc;
                    }, {});

                    // Сортуємо результати в кожному запливі по placeInHeat
                    const formatted: HeatResultsType[] = Object.keys(grouped)
                        .map(heatNum => ({
                            heatNumber: Number(heatNum),
                            results: (grouped[Number(heatNum)] || []).sort((a, b) => a.placeInHeat - b.placeInHeat)
                        }))
                        .sort((a, b) => a.heatNumber - b.heatNumber);

                    setHeatResults(formatted);
                } else {
                    setError(res.data.message || "Не вдалося завантажити результати");
                }
            } catch (error: any) {
                console.error(error);
                setError(error.response?.data?.message || error.message || "Невідома помилка");
            }
        }

        getResults();
    }, [distanceId]);

    return (
        <div className="results-container">
            <a href={`/distances?id=${searchParams.get('competitionId') || ''}`} className="back-link">
                Повернутися до дистанцій
            </a>

            <div className="results-header">
                <h1>Результати</h1>
            </div>

            {error && <p className="error-message">{error}</p>}

            {heatResults.length === 0 && !error && <p className="no-results">Результатів поки немає</p>}

            {heatResults.map((heat) => (
                <div key={heat.heatNumber} className="heat-section">
                    <h2 className="heat-title">Заплив №{heat.heatNumber}</h2>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Місце</th>
                                <th>Прізвище та ім'я</th>
                                <th>Дорожка</th>
                                <th>Заявлений час</th>
                                <th>Фактичний час</th>
                            </tr>
                        </thead>
                        <tbody>
                            {heat.results.map((result) => (
                                <tr key={result.id}>
                                    <td>{result.placeInHeat}</td>
                                    <td>{result.participant.surname} {result.participant.name}</td>
                                    <td>{result.participant.lane}</td>
                                    <td>{result.participant.declaredTime}</td>
                                    <td>{result.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    )
}
