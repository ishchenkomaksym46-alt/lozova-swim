import {useState} from "react";
import {api} from "../../../api/axios";
import {useAdminAuth} from "../../../hooks/useAdminAuth";

export default function DeleteDistance() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [name, setName] = useState<string>("");

    useAdminAuth();
    
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            const res = await api.delete('/distances/delete', {
                params: { name }
            });

            if(res.data.success) {
                setSuccess("Дистанцію успішно видалено");
            } else {
                setError("Помилка при видаленні дистанції");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || 'Помилка при видаленні дистанції');
        }
    }

    return(
        <div>
            <a href="/admin">Назад</a>
            <h2>Видалити дистанцію</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Назва дистанції"
                onChange={e => setName(e.target.value)}/>
                <button>Видалити</button>
            </form>
            <p className="success">{success}</p>
            <p>{error}</p>
        </div>
    )
}