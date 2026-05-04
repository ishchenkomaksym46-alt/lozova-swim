import { useSearchParams } from "react-router-dom";
import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

export default function CreateDistance() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
    const [success, setSuccess] = useState<string | null>(null);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await api.post('/distances/create', { name }, {
                params: { id }
            });

            if(res.data.success) {
                setSuccess("Дистанція успішно створена!");
                setName("");
            } else {
                setError(res.data.message || "Помилка при створенні дистанції!");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || "Невідома помилка");
        }
    }

    return(
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: '600px' }}>
                <a href="/admin" className="back-link">← Назад до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">➕ Додати дистанцію</h1>
                    <p className="page-subtitle">Створіть нову дистанцію для змагання</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Назва дистанції:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Наприклад: 50м вільний стиль"
                                minLength={3}
                                required
                            />
                        </div>

                        <button className="btn btn-primary btn-full">Додати дистанцію</button>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    )
}
