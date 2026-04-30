import {useEffect, useState} from "react";
import {api} from "../../api/axios";
import {useSearchParams} from "react-router-dom";
import styles from "./results.module.css";

type ResultType = {
    id: number;
    time: string;
    place: number;
    placeInHeat: number;
    participant: {
        id: number;
        name: string;
        surname: string;
        birthYear: number | null;
        lane: number;
        declaredTime: string;
        heat: {
            heatNumber: number;
        };
    };
}

type Distance = {
    id: number;
    name: string;
    competition: {
        name: string;
        date: string;
        ageGroups: string;
    };
}

export default function Results() {
    const [searchParams] = useSearchParams();
    const distanceId = searchParams.get("id");
    const [results, setResults] = useState<ResultType[]>([]);
    const [distance, setDistance] = useState<Distance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");

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
        const fetchResults = async () => {
            try {
                const res = await api.get('/results', {
                    params: { id: distanceId }
                });

                if (res.data.success) {
                    setResults(res.data.data);
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

        const fetchDistance = async () => {
            try {
                const res = await api.get('/distances/details', {
                    params: { id: distanceId }
                });

                if (res.data.success) {
                    setDistance(res.data.data);
                }
            } catch (e: any) {
                console.error(e);
            }
        };

        if (distanceId) {
            fetchResults();
            fetchDistance();
        }
    }, [distanceId]);

    // Filter results based on search query
    const filteredResults = results.filter(result => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        const fullName = `${result.participant.name} ${result.participant.surname}`.toLowerCase();
        const birthYear = result.participant.birthYear?.toString() || "";

        return fullName.includes(query) || birthYear.includes(query);
    });

    // Group results by age group
    const groupedResults = filteredResults.reduce((acc, result) => {
        const ageGroup = distance
            ? getAgeGroup(result.participant.birthYear, distance.competition.ageGroups)
            : "Невідомо";

        if (!acc[ageGroup]) {
            acc[ageGroup] = [];
        }
        acc[ageGroup].push(result);
        return acc;
    }, {} as Record<string, ResultType[]>);

    // Group by heat within each age group
    const groupedByAgeAndHeat = Object.keys(groupedResults).reduce((acc, ageGroup) => {
        const ageGroupResults = groupedResults[ageGroup];
        if (!ageGroupResults) return acc;

        const resultsByHeat = ageGroupResults.reduce((heatAcc, result) => {
            const heatNumber = result.participant.heat.heatNumber;
            if (!heatAcc[heatNumber]) {
                heatAcc[heatNumber] = [];
            }
            heatAcc[heatNumber].push(result);
            return heatAcc;
        }, {} as Record<number, ResultType[]>);

        acc[ageGroup] = resultsByHeat;
        return acc;
    }, {} as Record<string, Record<number, ResultType[]>>);

    if (loading) {
        return <div>Завантаження...</div>;
    }

    if (error) {
        return (
            <div>
                <a href="/">Назад</a>
                <p style={{ color: 'red' }}>Помилка: {error}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div style={{ marginBottom: '20px' }}>
                <a href="/" className={styles.backLink}>← Головна</a>
            </div>

            <h1 className={styles.title}>🏆 Результати</h1>

            {distance && (
                <div className={styles.competitionInfo}>
                    <h2 className={styles.competitionName}>{distance.competition.name}</h2>
                    <p className={styles.competitionDate}>📅 Дата: {distance.competition.date}</p>
                    <p className={styles.distanceName}>
                        🏊 Дистанція: {distance.name}
                    </p>
                </div>
            )}

            {results.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyStateText}>⏳ Результатів ще немає для цієї дистанції</p>
                </div>
            ) : (
                <>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="🔍 Пошук за ім'ям, прізвищем або роком народження..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        <p className={styles.resultsCount}>
                            Всього результатів: <strong>{filteredResults.length}</strong>
                        </p>
                    </div>

                    {Object.keys(groupedByAgeAndHeat).length === 0 ? (
                        <div className={styles.noResults}>
                            <p className={styles.noResultsText}>❌ Нічого не знайдено за вашим запитом</p>
                        </div>
                    ) : (
                        Object.keys(groupedByAgeAndHeat).map((ageGroup) => (
                            <div key={ageGroup} className={styles.ageGroupSection}>
                                {Object.keys(groupedByAgeAndHeat[ageGroup] || {})
                                    .map(Number)
                                    .sort((a, b) => a - b)
                                    .map((heatNumber) => {
                                        const heatResults = groupedByAgeAndHeat[ageGroup]?.[heatNumber];
                                        if (!heatResults) return null;

                                        return (
                                        <div key={heatNumber} className={styles.heatSection}>
                                            <div className={styles.heatHeader}>
                                                🏊 Заплив #{heatNumber}
                                            </div>

                                            <div className={styles.tableContainer}>
                                                <table className={styles.resultsTable}>
                                                    <thead>
                                                        <tr className={styles.tableHeader}>
                                                            <th className={styles.tableHeaderCellCenter}>
                                                                🥇 Місце
                                                            </th>
                                                            <th className={styles.tableHeaderCellCenter}>
                                                                Доріжка
                                                            </th>
                                                            <th className={styles.tableHeaderCell}>
                                                                Ім'я
                                                            </th>
                                                            <th className={styles.tableHeaderCell}>
                                                                Прізвище
                                                            </th>
                                                            <th className={styles.tableHeaderCellCenter}>
                                                                ⏱️ Час
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {heatResults
                                                            .sort((a, b) => a.placeInHeat - b.placeInHeat)
                                                            .map((result, index) => {
                                                                const isHighlighted = searchQuery &&
                                                                    `${result.participant.name} ${result.participant.surname}`.toLowerCase().includes(searchQuery.toLowerCase());

                                                                const rowClass = isHighlighted
                                                                    ? styles.tableRowHighlighted
                                                                    : (index % 2 === 0 ? styles.tableRow : styles.tableRowAlt);

                                                                const placeColorClass =
                                                                    result.placeInHeat === 1 ? styles.placeGold :
                                                                    result.placeInHeat === 2 ? styles.placeSilver :
                                                                    result.placeInHeat === 3 ? styles.placeBronze : styles.placeOther;

                                                                return (
                                                                    <tr key={result.id} className={rowClass}>
                                                                        <td className={`${styles.placeCell} ${placeColorClass}`}>
                                                                            {result.placeInHeat === 1 ? '🥇' :
                                                                             result.placeInHeat === 2 ? '🥈' :
                                                                             result.placeInHeat === 3 ? '🥉' : result.placeInHeat}
                                                                        </td>
                                                                        <td className={styles.tableCellCenter}>
                                                                            {result.participant.lane}
                                                                        </td>
                                                                        <td className={styles.tableCell}>
                                                                            {result.participant.name}
                                                                        </td>
                                                                        <td className={styles.tableCell}>
                                                                            {result.participant.surname}
                                                                        </td>
                                                                        <td className={styles.timeCell}>
                                                                            {result.time}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}
