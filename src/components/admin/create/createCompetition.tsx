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

export default function CreateCompetition() {
    const [name, setName] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [laneCount, setLaneCount] = useState<number>(6);
    const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(DEFAULT_BIRTH_YEAR_GROUPS);
    const [customAgeGroup, setCustomAgeGroup] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useAdminAuth();

    function toggleAgeGroup(group: string) {
        setSelectedAgeGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    }

    function addCustomAgeGroup() {
        const trimmed = customAgeGroup.trim();
        if (trimmed && !selectedAgeGroups.includes(trimmed)) {
            setSelectedAgeGroups(prev => [...prev, trimmed]);
            setCustomAgeGroup("");
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

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Додати власну категорію:</label>
                        <div style={{ display: "flex", gap: "5px" }}>
                            <input
                                type="text"
                                value={customAgeGroup}
                                onChange={(e) => setCustomAgeGroup(e.target.value)}
                                placeholder="Наприклад: 2010-2011 або 2005 і старше"
                                style={{ flex: 1 }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCustomAgeGroup();
                                    }
                                }}
                            />
                            <button type="button" onClick={addCustomAgeGroup}>Додати</button>
                        </div>
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