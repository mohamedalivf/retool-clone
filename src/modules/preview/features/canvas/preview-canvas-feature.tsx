/**
 * Preview Canvas Feature - displays components in read-only mode
 * Similar to MainCanvasFeature but without edit controls, drag & drop, or selection
 */

import { cn } from "@/lib/utils";
import { HUG_HEIGHT } from "@/modules/edit/constants/hug-system";
import { usePreviewComponents } from "../../store/use-preview-store";
import { processComponentsForStacking } from "../../utils/stack-group-processor";
import { PreviewDesktopRenderer } from "./components/preview-desktop-renderer";
import { PreviewMobileRenderer } from "./components/preview-mobile-renderer";
import { StackGroupWrapper } from "./components/stack-group-wrapper";

export function PreviewCanvasFeature() {
	const components = usePreviewComponents();

	// Process components to detect and group overlapping components
	const { stackGroups, processedComponents } =
		processComponentsForStacking(components);

	// Separate individual components from stacked components
	const individualComponents = processedComponents.filter(
		(component) => !component.stackGroupId,
	);

	// Sort individual components for proper rendering order
	const sortedIndividualComponents = [...individualComponents].sort((a, b) => {
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

	// Sort stack groups by position
	const sortedStackGroups = [...stackGroups].sort((a, b) => {
		if (a.position.y !== b.position.y) {
			return a.position.y - b.position.y;
		}
		return a.position.x - b.position.x;
	});

	// Create a unified rendering list with proper ordering
	const renderingItems: Array<
		| { type: "component"; component: (typeof sortedIndividualComponents)[0] }
		| { type: "stackGroup"; stackGroup: (typeof sortedStackGroups)[0] }
	> = [];

	// Add individual components
	for (const component of sortedIndividualComponents) {
		renderingItems.push({ type: "component", component });
	}

	// Add stack groups
	for (const stackGroup of sortedStackGroups) {
		renderingItems.push({ type: "stackGroup", stackGroup });
	}

	// Sort all items by position for final rendering order
	renderingItems.sort((a, b) => {
		const aPos =
			a.type === "component" ? a.component.position : a.stackGroup.position;
		const bPos =
			b.type === "component" ? b.component.position : b.stackGroup.position;

		if (aPos.y !== bPos.y) {
			return aPos.y - bPos.y;
		}
		return aPos.x - bPos.x;
	});

	const hasComponents = renderingItems.length > 0;

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
							{/* Desktop View - Hidden on mobile */}
							<div className="hidden md:contents">
								{renderingItems.map((item) => {
									if (item.type === "component") {
										return (
											<PreviewDesktopRenderer
												key={`desktop-${item.component.id}`}
												component={item.component}
											/>
										);
									}

									// Get processed components for this stack group
									const stackGroupProcessedComponents =
										processedComponents.filter(
											(comp) => comp.stackGroupId === item.stackGroup.id,
										);

									return (
										<StackGroupWrapper
											key={`desktop-stack-${item.stackGroup.id}`}
											stackGroup={item.stackGroup}
											processedComponents={stackGroupProcessedComponents}
											isDesktop={true}
										/>
									);
								})}
							</div>

							{/* Mobile View - Hidden on desktop */}
							<div className="contents md:hidden">
								{renderingItems.map((item, index) => {
									// Calculate mobile row start based on previous items' heights
									let mobileRowStart = 1;
									for (let i = 0; i < index; i++) {
										const prevItem = renderingItems[i];
										const height =
											prevItem.type === "component"
												? prevItem.component.size.height
												: prevItem.stackGroup.height;
										mobileRowStart += height;
									}

									if (item.type === "component") {
										return (
											<PreviewMobileRenderer
												key={`mobile-${item.component.id}`}
												component={item.component}
												mobileRowStart={mobileRowStart}
											/>
										);
									}

									// Get processed components for this stack group
									const stackGroupProcessedComponents =
										processedComponents.filter(
											(comp) => comp.stackGroupId === item.stackGroup.id,
										);

									return (
										<StackGroupWrapper
											key={`mobile-stack-${item.stackGroup.id}`}
											stackGroup={item.stackGroup}
											processedComponents={stackGroupProcessedComponents}
											isDesktop={false}
											mobileRowStart={mobileRowStart}
										/>
									);
								})}
							</div>
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
				<div className="mx-auto h-12 w-12 text-gray-400 mb-4">
					<svg
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						/>
					</svg>
				</div>
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
