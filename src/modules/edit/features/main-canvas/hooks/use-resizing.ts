import { useEffect } from "react";
import { GRID_COLS, HUG_HEIGHT } from "../../../constants/hug-system";
import type { ComponentState } from "../../../store/types";
import { useEditStore } from "../../../store/use-edit-store";

interface UseResizingProps {
	isResizing: boolean;
	resizeState: {
		resizedComponentId: string | null;
		resizeDirection: "horizontal" | "vertical" | "both" | null;
	} & Record<string, unknown>;
	components: ComponentState[];
	canvasRef: React.RefObject<HTMLDivElement | null>;
	updateResize: (newSize: { width: "half" | "full"; height: number }) => void;
	endResize: () => void;
}



export function useResizing({
	isResizing,
	resizeState,
	components,
	canvasRef,
	updateResize,
	endResize,
}: UseResizingProps) {
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
	}, [isResizing, resizeState, components, updateResize, endResize, canvasRef]);

	return {


	};
}
