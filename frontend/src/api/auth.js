const API_URL = "http://localhost:5259";

export async function register(email, password) {
    const response = await fetch(
        `${API_URL}/register`,
        {
            // O registo é efectuado através de POST.
            method: "POST",

            // Estamos a enviar JSON.
            headers: {
                "Content-Type": "application/json"
            },

            // Permite ao browser receber o
            // cookie HttpOnly da API.
            credentials: "include",

            // Dados enviados para o ASP.NET Identity.
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    // Se o registo falhar, devolvemos o erro da API.
    //
    // O Identity devolve os erros de validação
    // (ex: password fraca, email já registado)
    // num objeto JSON com a forma { errors: {...} }.
    if (!response.ok) {
        let message = "Erro ao registar.";

        try {
            const data = await response.json();

            if (data?.errors) {
                message = Object.values(data.errors)
                    .flat()
                    .join(" ");
            }
        } catch {
            // Se o corpo não for JSON, mantém
            // a mensagem genérica.
        }

        throw new Error(message);
    }

    return true;
}

export async function login(email, password) {
    const response = await fetch(
        `${API_URL}/login?useCookies=true`,
        {
            // O login é efectuado através de POST.
            method: "POST",

            // Estamos a enviar JSON.
            headers: {
                "Content-Type": "application/json"
            },

            // Permite ao browser receber e enviar o
            // cookie HttpOnly da API.
            credentials: "include",

            // Dados enviados para o ASP.NET Identity.
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    // Se o login falhar, devolvemos o erro.
    if (!response.ok) {
        throw new Error("Email ou password inválidos.");
    }

    // O cookie foi guardado automaticamente pelo browser.
    return true;
}

export async function getCurrentUser() {
    const response = await fetch(
        `${API_URL}/api/users/me`,
        {
            // Envia automaticamente o cookie HttpOnly.
            credentials: "include"
        }
    );

    // 401 significa que não existe uma sessão válida.
    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Erro ao obter o utilizador.");
    }

    return await response.json();
}

export async function logout() {
    const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
            // O logout deve ser POST.
            method: "POST",

            // Envia o cookie para a API.
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error("Erro ao terminar sessão.");
    }
}