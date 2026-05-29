import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem("ui-theme") as Theme) || "system"
	);

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");

		let activeTheme = theme;

		if (theme === "system") {
			activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}

		root.classList.add(activeTheme);

		root.style.setProperty('color-scheme', activeTheme);

		localStorage.setItem("ui-theme", theme);
	}, [theme]);


	useEffect(() => {
		if (theme !== "system") {
			return
		};

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			const root = window.document.documentElement;

			root.classList.remove("light", "dark");
			root.classList.add(mediaQuery.matches ? "dark" : "light");
		};

		mediaQuery.addEventListener("change", handleChange);

		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	return (
		<ThemeContext.Provider 
			value={{ theme, setTheme }}>
				{children}
		</ThemeContext.Provider>
	);
};


export const useTheme = () => {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider")
	};

	return context;
};