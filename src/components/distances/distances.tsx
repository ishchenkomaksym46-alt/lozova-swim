import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../api/axios";

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

                if(res.data.success) {
                    setDistances(res.data.distances);
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

        checkToken();
        getDistances();
    }, [id, navigate]);

    return(
        <div>
            <div className="distances">
                <a href="/">Назад</a>
                {isAdmin && <nav>
                    <a href={`/admin/distances/create?id=${id}`}>Додати дистанцію</a>
                    <a href="/admin/distances/delete">Видалити дистанцію</a>
                    <a href="/admin/distances/update">Виправити назву дистанції</a>
                </nav>}

                {distances.length === 0 && <h2>Дистанцій ще нема</h2>}
                {distances.map((el: DistancesType) => (
                    <div className="distance" key={el.id}>
                        <h2>{el.name}</h2>
                        <h3>Кількість запливів: {el.heats.length}</h3>
                        <a href={`/heats?id=${el.id}`}>Дивитись запливи</a>
                    </div>
                ))}
            </div>
            <p>{error}</p>
        </div>
    )
}