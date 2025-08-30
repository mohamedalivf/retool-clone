/**
 * Component renderer that displays components on the canvas
 */

import { cn } from "@/lib/utils";
import type { ComponentState, GridConfiguration } from "../../store/types";
import {
	useIsComponentSelected,
	useEditStore,
} from "../../store/use-edit-store";
import { ImageComponent } from "./image-component";
import { TextComponent } from "./text-component";

interface ComponentRendererProps {
	component: ComponentState;
	grid: GridConfiguration;
}

export function ComponentRenderer({ component }: ComponentRendererProps) {
	// Use specific selectors to prevent unnecessary re-renders
	const selectComponent = useEditStore((state) => state.selectComponent);
	const isSelected = useIsComponentSelected(component.id);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		selectComponent(component.id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			selectComponent(component.id);
		}
	};

	// Calculate grid position
	const gridColumn =
		component.size.width === "full"
			? "1 / -1"
			: component.position.x === 0
				? "1"
				: "2";

	const gridRow = `${component.position.y + 1} / span ${component.size.height}`;

	return (
		<div
			className={cn(
				"relative cursor-pointer transition-all duration-200",
				"hover:ring-2 hover:ring-blue-200",
				isSelected && "ring-2 ring-blue-500 ring-offset-2",
			)}
			style={{
				gridColumn,
				gridRow,
			}}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="button"
			aria-label={`${component.type} component`}
		>
			{/* Component Content */}
			<div className="h-full w-full">
				{component.type === "text" && <TextComponent component={component} />}
				{component.type === "image" && <ImageComponent component={component} />}
			</div>

			{/* Selection Indicator */}
			{isSelected && (
				<div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t-md">
					{component.type} component
				</div>
			)}
		</div>
	);
}
