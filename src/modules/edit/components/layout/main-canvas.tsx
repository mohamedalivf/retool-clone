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
import {
	GRID_COLS,
	HUG_HEIGHT,
	MAX_GRID_ROWS,
} from "../../constants/hug-system";
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

			// Hug-based grid calculations
			const columnWidth = canvasRect.width / GRID_COLS; // Each column width in pixels
			const hugSize = HUG_HEIGHT; // HUG_HEIGHT px per hug

			// Snap to columns (0 or 1)
			const snapX = mouseX < columnWidth ? 0 : 1;

			// Snap to hug boundaries (every HUG_HEIGHT px)
			const snapY = Math.max(0, Math.round(mouseY / hugSize));

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
		[components, validateDropPosition],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, delta, activatorEvent } = event;
			const componentId = active.id as string;

			// Find the dragged component
			const draggedComponent = components.find((c) => c.id === componentId);
			if (!draggedComponent || !canvasRef.current) {
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

			// Use mouse position for final snap calculation
			const mouseEvent = activatorEvent as MouseEvent;
			const canvasRect = canvasRef.current.getBoundingClientRect();

			// Calculate final mouse position relative to canvas
			const mouseX = mouseEvent.clientX + delta.x - canvasRect.left;
			const mouseY = mouseEvent.clientY + delta.y - canvasRect.top;

			// Hug-based grid calculations
			const columnWidth = canvasRect.width / GRID_COLS; // Each column width in pixels
			const hugSize = HUG_HEIGHT; // HUG_HEIGHT px per hug

			// Snap to columns (0 or 1)
			const snapX = mouseX < columnWidth ? 0 : 1;

			// Snap to hug boundaries (every HUG_HEIGHT px)
			const snapY = Math.max(0, Math.round(mouseY / hugSize));

			const snapPosition = { x: snapX, y: snapY };

			// Validate the new position based on component size constraints
			const isValidPosition = validateDropPosition(
				draggedComponent,
				snapPosition,
			);

			if (isValidPosition) {
				// Update component position
				updateComponent(componentId, {
					position: snapPosition,
				});
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
		[components, updateComponent, validateDropPosition],
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
						// Base layout - full height, no padding
						"h-full relative",
						// shadcn/ui styling conventions
						"bg-card/30", // Subtle background using card color
						// Transitions
						"transition-all duration-200 ease-in-out",
						// Focus and interaction states
						"focus-within:bg-card/40",
						// Enhanced keyboard navigation
						"focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-inset",
					)}
					onClick={handleCanvasClick}
					onKeyDown={handleKeyDown}
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

					<SectorBorders
						grid={grid}
						isDragging={useEditStore((state) => state.drag.isDragging)}
					/>

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
								// Full height, no padding, no rounded corners
								"h-full",
								// Enhanced visual feedback
								"transition-all duration-200 ease-in-out",
								// Mobile optimizations
								"touch-pan-y", // Better touch scrolling on mobile
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
						left: `${(zone.x / GRID_COLS) * 100}%`,
						top: `${zone.y * HUG_HEIGHT}px`, // Use HUG_HEIGHT directly
						width: `${100 / GRID_COLS}%`,
						height: `${HUG_HEIGHT}px`, // Use HUG_HEIGHT directly
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

interface SectorBordersProps {
	grid: GridConfiguration;
	isDragging: boolean;
}

function SectorBorders({ grid, isDragging }: SectorBordersProps) {
	if (!isDragging) {
		return null;
	}

	return (
		<div className="absolute inset-0 pointer-events-none z-20">
			{/* Vertical grid line - divides left/right columns */}
			<div
				className="absolute border-r border-dashed border-primary/30"
				style={{
					left: "50%",
					top: 0,
					height: "100%",
				}}
			/>

			{/* Horizontal hug lines - show every HUG_HEIGHT px */}
			{Array.from({ length: MAX_GRID_ROWS }, (_, i) => (
				<div
					key={`hug-line-${i}`}
					className="absolute border-b border-dashed border-primary/30"
					style={{
						left: 0,
						top: `${(i + 1) * HUG_HEIGHT}px`, // Every HUG_HEIGHT px
						width: "100%",
					}}
				/>
			))}

			{/* Left column highlight */}
			<div
				className="absolute bg-primary/5"
				style={{
					left: 0,
					top: 0,
					width: "50%",
					height: "100%",
				}}
			/>

			{/* Right column highlight */}
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
	);
}
