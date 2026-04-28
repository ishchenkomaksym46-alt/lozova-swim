import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

export default function CreateCompetition() {
    const [name, setName] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [laneCount, setLaneCount] = useState<number>(6);
    const [error, setError] = useState<string | null>(null);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setError(null);
        e.preventDefault();

        try {
            const res = await api.post('/competitions/create', {
                name,
                date,
                laneCount
            });

            if(res.data.success) {
                setError("Змагання успішно створено");
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);

            if(e.status === 403) {
                return setError("Доступ заборонено. Ви не є адміністратором.");
            } else if(e.status === 401) {
                return setError("Токен не надано або недійсний. Будь ласка, увійдіть знову.");
            }

            return setError("Невідома помилка");
        }
    }

    return (
        <div>
            <a href="/admin">Повернутися до консолі</a>
            <h1>Додати змагання</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="name" placeholder="Назва змагань: "
                    onChange={(e) => setName(e.target.value)}
                    minLength={3} required/>
                <input
                    type="text"
                    id="date"
                    placeholder="Дата проведення: "
                    onChange={(e) => setDate(e.target.value)}
                    minLength={3} required/>
                <input
                    type="number"
                    id="laneCount"
                    placeholder="Кількість доріжок"
                    value={laneCount}
                    onChange={(e) => setLaneCount(Number(e.target.value))}
                    min={1}
                    max={10}
                    required/>
                <button>Створити</button>
            </form>
            <p>{error}</p>
        </div>
    )
}