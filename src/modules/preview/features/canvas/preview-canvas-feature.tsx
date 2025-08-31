/**
 * Preview Canvas Feature - displays components in read-only mode
 * Similar to MainCanvasFeature but without edit controls, drag & drop, or selection
 */

import { cn } from "@/lib/utils";
import { HUG_HEIGHT } from "@/modules/edit/constants/hug-system";
import { usePreviewComponents } from "../../store/use-preview-store";
import { PreviewComponentRenderer } from "./components/preview-component-renderer";

export function PreviewCanvasFeature() {
	const components = usePreviewComponents();

	// Sort components for proper rendering order
	// On desktop: sort by creation time for proper layering
	// On mobile: sort by position (row first, then column) for logical flow
	const sortedComponents = [...components].sort((a, b) => {
		// Primary sort: by row (y position)
		if (a.position.y !== b.position.y) {
			return a.position.y - b.position.y;
		}

		// Secondary sort: by column (x position) within the same row
		if (a.position.x !== b.position.x) {
			return a.position.x - b.position.x;
		}

		// Tertiary sort: by creation time for components in the same position
		return a.createdAt - b.createdAt;
	});

	const hasComponents = sortedComponents.length > 0;

	return (
		<div className="flex-1 overflow-auto bg-gray-50">
			<div className="h-full p-4">
				<div
					className={cn(
						"mx-auto bg-white shadow-sm border border-gray-200",
						"min-h-full",
						// Responsive max width
						"max-w-4xl",
					)}
				>
					{!hasComponents && <PreviewEmptyState />}

					{/* Component Grid - Same layout as edit mode but without interactions */}
					{hasComponents && (
						<div
							className={cn(
								// Grid layout with responsive behavior
								"relative grid",
								// Desktop: 2 columns, Mobile/Tablet: 1 column
								"grid-cols-1 md:grid-cols-2",
								// NO GAPS - components should be flush against each other
								"gap-0",
								// Full height, no padding, no rounded corners
								"h-full min-h-screen",
							)}
							style={{
								gap: "0px", // Force no gap regardless of grid config
								gridAutoRows: `${HUG_HEIGHT}px`, // Fixed row height = 1 hug
								alignItems: "start", // Align items to start of their grid area
							}}
						>
							{sortedComponents.map((component, index) => {
								// Calculate mobile row start based on previous components' heights
								let mobileRowStart = 1;
								for (let i = 0; i < index; i++) {
									const prevComponent = sortedComponents[i];
									mobileRowStart += prevComponent.size.height;
								}

								return (
									<PreviewComponentRenderer
										key={component.id}
										component={component}
										mobileRowStart={mobileRowStart}
									/>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function PreviewEmptyState() {
	return (
		<div className="flex items-center justify-center h-full min-h-[400px]">
			<div className="text-center">
				<div className="mx-auto h-12 w-12 text-gray-400 mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					No components to preview
				</h3>
				<p className="text-gray-500 mb-4">
					Create some components in edit mode to see them here.
				</p>
			</div>
		</div>
	);
}
