import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import "../../../styles/global.css";
import "../../../styles/admin.css";

export default function CreateCompetition() {
    const [name, setName] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [laneCount, setLaneCount] = useState<number>(6);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setError(null);
        setSuccess(false);
        e.preventDefault();

        try {
            const res = await api.post('/competitions/create', {
                name,
                date,
                laneCount
            });

            if(res.status === 200) {
                setSuccess(true);
                setName("");
                setDate("");
                setLaneCount(6);
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

            return setError(e.response?.data?.message || e.message || "Невідома помилка");
        }
    }

    return (
        <div className="admin-page">
            <div className="container">
                <a href="/admin" className="back-link">Повернутися до консолі</a>

                <div className="admin-header">
                    <h1 className="form-title">Додати змагання</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Назва змагань</label>
                            <input
                                type="text"
                                id="name"
                                className="form-input"
                                placeholder="Наприклад: Чемпіонат України 2026"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                minLength={3}
                                required/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="date" className="form-label">Дата проведення</label>
                            <input
                                type="text"
                                id="date"
                                className="form-input"
                                placeholder="Наприклад: 15-17 травня 2026"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                minLength={3}
                                required/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="laneCount" className="form-label">Кількість доріжок</label>
                            <input
                                type="number"
                                id="laneCount"
                                className="form-input"
                                placeholder="6"
                                value={laneCount}
                                onChange={(e) => setLaneCount(Number(e.target.value))}
                                min={1}
                                max={10}
                                required/>
                        </div>

                        <button className="form-button">Створити змагання</button>
                    </form>

                    {success && <p className="form-message success">Змагання успішно створено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}