import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export function useAdminAuth() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            try {
                const res = await api.get('/admin/verify');

                if (!res.data.success) {
                    navigate('/admin/login');
                }
            } catch (e: any) {
                console.error(e);
                navigate('/admin/login');
            }
        }

        checkToken();
    }, [navigate]);
}
