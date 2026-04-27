import {useState, useEffect} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import "../../../styles/global.css";
import "../../../styles/admin.css";

type CompetitionType = {
    id: number;
    name: string;
}

export default function UploadProtocol() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [selectedCompetition, setSelectedCompetition] = useState<number>(0);
    const [textContent, setTextContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    useAdminAuth();

    useEffect(() => {
        const getCompetitions = async () => {
            try {
                const res = await api.get('/competitions');
                if(res.status === 200) {
                    setCompetitions(res.data.data);
                }
            } catch (e: any) {
                console.error(e);
                setError("Не вдалося завантажити змагання");
            }
        }

        getCompetitions();
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setError(null);
        setSuccess(false);
        e.preventDefault();

        if (!selectedCompetition) {
            return setError("Оберіть змагання");
        }

        if (!textContent.trim()) {
            return setError("Введіть текст протоколу");
        }

        try {
            const res = await api.post('/protocols/upload', {
                competitionId: selectedCompetition,
                textContent
            });

            if(res.status === 200) {
                setSuccess(true);
                setTextContent("");
            } else {
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);

            if(e.status === 403) {
                return setError("Доступ заборонено. Ви не є адміністратором.");
            } else if(e.status === 401) {
                return setError("Токен не надано або недійсний. Будь ласка, увійдіть знову.");
            }

            return setError(e.response?.data?.message || e.message || "Невідома помилка");
        }
    }

    return (
        <div className="admin-page">
            <div className="container">
                <a href="/admin" className="back-link">Повернутися до консолі</a>

                <div className="admin-header">
                    <h1 className="form-title">Завантажити протокол</h1>
                </div>

                <div className="form-container">
                    <div className="form-group">
                        <label htmlFor="competition" className="form-label">Оберіть змагання</label>
                        <select
                            id="competition"
                            className="form-select"
                            value={selectedCompetition}
                            onChange={(e) => setSelectedCompetition(Number(e.target.value))}>
                            <option value={0}>Оберіть змагання</option>
                            {competitions.map((comp) => (
                                <option key={comp.id} value={comp.id}>{comp.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCompetition > 0 && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="textContent" className="form-label">Текст протоколу</label>
                                <textarea
                                    id="textContent"
                                    className="form-textarea"
                                    placeholder="Вставте текст протоколу або скопійований текст з PDF..."
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                    rows={15}
                                    required
                                />
                            </div>
                            <button className="form-button">Завантажити протокол</button>
                        </form>
                    )}

                    {success && <p className="form-message success">Протокол успішно завантажено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}
