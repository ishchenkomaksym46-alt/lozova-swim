import {useState} from "react";
import {api} from "../../../api/axios";
import {useNavigate} from "react-router-dom";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import "../../../styles/global.css";
import "../../../styles/admin.css";

export default function DeleteDistance() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const navigate = useNavigate();

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!window.confirm(`Ви впевнені, що хочете видалити дистанцію "${name}"?`)) {
            return;
        }

        try {
            const res = await api.delete('/distances/delete', {
                params: { name }
            });

            if(res.status === 200) {
                setSuccess(true);
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
        <div className="admin-page">
            <div className="container">
                <a href="/admin" className="back-link">Повернутися до консолі</a>

                <div className="admin-header">
                    <h1 className="form-title">Видалити дистанцію</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Назва дистанції</label>
                            <input
                                type="text"
                                id="name"
                                className="form-input"
                                placeholder="Введіть точну назву дистанції"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required/>
                        </div>
                        <button className="form-button" style={{background: 'var(--danger)'}}>
                            Видалити дистанцію
                        </button>
                    </form>

                    {success && <p className="form-message success">Дистанцію успішно видалено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}