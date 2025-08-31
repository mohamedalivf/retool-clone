

import type {
	ComponentState,
	GridBounds,
	GridConfiguration,
	Position,
	Size,
} from "../store/types";

export function gridToPixels(
	position: Position,
	size: Size,
	gridConfig: GridConfiguration,
): { x: number; y: number; width: number; height: number } {
	const { cols, cellHeight, gap, containerPadding } = gridConfig;

	const availableWidth =
		window.innerWidth - containerPadding.left - containerPadding.right - gap;
	const cellWidth = availableWidth / cols;

	const x = containerPadding.left + position.x * (cellWidth + gap);
	const y = containerPadding.top + position.y * (cellHeight + gap);

	const width = size.width === "full" ? cellWidth * 2 + gap : cellWidth;
	const height = cellHeight * size.height + gap * (size.height - 1);

	return { x, y, width, height };
}

export function pixelsToGrid(
	clientX: number,
	clientY: number,
	gridConfig: GridConfiguration,
	containerRect: DOMRect,
): Position {
	const { cols, cellHeight, gap, containerPadding } = gridConfig;

	const relativeX = clientX - containerRect.left - containerPadding.left;
	const relativeY = clientY - containerRect.top - containerPadding.top;

	const availableWidth =
		containerRect.width - containerPadding.left - containerPadding.right - gap;
	const cellWidth = availableWidth / cols;

	const x = Math.max(0, Math.min(1, Math.floor(relativeX / (cellWidth + gap))));
	const y = Math.max(0, Math.floor(relativeY / (cellHeight + gap)));

	return { x, y };
}

export function checkCollision(
	position: Position,
	size: Size,
	components: ComponentState[],
	excludeId?: string,
): boolean {

	const occupiedCells = getOccupiedCells(position, size);

	for (const component of components) {
		if (excludeId && component.id === excludeId) {
			continue;
		}

		const existingCells = getOccupiedCells(component.position, component.size);

		for (const newCell of occupiedCells) {
			for (const existingCell of existingCells) {
				if (newCell.x === existingCell.x && newCell.y === existingCell.y) {
					return true;
				}
			}
		}
	}

	return false;
}

export function checkCollisionForCreation(
	position: Position,
	size: Size,
	components: ComponentState[],
): boolean {
	return checkCollision(position, size, components);
}

export function checkCollisionForDrag(
	position: Position,
	size: Size,
	_components: ComponentState[],
	_excludeId?: string,
): boolean {

	if (position.x < 0 || position.x > 1) {
		return true;
	}

	if (size.width === "full" && position.x !== 0) {
		return true;
	}

	if (size.width === "half" && position.x > 1) {
		return true;
	}

	if (position.y < 0) {
		return true;
	}

	return false;
}

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

export function findNextAvailablePosition(
	size: Size,
	components: ComponentState[],
	gridConfig: GridConfiguration,
): Position | null {
	const maxRows = Math.max(gridConfig.rows, getMaxRowUsed(components) + 5);

	for (let y = 0; y < maxRows; y++) {
		for (let x = 0; x <= (size.width === "full" ? 0 : 1); x++) {
			const position = { x, y };

			if (!checkCollisionForCreation(position, size, components)) {
				return position;
			}
		}
	}

	return null;
}

export function getMaxRowUsed(components: ComponentState[]): number {
	if (components.length === 0) return 0;

	return Math.max(
		...components.map(
			(component) => component.position.y + component.size.height - 1,
		),
	);
}

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

export function isValidGridPosition(
	position: Position,
	size: Size,
	_gridConfig: GridConfiguration,
): boolean {

	if (position.x < 0 || position.x > 1) {
		return false;
	}

	if (size.width === "full" && position.x !== 0) {
		return false;
	}

	if (size.width === "half" && position.x > 1) {
		return false;
	}

	if (position.y < 0) {
		return false;
	}

	return true;
}

export function snapToGrid(position: Position, size: Size): Position {
	let x = Math.round(position.x);
	let y = Math.round(position.y);

	x = Math.max(0, Math.min(1, x));

	if (size.width === "full") {
		x = 0;
	}

	y = Math.max(0, y);

	return { x, y };
}

export function calculateDropZones(
	draggedComponent: ComponentState,
	components: ComponentState[],
	gridConfig: GridConfiguration,
): Position[] {
	const dropZones: Position[] = [];
	const maxRows = Math.max(gridConfig.rows, getMaxRowUsed(components) + 3);

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

export function getDistance(pos1: Position, pos2: Position): number {
	const dx = pos1.x - pos2.x;
	const dy = pos1.y - pos2.y;
	return Math.sqrt(dx * dx + dy * dy);
}

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

export function getGridBounds(gridConfig: GridConfiguration): GridBounds {
	return {
		minX: 0,
		maxX: gridConfig.cols - 1,
		minY: 0,
		maxY: gridConfig.rows - 1,
	};
}

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

export function calculateResponsiveGrid(
	containerWidth: number,
	_containerHeight: number,
	baseGridConfig: GridConfiguration,
): GridConfiguration {

	const isSmall = containerWidth < 640;
	const isMedium = containerWidth >= 640 && containerWidth < 1024;

	const responsiveConfig: GridConfiguration = {
		...baseGridConfig,

		cellHeight: isSmall ? 80 : isMedium ? 100 : baseGridConfig.cellHeight,

		gap: isSmall ? 8 : isMedium ? 12 : baseGridConfig.gap,

		containerPadding: {
			top: isSmall ? 12 : 16,
			right: isSmall ? 12 : 16,
			bottom: isSmall ? 12 : 16,
			left: isSmall ? 12 : 16,
		},
	};

	return responsiveConfig;
}

export function getOptimalComponentSize(
	componentType: "text" | "image",
	_contentLength?: number,
): Size {
	switch (componentType) {
		case "text":

			return {
				width: "half",
				height: 1,
			};
		case "image":

			return {
				width: "half",
				height: 2,
			};
		default:
			return {
				width: "half",
				height: 1,
			};
	}
}

export function calculateEnhancedDropZones(
	draggedComponent: ComponentState,
	allComponents: ComponentState[],
	gridConfig: GridConfiguration,
): Array<Position & { isValid: boolean; feedback: string }> {
	const dropZones: Array<Position & { isValid: boolean; feedback: string }> =
		[];
	const maxRows = Math.max(gridConfig.rows, getMaxRowUsed(allComponents) + 3);

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

	const cellWidthPercent = 100 / cols;
	const widthPercent = size.width === "full" ? 100 : cellWidthPercent;

	return {
		left: `${position.x * cellWidthPercent}%`,
		top: `${position.y * (cellHeight + gap)}px`,
		width: `${widthPercent}%`,
		height: `${cellHeight * size.height + gap * (size.height - 1)}px`,
	};
}

export function validateGridConfig(config: GridConfiguration): {
	isValid: boolean;
	warnings: string[];
	suggestions: string[];
} {
	const warnings: string[] = [];
	const suggestions: string[] = [];

	if (config.cellHeight < 60) {
		warnings.push(
			"Cell height is very small, may affect component readability",
		);
		suggestions.push("Consider increasing cell height to at least 80px");
	}

	if (config.gap < 8) {
		warnings.push("Gap is very small, components may appear cramped");
		suggestions.push(
			"Consider increasing gap to at least 12px for better visual separation",
		);
	}

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
