/**
 * Component renderer that displays components on the canvas
 * Enhanced with shadcn/ui Card and Badge components for boundary indicators
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentState, GridConfiguration } from "../../store/types";
import {
	useEditStore,
	useIsComponentSelected,
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

		// TODO: Multi-select with Shift+click (future enhancement)
		// For now, single selection only
		if (e.shiftKey) {
			// Multi-select logic would go here
			console.log("Multi-select not yet implemented");
		}

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

	// For text components, use auto grid row. For images, use span if needed
	const gridRow =
		component.type === "text"
			? `${component.position.y + 1}`
			: `${component.position.y + 1} / span ${component.size.height}`;

	return (
		<div
			className={cn(
				// Enhanced container with better interaction states
				"relative cursor-pointer transition-all duration-200",
				"group", // Enable group hover states
				// Enhanced hover states
				"hover:ring-1 hover:ring-ring/30 hover:ring-offset-1",
				"hover:shadow-sm hover:z-[5]",
				// Selection states - enhanced visual feedback
				isSelected && [
					"ring-2 ring-primary/60 ring-offset-1 ring-offset-background",
					"shadow-md",
					"z-10", // Bring selected component above others
				],
				// Component type specific styling
				component.type === "text" && "min-h-[60px]",
				component.type === "image" && "min-h-[120px]",
				// Enhanced interactive states
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"focus-visible:ring-offset-2",
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
			{/* Enhanced Selection Indicator using shadcn/ui Badge */}
			{isSelected && (
				<Badge
					variant="default"
					className={cn(
						"absolute -top-3 left-2 z-20",
						"bg-primary text-primary-foreground",
						"shadow-md border border-primary/20",
						"text-xs font-medium",
						"animate-in fade-in-0 slide-in-from-top-1 duration-200",
					)}
				>
					{component.type} component
				</Badge>
			)}

			{/* Component Content - Direct rendering without wrapper */}
			<div className="w-full h-full">
				{component.type === "text" && <TextComponent component={component} />}
				{component.type === "image" && <ImageComponent component={component} />}
			</div>

			{/* Enhanced Component Type Indicator Badge */}
			<Badge
				variant="outline"
				className={cn(
					"absolute bottom-1 right-1 z-10",
					"bg-background/80 text-muted-foreground",
					"border-border/50 text-xs",
					// Enhanced visibility states
					"opacity-0 group-hover:opacity-75 transition-opacity duration-200",
					isSelected && "opacity-100",
					// Hide on mobile to save space
					"hidden sm:inline-flex",
				)}
			>
				{component.type}
			</Badge>

			{/* Selection Indicator Badge */}

			{/* Resize Handle Indicator (for future resizing feature) */}
			{isSelected && (
				<div
					className={cn(
						"absolute bottom-0 right-0 w-3 h-3",
						"bg-ring/60 rounded-tl-sm",
						"cursor-se-resize",
						"opacity-60 hover:opacity-100",
						"transition-opacity duration-200",
						// Visual indicator lines
						"after:content-[''] after:absolute after:bottom-0.5 after:right-0.5",
						"after:w-1 after:h-1 after:bg-background after:rounded-full",
					)}
					title="Resize component (coming soon)"
				/>
			)}
		</div>
	);
}
