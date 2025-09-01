import { useEditStore } from "../../../store/use-edit-store";



export function useCanvasStore() {

	const components = useEditStore((state) => state.components);
	const grid = useEditStore((state) => state.grid);


	const showGridLines = useEditStore((state) => state.settings.showGridLines);


	const selectedComponentId = useEditStore(
		(state) => state.selection.selectedComponentId,
	);


	const rightSidebarOpen = useEditStore(
		(state) => state.sidebars.rightSidebar.isOpen,
	);


	const dragState = useEditStore((state) => state.drag);
	const isDragging = dragState.isDragging;
	const draggedComponentId = dragState.draggedComponentId;
	const dropZones = dragState.dropZones;
	const isValidDrop = dragState.isValidDrop;


	const resizeState = useEditStore((state) => state.resize);


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


	const hasComponents = components.length > 0;

	return {

		components,
		grid,
		hasComponents,


		showGridLines,


		selectedComponentId,


		rightSidebarOpen,


		dragState: {
			isDragging,
			draggedComponentId,
			dropZones,
			isValidDrop,
		},


		resizeState: {
			...resizeState,
		},


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
