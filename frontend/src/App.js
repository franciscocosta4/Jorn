import "./App.css";
import { useEffect, useState } from "react";
function App() {
  // Guarda os dados recebidos da API.
  const [data, setData] = useState([]);

  // Executa quando o componente é carregado.
  useEffect(() => {
    // Faz um pedido GET à API.
    fetch("http://localhost:5259/weatherforecast")
      // Converte a resposta para JSON.
      .then((response) => response.json())
      // Guarda os dados no estado do React.
      .then((dados) => setData(dados));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Frontend</p>
        {data.map((d) => (
          <div>
            <strong>{d.date}</strong>
            <span>/ {d.temperatureC}</span>
            <span>/ {d.temperatureF}</span>
            <span>/ {d.summary}</span>
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;
