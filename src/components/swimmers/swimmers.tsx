import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../api/axios";

type SwimmersType = {
    id: number,
    name: string,
    surname: string,
    birthYear: string,
}

export default function Swimmers() {
    const [searchParams] = useSearchParams();
    const competitionId: string | null = searchParams.get("id");
    const [swimmers, setSwimmers] = useState<SwimmersType[]>([])
    const [error, setError] = useState<string | null>(null);
    const [searchSurname, setSearchSurname] = useState<string>("");
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        const getSwimmers = async () => {
            const res = await api.get(
                `${process.env.REACT_APP_API_URL}/swimmers`, {
                    params: {
                        competitionId,
                        page
                    }
                });

            if(res.status === 200) {
                setSwimmers(res.data.swimmers);
            } else {
                setError(res.data.message)
            }
        }

        getSwimmers();
    }, [competitionId, page]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            const res = await api.get(
                `${process.env.REACT_APP_API_URL}/search/swimmers`, {
                    params: {
                        competitionId,
                        page,
                        searchSurname,
                    }
                });

            if(res.status === 200) {
                setSwimmers(res.data.swimmers);
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || e.message || "Невідома помилка");
        }
    }

    return (
        <div>
            <a href="/">Назад</a>
            <h1>Спортсмени</h1>
            <p>{error}</p>

            <div className="search">
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Фамілія спортсмена"
                           onChange={(e) => setSearchSurname(e.target.value)}
                           required/>
                    <button>Знайти</button>
                </form>
            </div>

            {swimmers.map((el: SwimmersType) => (
                <div key={el.id}>
                    <h2>{el.name} {el.surname}</h2>
                    <h3>Рік народження: {el.birthYear}</h3>
                </div>
            ))}
            
            <h1>Сторінка</h1>
            {page !== 1 && <button onClick={() => setPage(page - 1)}>Назад</button>}
            <input type="number" value={page} placeholder="Номер сторінки" onChange={(e) => setPage(Number(e.target.value))}/>
            <button onClick={() => setPage(page + 1)}>Вперед</button>
        </div>
    )
}