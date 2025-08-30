/**
 * Component factory utilities for creating new components
 */

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
 * Create default size based on component type
 */
export function createDefaultSize(type: ComponentType): Size {
	return {
		width: "half", // Default to half-width for both types
		height: type === "text" ? 1 : 2, // Text: 1 unit, Image: 2 units
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
		: options?.attributes;

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
		: options?.attributes;

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
