import type { ComponentState } from "@/modules/edit/store/types";
import {
	useEditStore,
	useIsComponentSelected,
} from "@/modules/edit/store/use-edit-store";
import { useDraggable } from "@dnd-kit/core";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { CSS } from "@dnd-kit/utilities";

interface UseComponentStateProps {
	component: ComponentState;
}

interface UseComponentStateReturn {
	// Selection state
	isSelected: boolean;
	selectComponent: (id: string | null) => void;

	// Drag state
	isBeingDragged: boolean;
	draggedComponentId: string | null;
	dragAttributes: DraggableAttributes;
	dragListeners: SyntheticListenerMap | undefined;
	setNodeRef: (element: HTMLElement | null) => void;
	dragTransform: {
		x: number;
		y: number;
		scaleX: number;
		scaleY: number;
	} | null;
	isCurrentlyDragging: boolean;

	// Resize state
	startResize: (
		componentId: string,
		direction: "horizontal" | "vertical" | "both",
	) => void;

	// Component relationships
	isInsideAnotherComponent: boolean;
	allComponents: ComponentState[];

	// Styling
	getComponentZIndex: () => string;
	dragStyle: { transform: string };

	// Event handlers
	handleClick: (e: React.MouseEvent) => void;
	handleKeyDown: (e: React.KeyboardEvent) => void;
	handleResizeStart: (
		direction: "horizontal" | "vertical" | "both",
	) => (e: React.MouseEvent) => void;
}

export function useComponentState({
	component,
}: UseComponentStateProps): UseComponentStateReturn {
	// Store selectors
	const selectComponent = useEditStore((state) => state.selectComponent);
	const startResize = useEditStore((state) => state.startResize);
	const isSelected = useIsComponentSelected(component.id);
	const draggedComponentId = useEditStore(
		(state) => state.drag.draggedComponentId,
	);
	const allComponents = useEditStore((state) => state.components);

	// Drag and drop setup
	const {
		attributes: dragAttributes,
		listeners: dragListeners,
		setNodeRef,
		transform: dragTransform,
		isDragging: isCurrentlyDragging,
	} = useDraggable({
		id: component.id,
		data: {
			type: "component",
			component,
		},
	});

	// Drag style
	const dragStyle = {
		transform: CSS.Translate.toString(dragTransform) || "",
	};

	// Determine if component is being dragged
	const isBeingDragged =
		isCurrentlyDragging || draggedComponentId === component.id;

	// Check if this component is inside another component
	const isInsideAnotherComponent = allComponents.some((otherComponent) => {
		if (otherComponent.id === component.id) return false;

		// Check if x values are the same (same column)
		const sameColumn = otherComponent.position.x === component.position.x;

		// Check if current component's Y boundaries lie within the other component's Y boundaries
		const currentStartY = component.position.y;
		const currentEndY = component.position.y + component.size.height;
		const otherStartY = otherComponent.position.y;
		const otherEndY = otherComponent.position.y + otherComponent.size.height;

		const isWithinYBounds =
			currentStartY >= otherStartY && currentEndY <= otherEndY;

		return sameColumn && isWithinYBounds;
	});

	// Determine stable z-index based on component relationships
	const getComponentZIndex = (): string => {
		if (isBeingDragged) return "z-50"; // Highest priority for dragged components

		if (isInsideAnotherComponent) {
			// Inner components get higher z-index, but stable
			return isSelected ? "z-30" : "z-20";
		}

		// Outer components get lower z-index
		return isSelected ? "z-10" : "z-0";
	};

	// Event handlers
	const handleClick = (e: React.MouseEvent) => {
		// Prevent event bubbling to parent components
		e.stopPropagation();
		e.preventDefault();

		// TODO: Multi-select with Shift+click (future enhancement)
		// For now, single selection only
		if (e.shiftKey) {
			// Multi-select logic would go here
			console.log("Multi-select not yet implemented");
			return;
		}

		// Always select the clicked component for reliable nested selection
		selectComponent(component.id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			selectComponent(component.id);
		}
	};

	const handleResizeStart =
		(direction: "horizontal" | "vertical" | "both") =>
		(e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			startResize(component.id, direction);
		};

	return {
		// Selection state
		isSelected,
		selectComponent,

		// Drag state
		isBeingDragged,
		draggedComponentId,
		dragAttributes,
		dragListeners,
		setNodeRef,
		dragTransform,
		isCurrentlyDragging,

		// Resize state
		startResize,

		// Component relationships
		isInsideAnotherComponent,
		allComponents,

		// Styling
		getComponentZIndex,
		dragStyle,

		// Event handlers
		handleClick,
		handleKeyDown,
		handleResizeStart,
	};
}
