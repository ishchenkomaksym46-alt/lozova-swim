import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {api} from "../../api/axios";
import "../../styles/global.css";
import "../../styles/admin.css";

export default function AdminLogin() {
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            const res = await api.post('/admin/login', { password });

            if(res.status === 200) {
                navigate('/admin');
            } else {
                setError(res.data.message || "Неправильний пароль!");
            }
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.response?.data?.message || "Невідома помилка";
            return setError(errorMessage);
        }
    }

    return(
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <h1 className="admin-title">Вхід в адмін панель</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Пароль</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                className="form-input"
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введіть пароль"
                                required/>
                        </div>
                        <button className="form-button">Зайти в акаунт</button>
                    </form>
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}