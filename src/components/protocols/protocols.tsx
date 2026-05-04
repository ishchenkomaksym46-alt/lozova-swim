import {useEffect, useState} from "react";
import {api} from "../../api/axios";

type CompetitionType = {
    id: number;
    name: string;
    date: string;
}

type ProtocolType = {
    header: string;
    text: string;
    createdAt: string;
    updatedAt: string;
}

export default function Protocols() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [competitionId, setCompetitionId] = useState<string>("");
    const [protocols, setProtocols] = useState<ProtocolType[]>([]);
    const [page, setPage] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const getCompetitions = async () => {
            try {
                const res = await api.get('/competitions');
                if(res.status === 200) {
                    setCompetitions(res.data.data);
                }
            } catch (e) {
                console.error(e);
                setError("Помилка завантаження змагань");
            }
        }

        getCompetitions();
    }, []);

    useEffect(() => {
        if(!competitionId) {
            setProtocols([]);
            return;
        }

        const getProtocols = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/protocols?competitionId=${competitionId}&page=${page}`);

                if(res.status === 200) {
                    setProtocols(res.data.protocol);
                } else {
                    setError(res.data.message || "Помилка завантаження протоколів");
                }
            } catch (e: any) {
                console.error(e);
                setError(e.response?.data?.message || "Невідома помилка");
            } finally {
                setLoading(false);
            }
        }

        getProtocols();
    }, [competitionId, page]);

    const handleCompetitionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCompetitionId(e.target.value);
        setPage(1);
        setProtocols([]);
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                <a href="/" className="back-link">← Назад на головну</a>

                <div className="page-header">
                    <h1 className="page-title">Протоколи</h1>
                    <p className="page-subtitle">Перегляд протоколів змагань</p>
                </div>

                <div className="card section-spacing">
                    <div className="form-group">
                        <label className="form-label">Оберіть змагання:</label>
                        <select
                            className="form-select"
                            value={competitionId}
                            onChange={handleCompetitionChange}
                        >
                            <option value="">-- Оберіть змагання --</option>
                            {competitions.map((comp) => (
                                <option key={comp.id} value={comp.id}>
                                    {comp.name} ({comp.date})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && <div className="loading">Завантаження</div>}

                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                {!loading && competitionId && protocols.length === 0 && !error && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">Протоколів не знайдено</h3>
                        <p className="empty-state-text">Для цього змагання ще немає протоколів</p>
                    </div>
                )}

                {!loading && protocols.length > 0 && (
                    <>
                        {protocols.map((protocol, index) => (
                            <div key={index} className="protocol-card">
                                <h3 className="protocol-header">{protocol.header}</h3>
                                <p className="protocol-text">{protocol.text}</p>
                                <div className="protocol-meta">
                                    <div className="protocol-meta-item">
                                        <strong>Створено:</strong> {new Date(protocol.createdAt).toLocaleString('uk-UA')}
                                    </div>
                                    <div className="protocol-meta-item">
                                        <strong>Оновлено:</strong> {new Date(protocol.updatedAt).toLocaleString('uk-UA')}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                ← Попередня
                            </button>
                            <span className="pagination-info">Сторінка {page}</span>
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(page + 1)}
                                disabled={protocols.length < 10}
                            >
                                Наступна →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
