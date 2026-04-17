// This component handles both sign-up and sign-in. It manages five pieces of state: email and password for the form inputs, loading to disable the button while a request is in flight, error to display error messages, and isSignUp to toggle between sign-up and sign-in modes. The handleSubmit function conditionally calls either signUp or signInWithPassword depending on which mode we’re in.

import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

function Auth() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isSignUp, setIsSignUp] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { error } = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });

		if (error) setError(error.message);
		setLoading(false);
	};

	return (
		<div className="auth-container">
			<h2>{isSignUp ? "Create Account" : "Sign In"}</h2>
			{/* show error message */}
			{error && <p className="error-message">{error}</p>}
			<form onSubmit={handleSubmit}>
				<input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
				<input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
				<button type="submit" disabled={loading}>
					{loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
				</button>
			</form>
			<p className="toggle-auth" onClick={() => setIsSignUp(!isSignUp)}>
				{/* disabled={loading} prevents double-clicks while request in flight */}
				{/* isSignUp toggle: one component handles sign-up and sign-in */}
				{isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
			</p>
		</div>
	);
}

export default Auth;
