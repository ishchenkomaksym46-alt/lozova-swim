import {useState} from "react";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {api} from "../../../api/axios";

export default function UpdateDistanceName() {
    const [oldName, setOldName] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await api.patch('/distances/update', {
                oldName,
                name
            });

            if(res.data.success) {
                setSuccess("Дистанцію успішно оновлено");
                setOldName('');
                setName('');
            } else {
                setError(res.data.message || "Помилка при оновленні дистанції");
            }
        } catch (e: any) {
            console.error(e);
            setError("Помилка сервера");
        }
    }

    return(
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: '600px' }}>
                <a href="/admin" className="back-link">← Назад до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">✏️ Виправити дистанцію</h1>
                    <p className="page-subtitle">Оновіть назву дистанції</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Стара назва дистанції:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={oldName}
                                onChange={(e) => setOldName(e.target.value)}
                                placeholder="Введіть стару назву"
                                minLength={3}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Нова назва дистанції:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Введіть нову назву"
                                minLength={3}
                                required
                            />
                        </div>

                        <button className="btn btn-primary btn-full">Виправити дистанцію</button>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    )
}
