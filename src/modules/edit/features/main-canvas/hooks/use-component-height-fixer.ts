import { useEffect } from "react";
import type { ComponentState } from "../../../store/types";
import {
	fixImageComponentHeights,
	useEditStore,
} from "../../../store/use-edit-store";

interface UseComponentHeightFixerProps {
	components: ComponentState[];
	canvasRef: React.RefObject<HTMLDivElement | null>;
	fixExistingComponentHeights: () => void;
}

/**
 * Hook for handling image component height fixing based on canvas width
 */
export function useComponentHeightFixer({
	components,
	canvasRef,
	fixExistingComponentHeights,
}: UseComponentHeightFixerProps) {
	// Fix heights on initial mount
	useEffect(() => {
		const canvasWidth = canvasRef.current?.getBoundingClientRect().width;
		if (canvasWidth) {
			// Canvas is available, fix heights directly
			useEditStore.setState((state) => ({
				...state,
				components: fixImageComponentHeights(state.components),
			}));
		} else {
			// Canvas not available yet, use fallback method
			fixExistingComponentHeights();
		}
	}, [fixExistingComponentHeights, canvasRef]);

	// Fix heights when components are added/removed
	useEffect(() => {
		if (components.length > 0) {
			const canvasWidth = canvasRef.current?.getBoundingClientRect().width;
			if (canvasWidth) {
				// Canvas is available, fix heights directly
				useEditStore.setState((state) => ({
					...state,
					components: fixImageComponentHeights(state.components),
				}));
			} else {
				// Canvas not available yet, use fallback method
				fixExistingComponentHeights();
			}
		}
	}, [components.length, fixExistingComponentHeights, canvasRef]);

	return {
		// This hook primarily manages side effects
		// The actual height fixing is handled by the store functions
	};
}
