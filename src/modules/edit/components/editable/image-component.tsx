/**
 * Enhanced Image component with lazy loading, error handling, and accessibility
 * Optimized with React.memo for performance
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { HUG_HEIGHT } from "../../constants/hug-system";
import type { ComponentState, ImageAttributes } from "../../store/types";
import { useEditStore } from "../../store/use-edit-store";

interface ImageComponentProps {
	component: ComponentState;
}

// Image loading states
type ImageLoadingState = "idle" | "loading" | "loaded" | "error";

export const ImageComponent = React.memo(function ImageComponent({
	component,
}: ImageComponentProps) {
	const attributes = component.attributes as ImageAttributes;
	const styles = component.styles;
	const isSelected = useEditStore(
		(state) => state.selection.selectedComponentId === component.id,
	);

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

	// Simplified lazy loading - set in view immediately for now
	useEffect(() => {
		if (attributes.src) {
			setIsInView(true);
		}
	}, [attributes.src]);

	// Handle image loading
	const handleImageLoad = useCallback(() => {
		setLoadingState("loaded");
	}, []);

	const handleImageError = useCallback(() => {
		setLoadingState("error");
	}, []);

	// Start loading when in view
	useEffect(() => {
		if (isInView && attributes.src && loadingState === "idle") {
			setLoadingState("loading");
		}
	}, [isInView, attributes.src, loadingState]);

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

	const hasValidSrc = attributes.src && isValidImageUrl(attributes.src);

	// Calculate height based on component size in hugs
	const componentHeight = component.size.height * HUG_HEIGHT;

	return (
		<div
			ref={containerRef}
			className={cn(
				"w-full bg-white border border-gray-200",
				// Enhanced interaction states
				"transition-all duration-200",
				isSelected && "ring-1 ring-primary/50",
				"hover:bg-gray-50",
			)}
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
								`object-${attributes.objectFit || "cover"}`,
								borderRadiusClass,
								loadingState === "loaded" ? "opacity-100" : "opacity-0",
							)}
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
										? "Add an image source to display content"
										: "Please provide a valid image URL"}
								</p>
							</div>
						</div>
					)}

					{/* Status Badge for Selected Component */}
					{isSelected && (
						<Badge
							variant="secondary"
							className={cn(
								"absolute top-2 right-2 z-20",
								"bg-background/80 text-muted-foreground",
								"text-xs",
								"opacity-75 hover:opacity-100",
								"transition-opacity duration-200",
							)}
						>
							{loadingState === "loaded"
								? `${component.size.width} • ${component.size.height}h • ${attributes.objectFit || "cover"}`
								: loadingState}
						</Badge>
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
