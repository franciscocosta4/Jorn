import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getCurrentUser,
    logout as apiLogout
} from "../api/auth";

// Cria o contexto de autenticação.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Guarda o utilizador actualmente autenticado.
    const [user, setUser] = useState(null);

    // Indica se ainda estamos a verificar a sessão.
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                // Pergunta à API quem está autenticado.
                //
                // O browser envia automaticamente o cookie.
                const currentUser = await getCurrentUser();

                // Guarda o utilizador.
                setUser(currentUser);
            } catch {
                // Em caso de erro, consideramos o utilizador
                // não autenticado.
                setUser(null);
            } finally {
                // Terminámos a verificação.
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    async function logout() {
        // Pede à API para terminar a sessão.
        await apiLogout();

        // Remove o utilizador do estado React.
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}