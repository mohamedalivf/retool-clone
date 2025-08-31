/**
 * Preview Mobile Component Renderer - renders components for mobile view (single-column grid)
 * Stacked components (same row) become sequential, all become full-width
 */

import { cn } from "@/lib/utils";
import { hugsToPixels } from "@/modules/edit/constants/hug-system";
import type { ComponentState } from "@/modules/edit/store/types";
import { PreviewImageComponent } from "./preview-image-component";
import { PreviewTextComponent } from "./preview-text-component";

interface PreviewMobileRendererProps {
	component: ComponentState;
	mobileRowStart: number;
}

export function PreviewMobileRenderer({
	component,
	mobileRowStart,
}: PreviewMobileRendererProps) {
	// Calculate grid column: all components become full-width in mobile
	const gridColumn = "1 / -1";

	// Calculate grid row: use sequential positioning to avoid overlapping
	// This ensures stacked components (same desktop row) become sequential in mobile
	const gridRow =
		component.type === "text"
			? `${mobileRowStart}`
			: `${mobileRowStart} / span ${component.size.height}`;

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
			aria-label={`${component.type} component in mobile preview mode`}
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
