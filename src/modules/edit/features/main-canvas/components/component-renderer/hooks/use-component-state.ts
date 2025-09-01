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

	isSelected: boolean;
	selectComponent: (id: string | null) => void;


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


	startResize: (
		componentId: string,
		direction: "horizontal" | "vertical" | "both",
	) => void;


	isInsideAnotherComponent: boolean;
	allComponents: ComponentState[];


	getComponentZIndex: () => string;
	dragStyle: { transform: string };


	handleClick: (e: React.MouseEvent) => void;
	handleKeyDown: (e: React.KeyboardEvent) => void;
	handleResizeStart: (
		direction: "horizontal" | "vertical" | "both",
	) => (e: React.MouseEvent) => void;
}

export function useComponentState({
	component,
}: UseComponentStateProps): UseComponentStateReturn {

	const selectComponent = useEditStore((state) => state.selectComponent);
	const startResize = useEditStore((state) => state.startResize);
	const isSelected = useIsComponentSelected(component.id);
	const draggedComponentId = useEditStore(
		(state) => state.drag.draggedComponentId,
	);
	const allComponents = useEditStore((state) => state.components);


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


	const dragStyle = {
		transform: CSS.Translate.toString(dragTransform) || "",
	};


	const isBeingDragged =
		isCurrentlyDragging || draggedComponentId === component.id;


	const isInsideAnotherComponent = allComponents.some((otherComponent) => {
		if (otherComponent.id === component.id) return false;


		const sameColumn = otherComponent.position.x === component.position.x;


		const currentStartY = component.position.y;
		const currentEndY = component.position.y + component.size.height;
		const otherStartY = otherComponent.position.y;
		const otherEndY = otherComponent.position.y + otherComponent.size.height;

		const isWithinYBounds =
			currentStartY >= otherStartY && currentEndY <= otherEndY;

		return sameColumn && isWithinYBounds;
	});


	const getComponentZIndex = (): string => {
		if (isBeingDragged) return "z-50";

		if (isInsideAnotherComponent) {

			return isSelected ? "z-30" : "z-20";
		}


		return isSelected ? "z-10" : "z-0";
	};


	const handleClick = (e: React.MouseEvent) => {

		e.stopPropagation();
		e.preventDefault();



		if (e.shiftKey) {

			console.log("Multi-select not yet implemented");
			return;
		}


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

		isSelected,
		selectComponent,


		isBeingDragged,
		draggedComponentId,
		dragAttributes,
		dragListeners,
		setNodeRef,
		dragTransform,
		isCurrentlyDragging,


		startResize,


		isInsideAnotherComponent,
		allComponents,


		getComponentZIndex,
		dragStyle,


		handleClick,
		handleKeyDown,
		handleResizeStart,
	};
}
