import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { clearAdminToken } from "../utils/adminAuth";

export function useAdminAuth() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            try {
                const res = await api.get('/admin/verify');

                if (!res.data.success) {
                    clearAdminToken();
                    navigate('/admin/login');
                }
            } catch (e: any) {
                console.error(e);
                clearAdminToken();
                navigate('/admin/login');
            }
        }

        checkToken();
    }, [navigate]);
}
