/**
 * Grid calculation utilities for positioning and collision detection
 * Enhanced for shadcn/ui-based grid system with auto-sizing support
 */

import type {
	ComponentState,
	GridBounds,
	GridConfiguration,
	Position,
	Size,
} from "../store/types";

/**
 * Calculate pixel coordinates from grid position
 */
export function gridToPixels(
	position: Position,
	size: Size,
	gridConfig: GridConfiguration,
): { x: number; y: number; width: number; height: number } {
	const { cols, cellHeight, gap, containerPadding } = gridConfig;

	// Calculate cell width (accounting for gaps and padding)
	const availableWidth =
		window.innerWidth - containerPadding.left - containerPadding.right - gap;
	const cellWidth = availableWidth / cols;

	// Calculate position
	const x = containerPadding.left + position.x * (cellWidth + gap);
	const y = containerPadding.top + position.y * (cellHeight + gap);

	// Calculate size
	const width = size.width === "full" ? cellWidth * 2 + gap : cellWidth;
	const height = cellHeight * size.height + gap * (size.height - 1);

	return { x, y, width, height };
}

/**
 * Calculate grid position from pixel coordinates
 */
export function pixelsToGrid(
	clientX: number,
	clientY: number,
	gridConfig: GridConfiguration,
	containerRect: DOMRect,
): Position {
	const { cols, cellHeight, gap, containerPadding } = gridConfig;

	// Adjust for container position and padding
	const relativeX = clientX - containerRect.left - containerPadding.left;
	const relativeY = clientY - containerRect.top - containerPadding.top;

	// Calculate cell width
	const availableWidth =
		containerRect.width - containerPadding.left - containerPadding.right - gap;
	const cellWidth = availableWidth / cols;

	// Calculate grid coordinates
	const x = Math.max(0, Math.min(1, Math.floor(relativeX / (cellWidth + gap))));
	const y = Math.max(0, Math.floor(relativeY / (cellHeight + gap)));

	return { x, y };
}

/**
 * Check if a position and size would cause collision with existing components
 */
export function checkCollision(
	position: Position,
	size: Size,
	components: ComponentState[],
	excludeId?: string,
): boolean {
	// Get the cells that would be occupied by the new component
	const occupiedCells = getOccupiedCells(position, size);

	// Check against all existing components
	for (const component of components) {
		if (excludeId && component.id === excludeId) {
			continue; // Skip the component being moved/resized
		}

		const existingCells = getOccupiedCells(component.position, component.size);

		// Check for overlap
		for (const newCell of occupiedCells) {
			for (const existingCell of existingCells) {
				if (newCell.x === existingCell.x && newCell.y === existingCell.y) {
					return true; // Collision detected
				}
			}
		}
	}

	return false; // No collision
}

/**
 * Check collision for component creation - always prevents overlapping
 */
export function checkCollisionForCreation(
	position: Position,
	size: Size,
	components: ComponentState[],
): boolean {
	return checkCollision(position, size, components);
}

/**
 * Check collision for drag operations - allows overlapping during drag
 */
export function checkCollisionForDrag(
	position: Position,
	size: Size,
	components: ComponentState[],
	excludeId?: string,
): boolean {
	// During drag operations, we allow overlapping
	// Only validate basic grid position constraints

	// Check X bounds
	if (position.x < 0 || position.x > 1) {
		return true; // Invalid position
	}

	// For full-width components, x must be 0
	if (size.width === "full" && position.x !== 0) {
		return true; // Invalid position
	}

	// For half-width components, x must be 0 or 1
	if (size.width === "half" && position.x > 1) {
		return true; // Invalid position
	}

	// Check Y bounds (no upper limit, but must be non-negative)
	if (position.y < 0) {
		return true; // Invalid position
	}

	// All other positions are valid during drag (overlapping allowed)
	return false;
}

/**
 * Get all grid cells occupied by a component
 */
export function getOccupiedCells(position: Position, size: Size): Position[] {
	const cells: Position[] = [];

	const width = size.width === "full" ? 2 : 1;
	const height = size.height;

	for (let x = position.x; x < position.x + width; x++) {
		for (let y = position.y; y < position.y + height; y++) {
			cells.push({ x, y });
		}
	}

	return cells;
}

/**
 * Find the next available position for a component of given size
 */
export function findNextAvailablePosition(
	size: Size,
	components: ComponentState[],
	gridConfig: GridConfiguration,
): Position | null {
	const maxRows = Math.max(gridConfig.rows, getMaxRowUsed(components) + 5);

	// Try each position starting from top-left
	for (let y = 0; y < maxRows; y++) {
		for (let x = 0; x <= (size.width === "full" ? 0 : 1); x++) {
			const position = { x, y };

			if (!checkCollisionForCreation(position, size, components)) {
				return position;
			}
		}
	}

	return null; // No available position found
}

/**
 * Get the maximum row index currently used by components
 */
export function getMaxRowUsed(components: ComponentState[]): number {
	if (components.length === 0) return 0;

	return Math.max(
		...components.map(
			(component) => component.position.y + component.size.height - 1,
		),
	);
}

/**
 * Get all components in a specific row
 */
export function getComponentsInRow(
	row: number,
	components: ComponentState[],
): ComponentState[] {
	return components.filter((component) => {
		const startRow = component.position.y;
		const endRow = component.position.y + component.size.height - 1;
		return row >= startRow && row <= endRow;
	});
}

/**
 * Check if a position is within grid bounds
 */
export function isValidGridPosition(
	position: Position,
	size: Size,
	gridConfig: GridConfiguration,
): boolean {
	// Check X bounds
	if (position.x < 0 || position.x > 1) {
		return false;
	}

	// For full-width components, x must be 0
	if (size.width === "full" && position.x !== 0) {
		return false;
	}

	// For half-width components, x must be 0 or 1
	if (size.width === "half" && position.x > 1) {
		return false;
	}

	// Check Y bounds (no upper limit, but must be non-negative)
	if (position.y < 0) {
		return false;
	}

	return true;
}

/**
 * Snap position to grid boundaries
 */
export function snapToGrid(position: Position, size: Size): Position {
	let x = Math.round(position.x);
	let y = Math.round(position.y);

	// Ensure x is within bounds
	x = Math.max(0, Math.min(1, x));

	// For full-width components, force x to 0
	if (size.width === "full") {
		x = 0;
	}

	// Ensure y is non-negative
	y = Math.max(0, y);

	return { x, y };
}

/**
 * Calculate drop zones for drag and drop operations
 */
export function calculateDropZones(
	draggedComponent: ComponentState,
	components: ComponentState[],
	gridConfig: GridConfiguration,
): Position[] {
	const dropZones: Position[] = [];
	const maxRows = Math.max(gridConfig.rows, getMaxRowUsed(components) + 3);

	// Check each possible position
	for (let y = 0; y < maxRows; y++) {
		const maxX = draggedComponent.size.width === "full" ? 0 : 1;

		for (let x = 0; x <= maxX; x++) {
			const position = { x, y };

			if (
				isValidGridPosition(position, draggedComponent.size, gridConfig) &&
				!checkCollisionForDrag(
					position,
					draggedComponent.size,
					components,
					draggedComponent.id,
				)
			) {
				dropZones.push(position);
			}
		}
	}

	return dropZones;
}

/**
 * Get the closest valid drop position to a given position
 */
export function getClosestDropZone(
	targetPosition: Position,
	dropZones: Position[],
): Position | null {
	if (dropZones.length === 0) return null;

	let closestZone = dropZones[0];
	let minDistance = getDistance(targetPosition, closestZone);

	for (const zone of dropZones) {
		const distance = getDistance(targetPosition, zone);
		if (distance < minDistance) {
			minDistance = distance;
			closestZone = zone;
		}
	}

	return closestZone;
}

/**
 * Calculate distance between two positions
 */
export function getDistance(pos1: Position, pos2: Position): number {
	const dx = pos1.x - pos2.x;
	const dy = pos1.y - pos2.y;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a component can be resized to a new size at its current position
 */
export function canResize(
	component: ComponentState,
	newSize: Size,
	components: ComponentState[],
): boolean {
	return (
		isValidGridPosition(component.position, newSize, {
			cols: 2,
		} as GridConfiguration) &&
		!checkCollisionForCreation(component.position, newSize, components)
	);
}

/**
 * Get grid bounds for a given configuration
 */
export function getGridBounds(gridConfig: GridConfiguration): GridBounds {
	return {
		minX: 0,
		maxX: gridConfig.cols - 1,
		minY: 0,
		maxY: gridConfig.rows - 1,
	};
}

/**
 * Calculate the total height needed for all components
 */
export function calculateRequiredGridHeight(
	components: ComponentState[],
	gridConfig: GridConfiguration,
): number {
	if (components.length === 0) return gridConfig.cellHeight;

	const maxRow = getMaxRowUsed(components);
	const totalRows = maxRow + 1;

	return (
		gridConfig.containerPadding.top +
		gridConfig.containerPadding.bottom +
		totalRows * gridConfig.cellHeight +
		(totalRows - 1) * gridConfig.gap
	);
}

// ============================================================================
// ENHANCED UTILITIES FOR SHADCN/UI GRID SYSTEM
// ============================================================================

/**
 * Calculate responsive grid dimensions based on container size
 * Enhanced for shadcn/ui responsive design patterns
 */
export function calculateResponsiveGrid(
	containerWidth: number,
	containerHeight: number,
	baseGridConfig: GridConfiguration,
): GridConfiguration {
	// Responsive breakpoints following shadcn/ui conventions
	const isSmall = containerWidth < 640; // sm breakpoint
	const isMedium = containerWidth >= 640 && containerWidth < 1024; // md breakpoint
	const isLarge = containerWidth >= 1024; // lg breakpoint

	// Adjust grid configuration based on screen size
	const responsiveConfig: GridConfiguration = {
		...baseGridConfig,
		// Adjust cell height for smaller screens
		cellHeight: isSmall ? 80 : isMedium ? 100 : baseGridConfig.cellHeight,
		// Adjust gap for smaller screens
		gap: isSmall ? 8 : isMedium ? 12 : baseGridConfig.gap,
		// Adjust padding for smaller screens
		containerPadding: {
			top: isSmall ? 12 : 16,
			right: isSmall ? 12 : 16,
			bottom: isSmall ? 12 : 16,
			left: isSmall ? 12 : 16,
		},
	};

	return responsiveConfig;
}

/**
 * Get optimal component size based on content type and grid constraints
 * Follows shadcn/ui component sizing patterns
 */
export function getOptimalComponentSize(
	componentType: "text" | "image",
	contentLength?: number,
): Size {
	switch (componentType) {
		case "text":
			// Text components should be compact by default
			// Height is auto-calculated based on content
			return {
				width: "half", // Default to half-width
				height: 1, // Minimum height, will auto-expand
			};
		case "image":
			// Images should maintain aspect ratio
			return {
				width: "half", // Default to half-width
				height: 2, // Good default height for 16:9 aspect ratio
			};
		default:
			return {
				width: "half",
				height: 1,
			};
	}
}

/**
 * Calculate drop zones for drag and drop operations
 * Enhanced with shadcn/ui visual feedback patterns
 */
export function calculateEnhancedDropZones(
	draggedComponent: ComponentState,
	allComponents: ComponentState[],
	gridConfig: GridConfiguration,
): Array<Position & { isValid: boolean; feedback: string }> {
	const dropZones: Array<Position & { isValid: boolean; feedback: string }> =
		[];
	const maxRows = Math.max(gridConfig.rows, getMaxRowUsed(allComponents) + 3);

	// Calculate all possible drop positions
	for (let y = 0; y < maxRows; y++) {
		for (
			let x = 0;
			x <= (draggedComponent.size.width === "full" ? 0 : 1);
			x++
		) {
			const position = { x, y };
			const isValid = !checkCollisionForDrag(
				position,
				draggedComponent.size,
				allComponents,
				draggedComponent.id,
			);

			// Provide helpful feedback for each zone
			let feedback = "";
			if (isValid) {
				feedback = `Drop here (${x === 0 ? "Left" : "Right"} column, Row ${y + 1})`;
			} else {
				feedback = "Invalid position";
			}

			dropZones.push({
				x,
				y,
				isValid,
				feedback,
			});
		}
	}

	return dropZones;
}

/**
 * Get grid cell boundaries for visual indicators
 * Used by shadcn/ui Badge components in grid overlay
 */
export function getGridCellBounds(
	position: Position,
	size: Size,
	gridConfig: GridConfiguration,
): {
	left: string;
	top: string;
	width: string;
	height: string;
} {
	const { cols, cellHeight, gap } = gridConfig;

	// Calculate dimensions as percentages and pixels
	const cellWidthPercent = 100 / cols;
	const widthPercent = size.width === "full" ? 100 : cellWidthPercent;

	return {
		left: `${position.x * cellWidthPercent}%`,
		top: `${position.y * (cellHeight + gap)}px`,
		width: `${widthPercent}%`,
		height: `${cellHeight * size.height + gap * (size.height - 1)}px`,
	};
}

/**
 * Validate grid configuration for shadcn/ui compatibility
 * Ensures grid settings work well with shadcn/ui design system
 */
export function validateGridConfig(config: GridConfiguration): {
	isValid: boolean;
	warnings: string[];
	suggestions: string[];
} {
	const warnings: string[] = [];
	const suggestions: string[] = [];

	// Check minimum cell height for readability
	if (config.cellHeight < 60) {
		warnings.push(
			"Cell height is very small, may affect component readability",
		);
		suggestions.push("Consider increasing cell height to at least 80px");
	}

	// Check gap size for visual clarity
	if (config.gap < 8) {
		warnings.push("Gap is very small, components may appear cramped");
		suggestions.push(
			"Consider increasing gap to at least 12px for better visual separation",
		);
	}

	// Check padding for proper spacing
	const minPadding = 16;
	if (
		config.containerPadding.top < minPadding ||
		config.containerPadding.right < minPadding ||
		config.containerPadding.bottom < minPadding ||
		config.containerPadding.left < minPadding
	) {
		warnings.push("Container padding is small, content may touch edges");
		suggestions.push("Consider using at least 16px padding on all sides");
	}

	return {
		isValid: warnings.length === 0,
		warnings,
		suggestions,
	};
}
