import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {api} from "../../api/axios";

interface EntryItem {
    id: number;
    name: string;
    surname: string;
    birthYear: number;
    seedTime: string;
    ageGroup: string;
    entry: {
        name: string;
    };
}

interface Distance {
    id: number;
    name: string;
    competition: {
        name: string;
        date: string;
    };
}

export default function EntryProtocol() {
    const [searchParam] = useSearchParams();
    const id = searchParam.get("id");
    const [items, setItems] = useState<EntryItem[]>([]);
    const [distance, setDistance] = useState<Distance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchEntryProtocol = async () => {
            try {
                const res = await api.get('/entries/protocol', {
                    params: { id }
                });

                if (res.data.success) {
                    setDistance(res.data.data.distance);
                    setItems(res.data.data.items);
                } else {
                    setError(res.data.message);
                }
            } catch (e: any) {
                console.error(e);
                setError("Невідома помилка");
            } finally {
                setLoading(false);
            }
        };

        fetchEntryProtocol();
    }, [id]);

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <div className="loading">Завантаження протоколу</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <a href="/" className="back-link">← Головна</a>
                    <div className="alert alert-error">Помилка: {error}</div>
                </div>
            </div>
        );
    }

    // Групуємо заявки за віковими групами
    const groupedItems = items.reduce((acc, item) => {
        const group = item.ageGroup;
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(item);
        return acc;
    }, {} as Record<string, EntryItem[]>);

    return (
        <div className="page-wrapper">
            <div className="container">
                <a href="/" className="back-link">← Головна</a>

                <div className="page-header">
                    <h1 className="page-title">📋 Заявочний протокол</h1>
                    <p className="page-subtitle">Перегляд заявок на дистанцію</p>
                </div>

                {distance && (
                    <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, var(--water-light) 0%, var(--white) 100%)' }}>
                        <h2 className="card-title" style={{ color: 'var(--water-deep)', marginBottom: '0.75rem' }}>
                            {distance.competition.name}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            📅 <strong>Дата:</strong> {distance.competition.date}
                        </p>
                        <p style={{ color: 'var(--water-deep)', fontWeight: '600', fontSize: '1.125rem', margin: 0 }}>
                            🏊 <strong>Дистанція:</strong> {distance.name}
                        </p>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">Немає заявок</h3>
                        <p className="empty-state-text">Для цієї дистанції ще не створено заявок</p>
                    </div>
                ) : (
                    <>
                        <div className="card" style={{ marginBottom: '2rem', background: 'var(--water-light)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--water-deep)' }}>
                                👥 Всього учасників: {items.length}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {Object.keys(groupedItems).map((ageGroup) => (
                                <div key={ageGroup} className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Вікова група: {ageGroup}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                            Учасників: {groupedItems[ageGroup]?.length || 0}
                                        </p>
                                    </div>

                                    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--gray-100)' }}>
                                                    <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>№</th>
                                                    <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Ім'я</th>
                                                    <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Прізвище</th>
                                                    <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Рік народження</th>
                                                    <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Заявлений час</th>
                                                    <th style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600' }}>Заявка</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupedItems[ageGroup]?.map((item, index) => (
                                                    <tr key={item.id} style={{ background: index % 2 === 0 ? 'var(--white)' : 'var(--gray-50)' }}>
                                                        <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>{index + 1}</td>
                                                        <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem' }}>{item.name}</td>
                                                        <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem' }}>{item.surname}</td>
                                                        <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', textAlign: 'center' }}>{item.birthYear}</td>
                                                        <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem', fontWeight: '600', color: 'var(--water-deep)' }}>{item.seedTime}</td>
                                                        <td style={{ border: '1px solid var(--gray-300)', padding: '0.75rem' }}>{item.entry.name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
