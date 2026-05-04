import {useSearchParams} from "react-router-dom";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {useEffect, useState} from "react";
import {api} from "../../../api/axios";

interface Competition {
    id: number;
    name: string;
    date: string;
}

interface Entry {
    id: number;
    name: string;
    createdAt: string;
    _count: {
        entryItems: number;
    };
}

interface GeneratedHeat {
    heatNumber: number;
    ageGroup: string;
    participantCount: number;
}

export default function GenerateHeats() {
    const [searchParam] = useSearchParams();
    const urlEntryId = searchParam.get("id");
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<number>(0);
    const [selectedEntryId, setSelectedEntryId] = useState<number>(urlEntryId ? Number(urlEntryId) : 0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [competitionsLoading, setCompetitionsLoading] = useState<boolean>(true);
    const [entriesLoading, setEntriesLoading] = useState<boolean>(false);
    const [generatedHeats, setGeneratedHeats] = useState<GeneratedHeat[]>([]);

    useAdminAuth();

    function resetFeedback() {
        setError(null);
        setSuccess(null);
    }

    useEffect(() => {
        const fetchCompetitions = async () => {
            setCompetitionsLoading(true);

            try {
                const res = await api.get("/competitions");

                if (res.data.success) {
                    setCompetitions(res.data.data);
                } else {
                    setError(res.data.message);
                }
            } catch (e) {
                console.error(e);
                setError("Помилка при завантаженні змагань");
            } finally {
                setCompetitionsLoading(false);
            }
        };

        fetchCompetitions();
    }, []);

    useEffect(() => {
        if (selectedCompetitionId === 0) {
            setEntries([]);
            return;
        }

        const fetchEntries = async () => {
            setEntriesLoading(true);

            try {
                const res = await api.get("/entries", {
                    params: {id: selectedCompetitionId}
                });

                if (res.data.success) {
                    setEntries(res.data.data);
                } else {
                    setEntries([]);
                    setError(res.data.message);
                }
            } catch (e) {
                console.error(e);
                setEntries([]);
                setError("Помилка при завантаженні заявок");
            } finally {
                setEntriesLoading(false);
            }
        };

        fetchEntries();
    }, [selectedCompetitionId]);

    async function handleGenerate() {
        resetFeedback();

        if (!selectedEntryId) {
            setError("Оберіть заявку");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/seeding/generate", {}, {
                params: {id: selectedEntryId}
            });

            if (res.data.success) {
                setSuccess(res.data.message);
                setGeneratedHeats(Array.isArray(res.data.data) ? res.data.data : []);
            } else {
                setGeneratedHeats([]);
                setError(res.data.message);
            }
        } catch (e: any) {
            console.error(e);
            setGeneratedHeats([]);
            setError(e.response?.data?.message || "Невідома помилка");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-wrapper">
            <div className="container container-medium">
                <a href="/admin" className="back-link">← Повернутися до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">Автоматичне формування запливів</h1>
                    <p className="page-subtitle">Оберіть змагання та заявку, після чого система сформує серії автоматично</p>
                </div>

                <div className="card card-highlight stack-md section-spacing">
                    <p className="page-copy">
                        Сторінка формує запливи на основі заявочного протоколу без ручного розподілу учасників.
                    </p>
                    <ul className="list-reset">
                        <li>Учасники групуються за віковими категоріями.</li>
                        <li>Порядок формується за роком народження та заявленим часом.</li>
                        <li>Після успішного запуску нижче з’явиться список створених запливів.</li>
                    </ul>
                </div>

                <div className="cards-grid-compact section-spacing">
                    <div className="card card-muted summary-card">
                        <div className="summary-value">{competitions.length}</div>
                        <span className="summary-label">доступних змагань</span>
                    </div>
                    <div className="card card-muted summary-card">
                        <div className="summary-value">{selectedCompetitionId === 0 ? "—" : entries.length}</div>
                        <span className="summary-label">заявок у вибраному змаганні</span>
                    </div>
                    <div className="card card-muted summary-card">
                        <div className="summary-value">{generatedHeats.length}</div>
                        <span className="summary-label">створених запливів</span>
                    </div>
                </div>

                <div className="card stack-lg">
                    <div className="card-header">
                        <h2 className="card-title">Параметри формування</h2>
                        <p className="helper-text">Спочатку оберіть змагання, потім конкретну заявку для генерації.</p>
                    </div>

                    {competitionsLoading ? (
                        <div className="loading">Завантаження змагань</div>
                    ) : (
                        <div className="stack-md">
                            <div className="form-group">
                                <label className="form-label" htmlFor="competition">Змагання</label>
                                <select
                                    id="competition"
                                    className="form-select"
                                    value={selectedCompetitionId}
                                    onChange={(e) => {
                                        setSelectedCompetitionId(Number(e.target.value));
                                        setSelectedEntryId(0);
                                        setGeneratedHeats([]);
                                        resetFeedback();
                                    }}
                                >
                                    <option value={0}>-- Оберіть змагання --</option>
                                    {competitions.map((competition) => (
                                        <option key={competition.id} value={competition.id}>
                                            {competition.name} ({competition.date})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCompetitionId !== 0 && (
                                <div className="form-group">
                                    <label className="form-label" htmlFor="entry">Заявка</label>
                                    <select
                                        id="entry"
                                        className="form-select"
                                        value={selectedEntryId}
                                        onChange={(e) => {
                                            setSelectedEntryId(Number(e.target.value));
                                            setGeneratedHeats([]);
                                            resetFeedback();
                                        }}
                                        disabled={entriesLoading}
                                    >
                                        <option value={0}>-- Оберіть заявку --</option>
                                        {entries.map((entry) => (
                                            <option key={entry.id} value={entry.id}>
                                                {entry.name} (учасників: {entry._count.entryItems})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="helper-text">
                                        У списку відображаються лише заявки для вибраного змагання.
                                    </p>
                                </div>
                            )}

                            {entriesLoading && <div className="loading">Завантаження заявок</div>}

                            {selectedCompetitionId !== 0 && !entriesLoading && entries.length === 0 && (
                                <div className="empty-state">
                                    <h3 className="empty-state-title">Заявки не знайдено</h3>
                                    <p className="empty-state-text">
                                        Для цього змагання ще не створено жодної заявки.
                                    </p>
                                </div>
                            )}

                            <div className="action-bar">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleGenerate}
                                    disabled={loading || entriesLoading || selectedEntryId === 0}
                                >
                                    {loading ? "Формування..." : "Сформувати запливи"}
                                </button>
                            </div>
                        </div>
                    )}

                    {success && <div className="alert alert-success">{success}</div>}
                    {error && <div className="alert alert-error">{error}</div>}
                </div>

                {generatedHeats.length > 0 && (
                    <div className="card stack-md section-spacing">
                        <div className="card-header">
                            <h2 className="card-title">Створені запливи</h2>
                            <p className="helper-text">
                                Усього сформовано {generatedHeats.length} запливів для вибраної заявки.
                            </p>
                        </div>

                        <div className="cards-grid-compact">
                            {generatedHeats.map((heat, index) => (
                                <div key={`${heat.heatNumber}-${index}`} className="card card-muted accent-card">
                                    <div className="stack-sm">
                                        <div className="summary-value">Заплив #{heat.heatNumber}</div>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <span className="detail-key">Вікова група:</span>
                                                <span className="detail-value">{heat.ageGroup}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-key">Кількість учасників:</span>
                                                <span className="detail-value">{heat.participantCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
