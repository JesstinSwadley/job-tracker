import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();

	return (
		<button
			onClick={() => {
				if (theme === "light") { 
					setTheme("dark");
				} else if (theme === "dark") {
					setTheme("system")
				} else {
					setTheme("light")
				};
			}}
			title={`Current theme: ${theme}`}
			className="p-2 rounded-full hover:bg-ui-bg text-ui-muted hover:text-brand transition-all border border-transparent hover:border-ui-border"
			aria-label="Toggle Theme">
				{
					theme === "light" && 
					<Sun 
						size={20} />
				}

				{
					theme === "dark" && 
					<Moon 
						size={20} />
				}

				{
					theme === "system" && 
					<Monitor 
						size={20} />
				}
		</button>
	);
};

export default ThemeToggle;