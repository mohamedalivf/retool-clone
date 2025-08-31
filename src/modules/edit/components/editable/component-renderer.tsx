/**
 * Component renderer that displays components on the canvas
 * Enhanced with shadcn/ui Card and Badge components for boundary indicators
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ComponentState, GridConfiguration } from "../../store/types";
import {
	useEditStore,
	useIsComponentSelected,
} from "../../store/use-edit-store";
import { ImageComponent } from "./image-component";
import { TextComponent } from "./text-component";

interface ComponentRendererProps {
	component: ComponentState;
	grid: GridConfiguration;
}

export function ComponentRenderer({ component }: ComponentRendererProps) {
	// Use specific selectors to prevent unnecessary re-renders
	const selectComponent = useEditStore((state) => state.selectComponent);
	const startResize = useEditStore((state) => state.startResize);
	const toggleComponentWidth = useEditStore(
		(state) => state.toggleComponentWidth,
	);
	const isSelected = useIsComponentSelected(component.id);
	const draggedComponentId = useEditStore(
		(state) => state.drag.draggedComponentId,
	);

	// @dnd-kit draggable functionality
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		isDragging: isCurrentlyDragging,
	} = useDraggable({
		id: component.id,
		data: {
			type: "component",
			component,
		},
	});

	// Apply drag transform
	const style = {
		transform: CSS.Translate.toString(transform),
	};

	// Check if this component is being dragged
	const isBeingDragged =
		isCurrentlyDragging || draggedComponentId === component.id;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();

		// TODO: Multi-select with Shift+click (future enhancement)
		// For now, single selection only
		if (e.shiftKey) {
			// Multi-select logic would go here
			console.log("Multi-select not yet implemented");
		}

		selectComponent(component.id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			selectComponent(component.id);
		}
	};

	const handleResizeStart =
		(direction: "horizontal" | "vertical" | "both") =>
		(e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			startResize(component.id, direction);
		};

	// Calculate grid position
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
			ref={setNodeRef}
			className={cn(
				// Enhanced container with better interaction states
				"relative cursor-pointer transition-all duration-300 ease-in-out",
				"group", // Enable group hover states
				// Drag states - enhanced visual feedback
				isBeingDragged && [
					"opacity-50", // Fade out while dragging
					"z-50", // Bring dragged component to top
					// "rotate-2", // Slight rotation for drag feedback
					// "scale-105", // Slightly larger while dragging
				],
				// Enhanced hover states (only when not dragging)
				!isBeingDragged && [
					"hover:ring-1 hover:ring-ring/30 hover:ring-offset-1",
					"hover:shadow-sm hover:z-[5]",
				],
				// Selection states - enhanced visual feedback
				isSelected &&
					!isBeingDragged && [
						"ring-2 ring-primary/60 ring-offset-1 ring-offset-background",
						"shadow-md",
						"z-10", // Bring selected component above others
					],
				// Component type specific styling
				component.type === "text" && "min-h-[60px]",
				component.type === "image" && "min-h-[120px]",
				// Enhanced interactive states
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"focus-visible:ring-offset-2",
				// Normal cursor - drag will be handled by drag handle
				"cursor-pointer",
			)}
			style={{
				gridColumn,
				gridRow,
				...style, // Apply drag transform
			}}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			aria-label={`${component.type} component - click to select, use drag handle to move`}
			{...attributes}
		>
			{/* Enhanced Selection Indicator using shadcn/ui Badge */}
			{isSelected && (
				<Badge
					variant="default"
					className={cn(
						"absolute -top-3 left-2 z-20",
						"bg-primary text-primary-foreground",
						"shadow-md border border-primary/20",
						"text-xs font-medium",
						"animate-in fade-in-0 slide-in-from-top-1 duration-200",
					)}
				>
					{component.type} component
				</Badge>
			)}

			{/* Component Content - Direct rendering without wrapper */}
			<div className="w-full h-full">
				{component.type === "text" && <TextComponent component={component} />}
				{component.type === "image" && <ImageComponent component={component} />}
			</div>

			{/* Enhanced Component Type Indicator Badge */}
			<Badge
				variant="outline"
				className={cn(
					"absolute bottom-1 right-1 z-10",
					"bg-background/80 text-muted-foreground",
					"border-border/50 text-xs",
					// Enhanced visibility states
					"opacity-0 group-hover:opacity-75 transition-opacity duration-200",
					isSelected && "opacity-100",
					// Hide on mobile to save space
					"hidden sm:inline-flex",
					// Hide during drag
					isBeingDragged && "opacity-0",
				)}
			>
				{component.type}
			</Badge>

			{/* Drag Handle - Exclusive drag trigger, always available */}
			<div
				className={cn(
					"absolute top-1 right-1 z-20",
					"p-1 rounded-sm",
					"bg-primary/10 border border-primary/20",
					"text-primary",
					"transition-all duration-200",
					"cursor-grab active:cursor-grabbing",
					// Enhanced visual feedback
					"hover:bg-primary/20 hover:scale-110",
					// Enhanced visibility - always show on hover, more visible when selected
					"opacity-0 group-hover:opacity-60 hover:opacity-100",
					isSelected && "opacity-80 hover:opacity-100",
					isBeingDragged && "opacity-100",
					// Animation
					"animate-in fade-in-0 slide-in-from-top-1 duration-200",
				)}
				title="Drag to reorder component (won't open properties)"
				onClick={(e) => e.stopPropagation()} // Prevent selection when clicking drag handle
				onMouseDown={(e) => e.stopPropagation()} // Prevent any selection on mouse down
				{...listeners} // Only the drag handle has drag listeners
			>
				<GripVertical className="h-3 w-3" />
			</div>

			{/* Selection Indicator Badge */}

			{/* Resize Handles */}
			{isSelected && !isBeingDragged && (
				<>
					{/* Right edge handle - horizontal resize */}
					<div
						className={cn(
							"absolute top-0 right-0 w-1 h-full z-20",
							"cursor-ew-resize",
							"bg-primary/20 hover:bg-primary/40",
							"transition-all duration-200",
							"opacity-0 group-hover:opacity-60 hover:opacity-100",
						)}
						title="Resize width"
						onMouseDown={handleResizeStart("horizontal")}
					/>

					{/* Bottom edge handle - vertical resize */}
					<div
						className={cn(
							"absolute bottom-0 left-0 w-full h-1 z-20",
							"cursor-ns-resize",
							"bg-primary/20 hover:bg-primary/40",
							"transition-all duration-200",
							"opacity-0 group-hover:opacity-60 hover:opacity-100",
						)}
						title="Resize height"
						onMouseDown={handleResizeStart("vertical")}
					/>

					{/* Bottom-right corner handle - both directions */}
					<div
						className={cn(
							"absolute bottom-0 right-0 w-3 h-3 z-30",
							"cursor-nw-resize",
							"bg-primary/40 hover:bg-primary/60",
							"transition-all duration-200",
							"opacity-0 group-hover:opacity-80 hover:opacity-100",
							"after:content-[''] after:absolute after:bottom-0.5 after:right-0.5",
							"after:w-1 after:h-1 after:bg-background after:rounded-full",
						)}
						title="Resize both width and height"
						onMouseDown={handleResizeStart("both")}
					/>
				</>
			)}
		</div>
	);
}
