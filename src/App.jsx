import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./auth";
import "./App.css";

function App() {
	const [yarns, setYarns] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [editValue, setEditValue] = useState("");
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(null);
	const [user, setUser] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);

	useEffect(() => {
		fetchYarns();
	}, []);

	async function fetchYarns() {
		setLoading(true);
		const { data, error } = await supabase.from("yarns").select("*").order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching yarns:", error);
		} else {
			setYarns(data);
		}
		setLoading(false);
	}

	const handleSubmitNew = async (e) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const { data, error } = await supabase.from("yarns").insert({ text: inputValue.trim() }).select();

		if (error) {
			console.error("Error adding yarn:", error);
		} else {
			setYarns([...yarns, data[0]]);
			setInputValue("");
		}
		console.log(yarns);
	};

	const editYarn = async (id) => {
		if (!editValue.trim()) return;

		const { data, error } = await supabase.from("yarns").update({ text: editValue.trim() }).eq("id", id);

		if (error) {
			console.error("Error editing yarn:", error);
		} else {
			setYarns(yarns.map((t) => (t.id === id ? { ...t, text: editValue.trim() } : t)));
			setEditValue("");
			setEditing(null);
		}
	};

	const deleteYarn = async (id) => {
		const { error } = await supabase.from("yarns").delete().eq("id", id);

		if (error) {
			console.error("Error deleting yarn:", error);
		} else {
			setYarns(yarns.filter((yarn) => yarn.id !== id));
		}
	};

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user ?? null);
			setAuthLoading(false);

			// commented out so yarn still displays after signout
			// if (session?.user) {
			// 	fetchYarns();
			// } else {
			// 	setYarns([]);
			// }
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

	return (
		<div className="app">
			<div className="header">
				{!user && <Auth />}
				{user && (
					<div>
						<span>{user.email}</span>
						<button onClick={handleSignOut}>Sign Out</button>
					</div>
				)}
				<h1>Yarn Store Inventory</h1>
			</div>

			{user && (
				<form className="yarn-form" onSubmit={handleSubmitNew}>
					<input type="text" placeholder="Add a new yarn..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
					<button type="submit">Add</button>
				</form>
			)}

			{loading ? (
				<p>Loading yarns...</p>
			) : (
				<ul className="yarn-list">
					{yarns.map((yarn) => (
						<li key={yarn.id} className="yarn-item">
							{editing != yarn.id ? (
								<span>
									{user && (
										<button className="btn edit-btn" onClick={() => setEditing(yarn.id)}>
											Edit
										</button>
									)}
									{yarn.text}
								</span>
							) : (
								<span>
									<input type="text" placeholder="Enter new yarn name..." value={editValue} onChange={(e) => setEditValue(e.target.value)} />
									<button className="btn save-btn" onClick={() => editYarn(yarn.id)}>
										Save
									</button>
								</span>
							)}
							{user && (
								<div>
									<button className="btn delete-btn" onClick={() => deleteYarn(yarn.id)}>
										Delete
									</button>
								</div>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default App;
