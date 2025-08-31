/**
 * Simplified Zustand store for managing the drag-and-drop component editor state
 * This version removes complex middleware to fix infinite re-render issues
 */

import { create } from "zustand";

import type {
	ComponentState,
	ComponentType,
	DragState,
	GridConfiguration,
	Position,
	ResizeState,
	SelectionState,
	SidebarState,
} from "./types";

import { createDefaultSize } from "../utils/component-factory";
import { DEFAULT_GRID_CONFIG } from "./types";

import {
	createComponent,
	updateComponentTimestamp,
	validateComponent,
} from "../utils/component-factory";

import { findNextAvailablePosition } from "../utils/grid-calculations";

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Fix existing image component heights - no longer needed since we use manual sizing
 * Keeping for compatibility but it's essentially a no-op now
 */
export function fixImageComponentHeights(
	components: ComponentState[],
): ComponentState[] {
	// Since we're no longer using aspect ratio calculations,
	// just return components as-is. Height is now controlled manually via resizing.
	return components;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialSelectionState: SelectionState = {
	selectedComponentId: null,
	isMultiSelect: false,
	selectionHistory: [],
};

const initialSidebarState: SidebarState = {
	leftSidebar: {
		isOpen: false,
		width: 320,
	},
	rightSidebar: {
		isOpen: false,
		width: 400,
		activeTab: "properties",
	},
};

const initialDragState: DragState = {
	isDragging: false,
	draggedComponentId: null,
	dropZones: [],
	isValidDrop: false,
};

const initialResizeState: ResizeState = {
	isResizing: false,
	resizedComponentId: null,
	originalSize: null,
	newSize: null,
	resizeDirection: null,
	isValidResize: false,
};

// ============================================================================
// STORE TYPES
// ============================================================================

interface EditStoreState {
	components: ComponentState[];
	selection: SelectionState;
	sidebars: SidebarState;
	drag: DragState;
	resize: ResizeState;
	grid: GridConfiguration;
	settings: {
		snapToGrid: boolean;
		showGridLines: boolean;
		autoSave: boolean;
		theme: "light" | "dark" | "system";
	};
}

interface EditStoreActions {
	// Component actions
	addComponent: (type: ComponentType, position?: Position) => string;
	updateComponent: (id: string, updates: Partial<ComponentState>) => void;
	deleteComponent: (id: string) => void;

	// Selection actions
	selectComponent: (id: string | null) => void;
	clearSelection: () => void;

	// Resize actions
	startResize: (
		componentId: string,
		direction: "horizontal" | "vertical" | "both",
	) => void;
	updateResize: (newSize: { width: "half" | "full"; height: number }) => void;
	endResize: () => void;
	cancelResize: () => void;
	toggleComponentWidth: (componentId: string) => void;

	// Sidebar actions
	toggleLeftSidebar: () => void;
	toggleRightSidebar: () => void;
	setRightSidebarTab: (tab: "properties" | "styles" | "data") => void;

	// Settings actions
	updateSettings: (settings: Partial<EditStoreState["settings"]>) => void;

	// Utility actions
	getComponentById: (id: string) => ComponentState | undefined;
	exportComponents: () => ComponentState[];

	// Migration actions
	fixExistingComponentHeights: () => void;
}

type EditStoreType = EditStoreState & EditStoreActions;

// ============================================================================
// STORE CREATION
// ============================================================================

export const useEditStore = create<EditStoreType>((set, get) => ({
	// Initial state - migrate existing components to hug system
	components: [],
	selection: initialSelectionState,
	sidebars: initialSidebarState,
	drag: initialDragState,
	resize: initialResizeState,
	grid: DEFAULT_GRID_CONFIG,
	settings: {
		snapToGrid: true,
		showGridLines: false,
		autoSave: true,
		theme: "system",
	},

	// Component actions
	addComponent: (type: ComponentType, position?: Position) => {
		const state = get();

		// Calculate the correct size for positioning
		const componentSize = createDefaultSize(type);

		const targetPosition =
			position ||
			findNextAvailablePosition(componentSize, state.components, state.grid);

		if (!targetPosition) {
			console.warn("No available position for new component");
			return "";
		}

		const newComponent = createComponent(type, targetPosition);

		set((state) => ({
			...state,
			components: [...state.components, newComponent],
			selection: {
				...state.selection,
				selectedComponentId: newComponent.id,
				selectionHistory: [
					...state.selection.selectionHistory,
					newComponent.id,
				],
			},
			sidebars: {
				...state.sidebars,
				rightSidebar: { ...state.sidebars.rightSidebar, isOpen: true },
				leftSidebar: { ...state.sidebars.leftSidebar, isOpen: false },
			},
		}));

		return newComponent.id;
	},

	updateComponent: (id: string, updates: Partial<ComponentState>) => {
		set((state) => {
			const index = state.components.findIndex((c) => c.id === id);
			if (index === -1) return state;

			const updated = { ...state.components[index], ...updates };
			const timestamped = updateComponentTimestamp(updated);

			if (!validateComponent(timestamped)) {
				console.warn("Invalid component update rejected:", updates);
				return state;
			}

			const newComponents = [...state.components];
			newComponents[index] = timestamped;

			return { ...state, components: newComponents };
		});
	},

	deleteComponent: (id: string) => {
		set((state) => ({
			...state,
			components: state.components.filter((c) => c.id !== id),
			selection: {
				...state.selection,
				selectedComponentId:
					state.selection.selectedComponentId === id
						? null
						: state.selection.selectedComponentId,
				selectionHistory: state.selection.selectionHistory.filter(
					(historyId) => historyId !== id,
				),
			},
			sidebars: {
				...state.sidebars,
				rightSidebar: {
					...state.sidebars.rightSidebar,
					isOpen:
						state.components.filter((c) => c.id !== id).length > 0
							? state.sidebars.rightSidebar.isOpen
							: false,
				},
			},
		}));
	},

	// Selection actions
	selectComponent: (id: string | null) => {
		set((state) => {
			if (!id) {
				return {
					...state,
					selection: { ...state.selection, selectedComponentId: null },
				};
			}

			const newHistory = state.selection.selectionHistory.filter(
				(historyId) => historyId !== id,
			);
			newHistory.push(id);

			if (newHistory.length > 10) {
				newHistory.shift();
			}

			return {
				...state,
				selection: {
					...state.selection,
					selectedComponentId: id,
					selectionHistory: newHistory,
				},
				sidebars: {
					...state.sidebars,
					rightSidebar: { ...state.sidebars.rightSidebar, isOpen: true },
				},
			};
		});
	},

	clearSelection: () => {
		set((state) => ({
			...state,
			selection: { ...state.selection, selectedComponentId: null },
		}));
	},

	// Resize actions
	startResize: (
		componentId: string,
		direction: "horizontal" | "vertical" | "both",
	) => {
		set((state) => {
			const component = state.components.find((c) => c.id === componentId);
			if (!component) return state;

			return {
				...state,
				resize: {
					isResizing: true,
					resizedComponentId: componentId,
					originalSize: { ...component.size },
					newSize: { ...component.size },
					resizeDirection: direction,
					isValidResize: true,
				},
			};
		});
	},

	updateResize: (newSize: { width: "half" | "full"; height: number }) => {
		set((state) => ({
			...state,
			resize: {
				...state.resize,
				newSize,
			},
		}));
	},

	endResize: () => {
		set((state) => {
			const { isResizing, resizedComponentId, newSize } = state.resize;

			if (!isResizing || !resizedComponentId || !newSize) {
				return {
					...state,
					resize: initialResizeState,
				};
			}

			// Update the component with the new size
			const updatedComponents = state.components.map((component) =>
				component.id === resizedComponentId
					? {
							...component,
							size: newSize,
							updatedAt: Date.now(),
						}
					: component,
			);

			return {
				...state,
				components: updatedComponents,
				resize: initialResizeState,
			};
		});
	},

	cancelResize: () => {
		set((state) => ({
			...state,
			resize: initialResizeState,
		}));
	},

	toggleComponentWidth: (componentId: string) => {
		set((state) => {
			const component = state.components.find((c) => c.id === componentId);
			if (!component) return state;

			const newWidth: "half" | "full" =
				component.size.width === "half" ? "full" : "half";
			const updatedComponents = state.components.map((c) =>
				c.id === componentId
					? {
							...c,
							size: { ...c.size, width: newWidth },
							// Reset position to x=0 if switching to full width
							position:
								newWidth === "full" ? { ...c.position, x: 0 } : c.position,
							updatedAt: Date.now(),
						}
					: c,
			);

			return {
				...state,
				components: updatedComponents,
			};
		});
	},

	// Sidebar actions
	toggleLeftSidebar: () => {
		set((state) => ({
			...state,
			sidebars: {
				...state.sidebars,
				leftSidebar: {
					...state.sidebars.leftSidebar,
					isOpen: !state.sidebars.leftSidebar.isOpen,
				},
			},
		}));
	},

	toggleRightSidebar: () => {
		set((state) => ({
			...state,
			sidebars: {
				...state.sidebars,
				rightSidebar: {
					...state.sidebars.rightSidebar,
					isOpen: !state.sidebars.rightSidebar.isOpen,
				},
			},
		}));
	},

	setRightSidebarTab: (tab: "properties" | "styles" | "data") => {
		set((state) => ({
			...state,
			sidebars: {
				...state.sidebars,
				rightSidebar: {
					...state.sidebars.rightSidebar,
					activeTab: tab,
					isOpen: true,
				},
			},
		}));
	},

	// Settings actions
	updateSettings: (settings: Partial<EditStoreState["settings"]>) => {
		set((state) => ({
			...state,
			settings: { ...state.settings, ...settings },
		}));
	},

	// Utility actions
	getComponentById: (id: string) => {
		return get().components.find((c) => c.id === id);
	},

	exportComponents: () => {
		return get().components;
	},

	// Migration actions
	fixExistingComponentHeights: () => {
		set((state) => ({
			...state,
			components: fixImageComponentHeights(state.components),
		}));
	},
}));

// ============================================================================
// UTILITY HOOKS (Use direct selectors instead of these for better performance)
// ============================================================================

// These hooks are kept for backward compatibility but it's recommended to use
// direct selectors like: useEditStore((state) => state.components)
// This prevents unnecessary re-renders and improves performance.

export const useSelectedComponent = () => {
	return useEditStore((state) => {
		const selectedId = state.selection.selectedComponentId;
		return selectedId
			? state.components.find((c) => c.id === selectedId)
			: null;
	});
};

export const useIsComponentSelected = (componentId: string) => {
	return useEditStore(
		(state) => state.selection.selectedComponentId === componentId,
	);
};
