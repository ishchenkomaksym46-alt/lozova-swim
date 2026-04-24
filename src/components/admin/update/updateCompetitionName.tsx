import {useState} from "react";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {api} from "../../../api/axios";
import "../../../styles/global.css";
import "../../../styles/admin.css";

export default function UpdateCompetitionName() {
    const [oldName, setOldName] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const res = await api.patch(`${process.env.REACT_APP_API_URL}/competitions/update`, {
                oldName,
                name,
                date
            });

            if(res.status === 200) {
                setSuccess(true);
                setOldName('');
                setName('');
                setDate('');
            } else {
                setError(res.data.message || "Помилка при оновленні змагання");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || "Помилка сервера");
        }
    }

    return(
        <div className="admin-page">
            <div className="container">
                <a href="/admin" className="back-link">Повернутися до консолі</a>

                <div className="admin-header">
                    <h1 className="form-title">Оновити змагання</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="oldName" className="form-label">Стара назва змагання</label>
                            <input
                                type="text"
                                id="oldName"
                                className="form-input"
                                value={oldName}
                                onChange={(e) => setOldName(e.target.value)}
                                placeholder="Введіть поточну назву"
                                minLength={3}
                                required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Нова назва змагання</label>
                            <input
                                type="text"
                                id="name"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Введіть нову назву"
                                minLength={3}
                                required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date" className="form-label">Нова дата проведення</label>
                            <input
                                type="text"
                                id="date"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                placeholder="Введіть нову дату"
                                minLength={3}
                                required />
                        </div>

                        <button className="form-button">Оновити змагання</button>
                    </form>

                    {success && <p className="form-message success">Змагання успішно оновлено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}