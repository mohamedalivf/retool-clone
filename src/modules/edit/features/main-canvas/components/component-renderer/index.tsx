import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { hugsToPixels } from "@/modules/edit/constants/hug-system";
import type { GridConfiguration } from "@/modules/edit/store/types";
import type { ComponentState } from "@/modules/edit/store/types";
import { GripVertical } from "lucide-react";
import { ImageComponent } from "../image-component";
import { TextComponent } from "../text-component";
import { useComponentState } from "./hooks/use-component-state";
interface ComponentRendererProps {
	component: ComponentState;
	grid: GridConfiguration;
}

export function ComponentRenderer({ component }: ComponentRendererProps) {

	const {
		isSelected,
		isBeingDragged,
		isInsideAnotherComponent,
		getComponentZIndex,
		dragAttributes,
		dragListeners,
		setNodeRef,
		dragStyle,
		handleClick,
		handleKeyDown,
		handleResizeStart,
	} = useComponentState({ component });


	const gridColumn =
		component.size.width === "full"
			? "1 / -1"
			: component.position.x === 0
				? "1"
				: "2";


	const gridRow =
		component.type === "text"
			? `${component.position.y + 1}`
			: `${component.position.y + 1} / span ${component.size.height}`;

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"relative cursor-pointer transition-all duration-200 ease-in-out",
				"group",
				"pointer-events-auto",
				getComponentZIndex(),
				isBeingDragged && "opacity-50",
				!isBeingDragged && [
					"hover:ring-1 hover:ring-ring/30 hover:ring-offset-1",
					"hover:shadow-sm",
				],
				isSelected &&
					!isBeingDragged && [
						"ring-2 ring-primary/60 ring-offset-1 ring-offset-background",
						"shadow-md",
					],
				isInsideAnotherComponent && [
					"hover:ring-2 hover:ring-primary/40",
					"hover:shadow-md",
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
				...dragStyle,
			}}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			aria-label={`${component.type} component - click to select, use drag handle to move`}
			{...dragAttributes}
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
				onClick={(e) => e.stopPropagation()}
				onMouseDown={(e) => e.stopPropagation()}
				{...dragListeners}
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
