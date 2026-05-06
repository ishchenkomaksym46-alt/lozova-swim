import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {api} from "../../api/axios";
import {useAdminAuth} from "../../hooks/useAdminAuth";
import {clearAdminToken} from "../../utils/adminAuth";

export default function AdminConsole() {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useAdminAuth();

    async function logout() {
        setError(null);

        try {
            const res = await api.post('/admin/logout');

            if(!res.data.success) {
                setError(res.data.message);
            } else {
                clearAdminToken();
                navigate('/');
            }
        } catch (e: any) {
            console.error(e);
            return setError("Невідома помилка");
        }
    }

    return(
        <div className="page-wrapper">
            <div className="container">
                <a href="/" className="back-link">← Назад на головну</a>

                <div className="page-header">
                    <h1 className="page-title">⚙️ Консоль адміністратора</h1>
                    <p className="page-subtitle">Керування змаганнями та протоколами</p>
                </div>

                <div className="action-bar-center section-spacing">
                    <button onClick={logout} className="btn btn-danger">
                        🚪 Вийти з акаунту
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="stack-lg">
                    {/* Змагання */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">🏆 Змагання</h2>
                        </div>
                        <div className="card-body action-stack">
                            <a href="/admin/competition/create" className="btn btn-primary">
                                ➕ Додати змагання
                            </a>
                            <a href="/admin/competition/update" className="btn btn-secondary">
                                ✏️ Виправити змагання
                            </a>
                            <a href="/admin/competition/delete" className="btn btn-danger">
                                🗑️ Видалити змагання
                            </a>
                        </div>
                    </div>

                    {/* Протоколи */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">📋 Протоколи</h2>
                        </div>
                        <div className="card-body action-stack">
                            <a href="/admin/protocols/create" className="btn btn-primary">
                                ➕ Додати протокол
                            </a>
                            <a href="/admin/protocols/update" className="btn btn-secondary">
                                ✏️ Оновити протокол
                            </a>
                            <a href="/admin/protocols/delete" className="btn btn-danger">
                                🗑️ Видалити протокол
                            </a>
                        </div>
                    </div>

                    {/* Заявки та заплави */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">📝 Заявочний протокол та формування заплавів</h2>
                        </div>
                        <div className="card-body action-stack">
                            <a href="/admin/entries/create" className="btn btn-primary">
                                ➕ Створити заявку
                            </a>
                            <a href="/admin/showEntryItems" className="btn btn-secondary">
                                🔎 Дивитись учасників заявки
                            </a>
                            <a href="/admin/entries/select" className="btn btn-secondary">
                                👥 Додати учасників до заявки
                            </a>
                            <a href="/admin/seeding/generate" className="btn btn-secondary">
                                🔄 Автоматичне формування запливів
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
