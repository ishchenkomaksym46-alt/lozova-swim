import {useState} from "react";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {api} from "../../../api/axios";

export default function UpdateCompetitionName() {
    const [oldName, setOldName] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await api.patch('/competitions/update', {
                oldName,
                name,
                date
            });

            if(res.data.success) {
                setSuccess("Змагання успішно оновлено");
            } else {
                setError(res.data.message || "Помилка при оновленні змагання");
            }
        } catch (e: any) {
            console.error(e);
            setError("Помилка сервера");
        }
    }

    return(
        <div>
            <a href="/admin">Назад до консолі</a>
            <h1>Виправити назву змагань або дату проведення</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="update" id="oldName"
                onChange={(e) => setOldName(e.target.value)}
                placeholder="Стара назва змагання"
                minLength={3} required />

                <input type="text" name="update" id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Нова назва змагання"
                minLength={3} required />

                <input type="text" name="update" id="date"
                onChange={(e) => setDate(e.target.value)}
                placeholder="Нова дата проведення змагань"
                minLength={3} required />
                <button>Виправити</button>
            </form>
            <p className="success">{success}</p>
            <p>{error}</p>
        </div>
    )
}