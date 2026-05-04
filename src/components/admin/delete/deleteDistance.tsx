import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

export default function DeleteDistance() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [name, setName] = useState<string>("");

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if(!window.confirm(`Ви впевнені, що хочете видалити дистанцію "${name}"?`)) {
            return;
        }

        try {
            const res = await api.delete('/distances/delete', {
                params: { name }
            });

            if(res.data.success) {
                setSuccess("Дистанцію успішно видалено");
                setName("");
            } else {
                setError("Помилка при видаленні дистанції");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || 'Помилка при видаленні дистанції');
        }
    }

    return(
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: '600px' }}>
                <a href="/admin" className="back-link">← Назад до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">🗑️ Видалити дистанцію</h1>
                    <p className="page-subtitle">Видаліть дистанцію зі змагання</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Назва дистанції:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Введіть назву дистанції"
                                required
                            />
                        </div>

                        <button className="btn btn-danger btn-full">Видалити дистанцію</button>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    )
}
