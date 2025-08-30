/**
 * Grid calculation utilities for positioning and collision detection
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

			if (!checkCollision(position, size, components)) {
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
				!checkCollision(
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
		!checkCollision(component.position, newSize, components, component.id)
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
