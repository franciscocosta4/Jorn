import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Ainda a verificar a sessão na API.
    if (loading) {
        return <p>A carregar...</p>;
    }

    // Sem sessão válida, volta para o login.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
