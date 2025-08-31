import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { hugsToPixels } from "@/modules/edit/constants/hug-system";
import type { GridConfiguration } from "@/modules/edit/store/types";
import type { ComponentState } from "@/modules/edit/store/types";
import {
	useEditStore,
	useIsComponentSelected,
} from "@/modules/edit/store/use-edit-store";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
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
	const isSelected = useIsComponentSelected(component.id);
	const draggedComponentId = useEditStore(
		(state) => state.drag.draggedComponentId,
	);

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

	const style = {
		transform: CSS.Translate.toString(transform),
	};

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
				"relative cursor-pointer transition-all duration-300 ease-in-out",
				"group",
				isBeingDragged && [
					"opacity-50", // Fade out while dragging
					"z-50", // Bring dragged component to top
				],
				!isBeingDragged && [
					"hover:ring-1 hover:ring-ring/30 hover:ring-offset-1",
					"hover:shadow-sm",
					// Remove hover:z-[5] to prevent z-index changes on hover
				],
				isSelected &&
					!isBeingDragged && [
						"ring-2 ring-primary/60 ring-offset-1 ring-offset-background",
						"shadow-md",
						// Remove z-10 to prevent z-index changes on selection
					],
				component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
				component.type === "image" && `min-h-[${hugsToPixels(4)}px]`,
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"focus-visible:ring-offset-2",
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

			<div className="w-full h-full">
				{component.type === "text" && <TextComponent component={component} />}
				{component.type === "image" && <ImageComponent component={component} />}
			</div>

			<div
				className={cn(
					"absolute top-1 right-1 z-20",
					"p-1 rounded-sm",
					"bg-primary/10 border border-primary/20",
					"text-primary",
					"transition-all duration-200",
					"cursor-grab active:cursor-grabbing",
					"hover:bg-primary/20 hover:scale-110",
					"opacity-0 group-hover:opacity-60 hover:opacity-100",
					isSelected && "opacity-80 hover:opacity-100",
					isBeingDragged && "opacity-100",
					"animate-in fade-in-0 slide-in-from-top-1 duration-200",
				)}
				title="Drag to reorder component (won't open properties)"
				onClick={(e) => e.stopPropagation()} // Prevent selection when clicking drag handle
				onMouseDown={(e) => e.stopPropagation()} // Prevent any selection on mouse down
				{...listeners} // Only the drag handle has drag listeners
			>
				<GripVertical className="h-3 w-3" />
			</div>

			{isSelected && !isBeingDragged && (
				<>
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
