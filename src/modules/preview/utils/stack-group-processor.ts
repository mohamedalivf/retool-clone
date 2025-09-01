


import type { ComponentState } from "@/modules/edit/store/types";

export interface StackGroup {
	id: string;
	components: ComponentState[];
	position: { x: number; y: number };

	width: number;
	height: number;
}

export interface ProcessedComponent extends ComponentState {
	stackGroupId?: string;
	stackPosition?: {

		x: number;
		y: number;
	};
}



export function detectStackGroups(components: ComponentState[]): StackGroup[] {
	const stackGroups: StackGroup[] = [];
	const processedComponentIds = new Set<string>();

	for (const component of components) {
		if (processedComponentIds.has(component.id)) continue;


		const stackingComponents = components.filter((c) => {
			if (c.id === component.id || processedComponentIds.has(c.id))
				return false;
			if (c.position.x !== component.position.x) return false;


			const start1 = component.position.y;
			const end1 = component.position.y + component.size.height - 1;
			const start2 = c.position.y;
			const end2 = c.position.y + c.size.height - 1;

			return start1 <= end2 && start2 <= end1;
		});


		const allStackingComponents = [component, ...stackingComponents];

		if (allStackingComponents.length > 1) {


			const minY = Math.min(...allStackingComponents.map((c) => c.position.y));
			const maxY = Math.max(
				...allStackingComponents.map((c) => c.position.y + c.size.height - 1),
			);
			const groupHeight = maxY - minY + 1;

			const stackGroup: StackGroup = {
				id: `stack-${component.position.x}-${minY}`,
				components: allStackingComponents,
				position: { x: component.position.x, y: minY },

				width: Math.max(
					...allStackingComponents.map((c) =>
						c.size.width === "full" ? 2 : 1,
					),
				),
				height: groupHeight,
			};

			stackGroups.push(stackGroup);


			for (const c of allStackingComponents) {
				processedComponentIds.add(c.id);
			}
		}
	}

	return stackGroups;
}



export function processComponentsForStacking(components: ComponentState[]): {
	stackGroups: StackGroup[];
	processedComponents: ProcessedComponent[];
} {
	const stackGroups = detectStackGroups(components);
	const processedComponents: ProcessedComponent[] = [];

	for (const component of components) {

		const stackGroup = stackGroups.find((group) =>
			group.components.some((c) => c.id === component.id),
		);

		if (stackGroup) {

			const processedComponent: ProcessedComponent = {
				...component,
				stackGroupId: stackGroup.id,
				stackPosition: {

					x: component.position.x - stackGroup.position.x,
					y: component.position.y - stackGroup.position.y,
				},
			};
			processedComponents.push(processedComponent);
		} else {

			processedComponents.push(component);
		}
	}
	console.log("processedComponents", processedComponents);
	console.log("stackGroups", stackGroups);

	return { stackGroups, processedComponents };
}
