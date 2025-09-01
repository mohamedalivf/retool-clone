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



export function useComponentHeightFixer({
	components,
	canvasRef,
	fixExistingComponentHeights,
}: UseComponentHeightFixerProps) {

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
	}, [fixExistingComponentHeights, canvasRef]);


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
	}, [components.length, fixExistingComponentHeights, canvasRef]);

	return {


	};
}
