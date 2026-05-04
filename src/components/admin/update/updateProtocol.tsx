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

export default function UpdateProtocol() {
    useAdminAuth();

    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [competitionId, setCompetitionId] = useState<string>("");
    const [protocols, setProtocols] = useState<ProtocolType[]>([]);
    const [selectedProtocol, setSelectedProtocol] = useState<string>("");
    const [newHeader, setNewHeader] = useState<string>("");
    const [text, setText] = useState<string>("");
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

    const handleProtocolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const header = e.target.value;
        setSelectedProtocol(header);

        const protocol = protocols.find(p => p.header === header);
        if(protocol) {
            setNewHeader(protocol.header);
            setText(protocol.text);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if(!selectedProtocol || !newHeader || !text) {
            setError("Заповніть всі поля");
            setLoading(false);
            return;
        }

        try {
            const res = await api.put('/protocols/update', {
                oldHeader: selectedProtocol,
                newHeader,
                text
            });

            if(res.status === 200) {
                setSuccess("Протокол успішно оновлено");
                setSelectedProtocol("");
                setNewHeader("");
                setText("");

                const protocolsRes = await api.get(`/protocols?competitionId=${competitionId}&page=1`);
                if(protocolsRes.status === 200) {
                    setProtocols(protocolsRes.data.protocol);
                }
            } else {
                setError(res.data.message || "Помилка при оновленні протоколу");
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
                    <h1 className="page-title">Оновити протокол</h1>
                    <p className="page-subtitle">Редагуйте існуючий протокол</p>
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

                    {competitionId && (
                        <div className="form-group">
                            <label className="form-label">Протокол:</label>
                            <select
                                className="form-select"
                                value={selectedProtocol}
                                onChange={handleProtocolSelect}
                                disabled={loading || protocols.length === 0}
                            >
                                <option value="">-- Оберіть протокол --</option>
                                {protocols.map((protocol, index) => (
                                    <option key={index} value={protocol.header}>
                                        {protocol.header}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {selectedProtocol && (
                    <div className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Новий заголовок:</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newHeader}
                                    onChange={(e) => setNewHeader(e.target.value)}
                                    disabled={loading}
                                    placeholder="Введіть новий заголовок"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Текст:</label>
                                <textarea
                                    className="form-textarea"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    disabled={loading}
                                    placeholder="Введіть текст протоколу"
                                    rows={10}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? "Оновлення..." : "Оновити протокол"}
                            </button>
                        </form>

                        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                        {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    </div>
                )}
            </div>
        </div>
    )
}
