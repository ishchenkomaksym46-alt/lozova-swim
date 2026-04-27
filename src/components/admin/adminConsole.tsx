import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {api} from "../../api/axios";
import {useAdminAuth} from "../../hooks/useAdminAuth";
import "../../styles/global.css";
import "../../styles/admin.css";

export default function AdminConsole() {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useAdminAuth();

    async function logout() {
        setError(null);

        try {
            const res = await api.post('/admin/logout');

            if(res.status !== 200) {
                setError(res.data.message);
            } else {
                navigate('/');
            }
        } catch (e: any) {
            console.error(e);
            return setError(e.response?.data?.message || e.message || "Невідома помилка");
        }
    }

    return(
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <h1 className="admin-title">Консоль адміністратора</h1>
                </div>

                <div className="admin-console">
                    <a href="/" className="back-link">Назад</a>

                    <button onClick={logout} className="logout-button">
                        Вийти з акаунту
                    </button>

                    <div className="admin-actions">
                        <a href="/admin/competition/create" className="admin-action-link">
                            Додати змагання
                        </a>
                        <a href="/admin/competition/delete" className="admin-action-link">
                            Видалити змагання
                        </a>
                        <a href="/admin/competition/update" className="admin-action-link">
                            Виправити змагання
                        </a>
                        <a href="/admin/swimmer/create" className="admin-action-link">
                            Додати учасника
                        </a>
                        <a href="/admin/swimmer/update" className="admin-action-link">
                            Оновити учасника
                        </a>
                        <a href="/admin/swimmer/delete" className="admin-action-link">
                            Видалити учасника
                        </a>
                        <a href="/admin/results/add" className="admin-action-link">
                            Додати результат
                        </a>
                        <a href="/admin/protocols/upload" className="admin-action-link">
                            Завантажити протокол
                        </a>
                    </div>

                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}