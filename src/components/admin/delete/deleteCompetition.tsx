import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

export default function DeleteCompetition() {
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
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
                `${process.env.REACT_APP_API_URL}/competitions/delete?name=${name}`);

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