import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
export default function Home() {
  const { user, logout } = useAuth();
  const [data, setData] = useState([]);

  // Executa quando o componente é carregado.
  useEffect(() => {
    // Faz um pedido GET à API.
    fetch("http://localhost:5259/weatherforecast", {
  credentials: "include",
})
    
      // Converte a resposta para JSON.
      .then((response) => response.json())
      // Guarda os dados no estado do React.
      .then((dados) => setData(dados));
  }, []);

  async function handleLogout() {
    await logout();
  }

  return (
    <div>
      <h1>Área privada</h1>

      <p>Utilizador: {user?.email}</p>
      {data.map((d) => (
        <div>
          <strong>{d.date}</strong>
          <span>/ {d.temperatureC}</span>
          <span>/ {d.temperatureF}</span>
          <span>/ {d.summary}</span>
        </div>
      ))}
      <button onClick={handleLogout}>Terminar sessão</button>
    </div>
  );
}
