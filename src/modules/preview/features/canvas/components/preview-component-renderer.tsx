/**
 * Preview Component Renderer - renders components without edit controls
 * Similar to the edit ComponentRenderer but simplified for read-only display
 */

import { cn } from "@/lib/utils";
import { hugsToPixels } from "@/modules/edit/constants/hug-system";
import type { ComponentState } from "@/modules/edit/store/types";
import { PreviewImageComponent } from "./preview-image-component";
import { PreviewTextComponent } from "./preview-text-component";

interface PreviewComponentRendererProps {
	component: ComponentState;
}

export function PreviewComponentRenderer({
	component,
}: PreviewComponentRendererProps) {
	// Calculate grid position (same logic as edit mode)
	const gridColumn =
		component.size.width === "full"
			? "1 / -1"
			: component.position.x === 0
				? "1"
				: "2";

	// For text components, use auto grid row. For images, use span if needed
	const gridRow =
		component.type === "text"
			? `${component.position.y + 1}`
			: `${component.position.y + 1} / span ${component.size.height}`;

	// Calculate z-index based on creation time to handle overlapping components
	// More recent components (higher createdAt) should appear on top
	const zIndex = Math.floor(component.createdAt / 1000) % 1000; // Convert timestamp to reasonable z-index

	return (
		<div
			className={cn(
				"relative",
				// Remove all interactive states since this is preview-only
				component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
				component.type === "image" && `min-h-[${hugsToPixels(4)}px]`,
			)}
			style={{
				gridColumn,
				gridRow,
				zIndex, // Ensure proper layering for overlapping components
			}}
			aria-label={`${component.type} component in preview mode`}
		>
			<div className="w-full h-full">
				{component.type === "text" && (
					<PreviewTextComponent component={component} />
				)}
				{component.type === "image" && (
					<PreviewImageComponent component={component} />
				)}
			</div>
		</div>
	);
}
