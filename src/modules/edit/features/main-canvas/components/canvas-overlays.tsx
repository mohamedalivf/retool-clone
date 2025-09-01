import { cn } from "@/lib/utils";
import {
	GRID_COLS,
	HUG_HEIGHT,
	MAX_GRID_ROWS,
} from "../../../constants/hug-system";
import type {
	ComponentState,
	GridConfiguration,
	Position,
} from "../../../store/types";
import { GridOverlay } from "./grid-overlay";

interface CanvasOverlaysProps {

	showGridLines: boolean;
	grid: GridConfiguration;


	isDragging: boolean;
	isResizing: boolean;


	draggedComponentId: string | null;
	dropZones: Position[];
	components: ComponentState[];


	resizedComponentId: string | null;
	resizePreview?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	isValidResize: boolean;
}



export function CanvasOverlays({
	showGridLines,
	grid,
	isDragging,
	isResizing,
	draggedComponentId,
	dropZones,
	components,
	resizedComponentId,
	resizePreview,
	isValidResize,
}: CanvasOverlaysProps) {
	const draggedComponent = draggedComponentId
		? components.find((c) => c.id === draggedComponentId)
		: null;

	const resizedComponent = resizedComponentId
		? components.find((c) => c.id === resizedComponentId)
		: null;

	return (
		<>
			{showGridLines && (
				<GridOverlay
					grid={grid}
					className="absolute inset-0 pointer-events-none z-10"
				/>
			)}

			{(isDragging || isResizing) && (
				<div className="absolute inset-0 pointer-events-none z-20">
					<div
						className="absolute border-r border-dashed border-primary/30"
						style={{
							left: "50%",
							top: 0,
							height: "100%",
						}}
					/>

					{Array.from({ length: MAX_GRID_ROWS }, (_, i) => (
						<div
							key={`hug-line-row-${i + 1}`}
							className="absolute border-b border-dashed border-primary/30"
							style={{
								left: 0,
								top: `${(i + 1) * HUG_HEIGHT}px`,
								width: "100%",
							}}
						/>
					))}

					{draggedComponent &&
						dropZones.length > 0 &&
						dropZones.map((zone, index) => {
							const componentWidth =
								draggedComponent.size.width === "full" ? 100 : 50;

							const componentHeight = draggedComponent.size.height * HUG_HEIGHT;

							return (
								<div
									key={`drop-preview-${zone.x}-${zone.y}-${index}`}
									className={cn(
										"absolute transition-all duration-200",
										"border-2 border-solid border-blue-500",
										"bg-blue-50/20",
										"pointer-events-none",
									)}
									style={{
										left: `${(zone.x / GRID_COLS) * 100}%`,
										top: `${zone.y * HUG_HEIGHT}px`,
										width: `${componentWidth}%`,
										height: `${componentHeight}px`,
										zIndex: 40,
									}}
								/>
							);
						})}

					{isResizing && resizedComponent && resizePreview && (
						<div
							className={cn(
								"absolute transition-all duration-200",
								"border-2 border-dashed",
								isValidResize ? "border-blue-500" : "border-red-500",
								"pointer-events-none",
							)}
							style={{
								left: `${resizePreview.x}px`,
								top: `${resizePreview.y}px`,
								width: `${resizePreview.width}px`,
								height: `${resizePreview.height}px`,
								zIndex: 40,
							}}
						/>
					)}

					<div
						className="absolute bg-primary/5"
						style={{
							left: 0,
							top: 0,
							width: "50%",
							height: "100%",
						}}
					/>

					<div
						className="absolute bg-primary/5"
						style={{
							left: "50%",
							top: 0,
							width: "50%",
							height: "100%",
						}}
					/>
				</div>
			)}
		</>
	);
}
