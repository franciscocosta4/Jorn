import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import "./Dashboard.css";

const API_URL = "http://localhost:5259";

export default function Home() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTodoName, setNewTodoName] = useState("");
  const [creatingTodo, setCreatingTodo] = useState(false);
  const [createError, setCreateError] = useState("");

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
        setTodos(dados.filter((todo) => todo.userId === user?.id));
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
        }),
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
                  {todo.done ? "✓" : "○"}
                </span>
                <span> {todo.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
