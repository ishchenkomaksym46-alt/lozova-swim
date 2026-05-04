import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../api/axios";

type HeatsType = {
    id: number;
}

type DistancesType = {
    id: number;
    name: string;
    heats: HeatsType[];
}

export default function Distances() {
    const [searchParam] = useSearchParams();
    const id = searchParam.get("id");
    const [error, setError] = useState<string | null>(null);
    const [distances, setDistances] = useState<DistancesType[]>([]);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const getDistances = async () => {
            setError(null);
            setLoading(true);

            try {
                const res = await api.get('/distances', {
                    params: { id }
                });

                if(res.data.success) {
                    setDistances(res.data.distances);
                } else {
                    setError(res.data.message);
                }
            } catch (e) {
                console.error(e);
                setError("Невідома помилка");
            } finally {
                setLoading(false);
            }
        }

        const checkToken = async () => {
            try {
                const res = await api.get('/admin/verify');

                if(res.data.success) {
                    setIsAdmin(true);
                }
            } catch (e: any) {
                console.error(e);
            }
        }

        checkToken();
        getDistances();
    }, [id, navigate]);

    return(
        <div className="page-wrapper">
            <div className="container">
                <a href="/" className="back-link">← Назад на головну</a>

                <div className="page-header">
                    <h1 className="page-title">🏁 Дистанції</h1>
                    <p className="page-subtitle">Перегляд дистанцій змагання</p>
                </div>

                {isAdmin && (
                    <div className="card section-spacing">
                        <div className="card-header">
                            <h3 className="card-title">⚙️ Адмін панель</h3>
                        </div>
                        <div className="card-body action-bar">
                            <a href={`/admin/distances/create?id=${id}`} className="btn btn-primary">
                                ➕ Додати дистанцію
                            </a>
                            <a href="/admin/distances/update" className="btn btn-secondary">
                                ✏️ Виправити дистанцію
                            </a>
                            <a href="/admin/distances/delete" className="btn btn-danger">
                                🗑️ Видалити дистанцію
                            </a>
                        </div>
                    </div>
                )}

                {loading && <div className="loading">Завантаження дистанцій</div>}

                {error && <div className="alert alert-error">{error}</div>}

                {!loading && distances.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏁</div>
                        <h3 className="empty-state-title">Дистанцій ще немає</h3>
                        <p className="empty-state-text">Для цього змагання ще не додано дистанцій</p>
                    </div>
                )}

                <div className="cards-grid">
                    {!loading && distances.map((el: DistancesType) => (
                        <div key={el.id} className="card card-hover accent-card">
                            <div className="card-header">
                                <h2 className="card-title">{el.name}</h2>
                            </div>
                            <div className="card-body">
                                <p className="detail-value" style={{ marginBottom: '1rem' }}>
                                    <strong>🏊 Кількість запливів:</strong> {el.heats.length}
                                </p>
                                <a href={`/heats?id=${el.id}`} className="btn btn-primary btn-full">
                                    Дивитись запливи →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
