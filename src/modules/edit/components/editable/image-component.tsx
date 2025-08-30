/**
 * Image component for displaying images with flexible sizing
 */

import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";
import type { ComponentState, ImageAttributes } from "../../store/types";

interface ImageComponentProps {
	component: ComponentState;
}

export function ImageComponent({ component }: ImageComponentProps) {
	const attributes = component.attributes as ImageAttributes;
	const styles = component.styles;

	// Apply component styles
	const componentStyles = {
		backgroundColor: styles.backgroundColor,
		borderWidth: styles.border?.width,
		borderStyle: styles.border?.style,
		borderColor: styles.border?.color,
		padding: `${styles.padding?.top}px ${styles.padding?.right}px ${styles.padding?.bottom}px ${styles.padding?.left}px`,
		opacity: styles.opacity,
		boxShadow: getShadowValue(styles.shadow),
	};

	// Get aspect ratio style
	const aspectRatioStyle = getAspectRatioStyle(attributes.aspectRatio);

	// Get border radius class
	const borderRadiusClass = getBorderRadiusClass(attributes.borderRadius);

	return (
		<div
			className={cn("h-full w-full", "bg-white border border-gray-200")}
			style={componentStyles}
		>
			<div
				className="h-full w-full relative overflow-hidden"
				style={aspectRatioStyle}
			>
				{attributes.src ? (
					<img
						src={attributes.src}
						alt={attributes.alt}
						className={cn(
							"w-full h-full",
							`object-${attributes.objectFit}`,
							borderRadiusClass,
						)}
						onError={(e) => {
							// Show placeholder on error
							const target = e.target as HTMLImageElement;
							target.style.display = "none";
							const placeholder = target.nextElementSibling as HTMLElement;
							if (placeholder) {
								placeholder.style.display = "flex";
							}
						}}
					/>
				) : null}

				{/* Placeholder */}
				<div
					className={cn(
						"w-full h-full flex items-center justify-center",
						"bg-gray-50 text-gray-400",
						borderRadiusClass,
						attributes.src ? "hidden" : "flex",
					)}
				>
					<div className="text-center">
						<ImageIcon className="h-12 w-12 mx-auto mb-2" />
						<p className="text-sm font-medium">Image Placeholder</p>
						<p className="text-xs">Add an image source to display content</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function getShadowValue(shadow?: string): string {
	switch (shadow) {
		case "sm":
			return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
		case "md":
			return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
		case "lg":
			return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
		case "xl":
			return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
		default:
			return "none";
	}
}

function getAspectRatioStyle(aspectRatio: string): React.CSSProperties {
	switch (aspectRatio) {
		case "1:1":
			return { aspectRatio: "1 / 1" };
		case "16:9":
			return { aspectRatio: "16 / 9" };
		case "4:3":
			return { aspectRatio: "4 / 3" };
		case "3:2":
			return { aspectRatio: "3 / 2" };
		default:
			return {};
	}
}

function getBorderRadiusClass(borderRadius: string): string {
	switch (borderRadius) {
		case "sm":
			return "rounded-sm";
		case "md":
			return "rounded-md";
		case "lg":
			return "rounded-lg";
		case "full":
			return "rounded-full";
		default:
			return "rounded-none";
	}
}
