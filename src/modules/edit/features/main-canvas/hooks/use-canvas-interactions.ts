import { useCallback, useEffect } from "react";

interface UseCanvasInteractionsProps {
	selectedComponentId: string | null;
	canvasRef: React.RefObject<HTMLDivElement | null>;
	selectComponent: (id: string | null) => void;
}



export function useCanvasInteractions({
	selectedComponentId,
	canvasRef,
	selectComponent,
}: UseCanvasInteractionsProps) {
	const handleCanvasClick = useCallback(
		(e: React.MouseEvent) => {

			if (e.target === e.currentTarget) {
				selectComponent(null);
			}
		},
		[selectComponent],
	);


	useEffect(() => {
		if (selectedComponentId && canvasRef.current) {
			canvasRef.current.focus();
		}
	}, [selectedComponentId, canvasRef]);

	return {
		handleCanvasClick,
	};
}
