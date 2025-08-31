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

	// Sort components by creation time to ensure proper layering
	// Earlier components (lower createdAt) should render first, later ones on top
	const sortedComponents = [...components].sort(
		(a, b) => a.createdAt - b.createdAt,
	);

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
								// Base: 2 columns (as per design requirements)
								"grid-cols-2",
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
							{sortedComponents.map((component) => (
								<PreviewComponentRenderer
									key={component.id}
									component={component}
								/>
							))}
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
