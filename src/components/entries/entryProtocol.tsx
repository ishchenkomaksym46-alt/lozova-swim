import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../api/axios";

interface EntryItem {
    id: number;
    name: string;
    surname: string;
    birthYear: number;
    seedTime: string;
    ageGroup: string;
    entry: {
        name: string;
    };
}

interface Distance {
    id: number;
    name: string;
    competition: {
        name: string;
        date: string;
    };
}

export default function EntryProtocol() {
    const [searchParam] = useSearchParams();
    const id = searchParam.get("id");
    const [items, setItems] = useState<EntryItem[]>([]);
    const [distance, setDistance] = useState<Distance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchEntryProtocol = async () => {
            try {
                const res = await api.get('/entries/protocol', {
                    params: { id }
                });

                if (res.data.success) {
                    setDistance(res.data.data.distance);
                    setItems(res.data.data.items);
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

        fetchEntryProtocol();
    }, [id]);

    if (loading) {
        return <div>Завантаження...</div>;
    }

    if (error) {
        return <div>Помилка: {error}</div>;
    }

    // Групуємо заявки за віковими групами
    const groupedItems = items.reduce((acc, item) => {
        const group = item.ageGroup;
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(item);
        return acc;
    }, {} as Record<string, EntryItem[]>);

    return (
        <div>
            <a href="/">Назад</a>
            <h1>Заявочний протокол</h1>
            {distance && (
                <div>
                    <h2>{distance.competition.name}</h2>
                    <p>Дата: {distance.competition.date}</p>
                    <h3>Дистанція: {distance.name}</h3>
                </div>
            )}

            {items.length === 0 ? (
                <p>Немає заявок для цієї дистанції</p>
            ) : (
                <div>
                    <p>Всього учасників: {items.length}</p>
                    {Object.keys(groupedItems).map((ageGroup) => (
                        <div key={ageGroup} style={{ marginBottom: "30px" }}>
                            <h3>Вікова група: {ageGroup}</h3>
                            <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th>№</th>
                                        <th>Ім'я</th>
                                        <th>Прізвище</th>
                                        <th>Рік народження</th>
                                        <th>Заявлений час</th>
                                        <th>Заявка</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedItems[ageGroup]?.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.birthYear}</td>
                                            <td>{item.seedTime}</td>
                                            <td>{item.entry.name}</td>
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
