import { useCallback } from "react";
import type { ComponentState } from "../../../store/types";

interface UseKeyboardNavigationProps {
	hasComponents: boolean;
	selectedComponentId: string | null;
	components: ComponentState[];
	rightSidebarOpen: boolean;
	selectComponent: (id: string | null) => void;
	toggleRightSidebar: () => void;
	toggleComponentWidth: (id: string) => void;
}



export function useKeyboardNavigation({
	hasComponents,
	selectedComponentId,
	components,
	rightSidebarOpen,
	selectComponent,
	toggleRightSidebar,
	toggleComponentWidth,
}: UseKeyboardNavigationProps) {
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

	return {
		handleKeyDown,
	};
}
