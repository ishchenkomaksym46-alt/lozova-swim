import {useState, useEffect} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import "../../../styles/global.css";
import "../../../styles/admin.css";

type CompetitionType = {
    id: number;
    name: string;
}

type SwimmerType = {
    id: number;
    name: string;
    surname: string;
    birthYear: number;
}

export default function DeleteSwimmer() {
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
    const [swimmers, setSwimmers] = useState<SwimmerType[]>([]);
    const [selectedCompetition, setSelectedCompetition] = useState<number>(0);
    const [selectedSwimmer, setSelectedSwimmer] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);

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

    useEffect(() => {
        if (selectedCompetition === 0) {
            setSwimmers([]);
            return;
        }

        const getSwimmers = async () => {
            try {
                const res = await api.get(`/swimmers?competitionId=${selectedCompetition}&page=${page}`);
                if(res.status === 200) {
                    setSwimmers(res.data.swimmers);
                }
            } catch (e: any) {
                console.error(e);
                setError("Не вдалося завантажити учасників");
            }
        }

        getSwimmers();
    }, [selectedCompetition, page]);

    async function handleDelete() {
        setError(null);
        setSuccess(false);

        if (!selectedSwimmer) {
            return setError("Оберіть учасника для видалення");
        }

        if (!window.confirm("Ви впевнені, що хочете видалити цього учасника?")) {
            return;
        }

        try {
            const res = await api.delete(`/swimmers/delete?id=${selectedSwimmer}`);

            if(res.status === 200) {
                setSuccess(true);
                setSelectedSwimmer(0);
                // Перезавантажуємо список
                const resSwimmers = await api.get(`/swimmers?competitionId=${selectedCompetition}&page=${page}`);
                if(resSwimmers.status === 200) {
                    setSwimmers(resSwimmers.data.swimmers);
                }
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
                    <h1 className="form-title">Видалити учасника</h1>
                </div>

                <div className="form-container">
                    <div className="form-group">
                        <label htmlFor="competition" className="form-label">Оберіть змагання</label>
                        <select
                            id="competition"
                            className="form-select"
                            value={selectedCompetition}
                            onChange={(e) => {
                                setSelectedCompetition(Number(e.target.value));
                                setSelectedSwimmer(0);
                                setPage(1);
                            }}>
                            <option value={0}>Оберіть змагання</option>
                            {competitions.map((comp) => (
                                <option key={comp.id} value={comp.id}>{comp.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCompetition > 0 && (
                        <>
                            <div className="form-group">
                                <label htmlFor="swimmer" className="form-label">Оберіть учасника</label>
                                <select
                                    id="swimmer"
                                    className="form-select"
                                    value={selectedSwimmer}
                                    onChange={(e) => setSelectedSwimmer(Number(e.target.value))}>
                                    <option value={0}>Оберіть учасника</option>
                                    {swimmers.map((swimmer) => (
                                        <option key={swimmer.id} value={swimmer.id}>
                                            {swimmer.surname} {swimmer.name} ({swimmer.birthYear})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem'}}>
                                <button
                                    className="btn-edit"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    style={{opacity: page === 1 ? 0.5 : 1}}>
                                    ← Попередня
                                </button>
                                <span style={{display: 'flex', alignItems: 'center', fontWeight: 600}}>Сторінка {page}</span>
                                <button
                                    className="btn-edit"
                                    onClick={() => setPage(page + 1)}
                                    disabled={swimmers.length < 10}
                                    style={{opacity: swimmers.length < 10 ? 0.5 : 1}}>
                                    Наступна →
                                </button>
                            </div>
                        </>
                    )}

                    {selectedSwimmer > 0 && (
                        <button onClick={handleDelete} className="form-button" style={{background: 'var(--danger)'}}>
                            Видалити учасника
                        </button>
                    )}

                    {success && <p className="form-message success">Учасника успішно видалено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}
