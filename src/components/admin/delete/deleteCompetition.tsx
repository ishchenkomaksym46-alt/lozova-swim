import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

export default function DeleteCompetition() {
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if(!window.confirm(`Ви впевнені, що хочете видалити змагання "${name}"?`)) {
            return;
        }

        try {
            const res = await api.delete('/competitions/delete', {
                params: { name }
            });

            if(res.data.success) {
                setSuccess(res.data.message || "Змагання успішно видалено!");
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
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: '600px' }}>
                <a href="/admin" className="back-link">← Назад до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">🗑️ Видалити змагання</h1>
                    <p className="page-subtitle">Видаліть змагання з системи</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Назва змагання:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                placeholder="Введіть назву змагання для видалення"
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <button className="btn btn-danger btn-full">Видалити змагання</button>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    )
}