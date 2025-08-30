/**
 * Zustand store for managing the drag-and-drop component editor state
 * Implements all state management for components, UI, and interactions
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type {
	ComponentState,
	ComponentType,
	DragState,
	GridConfiguration,
	Position,
	ResizeState,
	SelectionState,
	SidebarState,
	Size,
} from "./types";

import { DEFAULT_GRID_CONFIG } from "./types";

import {
	createComponent,
	generateComponentId,
	updateComponentTimestamp,
	validateComponent,
} from "../utils/component-factory";

import {
	calculateDropZones,
	canResize,
	checkCollision,
	findNextAvailablePosition,
	isValidGridPosition,
	snapToGrid,
} from "../utils/grid-calculations";

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
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

interface EditStoreState {
	// Core state
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
	moveComponent: (id: string, newPosition: Position) => void;
	resizeComponent: (id: string, newSize: Size) => void;
	deleteComponent: (id: string) => void;
	duplicateComponent: (id: string) => string;

	// Selection actions
	selectComponent: (id: string | null) => void;
	clearSelection: () => void;

	// Sidebar actions
	toggleLeftSidebar: () => void;
	toggleRightSidebar: () => void;
	setRightSidebarTab: (tab: "properties" | "styles" | "data") => void;

	// Drag & Drop actions
	startDrag: (componentId: string) => void;
	updateDrag: (position: Position) => void;
	endDrag: (position?: Position) => void;
	cancelDrag: () => void;

	// Resize actions
	startResize: (componentId: string) => void;
	updateResize: (newSize: Size) => void;
	endResize: () => void;
	cancelResize: () => void;

	// Grid actions
	updateGridConfig: (config: Partial<GridConfiguration>) => void;

	// Utility actions
	getComponentById: (id: string) => ComponentState | undefined;
	getComponentsInRow: (y: number) => ComponentState[];
	getNextAvailablePosition: (size: Size) => Position | null;
	exportComponents: () => ComponentState[];
	importComponents: (components: ComponentState[]) => void;

	// Settings actions
	updateSettings: (settings: Partial<EditStoreState["settings"]>) => void;

	// Reset actions
	resetStore: () => void;
}

type EditStoreType = EditStoreState & EditStoreActions;

// ============================================================================
// STORE CREATION
// ============================================================================

export const useEditStore = create<EditStoreType>()((set, get) => ({
				// Initial state
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
					theme: "system" as const,
				},

				// ================================================================
				// COMPONENT ACTIONS
				// ================================================================

				addComponent: (type: ComponentType, position?: Position) => {
					const state = get();

					// Find position if not provided
					const targetPosition =
						position ||
						findNextAvailablePosition(
							{ width: "half", height: type === "text" ? 1 : 2 },
							state.components,
							state.grid,
						);

					if (!targetPosition) {
						console.warn("No available position for new component");
						return "";
					}

					// Create new component
					const newComponent = createComponent(type, targetPosition);

					set((state) => ({
						...state,
						components: [...state.components, newComponent],
						selection: {
							...state.selection,
							selectedComponentId: newComponent.id,
							selectionHistory: [...state.selection.selectionHistory, newComponent.id],
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
						if (index !== -1) {
							const updated = { ...state.components[index], ...updates };
							const timestamped = updateComponentTimestamp(updated);

							if (validateComponent(timestamped)) {
								const newComponents = [...state.components];
								newComponents[index] = timestamped;
								return { ...state, components: newComponents };
							} else {
								console.warn("Invalid component update rejected:", updates);
							}
						}
						return state;
					});
				},

				moveComponent: (id: string, newPosition: Position) => {
					const state = get();
					const component = state.components.find((c) => c.id === id);

					if (!component) return;

					// Validate position
					const snappedPosition = state.settings.snapToGrid
						? snapToGrid(newPosition, component.size)
						: newPosition;

					if (
						!isValidGridPosition(snappedPosition, component.size, state.grid)
					) {
						console.warn("Invalid grid position:", snappedPosition);
						return;
					}

					if (
						checkCollision(
							snappedPosition,
							component.size,
							state.components,
							id,
						)
					) {
						console.warn("Position collision detected:", snappedPosition);
						return;
					}

					set((draft) => {
						const index = draft.components.findIndex(
							(c: ComponentState) => c.id === id,
						);
						if (index !== -1) {
							draft.components[index].position = snappedPosition;
							draft.components[index] = updateComponentTimestamp(
								draft.components[index],
							);
						}
					});
				},

				resizeComponent: (id: string, newSize: Size) => {
					const state = get();
					const component = state.components.find((c) => c.id === id);

					if (!component) return;

					// Validate resize
					if (!canResize(component, newSize, state.components)) {
						console.warn("Cannot resize component to new size:", newSize);
						return;
					}

					set((draft) => {
						const index = draft.components.findIndex(
							(c: ComponentState) => c.id === id,
						);
						if (index !== -1) {
							draft.components[index].size = newSize;
							draft.components[index] = updateComponentTimestamp(
								draft.components[index],
							);
						}
					});
				},

				deleteComponent: (id: string) => {
					set((draft) => {
						draft.components = draft.components.filter(
							(c: ComponentState) => c.id !== id,
						);

						// Clear selection if deleted component was selected
						if (draft.selection.selectedComponentId === id) {
							draft.selection.selectedComponentId = null;
						}

						// Remove from selection history
						draft.selection.selectionHistory =
							draft.selection.selectionHistory.filter(
								(historyId: string) => historyId !== id,
							);

						// Close right sidebar if no components left
						if (draft.components.length === 0) {
							draft.sidebars.rightSidebar.isOpen = false;
						}
					});
				},

				duplicateComponent: (id: string) => {
					const state = get();
					const component = state.components.find((c) => c.id === id);

					if (!component) return "";

					// Find next available position
					const newPosition = findNextAvailablePosition(
						component.size,
						state.components,
						state.grid,
					);

					if (!newPosition) {
						console.warn("No available position for duplicated component");
						return "";
					}

					// Create duplicate
					const duplicate: ComponentState = {
						...component,
						id: generateComponentId(),
						position: newPosition,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					};

					set((draft) => {
						draft.components.push(duplicate);
						draft.selection.selectedComponentId = duplicate.id;
						draft.selection.selectionHistory.push(duplicate.id);
					});

					return duplicate.id;
				},

				// ================================================================
				// SELECTION ACTIONS
				// ================================================================

				selectComponent: (id: string | null) => {
					set((draft) => {
						draft.selection.selectedComponentId = id;

						if (id) {
							// Add to selection history (remove if already exists to move to end)
							draft.selection.selectionHistory =
								draft.selection.selectionHistory.filter(
									(historyId: string) => historyId !== id,
								);
							draft.selection.selectionHistory.push(id);

							// Keep history limited to last 10 selections
							if (draft.selection.selectionHistory.length > 10) {
								draft.selection.selectionHistory.shift();
							}

							// Auto-open right sidebar when selecting component
							draft.sidebars.rightSidebar.isOpen = true;
						}
					});
				},

				clearSelection: () => {
					set((draft) => {
						draft.selection.selectedComponentId = null;
					});
				},

				// ================================================================
				// SIDEBAR ACTIONS
				// ================================================================

				toggleLeftSidebar: () => {
					set((draft) => {
						draft.sidebars.leftSidebar.isOpen =
							!draft.sidebars.leftSidebar.isOpen;
					});
				},

				toggleRightSidebar: () => {
					set((draft) => {
						draft.sidebars.rightSidebar.isOpen =
							!draft.sidebars.rightSidebar.isOpen;
					});
				},

				setRightSidebarTab: (tab: "properties" | "styles" | "data") => {
					set((draft) => {
						draft.sidebars.rightSidebar.activeTab = tab;
						draft.sidebars.rightSidebar.isOpen = true;
					});
				},

				// ================================================================
				// DRAG & DROP ACTIONS
				// ================================================================

				startDrag: (componentId: string) => {
					const state = get();
					const component = state.components.find((c) => c.id === componentId);

					if (!component) return;

					const dropZones = calculateDropZones(
						component,
						state.components,
						state.grid,
					);

					set((draft) => {
						draft.drag = {
							isDragging: true,
							draggedComponentId: componentId,
							dropZones,
							isValidDrop: false,
						};
					});
				},

				updateDrag: (position: Position) => {
					const state = get();

					if (!state.drag.isDragging || !state.drag.draggedComponentId) return;

					const isValid = state.drag.dropZones.some(
						(zone) => zone.x === position.x && zone.y === position.y,
					);

					set((draft) => {
						draft.drag.isValidDrop = isValid;
						if (draft.drag.dragPreview) {
							draft.drag.dragPreview.x = position.x;
							draft.drag.dragPreview.y = position.y;
						}
					});
				},

				endDrag: (position?: Position) => {
					const state = get();

					if (!state.drag.isDragging || !state.drag.draggedComponentId) return;

					if (position && state.drag.isValidDrop) {
						// Move component to new position
						get().moveComponent(state.drag.draggedComponentId, position);
					}

					set((draft) => {
						draft.drag = initialDragState;
					});
				},

				cancelDrag: () => {
					set((draft) => {
						draft.drag = initialDragState;
					});
				},

				// ================================================================
				// RESIZE ACTIONS
				// ================================================================

				startResize: (componentId: string) => {
					const state = get();
					const component = state.components.find((c) => c.id === componentId);

					if (!component) return;

					set((draft) => {
						draft.resize = {
							isResizing: true,
							resizedComponentId: componentId,
							originalSize: { ...component.size },
							newSize: { ...component.size },
						};
					});
				},

				updateResize: (newSize: Size) => {
					set((draft) => {
						if (draft.resize.isResizing) {
							draft.resize.newSize = newSize;
						}
					});
				},

				endResize: () => {
					const state = get();

					if (
						state.resize.isResizing &&
						state.resize.resizedComponentId &&
						state.resize.newSize
					) {
						get().resizeComponent(
							state.resize.resizedComponentId,
							state.resize.newSize,
						);
					}

					set((draft) => {
						draft.resize = initialResizeState;
					});
				},

				cancelResize: () => {
					set((draft) => {
						draft.resize = initialResizeState;
					});
				},

				// ================================================================
				// GRID ACTIONS
				// ================================================================

				updateGridConfig: (config: Partial<GridConfiguration>) => {
					set((draft) => {
						draft.grid = { ...draft.grid, ...config };
					});
				},

				// ================================================================
				// UTILITY ACTIONS
				// ================================================================

				getComponentById: (id: string) => {
					return get().components.find((c) => c.id === id);
				},

				getComponentsInRow: (y: number) => {
					return get().components.filter((component) => {
						const startRow = component.position.y;
						const endRow = component.position.y + component.size.height - 1;
						return y >= startRow && y <= endRow;
					});
				},

				getNextAvailablePosition: (size: Size) => {
					const state = get();
					return findNextAvailablePosition(size, state.components, state.grid);
				},

				exportComponents: () => {
					return get().components;
				},

				importComponents: (components: ComponentState[]) => {
					const validComponents = components.filter(validateComponent);

					set((draft) => {
						draft.components = validComponents;
						draft.selection.selectedComponentId = null;
						draft.selection.selectionHistory = [];
					});
				},

				// ================================================================
				// SETTINGS ACTIONS
				// ================================================================

				updateSettings: (settings: Partial<EditStoreState["settings"]>) => {
					set((draft) => {
						draft.settings = { ...draft.settings, ...settings };
					});
				},

				// ================================================================
				// RESET ACTIONS
				// ================================================================

				resetStore: () => {
					set((draft) => {
						draft.components = [];
						draft.selection = initialSelectionState;
						draft.sidebars = initialSidebarState;
						draft.drag = initialDragState;
						draft.resize = initialResizeState;
						draft.grid = DEFAULT_GRID_CONFIG;
					});
				},
			})),
			{
				name: "edit-store",
				partialize: (state) => ({
					components: state.components,
					grid: state.grid,
					settings: state.settings,
				}),
			},
		),
		{
			name: "EditStore",
		},
	),
);

// ============================================================================
// CUSTOM HOOKS FOR ACCESSING STORE SLICES
// ============================================================================

/**
 * Hook to access components state and actions
 */
export const useComponents = () => {
	return useEditStore((state) => ({
		components: state.components,
		addComponent: state.addComponent,
		updateComponent: state.updateComponent,
		moveComponent: state.moveComponent,
		resizeComponent: state.resizeComponent,
		deleteComponent: state.deleteComponent,
		duplicateComponent: state.duplicateComponent,
		getComponentById: state.getComponentById,
		exportComponents: state.exportComponents,
		importComponents: state.importComponents,
	}));
};

/**
 * Hook to access selection state and actions
 */
export const useSelection = () => {
	return useEditStore((state) => ({
		selection: state.selection,
		selectComponent: state.selectComponent,
		clearSelection: state.clearSelection,
	}));
};

/**
 * Hook to access sidebar state and actions
 */
export const useSidebars = () => {
	return useEditStore((state) => ({
		sidebars: state.sidebars,
		toggleLeftSidebar: state.toggleLeftSidebar,
		toggleRightSidebar: state.toggleRightSidebar,
		setRightSidebarTab: state.setRightSidebarTab,
	}));
};

/**
 * Hook to access drag and drop state and actions
 */
export const useDragDrop = () => {
	return useEditStore((state) => ({
		drag: state.drag,
		startDrag: state.startDrag,
		updateDrag: state.updateDrag,
		endDrag: state.endDrag,
		cancelDrag: state.cancelDrag,
	}));
};

/**
 * Hook to access resize state and actions
 */
export const useResize = () => {
	return useEditStore((state) => ({
		resize: state.resize,
		startResize: state.startResize,
		updateResize: state.updateResize,
		endResize: state.endResize,
		cancelResize: state.cancelResize,
	}));
};

/**
 * Hook to access grid configuration and actions
 */
export const useGrid = () => {
	return useEditStore((state) => ({
		grid: state.grid,
		updateGridConfig: state.updateGridConfig,
		getComponentsInRow: state.getComponentsInRow,
		getNextAvailablePosition: state.getNextAvailablePosition,
	}));
};

/**
 * Hook to access settings and actions
 */
export const useSettings = () => {
	return useEditStore((state) => ({
		settings: state.settings,
		updateSettings: state.updateSettings,
	}));
};

/**
 * Hook to get the currently selected component
 */
export const useSelectedComponent = () => {
	return useEditStore((state) => {
		const selectedId = state.selection.selectedComponentId;
		return selectedId
			? state.components.find((c) => c.id === selectedId)
			: null;
	});
};

/**
 * Hook to check if a specific component is selected
 */
export const useIsComponentSelected = (componentId: string) => {
	return useEditStore(
		(state) => state.selection.selectedComponentId === componentId,
	);
};
