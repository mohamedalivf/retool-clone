export type ComponentType = "text" | "image";

export type ComponentWidth = "half" | "full";

export type ComponentStatus = "active" | "selected" | "dragging" | "resizing";

export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: ComponentWidth;
	height: number;
}

export interface TextAttributes {
	content: string;
	textAlign: "left" | "center" | "right" | "justify";
	color: string;
}

export interface ImageAttributes {
	src: string;
	alt: string;
	objectFit: "cover" | "contain" | "fill" | "scale-down" | "none";
	objectPosition:
		| "center"
		| "top"
		| "bottom"
		| "left"
		| "right"
		| "top-left"
		| "top-right"
		| "bottom-left"
		| "bottom-right";
	borderRadius: "none" | "sm" | "md" | "lg" | "full";
}

export type ComponentAttributes = TextAttributes | ImageAttributes;

export interface ComponentStyles {
	backgroundColor?: string;
	border?: {
		width: number;
		style: "solid" | "dashed" | "dotted" | "none";
		color: string;
	};
	padding?: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	margin?: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	shadow?: "none" | "sm" | "md" | "lg" | "xl";
	opacity?: number;
}

export interface ComponentState {
	id: string;
	type: ComponentType;
	position: Position;
	size: Size;
	attributes: ComponentAttributes;
	styles: ComponentStyles;
	status?: ComponentStatus;
	createdAt: number;
	updatedAt: number;
}

export interface GridConfiguration {
	cols: 2;
	rows: number;
	cellHeight: number;
	gap: number;
	containerPadding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
}

export interface GridCell {
	x: number;
	y: number;
	width: number;
	height: number;
	occupied: boolean;
	componentId?: string;
}

export interface GridBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

export interface SelectionState {
	selectedComponentId: string | null;
	isMultiSelect: boolean;
	selectionHistory: string[];
	isSelectedForDrag: boolean;
}

export interface SidebarState {
	leftSidebar: {
		isOpen: boolean;
		width: number;
	};
	rightSidebar: {
		isOpen: boolean;
		width: number;
		activeTab?: "properties" | "styles" | "data";
	};
}

export interface DragState {
	isDragging: boolean;
	draggedComponentId: string | null;
	dragPreview?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	dropZones: Position[];
	isValidDrop: boolean;
}

export interface ResizeState {
	isResizing: boolean;
	resizedComponentId: string | null;
	originalSize: Size | null;
	newSize: Size | null;
	resizeDirection: "horizontal" | "vertical" | "both" | null;
	resizePreview?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	isValidResize: boolean;
}

export interface EditStore {
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

	actions: {
		addComponent: (type: ComponentType, position?: Position) => string;
		updateComponent: (id: string, updates: Partial<ComponentState>) => void;
		moveComponent: (id: string, newPosition: Position) => void;
		resizeComponent: (id: string, newSize: Size) => void;
		deleteComponent: (id: string) => void;
		duplicateComponent: (id: string) => string;

		selectComponent: (id: string | null) => void;
		clearSelection: () => void;

		toggleLeftSidebar: () => void;
		toggleRightSidebar: () => void;
		setRightSidebarTab: (tab: "properties" | "styles" | "data") => void;

		startDrag: (componentId: string) => void;
		updateDrag: (position: Position) => void;
		endDrag: (position?: Position) => void;
		cancelDrag: () => void;

		startResize: (componentId: string) => void;
		updateResize: (newSize: Size) => void;
		endResize: () => void;
		cancelResize: () => void;

		updateGridConfig: (config: Partial<GridConfiguration>) => void;
		calculateGridPosition: (clientX: number, clientY: number) => Position;
		isValidPosition: (
			componentId: string,
			position: Position,
			size: Size,
		) => boolean;

		getComponentById: (id: string) => ComponentState | undefined;
		getComponentsInRow: (y: number) => ComponentState[];
		getNextAvailablePosition: (size: Size) => Position | null;
		exportComponents: () => ComponentState[];
		importComponents: (components: ComponentState[]) => void;
	};
}

export function isTextAttributes(
	attributes: ComponentAttributes,
): attributes is TextAttributes {
	return "content" in attributes && "textAlign" in attributes;
}

export function isImageAttributes(
	attributes: ComponentAttributes,
): attributes is ImageAttributes {
	return "src" in attributes && "alt" in attributes;
}

export const DEFAULT_TEXT_ATTRIBUTES: TextAttributes = {
	content: "Click to edit text",
	textAlign: "left",
	color: "#000000",
};

export const DEFAULT_IMAGE_ATTRIBUTES: ImageAttributes = {
	src: "",
	alt: "Image",
	objectFit: "cover",
	objectPosition: "center",
	borderRadius: "none",
};

export const DEFAULT_COMPONENT_STYLES: ComponentStyles = {
	backgroundColor: "transparent",
	border: {
		width: 0,
		style: "none",
		color: "#e5e7eb",
	},
	padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
	margin: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
	shadow: "none",
	opacity: 1,
};

import { GRID_COLS, HUG_HEIGHT, MAX_GRID_ROWS } from "../constants/hug-system";

export const DEFAULT_GRID_CONFIG: GridConfiguration = {
	cols: GRID_COLS,
	rows: MAX_GRID_ROWS,
	cellHeight: HUG_HEIGHT,
	gap: 0,
	containerPadding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
};

export type ComponentFactory = (
	type: ComponentType,
	position: Position,
	size?: Partial<Size>,
	attributes?: Partial<ComponentAttributes>,
	styles?: Partial<ComponentStyles>,
) => ComponentState;

export type ComponentEventHandler<T = void> = (
	componentId: string,
	event?: T,
) => void;
export type PositionEventHandler = (
	componentId: string,
	position: Position,
) => void;
export type SizeEventHandler = (componentId: string, size: Size) => void;
export type AttributeEventHandler<T extends ComponentAttributes> = (
	componentId: string,
	attributes: Partial<T>,
) => void;
