import {useEffect, useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

type CompetitionType = {
    id: number;
    name: string;
    date: string;
}

type ProtocolType = {
    header: string;
    text: string;
}

export default function DeleteProtocol() {
    useAdminAuth();

    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [competitionId, setCompetitionId] = useState<string>("");
    const [protocols, setProtocols] = useState<ProtocolType[]>([]);
    const [selectedProtocol, setSelectedProtocol] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
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
            try {
                const res = await api.get(`/protocols?competitionId=${competitionId}&page=1`);

                if(res.status === 200) {
                    setProtocols(res.data.protocol);
                }
            } catch (e: any) {
                console.error(e);
                setError(e.response?.data?.message || "Помилка завантаження протоколів");
            }
        }

        getProtocols();
    }, [competitionId]);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if(!selectedProtocol) {
            setError("Оберіть протокол для видалення");
            setLoading(false);
            return;
        }

        if(!window.confirm(`Ви впевнені, що хочете видалити протокол "${selectedProtocol}"?`)) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.delete('/protocols/delete', {
                data: { header: selectedProtocol }
            });

            if(res.status === 200) {
                setSuccess("Протокол успішно видалено");
                setSelectedProtocol("");

                const protocolsRes = await api.get(`/protocols?competitionId=${competitionId}&page=1`);
                if(protocolsRes.status === 200) {
                    setProtocols(protocolsRes.data.protocol);
                }
            } else {
                setError(res.data.message || "Помилка при видаленні протоколу");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || "Невідома помилка");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                <a href="/admin" className="back-link">← Назад до адмін панелі</a>

                <div className="page-header">
                    <h1 className="page-title">Видалити протокол</h1>
                    <p className="page-subtitle">Видаліть протокол зі змагання</p>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Змагання:</label>
                        <select
                            className="form-select"
                            value={competitionId}
                            onChange={(e) => setCompetitionId(e.target.value)}
                            disabled={loading}
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

                {competitionId && protocols.length > 0 && (
                    <div className="card">
                        <form onSubmit={handleDelete}>
                            <div className="form-group">
                                <label className="form-label">Протокол:</label>
                                <select
                                    className="form-select"
                                    value={selectedProtocol}
                                    onChange={(e) => setSelectedProtocol(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">-- Оберіть протокол --</option>
                                    {protocols.map((protocol, index) => (
                                        <option key={index} value={protocol.header}>
                                            {protocol.header}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-danger btn-full"
                                disabled={loading || !selectedProtocol}
                            >
                                {loading ? "Видалення..." : "Видалити протокол"}
                            </button>
                        </form>

                        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                        {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    </div>
                )}

                {competitionId && protocols.length === 0 && !error && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">Протоколів не знайдено</h3>
                        <p className="empty-state-text">Для цього змагання немає протоколів</p>
                    </div>
                )}
            </div>
        </div>
    )
}
