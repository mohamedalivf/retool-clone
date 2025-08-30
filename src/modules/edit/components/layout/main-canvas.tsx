/**
 * Main canvas area for grid-based component editing
 */

import { cn } from "@/lib/utils";
import { useEditStore } from "../../store/use-edit-store";
import { ComponentRenderer } from "../editable/component-renderer";
import { GridOverlay } from "../grid/grid-overlay";
import { EmptyState } from "./empty-state";

export function MainCanvas() {
	// Use specific selectors to prevent unnecessary re-renders
	const components = useEditStore((state) => state.components);
	const showGridLines = useEditStore((state) => state.settings.showGridLines);
	const grid = useEditStore((state) => state.grid);

	const hasComponents = components.length > 0;

	return (
		<div className="relative h-full overflow-auto">
			{/* Grid Container */}
			<div
				className={cn("min-h-full relative", "transition-all duration-200")}
				style={{
					padding: `${grid.containerPadding.top}px ${grid.containerPadding.right}px ${grid.containerPadding.bottom}px ${grid.containerPadding.left}px`,
				}}
			>
				{/* Grid Overlay */}
				{showGridLines && (
					<GridOverlay
						grid={grid}
						className="absolute inset-0 pointer-events-none z-10"
					/>
				)}

				{/* Empty State */}
				{!hasComponents && <EmptyState />}

				{/* Component Grid */}
				{hasComponents && (
					<div
						className="relative"
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(2, 1fr)",
							gap: `${grid.gap}px`,
							minHeight: `${grid.cellHeight * grid.rows}px`,
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
				)}

				{/* Drop Zones (will be added with drag & drop) */}
				<div className="absolute inset-0 pointer-events-none">
					{/* TODO: Add drop zone indicators during drag operations */}
				</div>
			</div>
		</div>
	);
}
