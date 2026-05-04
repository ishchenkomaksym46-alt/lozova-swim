import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {api} from "../../api/axios";

export default function AdminLogin() {
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            const res = await api.post('/admin/login', { password });

            if(res.data.success) {
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
        <div className="page-wrapper">
            <div className="container container-narrow">
                <a href="/" className="back-link">← Назад на головну</a>

                <div className="page-header">
                    <h1 className="page-title">🔐 Вхід</h1>
                    <p className="page-subtitle">Адміністраторська панель</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Пароль:</label>
                            <input
                                type="password"
                                className="form-input"
                                name="password"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введіть пароль"
                                required
                            />
                        </div>

                        <button className="btn btn-primary btn-full">Зайти в акаунт</button>
                    </form>

                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    )
}
