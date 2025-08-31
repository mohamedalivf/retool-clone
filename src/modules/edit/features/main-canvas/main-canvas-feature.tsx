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
import { checkCollisionForDrag } from "../../utils/grid-calculations";
import { ComponentRenderer } from "./components/editable/component-renderer";
import { EmptyState } from "./components/empty-state";
import { GridOverlay } from "./components/grid/grid-overlay";

export function MainCanvasFeature() {

	const components = useEditStore((state) => state.components);
	const showGridLines = useEditStore((state) => state.settings.showGridLines);
	const grid = useEditStore((state) => state.grid);
	const selectedComponentId = useEditStore(
		(state) => state.selection.selectedComponentId,
	);
	const selectComponent = useEditStore((state) => state.selectComponent);
	const selectComponentForDrag = useEditStore(
		(state) => state.selectComponentForDrag,
	);
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

	useEffect(() => {
		const canvasWidth = canvasRef.current?.getBoundingClientRect().width;
		if (canvasWidth) {

			useEditStore.setState((state) => ({
				...state,
				components: fixImageComponentHeights(state.components),
			}));
		} else {
			fixExistingComponentHeights();
		}
	}, [fixExistingComponentHeights]);

	useEffect(() => {
		if (components.length > 0) {
			const canvasWidth = canvasRef.current?.getBoundingClientRect().width;
			if (canvasWidth) {
				useEditStore.setState((state) => ({
					...state,
					components: fixImageComponentHeights(state.components),
				}));
			} else {
				fixExistingComponentHeights();
			}
		}
	}, [components.length, fixExistingComponentHeights]);
	const hasComponents = components.length > 0;

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: () => ({ x: 0, y: 0 }),
		}),
	);

	const { setNodeRef: setDroppableRef } = useDroppable({
		id: "canvas-drop-zone",
	});

	const validateDropPosition = useCallback(
		(component: ComponentState, newPosition: Position): boolean => {

			fixExistingComponentHeights();

			const updatedComponents = useEditStore.getState().components;
			const updatedComponent =
				updatedComponents.find((c) => c.id === component.id) || component;

			if (newPosition.x < 0 || newPosition.y < 0) {
				return false;
			}

			if (updatedComponent.size.width === "full") {

				if (newPosition.x !== 0) {
					return false;
				}
			} else {

				if (newPosition.x > 1) {
					return false;
				}
			}

			const otherComponents = updatedComponents.filter(
				(c) => c.id !== updatedComponent.id,
			);

			const hasCollision = checkCollisionForDrag(
				newPosition,
				updatedComponent.size,
				otherComponents,
				updatedComponent.id,
			);

			return !hasCollision;
		},
		[fixExistingComponentHeights],
	);

	const handleCanvasClick = useCallback(
		(e: React.MouseEvent) => {

			if (e.target === e.currentTarget) {
				selectComponent(null);
			}
		},
		[selectComponent],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!hasComponents) return;

			const currentIndex = selectedComponentId
				? components.findIndex((c) => c.id === selectedComponentId)
				: -1;

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

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const { active } = event;
			const componentId = active.id as string;

			selectComponentForDrag(componentId);

			useEditStore.setState((state) => ({
				...state,
				drag: {
					...state.drag,
					isDragging: true,
					draggedComponentId: componentId,
				},
			}));
		},
		[selectComponentForDrag],
	);

	const handleDragMove = useCallback(
		(event: DragMoveEvent) => {
			const { active, delta, activatorEvent } = event;
			const componentId = active.id as string;

			const draggedComponent = components.find((c) => c.id === componentId);
			if (!draggedComponent || !canvasRef.current) {
				return;
			}

			const mouseEvent = activatorEvent as MouseEvent;
			const canvasRect = canvasRef.current.getBoundingClientRect();

			const mouseX = mouseEvent.clientX + delta.x - canvasRect.left;
			const mouseY = mouseEvent.clientY + delta.y - canvasRect.top;

			const columnWidth = canvasRect.width / GRID_COLS;
			const hugSize = HUG_HEIGHT;

			let snapX: number;
			if (draggedComponent.size.width === "full") {
				snapX = 0;
			} else {
				snapX = mouseX < columnWidth ? 0 : 1;
			}

			const snapY = Math.max(0, Math.round(mouseY / hugSize));

			const snapPosition = { x: snapX, y: snapY };

			const isValidDrop = validateDropPosition(draggedComponent, snapPosition);

			const dropZonesToShow: Position[] = isValidDrop ? [snapPosition] : [];

			useEditStore.setState((state) => ({
				...state,
				drag: {
					...state.drag,
					isValidDrop,
					dropZones: dropZonesToShow,
				},
			}));
		},
		[components, validateDropPosition],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, delta, activatorEvent } = event;
			const componentId = active.id as string;

			const draggedComponent = components.find((c) => c.id === componentId);
			if (!draggedComponent || !canvasRef.current) {

				useEditStore.setState((state) => ({
					...state,
					drag: {
						...state.drag,
						isDragging: false,
						draggedComponentId: null,
						dropZones: [],
						isValidDrop: false,
					},
					selection: {
						...state.selection,
						isSelectedForDrag: false,
					},
				}));
				return;
			}

			const mouseEvent = activatorEvent as MouseEvent;
			const canvasRect = canvasRef.current.getBoundingClientRect();

			const mouseX = mouseEvent.clientX + delta.x - canvasRect.left;
			const mouseY = mouseEvent.clientY + delta.y - canvasRect.top;

			const columnWidth = canvasRect.width / GRID_COLS;
			const hugSize = HUG_HEIGHT;

			let snapX: number;
			if (draggedComponent.size.width === "full") {
				snapX = 0;
			} else {
				snapX = mouseX < columnWidth ? 0 : 1;
			}

			const snapY = Math.max(0, Math.round(mouseY / hugSize));

			const snapPosition = { x: snapX, y: snapY };

			const isValidPosition = validateDropPosition(
				draggedComponent,
				snapPosition,
			);

			if (isValidPosition) {

				updateComponent(componentId, {
					position: snapPosition,
				});
			}

			useEditStore.setState((state) => ({
				...state,
				drag: {
					...state.drag,
					isDragging: false,
					draggedComponentId: null,
					dropZones: [],
					isValidDrop: false,
				},
				selection: {
					...state.selection,
					isSelectedForDrag: false,
				},
			}));
		},
		[components, updateComponent, validateDropPosition],
	);

	useEffect(() => {
		if (!isResizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!canvasRef.current || !resizeState.resizedComponentId) return;

			const canvasRect = canvasRef.current.getBoundingClientRect();
			const mouseX = e.clientX - canvasRect.left;
			const mouseY = e.clientY - canvasRect.top;

			const component = components.find(
				(c) => c.id === resizeState.resizedComponentId,
			);
			if (!component) return;

			const columnWidth = canvasRect.width / GRID_COLS;
			const componentX = component.position.x * columnWidth;
			const componentY = component.position.y * HUG_HEIGHT;

			let newWidth = component.size.width;
			let newHeight = component.size.height;

			if (
				resizeState.resizeDirection === "horizontal" ||
				resizeState.resizeDirection === "both"
			) {

				const relativeX = mouseX - componentX;
				const halfWidth = columnWidth;
				const fullWidth = canvasRect.width;

				if (component.size.width === "half") {

					if (relativeX > halfWidth * 0.7) {
						newWidth = "full";
					}
				} else {

					if (relativeX < fullWidth * 0.7) {
						newWidth = "half";
					}
				}
			}

			if (
				resizeState.resizeDirection === "vertical" ||
				resizeState.resizeDirection === "both"
			) {

				const relativeY = mouseY - componentY;
				const newHeightInHugs = Math.max(1, Math.round(relativeY / HUG_HEIGHT));
				newHeight = newHeightInHugs;
			}

			const newSize = { width: newWidth, height: newHeight };
			updateResize(newSize);

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
					isValidResize: true,
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

	useEffect(() => {
		if (selectedComponentId && canvasRef.current) {
			canvasRef.current.focus();
		}
	}, [selectedComponentId]);

	return (
		<div className="relative h-full overflow-auto bg-background">
			{}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToParentElement]}
			>
				{}
				<div
					ref={(node) => {
						canvasRef.current = node;
						setDroppableRef(node);
					}}
					className={cn(

						"h-full relative",

						"bg-card/30",

						"transition-all duration-200 ease-in-out",

						"focus-within:bg-card/40",

						"focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-inset",
					)}
					onClick={handleCanvasClick}
					onKeyDown={handleKeyDown}
					role="application"
					aria-label="Component canvas - click components to select, use drag handles to reorder, arrow keys to navigate"
				>
					{}
					{showGridLines && (
						<GridOverlay
							grid={grid}
							className="absolute inset-0 pointer-events-none z-10"
						/>
					)}

					<SectorBorders
						isDragging={useEditStore((state) => state.drag.isDragging)}
						isResizing={isResizing}
					/>

					{}
					{!hasComponents && <EmptyState />}

					{}
					{hasComponents && (
						<div
							className={cn(

								"relative grid",

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
					)}

					{}
					<SectorBorders
						isDragging={useEditStore((state) => state.drag.isDragging)}
						isResizing={isResizing}
					/>
				</div>

				{}
				<DragOverlay modifiers={[restrictToWindowEdges]}>
					{}
					{}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

interface SectorBordersProps {
	isDragging: boolean;
	isResizing: boolean;
}

function SectorBorders({ isDragging, isResizing }: SectorBordersProps) {
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

	const draggedComponent = draggedComponentId
		? components.find((c) => c.id === draggedComponentId)
		: null;

	const resizedComponent = resizedComponentId
		? components.find((c) => c.id === resizedComponentId)
		: null;

	return (
		<div className="absolute inset-0 pointer-events-none z-20">
			{}
			<div
				className="absolute border-r border-dashed border-primary/30"
				style={{
					left: "50%",
					top: 0,
					height: "100%",
				}}
			/>

			{}
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

			{}
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

			{}
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

			{}
			<div
				className="absolute bg-primary/5"
				style={{
					left: 0,
					top: 0,
					width: "50%",
					height: "100%",
				}}
			/>

			{}
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
