/**
 * Main canvas area for grid-based component editing
 * Enhanced with shadcn/ui styling conventions
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	restrictToParentElement,
	restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import type {
	ComponentState,
	GridConfiguration,
	Position,
} from "../../store/types";
import { useEditStore } from "../../store/use-edit-store";
import { checkCollision } from "../../utils/grid-calculations";
import { ComponentRenderer } from "../editable/component-renderer";
import { GridOverlay } from "../grid/grid-overlay";
import { EmptyState } from "./empty-state";

export function MainCanvas() {
	// Use specific selectors to prevent unnecessary re-renders
	const components = useEditStore((state) => state.components);
	const showGridLines = useEditStore((state) => state.settings.showGridLines);
	const grid = useEditStore((state) => state.grid);
	const selectedComponentId = useEditStore(
		(state) => state.selection.selectedComponentId,
	);
	const selectComponent = useEditStore((state) => state.selectComponent);
	const toggleRightSidebar = useEditStore((state) => state.toggleRightSidebar);
	const rightSidebarOpen = useEditStore(
		(state) => state.sidebars.rightSidebar.isOpen,
	);
	const updateComponent = useEditStore((state) => state.updateComponent);

	const canvasRef = useRef<HTMLDivElement>(null);
	const hasComponents = components.length > 0;

	// @dnd-kit sensors for drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // 8px movement required to start drag
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: () => ({ x: 0, y: 0 }), // Will implement custom keyboard navigation
		}),
	);

	// Calculate snap position with improved UX - uses proximity and snap zones
	const calculateSnapPosition = useCallback(
		(
			component: ComponentState,
			delta: { x: number; y: number },
			canvasRect: DOMRect,
			gridConfig: GridConfiguration,
		): Position => {
			// Calculate new pixel position directly from delta (much simpler!)
			// Delta is already relative to the drag start position
			const dragEndX = delta.x; // How far we dragged horizontally
			const dragEndY = delta.y; // How far we dragged vertically

			// Convert delta to relative position within canvas
			// If we dragged more than half the canvas width to the right, go to right column
			const relativeX =
				(component.position.x * (canvasRect.width / gridConfig.cols) +
					dragEndX) /
				canvasRect.width;
			const relativeY =
				(component.position.y * gridConfig.cellHeight + dragEndY) /
				(gridConfig.cellHeight * 10);

			console.log("🔧 Fixed calculation:", {
				componentStartX: component.position.x,
				canvasWidth: canvasRect.width,
				dragDeltaX: dragEndX,
				calculatedRelativeX: relativeX,
				"Should be right?": relativeX > 0.5,
			});

			console.log("📊 Snap calculation:", {
				delta,
				currentPos: component.position,
				relativeX,
				relativeY,
				canvasWidth: canvasRect.width,
				componentWidth: component.size.width,
			});

			// Smart column snapping with generous snap zones
			let snapX = component.position.x; // Default to current position

			if (component.size.width === "full") {
				// Full-width components always stay at x=0
				snapX = 0;
				console.log("🔒 Full-width component, keeping x=0");
			} else {
				// Half-width components: snap to left (0) or right (1) column based on final position
				// Simple rule: left half of screen = left column, right half = right column
				console.log("🔄 Half-width component, final position check");
				console.log(
					"📍 RelativeX:",
					relativeX,
					"- Will snap to:",
					relativeX < 0.5 ? "LEFT (x=0)" : "RIGHT (x=1)",
				);

				// Much simpler: just check which half of the screen we're in
				if (relativeX < 0.5) {
					snapX = 0; // Left half of screen = left column
					console.log("⬅️ In left half, snapping to left column (x=0)");
				} else {
					snapX = 1; // Right half of screen = right column
					console.log("➡️ In right half, snapping to right column (x=1)");
				}
			}

			// Smart row snapping with generous snap zones
			let snapY = component.position.y; // Default to current position

			// Only snap vertically if there's significant vertical movement
			if (Math.abs(delta.y) > 15) {
				// Lower threshold for easier vertical movement
				// Calculate which row we're closest to
				const targetRow = Math.round(relativeY * 10); // Scale to row count

				// Use a threshold for easier row snapping (30% of cell height)
				const rowThreshold = 0.3;
				const rowProgress = (relativeY * 10) % 1; // Progress within current row

				if (rowProgress < rowThreshold) {
					snapY = Math.floor(relativeY * 10);
				} else if (rowProgress > 1 - rowThreshold) {
					snapY = Math.ceil(relativeY * 10);
				} else {
					snapY = Math.round(relativeY * 10);
				}
			}

			// Ensure boundaries
			snapX = Math.max(0, Math.min(snapX, gridConfig.cols - 1));
			snapY = Math.max(0, snapY);

			return { x: snapX, y: snapY };
		},
		[],
	);

	// Validate drop position based on component size and grid constraints
	const validateDropPosition = useCallback(
		(component: ComponentState, newPosition: Position): boolean => {
			// Boundary checks
			if (newPosition.x < 0 || newPosition.y < 0) {
				return false;
			}

			// Size-specific constraints
			if (component.size.width === "full") {
				// Full-width components can only be at x=0 and move up/down
				if (newPosition.x !== 0) {
					return false;
				}
			} else {
				// Half-width components can be at x=0 or x=1 (left or right column)
				if (newPosition.x > 1) {
					return false;
				}
			}

			// Check collision with other components
			const otherComponents = components.filter((c) => c.id !== component.id);
			return !checkCollision(newPosition, component.size, otherComponents);
		},
		[components],
	);

	// Handle background click to deselect
	const handleCanvasClick = useCallback(
		(e: React.MouseEvent) => {
			// Only deselect if clicking directly on the canvas background
			if (e.target === e.currentTarget) {
				selectComponent(null);
			}
		},
		[selectComponent],
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!hasComponents) return;

			const currentIndex = selectedComponentId
				? components.findIndex((c) => c.id === selectedComponentId)
				: -1;

			switch (e.key) {
				case "ArrowDown":
				case "ArrowRight": {
					e.preventDefault();
					const nextIndex =
						currentIndex < components.length - 1 ? currentIndex + 1 : 0;
					selectComponent(components[nextIndex].id);
					break;
				}
				case "ArrowUp":
				case "ArrowLeft": {
					e.preventDefault();
					const prevIndex =
						currentIndex > 0 ? currentIndex - 1 : components.length - 1;
					selectComponent(components[prevIndex].id);
					break;
				}
				case "Escape":
					e.preventDefault();
					selectComponent(null);
					break;
				case "Enter":
				case " ":
					if (selectedComponentId && !rightSidebarOpen) {
						e.preventDefault();
						toggleRightSidebar();
					}
					break;
			}
		},
		[
			components,
			selectedComponentId,
			selectComponent,
			hasComponents,
			rightSidebarOpen,
			toggleRightSidebar,
		],
	);

	// Drag and drop event handlers
	const handleDragStart = useCallback((event: DragStartEvent) => {
		const { active } = event;
		const componentId = active.id as string;

		console.log("🚀 Drag started for component:", componentId);

		// Update drag state in store
		useEditStore.setState((state) => ({
			...state,
			drag: {
				...state.drag,
				isDragging: true,
				draggedComponentId: componentId,
			},
		}));

		// Don't auto-select on drag - let users click component body to select
		// This prevents the sidebar from opening when dragging
	}, []);

	const handleDragOver = useCallback(
		(event: DragOverEvent) => {
			const { active, delta, activatorEvent } = event;
			const componentId = active.id as string;

			// Find the dragged component
			const draggedComponent = components.find((c) => c.id === componentId);
			if (!draggedComponent || !canvasRef.current) {
				return;
			}

			// Get the current mouse position from the activator event
			const mouseEvent = activatorEvent as MouseEvent;
			const canvasRect = canvasRef.current.getBoundingClientRect();

			// Calculate mouse position relative to canvas
			const mouseX = mouseEvent.clientX + delta.x - canvasRect.left;
			const mouseY = mouseEvent.clientY + delta.y - canvasRect.top;

			// Convert to relative position (0 to 1)
			const relativeX = mouseX / canvasRect.width;
			const relativeY = mouseY / canvasRect.height;

			console.log("🖱️ Mouse-based calculation:", {
				mouseClientX: mouseEvent.clientX,
				mouseClientY: mouseEvent.clientY,
				deltaX: delta.x,
				deltaY: delta.y,
				canvasLeft: canvasRect.left,
				canvasTop: canvasRect.top,
				mouseX,
				mouseY,
				relativeX,
				relativeY,
				"Should be right?": relativeX > 0.5,
			});

			// Simple snap logic
			const snapX = relativeX < 0.5 ? 0 : 1;
			const snapY = Math.max(0, Math.floor(relativeY * 10)); // Assuming 10 rows max

			const snapPosition = { x: snapX, y: snapY };

			// Validate the position and update drag state for visual feedback
			const isValidDrop = validateDropPosition(draggedComponent, snapPosition);

			useEditStore.setState((state) => ({
				...state,
				drag: {
					...state.drag,
					isValidDrop,
					dropZones: isValidDrop ? [snapPosition] : [],
				},
			}));
		},
		[components, grid, validateDropPosition],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, delta, activatorEvent } = event;
			const componentId = active.id as string;

			console.log("🏁 Drag ended for component:", componentId, "Delta:", delta);

			// Find the dragged component
			const draggedComponent = components.find((c) => c.id === componentId);
			if (!draggedComponent || !canvasRef.current) {
				console.log("❌ Component not found or canvas ref missing");
				// Reset drag state
				useEditStore.setState((state) => ({
					...state,
					drag: {
						...state.drag,
						isDragging: false,
						draggedComponentId: null,
						dropZones: [],
						isValidDrop: false,
					},
				}));
				return;
			}

			console.log("📍 Current position:", draggedComponent.position);

			// Use mouse position for final snap calculation
			const mouseEvent = activatorEvent as MouseEvent;
			const canvasRect = canvasRef.current.getBoundingClientRect();

			// Calculate final mouse position relative to canvas
			const mouseX = mouseEvent.clientX + delta.x - canvasRect.left;
			const mouseY = mouseEvent.clientY + delta.y - canvasRect.top;

			// Convert to relative position (0 to 1)
			const relativeX = mouseX / canvasRect.width;
			const relativeY = mouseY / canvasRect.height;

			// Simple snap logic
			const snapX = relativeX < 0.5 ? 0 : 1;
			const snapY = Math.max(0, Math.floor(relativeY * 10)); // Assuming 10 rows max

			const snapPosition = { x: snapX, y: snapY };

			console.log(
				"🎯 Mouse-based snap position:",
				snapPosition,
				"relativeX:",
				relativeX,
			);

			// Validate the new position based on component size constraints
			const isValidPosition = validateDropPosition(
				draggedComponent,
				snapPosition,
			);

			console.log("✅ Is valid position:", isValidPosition);

			if (isValidPosition) {
				console.log("🔄 Updating component position to:", snapPosition);
				// Update component position
				updateComponent(componentId, {
					position: snapPosition,
				});
			} else {
				console.log("❌ Invalid position, not updating");
			}

			// Reset drag state
			useEditStore.setState((state) => ({
				...state,
				drag: {
					...state.drag,
					isDragging: false,
					draggedComponentId: null,
					dropZones: [],
					isValidDrop: false,
				},
			}));
		},
		[components, grid, updateComponent, validateDropPosition],
	);

	// Focus management
	useEffect(() => {
		if (selectedComponentId && canvasRef.current) {
			canvasRef.current.focus();
		}
	}, [selectedComponentId]);

	return (
		<div className="relative h-full overflow-auto bg-background">
			{/* @dnd-kit Drag and Drop Context */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToParentElement]}
			>
				{/* Enhanced Grid Container with selection system */}
				<div
					ref={canvasRef}
					className={cn(
						// Base layout
						"min-h-full relative",
						// shadcn/ui styling conventions
						"bg-card/30", // Subtle background using card color
						"border-border/20", // Subtle border
						// Transitions
						"transition-all duration-200 ease-in-out",
						// Focus and interaction states
						"focus-within:bg-card/40",
						// Enhanced keyboard navigation
						"focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-inset",
					)}
					style={{
						padding: `${grid.containerPadding.top}px ${grid.containerPadding.right}px ${grid.containerPadding.bottom}px ${grid.containerPadding.left}px`,
					}}
					onClick={handleCanvasClick}
					onKeyDown={handleKeyDown}
					tabIndex={0}
					role="application"
					aria-label="Component canvas - click components to select, use drag handles to reorder, arrow keys to navigate"
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

					{/* Component Grid - Enhanced with responsive shadcn/ui patterns */}
					{hasComponents && (
						<div
							className={cn(
								// Grid layout with responsive behavior
								"relative grid",
								// Base: 2 columns (as per design requirements)
								"grid-cols-2",
								// NO GAPS - components should be flush against each other
								"gap-0",
								// shadcn/ui spacing and styling
								"rounded-md p-2 sm:p-3 md:p-4",
								// Enhanced visual feedback
								"transition-all duration-200 ease-in-out",
								// Focus and interaction states
								"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
								"hover:bg-card/20",
								// Mobile optimizations
								"touch-pan-y", // Better touch scrolling on mobile
							)}
							style={{
								gap: "0px", // Force no gap regardless of grid config
								gridAutoRows: "auto", // Allow rows to size automatically
								alignItems: "start", // Align items to start of their grid area
								// Responsive grid adjustments
								minHeight: "200px", // Ensure minimum usable space
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

					{/* Drop Zones - Visual feedback during drag operations */}
					<DropZoneIndicators
						grid={grid}
						isDragging={useEditStore((state) => state.drag.isDragging)}
						dropZones={useEditStore((state) => state.drag.dropZones)}
						isValidDrop={useEditStore((state) => state.drag.isValidDrop)}
					/>
				</div>

				{/* @dnd-kit Drag Overlay for visual feedback */}
				<DragOverlay modifiers={[restrictToWindowEdges]}>
					{/* TODO: Render dragged component preview */}
					{/* Will be implemented in next step */}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

// Drop Zone Indicators Component
interface DropZoneIndicatorsProps {
	grid: GridConfiguration;
	isDragging: boolean;
	dropZones: Position[];
	isValidDrop: boolean;
}

function DropZoneIndicators({
	grid,
	isDragging,
	dropZones,
	isValidDrop,
}: DropZoneIndicatorsProps) {
	if (!isDragging || dropZones.length === 0) {
		return null;
	}

	return (
		<div className="absolute inset-0 pointer-events-none z-30">
			{dropZones.map((zone, index) => (
				<div
					key={`drop-zone-${zone.x}-${zone.y}-${index}`}
					className={cn(
						"absolute border-2 border-dashed rounded-lg transition-all duration-300",
						"shadow-lg backdrop-blur-sm",
						isValidDrop
							? "border-green-400 bg-green-100/30 shadow-green-200/50"
							: "border-red-400 bg-red-100/30 shadow-red-200/50",
					)}
					style={{
						left: `${(zone.x / grid.cols) * 100}%`,
						top: `${zone.y * (grid.cellHeight + grid.gap)}px`,
						width: `${100 / grid.cols}%`,
						height: `${grid.cellHeight}px`,
						// Add some margin for better visual feedback
						margin: "2px",
						transform: "scale(1.02)", // Slightly larger for better visibility
					}}
				>
					<Badge
						variant={isValidDrop ? "default" : "destructive"}
						className={cn(
							"absolute top-2 left-2 text-xs font-medium",
							"animate-pulse shadow-sm",
							isValidDrop ? "bg-green-600" : "bg-red-600",
						)}
					>
						{isValidDrop ? "✓ Drop Here" : "✗ Invalid"}
					</Badge>

					{/* Visual snap indicator */}
					<div
						className={cn(
							"absolute inset-0 rounded-lg border border-dashed",
							"opacity-40",
							isValidDrop ? "border-green-300" : "border-red-300",
						)}
					/>
				</div>
			))}
		</div>
	);
}
