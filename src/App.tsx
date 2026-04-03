// src/App.tsx
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import "./App.css";

// The to-do list item will have an ID number and a description of the thing to do (text string)
interface Todo {
	id: number;
	text: string;
}

function App() {
	// State for the list of todos — typed as an array of Todo objects
	const [todos, setTodos] = useState<Todo[]>([]);

	// State for the input field — TypeScript infers this as string
	const [inputValue, setInputValue] = useState("");

	const [loading, setLoading] = useState(true);

	// when the page loads, fetch todos
	useEffect(() => {
		fetchTodos();
	}, []);

	async function fetchTodos() {
		setLoading(true);
		const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching todos:", error);
		} else {
			setTodos(data);
		}
		setLoading(false);
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const { data, error } = await supabase.from("todos").insert({ text: inputValue.trim() }).select();

		if (error) {
			console.error("Error adding todo:", error);
		} else {
			setTodos([...todos, data[0]]);
			setInputValue("");
		}
	};

	const deleteTodo = async (id) => {
		const { error } = await supabase.from("todos").delete().eq("id", id);

		if (error) {
			console.error("Error deleting todo:", error);
		} else {
			setTodos(todos.filter((todo) => todo.id !== id));
		}
	};

	return (
		<div className="app">
			<h1>React Todo App</h1>

			<form className="todo-form" onSubmit={handleSubmit}>
				<input type="text" placeholder="Add a new todo..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
				<button type="submit">Add</button>
			</form>

			{loading ? (
				<p>Loading todos...</p>
			) : (
				<ul className="todo-list">
					{todos.map((todo) => (
						<li key={todo.id} className="todo-item">
							<span>{todo.text}</span>
							<button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
								Delete
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default App;
