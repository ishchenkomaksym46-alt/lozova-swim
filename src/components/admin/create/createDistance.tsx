import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";

export default function CreateDistance() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
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
        setSuccess(null);

        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/distances/create?id=${id}`, {
                    name
                });

            if(res.data.success) {
                setSuccess("Дистанція успішно створена!");
            } else {
                setError(res.data.message || "Помилка при створенні дистанції!");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || "Невідома помилка");
        }
    }

    return(
        <div>
            <a href="/admin">Назад</a>
            <form onSubmit={handleSubmit}>
                <input type="text" name="distanceName" id="distanceName" placeholder="Назва дистанції" minLength={3}
                       onChange={(e) => setName(e.target.value)} required/>
                <button>Додати дистанцію</button>
            </form>
            <p className="success">{success}</p>
            <p>{error}</p>
        </div>
    )
}