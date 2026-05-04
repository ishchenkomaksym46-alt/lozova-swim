import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../api/axios";

type ParticipantType = {
    id: number;
    name: string;
    surname: string;
    birthYear: number | null;
    declaredTime: string;
    actualTime: string | null;
    lane: number;
}

type HeatType = {
    id: number;
    heatNumber: number;
    participants: ParticipantType[];
    distance: {
        competition: {
            ageGroups: string;
        }
    }
}

export default function Heats() {
    const [searchParam] = useSearchParams();
    const id = searchParam.get("id");
    const [error, setError] = useState<string | null>(null);
    const [heats, setHeats] = useState<HeatType[]>([]);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // Function to determine age group based on birth year
    const getAgeGroup = (birthYear: number | null, ageGroupsString: string): string => {
        if (!birthYear) return "Невідомо";

        const ageGroups = ageGroupsString.split(',').map(g => g.trim());

        for (const group of ageGroups) {
            // Single year like "2012"
            if (/^\d{4}$/.test(group.trim())) {
                const year = parseInt(group.trim());
                if (birthYear === year) {
                    return group;
                }
            }
            // Range like "2016-2017"
            else if (group.includes('-') && !group.includes('старше') && !group.includes('молодше')) {
                const years = group.match(/\d+/g)?.map(Number) || [];
                if (years.length === 2 && years[0] !== undefined && years[1] !== undefined) {
                    const minYear = Math.min(years[0], years[1]);
                    const maxYear = Math.max(years[0], years[1]);
                    if (birthYear >= minYear && birthYear <= maxYear) {
                        return group;
                    }
                }
            }
            // "2007 і старше"
            else if (group.includes('старше')) {
                const year = parseInt(group.match(/\d+/)?.[0] || '0');
                if (year > 0 && birthYear <= year) {
                    return group;
                }
            }
            // "2020 і молодше"
            else if (group.includes('молодше')) {
                const year = parseInt(group.match(/\d+/)?.[0] || '0');
                if (year > 0 && birthYear >= year) {
                    return group;
                }
            }
        }

        return "Невідомо";
    };

    useEffect(() => {
        const getHeats = async () => {
            setError(null);
            setLoading(true);

            try {
                const res = await api.get('/heats', {
                    params: { id }
                });

                if(res.data.success) {
                    setHeats(res.data.data);
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
        getHeats();
    }, [id, navigate]);

    // Group heats by age group
    const groupedHeats = heats.reduce((acc, heat) => {
        const ageGroupsString = heat.distance.competition.ageGroups;

        // Get unique age groups from all participants in this heat
        const heatAgeGroups = new Set(
            heat.participants.map(p => getAgeGroup(p.birthYear, ageGroupsString))
        );

        heatAgeGroups.forEach(ageGroup => {
            if (!acc[ageGroup]) {
                acc[ageGroup] = [];
            }
            acc[ageGroup].push(heat);
        });

        return acc;
    }, {} as Record<string, HeatType[]>);

    async function deleteHeat(heatNumber: number) {
        setError(null);
        setLoading(true);

        try {
            const res = await api.delete('/heats/delete', { params: { heatNumber, distanceId: id } });

            if(!res.data.success) {
                setError(res.data.message);
            }
        } catch (e) {
            console.error(e);
            setError("Невідома помилка");
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="page-wrapper">
            <div className="container">
                <a href={`/distances?id=${searchParam.get("competitionId") || ""}`} className="back-link">← Назад до дистанцій</a>

                <div className="page-header">
                    <h1 className="page-title">🏊 Запливи</h1>
                    <p className="page-subtitle">Перегляд запливів дистанції</p>
                    <a href={`/results?id=${id}`} className="btn btn-primary">🏆 Результати</a>
                </div>

                {isAdmin && (
                    <div className="card section-spacing">
                        <div className="card-header">
                            <h3 className="card-title">⚙️ Адмін панель</h3>
                        </div>
                        <div className="card-body action-bar">
                            <a href={`/admin/heats/create?id=${id}`} className="btn btn-primary">
                                ➕ Додати заплив
                            </a>
                            <a href={`/admin/heats/update?id=${id}`} className="btn btn-secondary">
                                ✏️ Виправити заплив
                            </a>
                        </div>
                    </div>
                )}

                {loading && <div className="loading">Завантаження запливів</div>}

                {error && <div className="alert alert-error">{error}</div>}

                {!loading && heats.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏊</div>
                        <h3 className="empty-state-title">Запливів ще немає</h3>
                        <p className="empty-state-text">Для цієї дистанції ще не додано запливів</p>
                    </div>
                )}

                {!loading && Object.keys(groupedHeats).length > 0 && (
                    <div className="section-spacing">
                        {Object.keys(groupedHeats).map((ageGroup) => (
                            <div key={ageGroup} style={{ marginBottom: '2rem' }}>
                                <h2 className="section-title" style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '1rem',
                                    color: '#2c3e50',
                                    borderBottom: '2px solid #3498db',
                                    paddingBottom: '0.5rem'
                                }}>
                                    👥 Вікова група: {ageGroup}
                                </h2>

                                <div className="cards-grid">
                                    {groupedHeats[ageGroup]
                                        ?.sort((a, b) => a.heatNumber - b.heatNumber)
                                        .map((heat: HeatType) => (
                                        <div key={heat.id} className="card card-hover accent-card">
                                            {isAdmin && (
                                                <button className="btn btn-secondary" onClick={() => deleteHeat(heat.heatNumber)}>🗑️ Видалити заплив</button>
                                            )}
                                            <div className="card-header">
                                                <h2 className="card-title">Заплив #{heat.heatNumber}</h2>
                                            </div>
                                            <div className="card-body">
                                                <p className="detail-value" style={{ marginBottom: '1rem' }}>
                                                    <strong>👥 Кількість учасників:</strong> {heat.participants.length}
                                                </p>

                                                <div style={{ marginBottom: '1rem' }}>
                                                    <strong>Учасники:</strong>
                                                    <ul style={{
                                                        marginTop: '0.5rem',
                                                        paddingLeft: '1.5rem',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {heat.participants
                                                            .sort((a, b) => a.lane - b.lane)
                                                            .map((participant) => (
                                                            <li key={participant.id} style={{ marginBottom: '0.3rem' }}>
                                                                <strong>Доріжка {participant.lane}:</strong> {participant.name} {participant.surname}
                                                                {participant.birthYear && ` (${participant.birthYear})`}
                                                                {participant.declaredTime && ` - ${participant.declaredTime}`}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
