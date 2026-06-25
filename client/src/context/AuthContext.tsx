import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
	username: string;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (data: { token: string; username: string; }) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children } : { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("username");
		setUser(null);
	};

	const login = (data: { token: string; username: string }) => {
		localStorage.setItem("token", data.token);
		localStorage.setItem("username", data.username);

		setUser({ username: data.username });
	};

	useEffect(() => {
		const initializeAuth = () => {
			try {
				const token = localStorage.getItem("token");
				const username = localStorage.getItem("username");

				if (token && username) {
					setUser({ username });
				}
			} catch (err) {
				console.error("Auth initialization failed:", err);
				
				logout();
			} finally {
				setIsLoading(false);
			}
		};

		initializeAuth();

		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === "token") {
				if (!e.newValue) {
					setUser(null);
				} else {
					const username = localStorage.getItem("username");

					if (username) {
						setUser({ username });
					}
				}
			}
		};

		window.addEventListener("storage", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
		}
	}, []);



	return (
		<AuthContext.Provider value={{
			user,
			isAuthenticated: !!user,
			isLoading,
			login,
			logout
		}}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within AuthProvider")
	};

	return context;
}