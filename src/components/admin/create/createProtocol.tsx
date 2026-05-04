import {useEffect, useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

type CompetitionType = {
    id: number;
    name: string;
    date: string;
}

export default function CreateProtocol() {
    useAdminAuth();

    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [competitionId, setCompetitionId] = useState<string>("");
    const [header, setHeader] = useState<string>("");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if(!competitionId || !header || !text) {
            setError("Заповніть всі поля");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post(`/protocols/create?competitionId=${competitionId}`, {
                header,
                text
            });

            if(res.status === 200) {
                setSuccess("Протокол успішно створено");
                setHeader("");
                setText("");
            } else {
                setError(res.data.message || "Помилка при створенні протоколу");
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
                    <h1 className="page-title">Створити протокол</h1>
                    <p className="page-subtitle">Додайте новий протокол до змагання</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
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

                        <div className="form-group">
                            <label className="form-label">Заголовок:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={header}
                                onChange={(e) => setHeader(e.target.value)}
                                disabled={loading}
                                placeholder="Введіть заголовок протоколу"
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
                            {loading ? "Створення..." : "Створити протокол"}
                        </button>
                    </form>

                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                </div>
            </div>
        </div>
    )
}
