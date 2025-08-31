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
	mobileRowStart: number;
}

export function PreviewComponentRenderer({
	component,
	mobileRowStart,
}: PreviewComponentRendererProps) {
	// Calculate grid position with responsive behavior
	// On mobile/tablet (single column): all components span full width
	// On desktop (2 columns): use original logic
	const getGridColumnClasses = () => {
		if (component.size.width === "full") {
			return "col-span-full"; // Full width spans all columns (works for both 1 and 2 column layouts)
		}

		// Half-width components: full width on mobile, positioned column on desktop
		if (component.position.x === 0) {
			return "col-span-full md:col-span-1 md:col-start-1"; // Full width on mobile, first column on desktop
		}

		return "col-span-full md:col-span-1 md:col-start-2"; // Full width on mobile, second column on desktop
	};

	// Calculate grid row for both mobile and desktop
	const desktopGridRow =
		component.type === "text"
			? `${component.position.y + 1}`
			: `${component.position.y + 1} / span ${component.size.height}`;

	// For mobile, calculate row based on cumulative heights of previous components
	// Text components take 1 row, image components take their height in rows
	const mobileGridRow =
		component.type === "text"
			? `${mobileRowStart}`
			: `${mobileRowStart} / span ${component.size.height}`;

	return (
		<div
			className={cn(
				"relative",
				// Responsive grid positioning
				getGridColumnClasses(),
				// Add responsive grid row classes based on component type
				component.type === "text"
					? "preview-text-responsive"
					: "preview-image-responsive",
				// Remove all interactive states since this is preview-only
				component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
				component.type === "image" && `min-h-[${hugsToPixels(4)}px]`,
				// Add z-index classes similar to edit mode for proper layering
				component.type === "text" && "z-10", // Text components get higher z-index
				component.type === "image" && "z-0", // Image components get lower z-index
			)}
			style={
				{
					// Set CSS custom properties for both mobile and desktop grid row positioning
					"--desktop-grid-row": desktopGridRow,
					"--mobile-grid-row": mobileGridRow,
				} as React.CSSProperties
			}
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
