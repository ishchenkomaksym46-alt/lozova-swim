import {useState} from "react";
import {useAdminAuth} from "../../../hooks/useAdminAuth";
import {api} from "../../../api/axios";

export default function UpdateDistanceName() {
    const [oldName, setOldName] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useAdminAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await api.patch(`${process.env.REACT_APP_API_URL}/distances/update`, {
                oldName,
                name
            });

            if(res.data.success) {
                setSuccess("Дистанція успішно оновлено");
            } else {
                setError(res.data.message || "Помилка при оновленні дистанції");
            }
        } catch (e: any) {
            console.error(e);
            setError("Помилка сервера");
        }
    }

    return(
        <div>
            <a href="/admin">Назад до консолі</a>
            <h1>Виправити назву дистанцій</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="update" id="oldName"
                       onChange={(e) => setOldName(e.target.value)}
                       placeholder="Стара назва дистанції"
                       minLength={3} required />

                <input type="text" name="update" id="name"
                       onChange={(e) => setName(e.target.value)}
                       placeholder="Нова назва дистанції"
                       minLength={3} required />
                <button>Виправити</button>
            </form>
            <p className="success">{success}</p>
            <p>{error}</p>
        </div>
    )
}