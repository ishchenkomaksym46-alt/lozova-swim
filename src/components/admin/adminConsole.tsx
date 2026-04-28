import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {api} from "../../api/axios";
import {useAdminAuth} from "../../hooks/useAdminAuth";

export default function AdminConsole() {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useAdminAuth();

    async function logout() {
        setError(null);

        try {
            const res = await api.post('/admin/logout');

            if(!res.data.success) {
                setError(res.data.message);
            } else {
                navigate('/');
            }
        } catch (e: any) {
            console.error(e);
            return setError("Невідома помилка");
        }
    }

    return(
        <div>
            <a href="/">Назад</a>
            <h1>Консоль адміністратора</h1>
            <button onClick={logout}>Вийти з акаунту</button>
            <a href="/admin/competition/create">Додати змагання</a>
            <a href="/admin/competition/delete">Видалити змагання</a>
            <a href="/admin/competition/update">Виправити назву змагання або дату проведення</a>
            <h2>Заявочний протокол та формування заплавів</h2>
            <a href="/admin/entries/create">Створити заявку</a>
            <a href="/admin/entries/select">Додати учасників до заявки</a>
            <a href="/admin/seeding/generate">Автоматичне формування заплавів</a>
            <p>{error}</p>
        </div>
    )
}