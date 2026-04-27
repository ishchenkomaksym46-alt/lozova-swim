import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import "../../styles/global.css";
import "../../styles/distances.css";

type HeatsType = {
    id: number;
}

type DistancesType = {
    id: number;
    name: string;
    heats: HeatsType[];
}

export default function Distances() {
    const [searchParam] = useSearchParams();
    const id = searchParam.get("id");
    const [error, setError] = useState<string | null>(null);
    const [distances, setDistances] = useState<DistancesType[]>([]);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const getDistances = async () => {
            setError(null);

            try {
                const res = await api.get('/distances', {
                    params: { id }
                });

                if(res.status === 200) {
                    setDistances(res.data.distances);
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

        checkToken();
        getDistances();
    }, [id, navigate]);

    return(
        <div className="distances-page">
            <div className="container">
                <a href="/" className="back-link">Назад</a>

                <div className="distances-header">
                    <h1>Дистанції</h1>
                    {isAdmin && (
                        <nav className="admin-nav">
                            <a href={`/admin/distances/create?id=${id}`}>Додати дистанцію</a>
                            <a href="/admin/distances/delete">Видалити дистанцію</a>
                            <a href="/admin/distances/update">Виправити назву</a>
                        </nav>
                    )}
                </div>

                <a href={`/swimmers?id=${id}`} className="btn btn-secondary mb-3">Спортсмени</a>

                {distances.length === 0 && (
                    <div className="no-distances">
                        <h2>Дистанцій ще нема</h2>
                    </div>
                )}

                <div className="distances-grid">
                    {distances.map((el: DistancesType) => (
                        <div className="distance-card" key={el.id}>
                            <h2 className="distance-name">{el.name}</h2>
                            <div className="distance-info">
                                Кількість запливів: {el.heats.length}
                            </div>
                            <div className="distance-links">
                                <a href={`/heats?id=${el.id}`} className="distance-link">
                                    Дивитись запливи
                                </a>
                                <a href={`/results?id=${el.id}&competitionId=${id}`} className="distance-link distance-link-secondary">
                                    Результати
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    )
}