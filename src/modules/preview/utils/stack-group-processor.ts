/**
 * Stack Group Processor - Detects and groups overlapped components
 * Creates relationships between components that occupy the same grid position
 */

import type { ComponentState } from "@/modules/edit/store/types";

export interface StackGroup {
	id: string;
	components: ComponentState[];
	position: { x: number; y: number };
	// Dimensions in hugs - based on the largest component in the group
	width: number; // in hugs (1 for half-width, 2 for full-width)
	height: number; // in hugs
}

export interface ProcessedComponent extends ComponentState {
	stackGroupId?: string;
	stackPosition?: {
		// Position within the stack group (in hugs)
		x: number;
		y: number;
	};
}

/**
 * Detects components that overlap (same column with overlapping vertical ranges) and groups them
 */
export function detectStackGroups(components: ComponentState[]): StackGroup[] {
	const stackGroups: StackGroup[] = [];
	const processedComponentIds = new Set<string>();

	for (const component of components) {
		if (processedComponentIds.has(component.id)) continue;

		// Find components that stack with this one (same column, overlapping vertical ranges)
		const stackingComponents = components.filter((c) => {
			if (c.id === component.id || processedComponentIds.has(c.id))
				return false;
			if (c.position.x !== component.position.x) return false;

			// Check if vertical ranges overlap
			const start1 = component.position.y;
			const end1 = component.position.y + component.size.height - 1;
			const start2 = c.position.y;
			const end2 = c.position.y + c.size.height - 1;

			return start1 <= end2 && start2 <= end1;
		});

		// Include the current component in the stacking group
		const allStackingComponents = [component, ...stackingComponents];

		if (allStackingComponents.length > 1) {
			// Create a stack group
			// Calculate the overall bounds of the stacking group
			const minY = Math.min(...allStackingComponents.map((c) => c.position.y));
			const maxY = Math.max(
				...allStackingComponents.map((c) => c.position.y + c.size.height - 1),
			);
			const groupHeight = maxY - minY + 1;

			const stackGroup: StackGroup = {
				id: `stack-${component.position.x}-${minY}`,
				components: allStackingComponents,
				position: { x: component.position.x, y: minY },
				// Calculate group dimensions based on largest component
				width: Math.max(
					...allStackingComponents.map((c) =>
						c.size.width === "full" ? 2 : 1,
					),
				),
				height: groupHeight,
			};

			stackGroups.push(stackGroup);

			// Mark all components in this group as processed
			for (const c of allStackingComponents) {
				processedComponentIds.add(c.id);
			}
		}
	}

	return stackGroups;
}

/**
 * Processes components to add stack group relationships
 */
export function processComponentsForStacking(components: ComponentState[]): {
	stackGroups: StackGroup[];
	processedComponents: ProcessedComponent[];
} {
	const stackGroups = detectStackGroups(components);
	const processedComponents: ProcessedComponent[] = [];

	for (const component of components) {
		// Find if this component belongs to a stack group
		const stackGroup = stackGroups.find((group) =>
			group.components.some((c) => c.id === component.id),
		);

		if (stackGroup) {
			// Component is part of a stack group
			const processedComponent: ProcessedComponent = {
				...component,
				stackGroupId: stackGroup.id,
				stackPosition: {
					// For now, all components in a stack start at 0,0 within the group
					// This can be enhanced later for more complex positioning
					x: 0,
					y: 0,
				},
			};
			processedComponents.push(processedComponent);
		} else {
			// Individual component (no stacking)
			processedComponents.push(component);
		}
	}

	return { stackGroups, processedComponents };
}
