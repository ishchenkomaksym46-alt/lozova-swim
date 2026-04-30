import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import {useSearchParams} from "react-router-dom";

type ParticipantsType = {
    id: number,
    name: string,
    surname: string,
    birthYear: number | null,
    declaredTime: string,
    actualTime: string,
    lane: number
}

type HeatType = {
    id: number,
    heatNumber: number,
    participants: ParticipantsType[],
    distance?: {
        competition: {
            ageGroups: string
        }
    }
}

export default function Heats() {
    const [heats, setHeats] = useState<HeatType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // Function to determine age group based on birth year
    const getAgeGroup = (birthYear: number | null, ageGroupsString: string): string => {
        if (!birthYear) return "Невідомо";

        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;

        // Parse age groups from string like "2016-2017,2014-2015,2012-2013,2010-2011,2008-2009,2007 and older"
        const ageGroups = ageGroupsString.split(',').map(g => g.trim());

        for (const group of ageGroups) {
            if (group.includes('-')) {
                const parts = group.split('-').map(y => parseInt(y.trim()));
                const start = parts[0];
                const end = parts[1];
                if (start !== undefined && end !== undefined && !isNaN(start) && !isNaN(end)) {
                    if (birthYear >= start && birthYear <= end) {
                        return group;
                    }
                }
            } else if (group.includes('і молодше') || group.includes('and younger')) {
                const year = parseInt(group.match(/\d+/)?.[0] || '0');
                if (!isNaN(year) && birthYear >= year) {
                    return group;
                }
            } else if (group.includes('і старше') || group.includes('and older') || group.includes('+')) {
                const year = parseInt(group.match(/\d+/)?.[0] || '0');
                if (!isNaN(year) && birthYear <= year) {
                    return group;
                }
            } else {
                // Single year
                const year = parseInt(group);
                if (!isNaN(year) && birthYear === year) {
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

        getHeats();
        checkToken();
    }, [id]);

    async function deleteHeat(heatNumber: number) {
        setError(null);
        setLoading(true);

        try {
            const res = await api.delete('/heats/delete', {
                params: {
                    heatNumber: heatNumber,
                    distanceId: id
                }
            });

            if(res.status === 200) {
                setHeats(heats.filter(heat => heat.heatNumber !== heatNumber).sort((a, b) => a.heatNumber - b.heatNumber));
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

    return (
        <div>
            <a href="/">Головна</a>
            {isAdmin && (
                <nav>
                    <a href={`/admin/heats/create?id=${id}`}>Створити запливи</a>
                    <a href={`/admin/results/add?distanceId=${id}`}>Додати результати</a>
                </nav>
            )}
            <nav>
                <a href={`/results?id=${id}`} style={{ fontWeight: 'bold', color: '#0066cc' }}>🏆 Переглянути результати</a>
            </nav>
            <h1>Запливи</h1>
            {loading && <p>Завантаження...</p>}
            <div className="heats">
                {!loading && heats.length === 0 && <p>Немає запливів для цієї дистанції</p>}
                {!loading && heats.map((el: HeatType)=> (
                    <div key={el.id} className="heat">
                        {isAdmin && (
                            <nav>
                                <button onClick={() => deleteHeat(el.heatNumber)}>Видалити цей заплив</button>
                                <a href={`/admin/heats/update?heatNumber=${el.heatNumber}&distanceId=${id}`}>Оновити цей заплив</a>
                            </nav>
                        )}
                        <h2>Номер запливу: {el.heatNumber}</h2>

                        {el.participants.length === 0 ? (
                            <p>Немає учасників у цьому запливі</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Доріжка</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Ім'я</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Прізвище</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Рік народження</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Вікова група</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Заявлений час</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Фактичний час</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {el.participants.map((participant: ParticipantsType) => (
                                        <tr key={participant.id}>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{participant.lane}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{participant.name}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{participant.surname}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{participant.birthYear || 'Н/Д'}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                                {el.distance?.competition.ageGroups
                                                    ? getAgeGroup(participant.birthYear, el.distance.competition.ageGroups)
                                                    : 'Н/Д'}
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{participant.declaredTime}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{participant.actualTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))}
            </div>
            <p>{error}</p>
        </div>
    )
}