import { useEditStore } from "../../../store/use-edit-store";

/**
 * Consolidated hook for all canvas-related store selectors
 * Reduces coupling between MainCanvasFeature and the store
 */
export function useCanvasStore() {
	// Component data
	const components = useEditStore((state) => state.components);
	const grid = useEditStore((state) => state.grid);

	// Settings
	const showGridLines = useEditStore((state) => state.settings.showGridLines);

	// Selection state
	const selectedComponentId = useEditStore(
		(state) => state.selection.selectedComponentId,
	);

	// Sidebar state
	const rightSidebarOpen = useEditStore(
		(state) => state.sidebars.rightSidebar.isOpen,
	);

	// Drag state
	const dragState = useEditStore((state) => state.drag);
	const isDragging = dragState.isDragging;
	const draggedComponentId = dragState.draggedComponentId;
	const dropZones = dragState.dropZones;
	const isValidDrop = dragState.isValidDrop;

	// Resize state
	const resizeState = useEditStore((state) => state.resize);

	// Actions
	const selectComponent = useEditStore((state) => state.selectComponent);
	const selectComponentForDrag = useEditStore(
		(state) => state.selectComponentForDrag,
	);
	const updateComponent = useEditStore((state) => state.updateComponent);
	const toggleRightSidebar = useEditStore((state) => state.toggleRightSidebar);
	const toggleComponentWidth = useEditStore(
		(state) => state.toggleComponentWidth,
	);
	const fixExistingComponentHeights = useEditStore(
		(state) => state.fixExistingComponentHeights,
	);
	const updateResize = useEditStore((state) => state.updateResize);
	const endResize = useEditStore((state) => state.endResize);

	// Derived state
	const hasComponents = components.length > 0;

	return {
		// Data
		components,
		grid,
		hasComponents,

		// Settings
		showGridLines,

		// Selection
		selectedComponentId,

		// Sidebar
		rightSidebarOpen,

		// Drag state
		dragState: {
			isDragging,
			draggedComponentId,
			dropZones,
			isValidDrop,
		},

		// Resize state
		resizeState: {
			...resizeState, // Include full state for complex operations
		},

		// Actions
		actions: {
			selectComponent,
			selectComponentForDrag,
			updateComponent,
			toggleRightSidebar,
			toggleComponentWidth,
			fixExistingComponentHeights,
			updateResize,
			endResize,
		},
	};
}
