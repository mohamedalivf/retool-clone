/**
 * Core TypeScript types and interfaces for the drag-and-drop component editor
 * Based on the Retool-like edit mode specifications
 */

// ============================================================================
// COMPONENT TYPES
// ============================================================================

/**
 * Available component types in the editor
 */
export type ComponentType = "text" | "image";

/**
 * Component width options for the 2-column grid system
 */
export type ComponentWidth = "half" | "full";

/**
 * Component status for lifecycle management
 */
export type ComponentStatus = "active" | "selected" | "dragging" | "resizing";

// ============================================================================
// POSITION AND SIZE TYPES
// ============================================================================

/**
 * Grid position coordinates
 * x: 0 (left column) or 1 (right column)
 * y: 0 to infinity (row index)
 */
export interface Position {
	x: number; // 0-1 for 2-column grid
	y: number; // 0-∞ for unlimited rows
}

/**
 * Component size configuration
 * width: 'half' (1 column) or 'full' (2 columns)
 * height: number of grid units
 */
export interface Size {
	width: ComponentWidth;
	height: number; // Height in grid units
}

// ============================================================================
// COMPONENT ATTRIBUTES
// ============================================================================

/**
 * Text component specific attributes
 * Supports markdown content with natural markdown styling
 */
export interface TextAttributes {
	content: string; // Markdown content
	textAlign: "left" | "center" | "right" | "justify";
	color: string; // Hex color or CSS color value
}

/**
 * Image component specific attributes
 * Handles image display with flexible sizing and styling
 */
export interface ImageAttributes {
	src: string; // Image URL/path (empty string shows placeholder)
	alt: string; // Alt text for accessibility
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

/**
 * Union type for component-specific attributes
 */
export type ComponentAttributes = TextAttributes | ImageAttributes;

// ============================================================================
// STYLING TYPES
// ============================================================================

/**
 * Common styling properties for all components
 */
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
	opacity?: number; // 0-1
}

// ============================================================================
// MAIN COMPONENT STATE
// ============================================================================

/**
 * Complete state definition for a component in the editor
 * This is the core data structure for all components
 */
export interface ComponentState {
	id: string; // Unique identifier
	type: ComponentType; // 'text' | 'image'
	position: Position; // Grid coordinates
	size: Size; // Width and height configuration
	attributes: ComponentAttributes; // Component-specific properties
	styles: ComponentStyles; // Common styling properties
	status?: ComponentStatus; // Current component status
	createdAt: number; // Timestamp
	updatedAt: number; // Timestamp
}

// ============================================================================
// GRID SYSTEM TYPES
// ============================================================================

/**
 * Grid configuration for the canvas layout system
 */
export interface GridConfiguration {
	cols: 2; // Fixed 2-column layout
	rows: number; // Dynamic number of rows
	cellHeight: number; // Height of each grid cell in pixels
	gap: number; // Gap between grid cells in pixels
	containerPadding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
}

/**
 * Grid cell information for positioning calculations
 */
export interface GridCell {
	x: number;
	y: number;
	width: number;
	height: number;
	occupied: boolean;
	componentId?: string;
}

/**
 * Grid bounds for drag and drop validation
 */
export interface GridBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

// ============================================================================
// SELECTION AND UI STATE
// ============================================================================

/**
 * Component selection state management
 */
export interface SelectionState {
	selectedComponentId: string | null;
	isMultiSelect: boolean; // Future feature for multi-selection
	selectionHistory: string[]; // Track selection history
	isSelectedForDrag: boolean; // True when selection is made for dragging (prevents sidebar opening)
}

/**
 * Sidebar visibility and state management
 */
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

/**
 * Drag and drop operation state
 */
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

/**
 * Resize operation state
 */
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

// ============================================================================
// EDITOR STATE
// ============================================================================

/**
 * Complete editor state combining all sub-states
 */
export interface EditStore {
	// Component management
	components: ComponentState[];

	// UI state
	selection: SelectionState;
	sidebars: SidebarState;
	drag: DragState;
	resize: ResizeState;

	// Grid configuration
	grid: GridConfiguration;

	// Editor settings
	settings: {
		snapToGrid: boolean;
		showGridLines: boolean;
		autoSave: boolean;
		theme: "light" | "dark" | "system";
	};

	// Actions (will be implemented in the store)
	actions: {
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
		calculateGridPosition: (clientX: number, clientY: number) => Position;
		isValidPosition: (
			componentId: string,
			position: Position,
			size: Size,
		) => boolean;

		// Utility actions
		getComponentById: (id: string) => ComponentState | undefined;
		getComponentsInRow: (y: number) => ComponentState[];
		getNextAvailablePosition: (size: Size) => Position | null;
		exportComponents: () => ComponentState[];
		importComponents: (components: ComponentState[]) => void;
	};
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard to check if attributes are TextAttributes
 */
export function isTextAttributes(
	attributes: ComponentAttributes,
): attributes is TextAttributes {
	return "content" in attributes && "textAlign" in attributes;
}

/**
 * Type guard to check if attributes are ImageAttributes
 */
export function isImageAttributes(
	attributes: ComponentAttributes,
): attributes is ImageAttributes {
	return "src" in attributes && "alt" in attributes;
}

/**
 * Default values for component creation
 */
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
	cellHeight: HUG_HEIGHT, // 1 hug = HUG_HEIGHT px
	gap: 0, // No gap between grid elements
	containerPadding: {
		top: 0, // No padding for full-screen layout
		right: 0,
		bottom: 0,
		left: 0,
	},
};

/**
 * Component factory function type
 */
export type ComponentFactory = (
	type: ComponentType,
	position: Position,
	size?: Partial<Size>,
	attributes?: Partial<ComponentAttributes>,
	styles?: Partial<ComponentStyles>,
) => ComponentState;

/**
 * Event handler types for component interactions
 */
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

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// All types are exported individually above where they are defined
