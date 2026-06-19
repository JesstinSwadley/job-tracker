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
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const applyTheme = () => {
			root.classList.remove("light", "dark");

			const activeTheme = theme === "system"
					? (mediaQuery.matches ? "dark" : "light")
					: theme;

			root.classList.remove("light", "dark");
			root.style.colorScheme = activeTheme;
		}

		applyTheme();
		localStorage.setItem("ui-theme", theme);

		if (theme !== "system") {
			return
		}

		mediaQuery.addEventListener("change", applyTheme);
		return () => {
			mediaQuery.removeEventListener("change", applyTheme);
		}
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