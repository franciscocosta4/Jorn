import { useState } from "react";
import { login } from "../api/auth";

export default function Login() {
    // Guarda o email introduzido pelo utilizador.
    const [email, setEmail] = useState("");

    // Guarda a password introduzida pelo utilizador.
    const [password, setPassword] = useState("");

    // Guarda uma eventual mensagem de erro.
    const [error, setError] = useState("");

    // Indica se o login está a ser processado.
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        // Impede o browser de recarregar a página.
        event.preventDefault();

        // Limpa erros anteriores.
        setError("");

        // Indica que começámos o login.
        setLoading(true);

        try {
            // Chama a API ASP.NET Core.
            await login(email, password);

            // Se chegámos aqui, o cookie foi criado.
            //
            // Podemos agora redireccionar para a página
            // protegida.
            window.location.href = "/";
        } catch (error) {
            // Mostra o erro ao utilizador.
            setError(error.message);
        } finally {
            // Termina o estado de loading.
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />
                </div>

                {error && (
                    <p>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "A entrar..." : "Entrar"}
                </button>
            </form>

            <p>
                Não tens conta? <a href="/register">Registar</a>
            </p>
        </div>
    );
}