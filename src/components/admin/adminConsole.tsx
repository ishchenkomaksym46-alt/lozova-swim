import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";

export default function AdminConsole() {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            try {
                axios.defaults.withCredentials = true;
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/verify`);

                if(!res.data.success) {
                    navigate('/admin/login');
                }
            } catch (e: any) {
                console.error(e);
                navigate('/admin/login');
            }
        }

        checkToken();
    }, [navigate]);

    async function logout() {
        setError(null);

        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/admin/logout`);

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
            <p>{error}</p>
        </div>
    )
}