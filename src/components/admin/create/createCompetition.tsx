import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

const currentYear = new Date().getFullYear();

const DEFAULT_BIRTH_YEAR_GROUPS = [
    `${currentYear - 10}-${currentYear - 9}`,
    `${currentYear - 12}-${currentYear - 11}`,
    `${currentYear - 14}-${currentYear - 13}`,
    `${currentYear - 16}-${currentYear - 15}`,
    `${currentYear - 18}-${currentYear - 17}`,
    `${currentYear - 19} і старше`
];

type CustomGroupType = 'range' | 'older' | 'younger' | 'single';

export default function CreateCompetition() {
    const [name, setName] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [laneCount, setLaneCount] = useState<number>(6);
    const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(DEFAULT_BIRTH_YEAR_GROUPS);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Custom group builder state
    const [customGroupType, setCustomGroupType] = useState<CustomGroupType>('range');
    const [customYear1, setCustomYear1] = useState<string>("");
    const [customYear2, setCustomYear2] = useState<string>("");
    const [customSingleYear, setCustomSingleYear] = useState<string>("");

    useAdminAuth();

    function toggleAgeGroup(group: string) {
        setSelectedAgeGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    }

    function addCustomAgeGroup() {
        let newGroup = "";

        if (customGroupType === 'range') {
            const year1 = parseInt(customYear1);
            const year2 = parseInt(customYear2);
            if (!isNaN(year1) && !isNaN(year2)) {
                const minYear = Math.min(year1, year2);
                const maxYear = Math.max(year1, year2);
                newGroup = `${minYear}-${maxYear}`;
            }
        } else if (customGroupType === 'single') {
            const year = parseInt(customSingleYear);
            if (!isNaN(year)) {
                newGroup = `${year}`;
            }
        } else if (customGroupType === 'older') {
            const year = parseInt(customSingleYear);
            if (!isNaN(year)) {
                newGroup = `${year} і старше`;
            }
        } else if (customGroupType === 'younger') {
            const year = parseInt(customSingleYear);
            if (!isNaN(year)) {
                newGroup = `${year} і молодше`;
            }
        }

        if (newGroup && !selectedAgeGroups.includes(newGroup)) {
            setSelectedAgeGroups(prev => [...prev, newGroup]);
            setCustomYear1("");
            setCustomYear2("");
            setCustomSingleYear("");
        }
    }

    function removeAgeGroup(group: string) {
        setSelectedAgeGroups(prev => prev.filter(g => g !== group));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setError(null);
        setSuccess(null);
        e.preventDefault();

        if (selectedAgeGroups.length === 0) {
            setError("Оберіть хоча б одну вікову категорію");
            return;
        }

        try {
            const res = await api.post('/competitions/create', {
                name,
                date,
                laneCount,
                ageGroups: selectedAgeGroups.join(',')
            });

            if(res.data.success) {
                setSuccess("Змагання успішно створено");
                setName("");
                setDate("");
                setLaneCount(6);
                setSelectedAgeGroups(DEFAULT_BIRTH_YEAR_GROUPS);
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

            return setError("Невідома помилка");
        }
    }

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: '800px' }}>
                <a href="/admin" className="back-link">← Повернутися до консолі</a>

                <div className="page-header">
                    <h1 className="page-title">➕ Додати змагання</h1>
                    <p className="page-subtitle">Створіть нове змагання з віковими категоріями</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Назва змагань:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Введіть назву змагань"
                                minLength={3}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Дата проведення:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                placeholder="Наприклад: 15.05.2026"
                                minLength={3}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Кількість доріжок:</label>
                            <input
                                type="number"
                                className="form-input"
                                value={laneCount}
                                onChange={(e) => setLaneCount(Number(e.target.value))}
                                placeholder="Кількість доріжок"
                                min={1}
                                max={10}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ marginBottom: '1rem' }}>
                                Вікові категорії (за роком народження):
                            </label>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Стандартні категорії:
                                </p>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    {DEFAULT_BIRTH_YEAR_GROUPS.map(group => (
                                        <label key={group} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            background: selectedAgeGroups.includes(group) ? 'var(--water-light)' : 'var(--gray-100)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-base)'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedAgeGroups.includes(group)}
                                                onChange={() => toggleAgeGroup(group)}
                                                style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: selectedAgeGroups.includes(group) ? '600' : '400' }}>
                                                {group}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="card" style={{ background: 'var(--gray-50)', marginBottom: '1.5rem' }}>
                                <p style={{ fontWeight: '600', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                    Додати власну категорію:
                                </p>

                                <div className="form-group">
                                    <label className="form-label">Тип категорії:</label>
                                    <select
                                        className="form-select"
                                        value={customGroupType}
                                        onChange={(e) => setCustomGroupType(e.target.value as CustomGroupType)}
                                    >
                                        <option value="range">Діапазон років (наприклад: 2010-2011)</option>
                                        <option value="single">Один рік (наприклад: 2012)</option>
                                        <option value="older">Рік і старше (наприклад: 2007 і старше)</option>
                                        <option value="younger">Рік і молодше (наприклад: 2020 і молодше)</option>
                                    </select>
                                </div>

                                {customGroupType === 'range' && (
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={customYear1}
                                            onChange={(e) => setCustomYear1(e.target.value)}
                                            placeholder="Рік 1"
                                            min={1900}
                                            max={currentYear + 10}
                                        />
                                        <span style={{ fontWeight: '600' }}>-</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={customYear2}
                                            onChange={(e) => setCustomYear2(e.target.value)}
                                            placeholder="Рік 2"
                                            min={1900}
                                            max={currentYear + 10}
                                        />
                                    </div>
                                )}

                                {(customGroupType === 'single' || customGroupType === 'older' || customGroupType === 'younger') && (
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={customSingleYear}
                                            onChange={(e) => setCustomSingleYear(e.target.value)}
                                            placeholder="Рік народження"
                                            min={1900}
                                            max={currentYear + 10}
                                        />
                                        {customGroupType === 'older' && <span style={{ whiteSpace: 'nowrap', fontWeight: '600' }}>і старше</span>}
                                        {customGroupType === 'younger' && <span style={{ whiteSpace: 'nowrap', fontWeight: '600' }}>і молодше</span>}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-secondary btn-full"
                                    onClick={addCustomAgeGroup}
                                >
                                    Додати категорію
                                </button>
                            </div>

                            {selectedAgeGroups.some(g => !DEFAULT_BIRTH_YEAR_GROUPS.includes(g)) && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Власні категорії:
                                    </p>
                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                        {selectedAgeGroups
                                            .filter(g => !DEFAULT_BIRTH_YEAR_GROUPS.includes(g))
                                            .map(group => (
                                                <div key={group} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.75rem',
                                                    background: 'var(--water-light)',
                                                    borderRadius: 'var(--border-radius-sm)'
                                                }}>
                                                    <span style={{ fontWeight: '600' }}>{group}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => removeAgeGroup(group)}
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    >
                                                        Видалити
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div className="alert alert-info">
                                <strong>Обрані категорії:</strong> {selectedAgeGroups.join(', ') || 'Немає'}
                            </div>
                        </div>

                        <button className="btn btn-primary btn-full">Створити змагання</button>
                    </form>

                    {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
            </div>
        </div>
    )
}
