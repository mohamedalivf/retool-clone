import {
	DndContext,
	type DragEndEvent,
	type DragMoveEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	restrictToParentElement,
	restrictToWindowEdges,
} from "@dnd-kit/modifiers";

interface DragDropProviderProps {
	children: React.ReactNode;
	onDragStart: (event: DragStartEvent) => void;
	onDragMove: (event: DragMoveEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
}

/**
 * Provider component that wraps the canvas with drag and drop functionality
 */
export function DragDropProvider({
	children,
	onDragStart,
	onDragMove,
	onDragEnd,
}: DragDropProviderProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: () => ({ x: 0, y: 0 }),
		}),
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={onDragStart}
			onDragMove={onDragMove}
			onDragEnd={onDragEnd}
			modifiers={[restrictToParentElement]}
		>
			{children}

			{/* Drag Overlay for visual feedback during drag */}
			<DragOverlay modifiers={[restrictToWindowEdges]}>
				{/* Empty overlay - the actual drag preview is handled by the draggable components */}
			</DragOverlay>
		</DndContext>
	);
}
