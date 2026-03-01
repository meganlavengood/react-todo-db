// src/App.tsx
import "./App.css";

// src/App.tsx
import { useState } from "react";
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault(); // Stop the browser from refreshing the page

		// Don't add empty todos
		if (!inputValue.trim()) return;

		// Create a new todo object that matches our Todo interface
		const newTodo: Todo = {
			id: Date.now(), // Unique ID using current timestamp
			text: inputValue.trim(), // Remove extra whitespace
		};

		// Add the new todo to the existing array (spread operator creates a copy)
		setTodos([...todos, newTodo]);

		// Clear the input field
		setInputValue("");
	};

	const deleteTodo = (id: number) => {
		setTodos(todos.filter((todo) => todo.id !== id)); // Returns true for every todo except the one with the same id
	};

	return (
		<div className="app">
			<h1>React To-do App</h1>

			<form className="todo-form" onSubmit={handleSubmit}>
				<input type="text" placeholder="Add a new to-do..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
				<button type="submit">Add</button>
			</form>

			<ul className="todo-list">
				{todos.map((todo) => (
					<li key={todo.id} className="todo-item">
						<span>☐ {todo.text}</span>
						<button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
							Delete
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export default App;
