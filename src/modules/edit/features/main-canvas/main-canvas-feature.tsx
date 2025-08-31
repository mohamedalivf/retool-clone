import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { useRef } from "react";
import { CanvasGrid } from "./components/canvas-grid";
import { CanvasOverlays } from "./components/canvas-overlays";
import { DragDropProvider } from "./components/drag-drop-provider";
import { EmptyState } from "./components/empty-state";
import { useCanvasInteractions } from "./hooks/use-canvas-interactions";
import { useCanvasStore } from "./hooks/use-canvas-store";
import { useComponentHeightFixer } from "./hooks/use-component-height-fixer";
import { useDragAndDrop } from "./hooks/use-drag-and-drop";
import { useKeyboardNavigation } from "./hooks/use-keyboard-navigation";
import { useResizing } from "./hooks/use-resizing";

export function MainCanvasFeature() {
	const canvasRef = useRef<HTMLDivElement | null>(null);

	// Consolidated store selectors
	const {
		components,
		grid,
		hasComponents,
		showGridLines,
		selectedComponentId,
		rightSidebarOpen,
		dragState,
		resizeState,
		actions,
	} = useCanvasStore();

	// Custom hooks for different concerns
	const { handleDragStart, handleDragMove, handleDragEnd } = useDragAndDrop({
		components,
		canvasRef,
		updateComponent: actions.updateComponent,
		selectComponentForDrag: actions.selectComponentForDrag,
		fixExistingComponentHeights: actions.fixExistingComponentHeights,
	});

	useResizing({
		isResizing: resizeState.isResizing,
		resizeState,
		components,
		canvasRef,
		updateResize: actions.updateResize,
		endResize: actions.endResize,
	});

	const { handleKeyDown } = useKeyboardNavigation({
		hasComponents,
		selectedComponentId,
		components,
		rightSidebarOpen,
		selectComponent: actions.selectComponent,
		toggleRightSidebar: actions.toggleRightSidebar,
		toggleComponentWidth: actions.toggleComponentWidth,
	});

	const { handleCanvasClick } = useCanvasInteractions({
		selectedComponentId,
		canvasRef,
		selectComponent: actions.selectComponent,
	});

	useComponentHeightFixer({
		components,
		canvasRef,
		fixExistingComponentHeights: actions.fixExistingComponentHeights,
	});

	const { setNodeRef: setDroppableRef } = useDroppable({
		id: "canvas-drop-zone",
	});

	return (
		<div className="relative h-full overflow-auto bg-background">
			<DragDropProvider
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
			>
				<div
					ref={(node) => {
						canvasRef.current = node;
						setDroppableRef(node);
					}}
					className={cn(
						// Layout
						"h-full relative",
						// Background
						"bg-card/30",
						// Transitions
						"transition-all duration-200 ease-in-out",
						// Focus states
						"focus-within:bg-card/40",
						"focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-inset",
					)}
					onClick={handleCanvasClick}
					onKeyDown={handleKeyDown}
					role="application"
					aria-label="Component canvas - click components to select, use drag handles to reorder, arrow keys to navigate"
				>
					{/* Canvas Overlays (Grid lines, drag zones, resize previews) */}
					<CanvasOverlays
						showGridLines={showGridLines}
						grid={grid}
						isDragging={dragState.isDragging}
						isResizing={resizeState.isResizing}
						draggedComponentId={dragState.draggedComponentId}
						dropZones={dragState.dropZones}
						components={components}
						resizedComponentId={resizeState.resizedComponentId}
						resizePreview={resizeState.resizePreview}
						isValidResize={resizeState.isValidResize}
					/>

					{/* Empty State */}
					{!hasComponents && <EmptyState />}

					{/* Component Grid */}
					<CanvasGrid
						components={components}
						grid={grid}
						hasComponents={hasComponents}
					/>
				</div>
			</DragDropProvider>
		</div>
	);
}
