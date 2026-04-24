import {useState, useEffect} from "react";
import {api} from "../../api/axios";
import {useSearchParams} from "react-router-dom";
import "../../styles/global.css";
import "../../styles/protocols.css";

type ProtocolType = {
    id: number;
    textContent: string;
    fileName: string | null;
    fileUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function ViewProtocol() {
    const [protocol, setProtocol] = useState<ProtocolType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    const competitionId = searchParams.get('id');

    useEffect(() => {
        if (!competitionId) {
            setError("ID змагання не надано");
            return;
        }

        const getProtocol = async () => {
            try {
                const res = await api.get(`/protocols?id=${competitionId}`);

                if(res.status === 200) {
                    setProtocol(res.data.data);
                } else {
                    setError(res.data.message || "Не вдалося завантажити протокол");
                }
            } catch (error: any) {
                console.error(error);
                setError(error.response?.data?.message || error.message || "Протокол не знайдено");
            }
        }

        getProtocol();
    }, [competitionId]);

    return (
        <div className="protocol-page">
            <div className="container">
                <a href="/" className="back-link">Повернутися до змагань</a>

                <div className="protocol-header">
                    <h1 className="protocol-title">Протокол</h1>
                </div>

                {error && <p className="error-message">{error}</p>}

                {protocol && (
                    <div className="protocol-content">
                        <div className="protocol-text">
                            {protocol.textContent?.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                        {protocol.fileUrl && (
                            <div className="protocol-file">
                                <a href={protocol.fileUrl} target="_blank" rel="noopener noreferrer" className="protocol-download">
                                    📄 Завантажити файл протоколу
                                </a>
                            </div>
                        )}
                        <div className="protocol-meta">
                            <p className="protocol-updated">
                                Оновлено: {new Date(protocol.updatedAt).toLocaleString('uk-UA')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
