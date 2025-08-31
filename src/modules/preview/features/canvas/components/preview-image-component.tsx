/**
 * Preview-only Image component - renders images without edit controls
 * Based on the edit ImageComponent but simplified for read-only display
 */

import { cn } from "@/lib/utils";
import { HUG_HEIGHT } from "@/modules/edit/constants/hug-system";
import type {
	ComponentState,
	ImageAttributes,
} from "@/modules/edit/store/types";
import { AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import React, { useState, useCallback, useRef, useEffect } from "react";

interface PreviewImageComponentProps {
	component: ComponentState;
}

// Image loading states
type ImageLoadingState = "idle" | "loading" | "loaded" | "error";

export const PreviewImageComponent = React.memo(function PreviewImageComponent({
	component,
}: PreviewImageComponentProps) {
	const attributes = component.attributes as ImageAttributes;
	const styles = component.styles;

	// Image loading state management
	const [loadingState, setLoadingState] = useState<ImageLoadingState>("idle");
	const [isInView, setIsInView] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

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

	// Get border radius class
	const borderRadiusClass = getBorderRadiusClass(attributes.borderRadius);

	// Validate image source - more flexible for URLs
	const isValidImageUrl = useCallback((url: string): boolean => {
		try {
			const parsedUrl = new URL(url);
			// Accept any valid URL - let the browser handle whether it's actually an image
			// This allows for dynamic image URLs, APIs, etc.
			return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
		} catch {
			return false;
		}
	}, []);

	// Handle image loading
	const handleImageLoad = useCallback(() => {
		setLoadingState("loaded");
	}, []);

	const handleImageError = useCallback(() => {
		setLoadingState("error");
	}, []);

	// Simplified loading - start immediately when component mounts with a valid src
	useEffect(() => {
		if (attributes.src && isValidImageUrl(attributes.src)) {
			setIsInView(true);
			setLoadingState("loading");
		} else {
			setIsInView(false);
			setLoadingState("idle");
		}
	}, [attributes.src, isValidImageUrl]);

	const hasValidSrc = attributes.src && isValidImageUrl(attributes.src);

	// Calculate height based on component size in hugs
	const componentHeight = component.size.height * HUG_HEIGHT;

	return (
		<div
			ref={containerRef}
			className={cn("w-full bg-white border border-gray-200")}
			style={{
				...componentStyles,
				height: `${componentHeight}px`, // Fixed height based on hugs
				minHeight: `${HUG_HEIGHT}px`, // Minimum 1 hug
			}}
			role="img"
			aria-label={
				attributes.alt ||
				(hasValidSrc ? "Image component" : "Empty image placeholder")
			}
		>
			<div className="w-full h-full">
				<div
					className={cn(
						"w-full h-full relative overflow-hidden",
						borderRadiusClass,
					)}
				>
					{/* Loading State */}
					{loadingState === "loading" && (
						<div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
							<div className="text-center">
								<Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
								<p className="text-sm text-muted-foreground">
									Loading image...
								</p>
							</div>
						</div>
					)}

					{/* Image */}
					{hasValidSrc && isInView && (
						<img
							ref={imgRef}
							src={attributes.src}
							alt={attributes.alt || ""}
							className={cn(
								"w-full h-full transition-opacity duration-300",
								borderRadiusClass,
								loadingState === "loaded" ? "opacity-100" : "opacity-0",
							)}
							style={{
								objectFit: attributes.objectFit || "cover",
								objectPosition: getObjectPositionValue(
									attributes.objectPosition || "center",
								),
							}}
							onLoad={handleImageLoad}
							onError={handleImageError}
							decoding="async"
						/>
					)}

					{/* Error State */}
					{loadingState === "error" && (
						<div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
							<div className="text-center">
								<AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
								<p className="text-sm font-medium text-red-600">
									Failed to load image
								</p>
								<p className="text-xs text-red-500">Check the image URL</p>
							</div>
						</div>
					)}

					{/* Placeholder State */}
					{(!hasValidSrc || loadingState === "idle") && (
						<div
							className={cn(
								"w-full h-full flex items-center justify-center",
								"bg-gray-50 text-gray-400",
								borderRadiusClass,
							)}
						>
							<div className="text-center">
								<ImageIcon className="h-12 w-12 mx-auto mb-2" />
								<p className="text-sm font-medium">
									{!attributes.src ? "Image Placeholder" : "Invalid Image URL"}
								</p>
								<p className="text-xs">
									{!attributes.src
										? "No image source provided"
										: "Invalid image URL"}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

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

function getObjectPositionValue(objectPosition: string): string {
	switch (objectPosition) {
		case "top":
			return "top";
		case "bottom":
			return "bottom";
		case "left":
			return "left";
		case "right":
			return "right";
		case "top-left":
			return "top left";
		case "top-right":
			return "top right";
		case "bottom-left":
			return "bottom left";
		case "bottom-right":
			return "bottom right";
		default:
			return "center";
	}
}
