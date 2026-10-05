import { useState } from "react";
import { register } from "../api/auth";

export default function Register() {
    // Guarda o email introduzido pelo utilizador.
    const [email, setEmail] = useState("");

    // Guarda a password introduzida pelo utilizador.
    const [password, setPassword] = useState("");

    // Guarda uma eventual mensagem de erro.
    const [error, setError] = useState("");

    // Indica se o registo está a ser processado.
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        // Impede o browser de recarregar a página.
        event.preventDefault();

        // Limpa erros anteriores.
        setError("");

        // Indica que começámos o registo.
        setLoading(true);

        try {
            // Cria a conta na API ASP.NET Core.
            await register(email, password);

            // Se chegámos aqui, a conta foi criada.
            //
            // O /register não faz login automático, por isso
            // redireccionamos para o login em vez de ir
            // directo para a página protegida.
            window.location.href = "/login";
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
            <h1>Registo</h1>

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
                    {loading ? "A registar..." : "Registar"}
                </button>
            </form>
        </div>
    );
}