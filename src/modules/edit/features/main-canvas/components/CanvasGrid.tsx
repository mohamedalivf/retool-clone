import { cn } from "@/lib/utils";
import { HUG_HEIGHT } from "../../../constants/hug-system";
import type { ComponentState, GridConfiguration } from "../../../store/types";
import { ComponentRenderer } from "./editable/component-renderer";

interface CanvasGridProps {
	components: ComponentState[];
	grid: GridConfiguration;
	hasComponents: boolean;
}

/**
 * Component responsible for rendering the grid layout and components
 */
export function CanvasGrid({
	components,
	grid,
	hasComponents,
}: CanvasGridProps) {
	if (!hasComponents) {
		return null;
	}

	return (
		<div
			className={cn(
				// Grid layout
				"relative grid",
				// 2-column grid as per design requirements
				"grid-cols-2",
				// No gaps - components should be flush
				"gap-0",
				// Full height
				"h-full",
				// Smooth transitions
				"transition-all duration-200 ease-in-out",
				// Touch support
				"touch-pan-y",
			)}
			style={{
				gap: "0px", // Force no gap regardless of grid config
				gridAutoRows: `${HUG_HEIGHT}px`, // Fixed row height = 1 hug
				alignItems: "start", // Align items to start of their grid area
			}}
		>
			{components.map((component) => (
				<ComponentRenderer
					key={component.id}
					component={component}
					grid={grid}
				/>
			))}
		</div>
	);
}
