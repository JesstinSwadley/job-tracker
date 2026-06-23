import { Moon, Sun, Monitor  } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "system";

const themeOptions = [
	{
		key: "light",
		label: "Light",
		Icon: Sun
	},
	{
		key: "dark",
		label: "Dark",
		Icon: Moon
	},
	{
		key: "system",
		label: "System",
		Icon: Monitor
	}
] as const;

const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}

			if (isOpen) {
				document.addEventListener("mousedown", handleOutsideClick);
			}

			return () => {
				document.removeEventListener("mousedown", handleOutsideClick);
			}
		}
	}, [isOpen]);

	const ActiveIcon = themeOptions.find((opt) => opt.key === theme)?.Icon || Monitor;

	return (
		<div
			ref={containerRef}
			className="relative inline-block text-left">
				<button
					onClick={() => setIsOpen((prev) => !prev)}
					title="Change them layout"
					aria-haspopup="true"
					aria-expanded={isOpen}
					aria-label="Theme selection menu"
					className="p-2 rounded-full hover:bg-ui-bg text-ui-muted hover:text-brand transition-all border border-transparent hover:border-ui-border cursor-pointer flex items-center justify-center">
						<ActiveIcon
							size={20} />
				</button>

				{isOpen && (
					<div
						role="menu"
						aria-orientation="vertical"
						className="absolute right-0 mt-2 w-36 origin-top-right rounded-brand border border-ui-border bg-ui-bg shadow-xl z-50 py-1">
							{themeOptions.map(({key, label, Icon}) => {
								const isSelected = theme === key;

								return (
									<button
										key={key}
										onClick={() => {
											setTheme(key as Theme);
											setIsOpen(false);
										}}
										className={`w-full flex items-center justify-between px-3 py-2 text-sm font-bold transition-colors cursor-pointer text-left ${
											isSelected ? "text-brand bg-ui-bg/50" : "text-ui-text hover:bg-ui-bg hover:text-brand"
										}`}
										role="menuitem">
											<div
												className="flex items-center gap-2">
													<Icon
														size={16}
														className={isSelected ? "text-brand" : "text-ui-muted"} />
													<span>{label}</span>
												</div>
									</button>
								)
							})}
					</div>
				)}
		</div>
	);
};

export default ThemeToggle;