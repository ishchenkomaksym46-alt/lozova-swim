import {useNavigate, useSearchParams} from "react-router-dom";
import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import "../../../styles/global.css";
import "../../../styles/admin.css";

export default function CreateDistance() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const res = await api.post('/distances/create', { name }, {
                params: { id }
            });

            if(res.status === 200) {
                setSuccess(true);
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
        <div className="admin-page">
            <div className="container">
                <a href="/admin" className="back-link">Повернутися до консолі</a>

                <div className="admin-header">
                    <h1 className="form-title">Додати дистанцію</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="distanceName" className="form-label">Назва дистанції</label>
                            <input
                                type="text"
                                name="distanceName"
                                id="distanceName"
                                className="form-input"
                                placeholder="Наприклад: 50м вільний стиль"
                                value={name}
                                minLength={3}
                                onChange={(e) => setName(e.target.value)}
                                required/>
                        </div>
                        <button className="form-button">Додати дистанцію</button>
                    </form>

                    {success && <p className="form-message success">Дистанція успішно створена!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}