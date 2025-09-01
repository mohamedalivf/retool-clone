import { cn } from "@/lib/utils";
import { HUG_HEIGHT } from "../../../constants/hug-system";
import type { ComponentState, GridConfiguration } from "../../../store/types";
import { ComponentRenderer } from "./component-renderer";

interface CanvasGridProps {
	components: ComponentState[];
	grid: GridConfiguration;
	hasComponents: boolean;
}



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

				"relative grid pt-4",

				"grid-cols-2",

				"gap-0",

				"h-full",

				"transition-all duration-200 ease-in-out",

				"touch-pan-y",
			)}
			style={{
				gap: "0px",
				gridAutoRows: `${HUG_HEIGHT}px`,
				alignItems: "start",
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
