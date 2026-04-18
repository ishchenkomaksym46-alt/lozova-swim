import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

export default function DeleteCompetition() {
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            const res = await api.delete('/competitions/delete', {
                params: { name }
            });

            if(res.data.success) {
                setSuccess(res.data.message || "Змагання успішно видалено!");
            } else {
                setError(res.data.message || "Помилка при видаленні змагання!");
            }
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.response?.data?.message || "Невідома помилка";
            return setError(errorMessage);
        }
    }

    return (
        <div>
            <a href="/admin">Назад до консолі</a>
            <h1>Видалити змагання</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Назва змагання для видалення"
                    onChange={(e) => setName(e.target.value)}
                    required/>
                <button>Видалити</button>
            </form>
            <p className="success">{success}</p>
            <p>{error}</p>
        </div>
    )
}