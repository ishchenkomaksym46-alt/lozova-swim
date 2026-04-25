import {useState, useEffect} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import "../../../styles/global.css";
import "../../../styles/admin.css";

type CompetitionType = {
    id: number;
    name: string;
}

export default function CreateSwimmer() {
    const [name, setName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [birthYear, setBirthYear] = useState<number>(2010);
    const [competitionId, setCompetitionId] = useState<number>(0);
    const [competitions, setCompetitions] = useState<CompetitionType[]>([]);
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

        if (!competitionId) {
            return setError("Оберіть змагання");
        }

        try {
            const res = await api.post('/swimmers/create', {
                name,
                surname,
                birthYear,
                competitionId
            });

            if(res.status === 200) {
                setSuccess(true);
                setName("");
                setSurname("");
                setBirthYear(2010);
                setCompetitionId(0);
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
                    <h1 className="form-title">Додати учасника</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Ім'я</label>
                            <input
                                type="text"
                                id="name"
                                className="form-input"
                                placeholder="Введіть ім'я"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                minLength={2}
                                required/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="surname" className="form-label">Прізвище</label>
                            <input
                                type="text"
                                id="surname"
                                className="form-input"
                                placeholder="Введіть прізвище"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                minLength={2}
                                required/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="birthYear" className="form-label">Рік народження</label>
                            <input
                                type="number"
                                id="birthYear"
                                className="form-input"
                                placeholder="2010"
                                value={birthYear}
                                onChange={(e) => setBirthYear(Number(e.target.value))}
                                min={1950}
                                max={2020}
                                required/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="competition" className="form-label">Змагання</label>
                            <select
                                id="competition"
                                className="form-select"
                                value={competitionId}
                                onChange={(e) => setCompetitionId(Number(e.target.value))}
                                required>
                                <option value={0}>Оберіть змагання</option>
                                {competitions.map((comp) => (
                                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                                ))}
                            </select>
                        </div>

                        <button className="form-button">Створити учасника</button>
                    </form>

                    {success && <p className="form-message success">Учасника успішно створено!</p>}
                    {error && <p className="form-message error">{error}</p>}
                </div>
            </div>
        </div>
    )
}
