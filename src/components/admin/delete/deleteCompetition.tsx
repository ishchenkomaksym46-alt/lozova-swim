import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import "../../../styles/global.css";
import "../../../styles/admin.css";

export default function DeleteCompetition() {
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!window.confirm(`Ви впевнені, що хочете видалити змагання "${name}"? Це видалить всі пов'язані дані!`)) {
            return;
        }

        try {
            const res = await api.delete('/competitions/delete', {
                params: { name }
            });

            if(res.status === 200) {
                setSuccess(true);
                setName("");
            } else {
                setError(res.data.message || "Помилка при видаленні змагання!");
            }
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.response?.data?.message || "Невідома помилка";
            return setError(errorMessage);
        }
    }

    return (
        <div className="admin-page">
            <div className="container">
                <a href="/admin" className="back-link">Повернутися до консолі</a>

                <div className="admin-header">
                    <h1 className="form-title">Видалити змагання</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Назва змагання</label>
                            <input
                                type="text"
                                id="name"
                                className="form-input"
                                placeholder="Введіть точну назву змагання"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required/>
                        </div>
                        <button className="form-button" style={{background: 'var(--danger)'}}>
                            Видалити змагання
                        </button>
                    </form>

                    {success && <p className="form-message success">Змагання успішно видалено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}