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
                // Автоматично сортуємо роки (менший-більший)
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
            // Очищаємо поля
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
                setError("Змагання успішно створено");
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
        <div>
            <a href="/admin">Повернутися до консолі</a>
            <h1>Додати змагання</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="name" placeholder="Назва змагань: "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={3} required/>
                <input
                    type="text"
                    id="date"
                    placeholder="Дата проведення: "
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    minLength={3} required/>
                <input
                    type="number"
                    id="laneCount"
                    placeholder="Кількість доріжок"
                    value={laneCount}
                    onChange={(e) => setLaneCount(Number(e.target.value))}
                    min={1}
                    max={10}
                    required/>

                <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                        Вікові категорії (за роком народження):
                    </label>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Стандартні категорії:</label>
                        {DEFAULT_BIRTH_YEAR_GROUPS.map(group => (
                            <div key={group} style={{ marginBottom: "5px" }}>
                                <label style={{ cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedAgeGroups.includes(group)}
                                        onChange={() => toggleAgeGroup(group)}
                                        style={{ marginRight: "8px" }}
                                    />
                                    {group}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: "15px", padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
                        <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>Додати власну категорію:</label>

                        <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", marginBottom: "5px" }}>Тип категорії:</label>
                            <select
                                value={customGroupType}
                                onChange={(e) => setCustomGroupType(e.target.value as CustomGroupType)}
                                style={{ width: "100%", padding: "5px" }}
                            >
                                <option value="range">Діапазон років (наприклад: 2010-2011)</option>
                                <option value="single">Один рік (наприклад: 2012)</option>
                                <option value="older">Рік і старше (наприклад: 2007 і старше)</option>
                                <option value="younger">Рік і молодше (наприклад: 2020 і молодше)</option>
                            </select>
                        </div>

                        {customGroupType === 'range' && (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                                <input
                                    type="number"
                                    value={customYear1}
                                    onChange={(e) => setCustomYear1(e.target.value)}
                                    placeholder="Рік 1"
                                    style={{ flex: 1, padding: "5px" }}
                                    min={1900}
                                    max={currentYear + 10}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    value={customYear2}
                                    onChange={(e) => setCustomYear2(e.target.value)}
                                    placeholder="Рік 2"
                                    style={{ flex: 1, padding: "5px" }}
                                    min={1900}
                                    max={currentYear + 10}
                                />
                            </div>
                        )}

                        {customGroupType === 'single' && (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                                <input
                                    type="number"
                                    value={customSingleYear}
                                    onChange={(e) => setCustomSingleYear(e.target.value)}
                                    placeholder="Рік народження"
                                    style={{ flex: 1, padding: "5px" }}
                                    min={1900}
                                    max={currentYear + 10}
                                />
                            </div>
                        )}

                        {customGroupType === 'older' && (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                                <input
                                    type="number"
                                    value={customSingleYear}
                                    onChange={(e) => setCustomSingleYear(e.target.value)}
                                    placeholder="Рік народження"
                                    style={{ flex: 1, padding: "5px" }}
                                    min={1900}
                                    max={currentYear + 10}
                                />
                                <span style={{ whiteSpace: "nowrap" }}>і старше</span>
                            </div>
                        )}

                        {customGroupType === 'younger' && (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                                <input
                                    type="number"
                                    value={customSingleYear}
                                    onChange={(e) => setCustomSingleYear(e.target.value)}
                                    placeholder="Рік народження"
                                    style={{ flex: 1, padding: "5px" }}
                                    min={1900}
                                    max={currentYear + 10}
                                />
                                <span style={{ whiteSpace: "nowrap" }}>і молодше</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={addCustomAgeGroup}
                            style={{ width: "100%" }}
                        >
                            Додати категорію
                        </button>
                    </div>

                    {selectedAgeGroups.some(g => !DEFAULT_BIRTH_YEAR_GROUPS.includes(g)) && (
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px" }}>Власні категорії:</label>
                            {selectedAgeGroups
                                .filter(g => !DEFAULT_BIRTH_YEAR_GROUPS.includes(g))
                                .map(group => (
                                    <div key={group} style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span>{group}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeAgeGroup(group)}
                                            style={{ padding: "2px 8px", fontSize: "12px" }}
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                ))}
                        </div>
                    )}

                    <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
                        <strong>Обрані категорії:</strong> {selectedAgeGroups.join(', ') || 'Немає'}
                    </div>
                </div>

                <button>Створити</button>
            </form>
            <p>{error}</p>
        </div>
    )
}