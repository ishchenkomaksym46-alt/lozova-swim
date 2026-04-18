import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {api} from "../../api/axios";

export default function AdminLogin() {
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            const res = await api.post('/admin/login', { password });

            if(res.data.success) {
                navigate('/admin');
            } else {
                setError(res.data.message || "Неправильний пароль!");
            }
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.response?.data?.message || "Невідома помилка";
            return setError(errorMessage);
        }
    }

    return(
        <div>
            <h1>Вхід в адмін панель</h1>
            <form onSubmit={handleSubmit}>
                <input type="password"
                       name="password"
                       id="password"
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="Пароль: "
                       required/>
                <button>Зайти в акаунт</button>
            </form>
            <p>{error}</p>
        </div>
    )
}