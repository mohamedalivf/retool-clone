import type {
	DragEndEvent,
	DragMoveEvent,
	DragStartEvent,
} from "@dnd-kit/core";
import { useCallback } from "react";
import { GRID_COLS, HUG_HEIGHT } from "../../../constants/hug-system";
import type { ComponentState, Position } from "../../../store/types";
import { useEditStore } from "../../../store/use-edit-store";
import { checkCollisionForDrag } from "../../../utils/grid-calculations";

interface UseDragAndDropProps {
	components: ComponentState[];
	canvasRef: React.RefObject<HTMLDivElement | null>;
	updateComponent: (id: string, updates: Partial<ComponentState>) => void;
	selectComponentForDrag: (id: string) => void;
	fixExistingComponentHeights: () => void;
}

/**
 * Hook for handling drag and drop operations on the canvas
 */
export function useDragAndDrop({
	components,
	canvasRef,
	updateComponent,
	selectComponentForDrag,
	fixExistingComponentHeights,
}: UseDragAndDropProps) {
	const validateDropPosition = useCallback(
		(component: ComponentState, newPosition: Position): boolean => {
			// Fix existing component heights before validation
			fixExistingComponentHeights();

			const updatedComponents = useEditStore.getState().components;
			const updatedComponent =
				updatedComponents.find((c) => c.id === component.id) || component;

			if (newPosition.x < 0 || newPosition.y < 0) {
				return false;
			}

			if (updatedComponent.size.width === "full") {
				// Full width components must be at x=0
				if (newPosition.x !== 0) {
					return false;
				}
			} else {
				// Half width components can be at x=0 or x=1
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
		[components, validateDropPosition, canvasRef],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, delta, activatorEvent } = event;
			const componentId = active.id as string;

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
				selection: {
					...state.selection,
					isSelectedForDrag: false,
				},
			}));
		},
		[components, updateComponent, validateDropPosition, canvasRef],
	);

	return {
		handleDragStart,
		handleDragMove,
		handleDragEnd,
		validateDropPosition,
	};
}
