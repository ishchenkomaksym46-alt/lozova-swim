import {useEffect, useState} from "react";
import {api} from "../../../api/axios";

type DistancesType = {
    id: number,
    name: string,
}

type CompetitionsType = {
    id: number,
    name: string,
    date: string,
    laneCount: number,
    distances: DistancesType[],
}

type EntryType = {
    id: number,
    name: string,
    createdAt: string,
    _count: {
        entryItems: number,
    },
}

type EntryItemsType = {
    id: number,
    name: string,
    surname: string,
    birthYear: number,
    seedTime: string,
    distance: DistancesType,
    gender: 'WOMEN' | 'MEN',
}

export default function ShowEntryItems() {
    const [entryId, setEntryId] = useState<number>(0);
    const [entries, setEntries] = useState<EntryType[]>([]);
    const [competitionId, setCompetitionId] = useState<number>(0);
    const [competitions, setCompetitions] = useState<CompetitionsType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [entryItems, setEntryItems] = useState<EntryItemsType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const getCompetitions = async () => {
            setError(null);

            try {
                const res = await api.get('/competitions');

                if(res.data.success) {
                    setCompetitions(res.data.data);
                } else {
                    setError(res.data.message);
                }
            } catch (e) {
                console.error(e);
                setError("Невідома помилка");
            }
        }

        const getEntries = async () => {
            setError(null);

            try {
                const res = await api.get(`/entries`, { params: { id: competitionId } });

                if(res.data.success) {
                    setEntries(res.data.data);
                } else {
                    setError(res.data.message);
                }
            } catch (e) {
                console.error(e);
                setError("Невідома помилка")
            }
        }

        const getEntryItems = async () => {
            setError(null);
            setLoading(true);

            try {
                const res = await api.get('/entries/items', { params: { id: entryId } });

                if(res.data.success) {
                    setEntryItems(res.data.data);
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

        getCompetitions();
        getEntries();
        getEntryItems()
    }, [competitionId, entryId]);

    return(
        <div className="page-wrapper">
            <div className="container container-medium">
                <div className="page-header">
                    <a href="/admin" className="back-link">← Назад до консолі</a>
                    <h1 className="page-title">Дивитись учасників заявки</h1>
                    <a href="/admin/entries/create" className="btn btn-primary">➕ Додати заявку</a>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="stack-lg">
                    <div className="form-group">
                        <label className="form-label">Оберіть змагання</label>
                        <select className="form-select" onChange={(e) => setCompetitionId(Number(e.target.value))}>
                            <option value="0">-- Оберіть змагання --</option>
                            {competitions.map((el: CompetitionsType) => (
                                <option key={el.id} value={el.id}>{el.name}</option>
                            ))}
                        </select>
                    </div>

                    {competitionId !== 0 && (
                        <div className="form-group">
                            <label className="form-label">Оберіть заявку</label>
                            <select className="form-select" onChange={(e) => setEntryId(Number(e.target.value))}>
                                <option value="0">-- Оберіть заявку --</option>
                                {entries.map((el: EntryType) => (
                                    <option key={el.id} value={el.id}>{el.name} (Учасників: {el._count?.entryItems || 0})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {loading && <div className="loading"></div>}

                    {entryId !== 0 && (
                        <div className="section-spacing">
                            <h2 className="section-title">Учасники</h2>
                            <div className="stack-md">
                                {entryItems.map((el: EntryItemsType) => (
                                    <div key={el.id} className="card card-highlight card-hover-right">
                                        <div className="card-header">
                                            <h3 className="card-title">{el.name} {el.surname}</h3>
                                            <p className="detail-value">Рік народження: {el.birthYear}</p>
                                            <p className="detail-value">Стать: {el.gender === 'WOMEN' ? '👩 Жінка' : '👨 Чоловік'}</p>
                                        </div>
                                        <div className="card-body">
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <span className="detail-key">Заявлений час:</span>
                                                    <span className="detail-value">{el.seedTime}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-key">Дистанція:</span>
                                                    <span className="detail-value">{el.distance.name}</span>
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
        </div>
    )
}