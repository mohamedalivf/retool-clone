/**
 * Component factory utilities for creating new components
 */

import { HUG_HEIGHT } from "../constants/hug-system";
import type {
	ComponentAttributes,
	ComponentState,
	ComponentStyles,
	ComponentType,
	ImageAttributes,
	Position,
	Size,
	TextAttributes,
} from "../store/types";

import {
	DEFAULT_COMPONENT_STYLES,
	DEFAULT_IMAGE_ATTRIBUTES,
	DEFAULT_TEXT_ATTRIBUTES,
} from "../store/types";

/**
 * Generate a unique component ID
 */
export function generateComponentId(): string {
	return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate image height in hugs based on aspect ratio and width
 */
export function calculateImageHeightInHugs(
	aspectRatio: string,
	width: "half" | "full",
	actualCanvasWidth?: number,
): number {
	// Get aspect ratio value
	let ratio: number;
	switch (aspectRatio) {
		case "1:1":
			ratio = 1;
			break;
		case "16:9":
			ratio = 16 / 9;
			break;
		case "4:3":
			ratio = 4 / 3;
			break;
		case "3:2":
			ratio = 3 / 2;
			break;
		case "21:9":
			ratio = 21 / 9;
			break;
		case "2:1":
			ratio = 2 / 1;
			break;
		default:
			ratio = 16 / 9; // Default to 16:9
	}

	// Use actual canvas width if provided, otherwise fall back to assumption
	const canvasWidth = actualCanvasWidth || 800;
	const componentWidth = width === "half" ? canvasWidth / 2 : canvasWidth;
	const componentHeight = componentWidth / ratio;

	// Convert to hugs and round to nearest hug
	const heightInHugs = Math.max(1, Math.round(componentHeight / HUG_HEIGHT));

	// Debug: Log the calculation
	console.log(`🧮 Image height calculation:
		aspectRatio: ${aspectRatio} (ratio: ${ratio})
		width: ${width} (${componentWidth}px from canvas ${canvasWidth}px)
		componentHeight: ${componentHeight}px
		HUG_HEIGHT: ${HUG_HEIGHT}px
		heightInHugs: ${heightInHugs}`);

	return heightInHugs;
}

/**
 * Create default size based on component type
 */
export function createDefaultSize(type: ComponentType): Size {
	if (type === "text") {
		return {
			width: "half",
			height: 1, // Text starts with 1 hug
		};
	}

	// For images, calculate height based on default aspect ratio (16:9)
	const width = "half";
	const height = calculateImageHeightInHugs("16:9", width);
	return {
		width,
		height,
	};
}

/**
 * Create default attributes based on component type
 */
export function createDefaultAttributes(
	type: ComponentType,
): ComponentAttributes {
	switch (type) {
		case "text":
			return { ...DEFAULT_TEXT_ATTRIBUTES };
		case "image":
			return { ...DEFAULT_IMAGE_ATTRIBUTES };
		default:
			throw new Error(`Unknown component type: ${type}`);
	}
}

/**
 * Create a new component with default or provided values
 */
export function createComponent(
	type: ComponentType,
	position: Position,
	size?: Partial<Size>,
	attributes?: Partial<ComponentAttributes>,
	styles?: Partial<ComponentStyles>,
): ComponentState {
	const now = Date.now();
	const defaultSize = createDefaultSize(type);
	const defaultAttributes = createDefaultAttributes(type);

	return {
		id: generateComponentId(),
		type,
		position,
		size: { ...defaultSize, ...size },
		attributes: { ...defaultAttributes, ...attributes } as ComponentAttributes,
		styles: { ...DEFAULT_COMPONENT_STYLES, ...styles },
		status: "active",
		createdAt: now,
		updatedAt: now,
	};
}

/**
 * Create a text component with specific content
 */
export function createTextComponent(
	position: Position,
	content?: string,
	options?: {
		size?: Partial<Size>;
		attributes?: Partial<TextAttributes>;
		styles?: Partial<ComponentStyles>;
	},
): ComponentState {
	const textAttributes: Partial<TextAttributes> = content
		? { content, ...options?.attributes }
		: options?.attributes || {};

	return createComponent(
		"text",
		position,
		options?.size,
		textAttributes,
		options?.styles,
	);
}

/**
 * Create an image component with specific source
 */
export function createImageComponent(
	position: Position,
	src?: string,
	options?: {
		size?: Partial<Size>;
		attributes?: Partial<ImageAttributes>;
		styles?: Partial<ComponentStyles>;
	},
): ComponentState {
	const imageAttributes: Partial<ImageAttributes> = src
		? { src, ...options?.attributes }
		: options?.attributes || {};

	return createComponent(
		"image",
		position,
		options?.size,
		imageAttributes,
		options?.styles,
	);
}

/**
 * Clone an existing component with a new ID and position
 */
export function cloneComponent(
	component: ComponentState,
	newPosition: Position,
): ComponentState {
	const now = Date.now();

	return {
		...component,
		id: generateComponentId(),
		position: newPosition,
		createdAt: now,
		updatedAt: now,
	};
}

/**
 * Update component timestamps
 */
export function updateComponentTimestamp(
	component: ComponentState,
): ComponentState {
	return {
		...component,
		updatedAt: Date.now(),
	};
}

/**
 * Validate component data structure
 */
export function validateComponent(component: ComponentState): boolean {
	try {
		// Check required fields
		if (
			!component.id ||
			!component.type ||
			!component.position ||
			!component.size ||
			!component.attributes
		) {
			return false;
		}

		// Validate position
		if (
			typeof component.position.x !== "number" ||
			typeof component.position.y !== "number"
		) {
			return false;
		}

		if (
			component.position.x < 0 ||
			component.position.x > 1 ||
			component.position.y < 0
		) {
			return false;
		}

		// Validate size
		if (
			!["half", "full"].includes(component.size.width) ||
			typeof component.size.height !== "number"
		) {
			return false;
		}

		if (component.size.height <= 0) {
			return false;
		}

		// Validate type-specific attributes
		if (component.type === "text") {
			const attrs = component.attributes as TextAttributes;
			if (typeof attrs.content !== "string") {
				return false;
			}
		} else if (component.type === "image") {
			const attrs = component.attributes as ImageAttributes;
			if (typeof attrs.src !== "string" || typeof attrs.alt !== "string") {
				return false;
			}
		}

		return true;
	} catch (error) {
		return false;
	}
}

/**
 * Sanitize component data to ensure type safety
 */
export function sanitizeComponent(
	component: Partial<ComponentState>,
): ComponentState | null {
	try {
		if (!component.type || !component.position) {
			return null;
		}

		const sanitized = createComponent(
			component.type,
			component.position,
			component.size,
			component.attributes,
			component.styles,
		);

		// Override with provided ID if valid
		if (component.id && typeof component.id === "string") {
			sanitized.id = component.id;
		}

		// Override timestamps if provided
		if (component.createdAt && typeof component.createdAt === "number") {
			sanitized.createdAt = component.createdAt;
		}
		if (component.updatedAt && typeof component.updatedAt === "number") {
			sanitized.updatedAt = component.updatedAt;
		}

		return validateComponent(sanitized) ? sanitized : null;
	} catch (error) {
		return null;
	}
}
