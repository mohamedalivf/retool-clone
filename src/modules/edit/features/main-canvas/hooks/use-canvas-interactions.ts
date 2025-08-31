import { useCallback, useEffect } from "react";

interface UseCanvasInteractionsProps {
	selectedComponentId: string | null;
	canvasRef: React.RefObject<HTMLDivElement | null>;
	selectComponent: (id: string | null) => void;
}

/**
 * Hook for handling general canvas interactions like clicks and focus
 */
export function useCanvasInteractions({
	selectedComponentId,
	canvasRef,
	selectComponent,
}: UseCanvasInteractionsProps) {
	const handleCanvasClick = useCallback(
		(e: React.MouseEvent) => {
			// Only deselect if clicking on the canvas itself, not on child elements
			if (e.target === e.currentTarget) {
				selectComponent(null);
			}
		},
		[selectComponent],
	);

	// Focus canvas when a component is selected
	useEffect(() => {
		if (selectedComponentId && canvasRef.current) {
			canvasRef.current.focus();
		}
	}, [selectedComponentId, canvasRef]);

	return {
		handleCanvasClick,
	};
}
