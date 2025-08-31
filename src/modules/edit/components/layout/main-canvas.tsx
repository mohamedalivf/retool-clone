import { cn } from "@/lib/utils";
import {
	DndContext,
	type DragEndEvent,
	type DragMoveEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useDroppable,
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
import type { ComponentState, Position } from "../../store/types";
import {
	fixImageComponentHeights,
	useEditStore,
} from "../../store/use-edit-store";
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
	const toggleComponentWidth = useEditStore(
		(state) => state.toggleComponentWidth,
	);
	const fixExistingComponentHeights = useEditStore(
		(state) => state.fixExistingComponentHeights,
	);
	const rightSidebarOpen = useEditStore(
		(state) => state.sidebars.rightSidebar.isOpen,
	);
	const updateComponent = useEditStore((state) => state.updateComponent);
	const isResizing = useEditStore((state) => state.resize.isResizing);
	const resizeState = useEditStore((state) => state.resize);
	const updateResize = useEditStore((state) => state.updateResize);
	const endResize = useEditStore((state) => state.endResize);

	const canvasRef = useRef<HTMLDivElement>(null);

	// Fix existing component heights on mount and whenever components change
	useEffect(() => {
		const canvasWidth = canvasRef.current?.getBoundingClientRect().width;
		if (canvasWidth) {
			// Pass actual canvas width for accurate calculations
			useEditStore.setState((state) => ({
				...state,
				components: fixImageComponentHeights(state.components, canvasWidth),
			}));
		} else {
			fixExistingComponentHeights();
		}
	}, [fixExistingComponentHeights]);

	// Also fix heights whenever components array changes (more aggressive)
	useEffect(() => {
		if (components.length > 0) {
			const canvasWidth = canvasRef.current?.getBoundingClientRect().width;
			if (canvasWidth) {
				useEditStore.setState((state) => ({
					...state,
					components: fixImageComponentHeights(state.components, canvasWidth),
				}));
			} else {
				fixExistingComponentHeights();
			}
		}
	}, [components.length, fixExistingComponentHeights]);
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

	// Make the canvas a droppable area
	const { setNodeRef: setDroppableRef } = useDroppable({
		id: "canvas-drop-zone",
	});

	// Validate drop position based on component size and grid constraints
	const validateDropPosition = useCallback(
		(component: ComponentState, newPosition: Position): boolean => {
			// Ensure all components have correct heights before collision detection
			fixExistingComponentHeights();

			// Get the updated component with correct height from the store
			const updatedComponents = useEditStore.getState().components;
			const updatedComponent =
				updatedComponents.find((c) => c.id === component.id) || component;

			// Boundary checks
			if (newPosition.x < 0 || newPosition.y < 0) {
				return false;
			}

			// Size-specific constraints
			if (updatedComponent.size.width === "full") {
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

			// Check collision with other components (excluding the dragged component)
			const otherComponents = updatedComponents.filter(
				(c) => c.id !== updatedComponent.id,
			);

			const hasCollision = checkCollision(
				newPosition,
				updatedComponent.size,
				otherComponents,
			);

			return !hasCollision;
		},
		[components, fixExistingComponentHeights],
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

			// Handle Alt + Arrow keys for resizing first
			if (
				e.altKey &&
				selectedComponentId &&
				(e.key === "ArrowLeft" || e.key === "ArrowRight")
			) {
				e.preventDefault();
				toggleComponentWidth(selectedComponentId);
				return;
			}

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
			toggleComponentWidth,
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

	const handleDragMove = useCallback(
		(event: DragMoveEvent) => {
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

	// Resize mouse tracking
	useEffect(() => {
		if (!isResizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!canvasRef.current || !resizeState.resizedComponentId) return;

			const canvasRect = canvasRef.current.getBoundingClientRect();
			const mouseX = e.clientX - canvasRect.left;
			const mouseY = e.clientY - canvasRect.top;

			// Find the component being resized
			const component = components.find(
				(c) => c.id === resizeState.resizedComponentId,
			);
			if (!component) return;

			// Calculate current component position in pixels
			const columnWidth = canvasRect.width / GRID_COLS;
			const componentX = component.position.x * columnWidth;
			const componentY = component.position.y * HUG_HEIGHT;

			// Calculate new size based on resize direction
			let newWidth = component.size.width;
			let newHeight = component.size.height;

			if (
				resizeState.resizeDirection === "horizontal" ||
				resizeState.resizeDirection === "both"
			) {
				// Horizontal resize - snap to half or full width
				const relativeX = mouseX - componentX;
				const halfWidth = columnWidth;
				const fullWidth = canvasRect.width;

				// Determine if closer to half or full width
				if (component.size.width === "half") {
					// Currently half, check if should become full
					if (relativeX > halfWidth * 0.7) {
						newWidth = "full";
					}
				} else {
					// Currently full, check if should become half
					if (relativeX < fullWidth * 0.7) {
						newWidth = "half";
					}
				}
			}

			if (
				resizeState.resizeDirection === "vertical" ||
				resizeState.resizeDirection === "both"
			) {
				// Vertical resize - snap to hug multiples
				const relativeY = mouseY - componentY;
				const newHeightInHugs = Math.max(1, Math.round(relativeY / HUG_HEIGHT));
				newHeight = newHeightInHugs;
			}

			// Update resize preview
			const newSize = { width: newWidth, height: newHeight };
			updateResize(newSize);

			// Calculate preview rectangle for visual feedback
			const previewWidth = newWidth === "full" ? canvasRect.width : columnWidth;
			const previewHeight = newHeight * HUG_HEIGHT;

			useEditStore.setState((state) => ({
				...state,
				resize: {
					...state.resize,
					resizePreview: {
						x: componentX,
						y: componentY,
						width: previewWidth,
						height: previewHeight,
					},
					isValidResize: true, // TODO: Add collision detection
				},
			}));
		};

		const handleMouseUp = () => {
			endResize();
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, resizeState, components, updateResize, endResize]);

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
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToParentElement]}
			>
				{/* Enhanced Grid Container with selection system */}
				<div
					ref={(node) => {
						canvasRef.current = node;
						setDroppableRef(node);
					}}
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
						isDragging={useEditStore((state) => state.drag.isDragging)}
						isResizing={isResizing}
						canvasRef={canvasRef}
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

					{/* Visual feedback during drag and resize operations */}
					<SectorBorders
						isDragging={useEditStore((state) => state.drag.isDragging)}
						isResizing={isResizing}
						canvasRef={canvasRef}
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

interface SectorBordersProps {
	isDragging: boolean;
	isResizing: boolean;
	canvasRef: React.RefObject<HTMLDivElement | null>;
}

function SectorBorders({
	isDragging,
	isResizing,
	canvasRef,
}: SectorBordersProps) {
	const draggedComponentId = useEditStore(
		(state) => state.drag.draggedComponentId,
	);
	const resizedComponentId = useEditStore(
		(state) => state.resize.resizedComponentId,
	);
	const resizePreview = useEditStore((state) => state.resize.resizePreview);
	const isValidResize = useEditStore((state) => state.resize.isValidResize);
	const components = useEditStore((state) => state.components);
	const dropZones = useEditStore((state) => state.drag.dropZones);

	if (!isDragging && !isResizing) {
		return null;
	}

	// Find the dragged component for preview
	const draggedComponent = draggedComponentId
		? components.find((c) => c.id === draggedComponentId)
		: null;

	// Find the resized component for preview
	const resizedComponent = resizedComponentId
		? components.find((c) => c.id === resizedComponentId)
		: null;

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
					key={`hug-line-row-${i + 1}`}
					className="absolute border-b border-dashed border-primary/30"
					style={{
						left: 0,
						top: `${(i + 1) * HUG_HEIGHT}px`, // Every HUG_HEIGHT px
						width: "100%",
					}}
				/>
			))}

			{/* Drop Preview - Blue border showing where component will land */}
			{draggedComponent &&
				dropZones.length > 0 &&
				dropZones.map((zone, index) => {
					const componentWidth =
						draggedComponent.size.width === "full" ? 100 : 50;

					// Calculate actual rendered height based on component type
					let componentHeight: number;
					if (draggedComponent.type === "image") {
						// For images, calculate height based on aspect ratio and width
						const canvasRect = canvasRef.current?.getBoundingClientRect();
						if (canvasRect) {
							const actualWidth = (canvasRect.width * componentWidth) / 100;
							const aspectRatio =
								(draggedComponent.attributes as { aspectRatio?: string })
									.aspectRatio || "16:9";

							// Get aspect ratio value
							let ratio: number;
							switch (aspectRatio) {
								case "1:1":
									ratio = 1;
									break;
								case "16:9":
									ratio = 16 / 9;
									break;
								case "4:3":
									ratio = 4 / 3;
									break;
								case "3:2":
									ratio = 3 / 2;
									break;
								case "21:9":
									ratio = 21 / 9;
									break;
								case "2:1":
									ratio = 2 / 1;
									break;
								default:
									ratio = 16 / 9;
							}

							componentHeight = actualWidth / ratio;
						} else {
							// Fallback to hug-based height
							componentHeight = draggedComponent.size.height * HUG_HEIGHT;
						}
					} else {
						// For text components, use hug-based height
						componentHeight = draggedComponent.size.height * HUG_HEIGHT;
					}

					return (
						<div
							key={`drop-preview-${zone.x}-${zone.y}-${index}`}
							className={cn(
								"absolute transition-all duration-200",
								"border-2 border-solid border-blue-500",
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

			{/* Resize Preview - Blue dashed border showing new size */}
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
