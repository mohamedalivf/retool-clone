/**
 * Preview Desktop Component Renderer - renders components for desktop view (2-column grid)
 * Uses the original grid positioning logic from edit mode
 */

import { cn } from "@/lib/utils";
import { hugsToPixels } from "@/modules/edit/constants/hug-system";
import type { ComponentState } from "@/modules/edit/store/types";
import { PreviewImageComponent } from "./preview-image-component";
import { PreviewTextComponent } from "./preview-text-component";

interface PreviewDesktopRendererProps {
	component: ComponentState;
}

export function PreviewDesktopRenderer({
	component,
}: PreviewDesktopRendererProps) {
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

	return (
		<div
			className={cn(
				"relative",
				// Remove all interactive states since this is preview-only
				component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
				component.type === "image" && `min-h-[${hugsToPixels(4)}px]`,
				// Add z-index classes similar to edit mode for proper layering
				component.type === "text" && "z-10", // Text components get higher z-index
				component.type === "image" && "z-0", // Image components get lower z-index
			)}
			style={{
				gridColumn,
				gridRow,
			}}
			aria-label={`${component.type} component in desktop preview mode`}
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
