import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function DeleteDistance() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
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
    
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        
        try {
            const res = await axios.delete(
                `${process.env.REACT_APP_API_URL}/distances/delete?name=${name}`);

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