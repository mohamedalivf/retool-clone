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

/**
 * Hook for handling keyboard navigation and shortcuts on the canvas
 */
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

			// Alt + Arrow Left/Right: Toggle component width
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
					// Navigate to next component
					e.preventDefault();
					const nextIndex =
						currentIndex < components.length - 1 ? currentIndex + 1 : 0;
					selectComponent(components[nextIndex].id);
					break;
				}
				case "ArrowUp":
				case "ArrowLeft": {
					// Navigate to previous component
					e.preventDefault();
					const prevIndex =
						currentIndex > 0 ? currentIndex - 1 : components.length - 1;
					selectComponent(components[prevIndex].id);
					break;
				}
				case "Escape":
					// Clear selection
					e.preventDefault();
					selectComponent(null);
					break;
				case "Enter":
				case " ":
					// Open right sidebar for selected component
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
