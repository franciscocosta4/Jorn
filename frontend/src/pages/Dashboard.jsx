import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import "./Dashboard.css";
import Checkbox from '@mui/material/Checkbox';

const API_URL = "http://localhost:5259";

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value, decimals = 2) {
  return value.toFixed(decimals);
}

function formatPercent(value, decimals = 2) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export default function Home() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newTodoName, setNewTodoName] = useState("");
  const [creatingTodo, setCreatingTodo] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [etfPrices, setEtfPrices] = useState([]);
  const [etfLoading, setEtfLoading] = useState(true);
  const [etfError, setEtfError] = useState("");

  useEffect(() => {
    async function loadTodos() {
      try {
        const response = await fetch(`${API_URL}/ToDo`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os todos.");
        }

        const dados = await response.json();
        setTodos(dados);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      loadTodos();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    async function loadEtfPrices() {
      try {
        const response = await fetch(`${API_URL}/Finnhub`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os preços dos ETFs.");
        }

        const dados = await response.json();
        setEtfPrices(dados);
      } catch (requestError) {
        setEtfError(requestError.message);
      } finally {
        setEtfLoading(false);
      }
    }

    if (user?.id) {
      loadEtfPrices();
    } else {
      setEtfLoading(false);
    }
  }, [user]);

  async function handleDeleteTodo(id) {
    if (!user?.id) {
      setError("Não foi possível identificar o utilizador autenticado.");
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}/ToDo/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Não foi possível apagar o todo.");
      }

      setTodos((currentTodos) => currentTodos.filter((t) => t.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreateTodo(event) {
    event.preventDefault();
    const name = newTodoName.trim();

    if (!name) {
      return;
    }

    if (!user?.id) {
      setCreateError("Não foi possível identificar o utilizador autenticado.");
      return;
    }

    setCreatingTodo(true);
    setCreateError("");

    try {
      const response = await fetch(`${API_URL}/ToDo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        let message = "Não foi possível criar o todo.";
        try {
          const responseData = await response.json();
          if (typeof responseData === "string" && responseData) {
            message = responseData;
          }
        } catch {
          // Mantém a mensagem genérica quando a API não devolve JSON.
        }
        throw new Error(message);
      }

      const createdTodo = await response.json();
      setTodos((currentTodos) => [...currentTodos, createdTodo]);
      setNewTodoName("");
    } catch (requestError) {
      setCreateError(requestError.message);
    } finally {
      setCreatingTodo(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Olá, {user?.email}</h1>
        </div>
        <button className="logout-button" onClick={logout}>
          sair
        </button>
      </header>

      <section className="create-todo-section" aria-labelledby="create-todo-heading">
        <h2 id="create-todo-heading">Criar um todo</h2>
        <form className="create-todo-form" onSubmit={handleCreateTodo}>
          <label htmlFor="todo-name">O que precisas de fazer?</label>
          <div className="create-todo-controls">
            <input
              id="todo-name"
              type="text"
              value={newTodoName}
              onChange={(event) => setNewTodoName(event.target.value)}
              placeholder="Ex.: Preparar a apresentação"
              maxLength={200}
              required
            />
            <button type="submit" disabled={creatingTodo || !newTodoName.trim()}>
              {creatingTodo ? "A criar..." : "Adicionar todo"}
            </button>
          </div>
          {createError && <p className="form-error" role="alert">{createError}</p>}
        </form>
      </section>

      <section className="todos-section" aria-labelledby="todos-heading">
        <div className="section-heading">
          <h2 id="todos-heading">Os meus todos</h2>
          {!loading && !error && (
            <span className="todo-count">{todos.length} {todos.length === 1 ? "tarefa" : "tarefas"}</span>
          )}
        </div>

        {loading && <p className="status-message">A carregar ...</p>}
        {error && <p className="status-message error-message">{error}</p>}
        {!loading && !error && todos.length === 0 && (
          <p className="status-message">não criaste nenhum todo.</p>
        )}
        {!loading && !error && todos.length > 0 && (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li className={`todo-item${todo.done ? " todo-item-done" : ""}`} key={todo.id}>
                <span className="todo-status" aria-hidden="true">
                  {todo.done ? <Checkbox defaultChecked   size="small"/> : <Checkbox  size="small" /> } 
                </span>  
                <span > {todo.name}</span>
                <button
                  className="delete-todo-button"
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={deletingId === todo.id}
                  aria-label={`Apagar ${todo.name}`}
                >
                  {deletingId === todo.id ? "A apagar..." : "Apagar todo"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="etf-section" aria-labelledby="etf-heading">
        <div className="section-heading">
          <h2 id="etf-heading">Preços dos ETFs</h2>
          {!etfLoading && !etfError && etfPrices.length > 0 && (
            <span className="etf-count">{etfPrices.length} ETFs</span>
          )}
        </div>

        {etfLoading && <p className="status-message">A carregar preços...</p>}
        {etfError && <p className="status-message error-message">{etfError}</p>}
        {!etfLoading && !etfError && etfPrices.length === 0 && (
          <p className="status-message">Nenhum ETF encontrado.</p>
        )}
        {!etfLoading && !etfError && etfPrices.length > 0 && (
          <div className="etf-grid">
            {etfPrices.map((etf) => {
              const data = etf.data;
              const isPositive = data.d >= 0;
              const changeClass = isPositive ? "positive" : "negative";

              return (
                <article className="etf-card" key={etf.symbol}>
                  <div className="etf-card-header">
                    <h3 className="etf-symbol">{etf.symbol}</h3>
                    <span className={`etf-change ${changeClass}`}>
                      {formatPercent(data.dp)}
                    </span>
                  </div>
                  <p className="etf-name">{etf.name}</p>

                  <div className="etf-price-row">
                    <span className="etf-price">{formatNumber(data.c)}</span>
                    <span className={`etf-change-value ${changeClass}`}>
                      {isPositive ? "+" : ""}{formatNumber(data.d)}
                    </span>
                  </div>

                  <div className="etf-details">
                    <div className="etf-detail-item">
                      <span className="etf-detail-label">Abertura</span>
                      <span className="etf-detail-value">{formatNumber(data.o)}</span>
                    </div>
                    <div className="etf-detail-item">
                      <span className="etf-detail-label">Anterior</span>
                      <span className="etf-detail-value">{formatNumber(data.pc)}</span>
                    </div>
                    <div className="etf-detail-item">
                      <span className="etf-detail-label">Máxima</span>
                      <span className="etf-detail-value">{formatNumber(data.h)}</span>
                    </div>
                    <div className="etf-detail-item">
                      <span className="etf-detail-label">Mínima</span>
                      <span className="etf-detail-value">{formatNumber(data.l)}</span>
                    </div>
                  </div>

                  <p className="etf-timestamp">{formatDate(data.t)}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}