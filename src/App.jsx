import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./auth";
import "./App.css";

function App() {
	const [todos, setTodos] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);

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

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user ?? null);
			setAuthLoading(false);

			if (session?.user) {
				fetchTodos();
			} else {
				setTodos([]);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const handleSignOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) console.error("Error signing out:", error.message);
	};

	if (authLoading) {
		return (
			<div className="app">
				<p>Loading...</p>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="app">
				<h1>React Todo App</h1>
				<Auth />
			</div>
		);
	}

	return (
		<div className="app">
			<div className="header">
				<h1>React Todo App</h1>
				<div>
					<span>{user.email}</span>
					<button onClick={handleSignOut}>Sign Out</button>
				</div>
			</div>

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
