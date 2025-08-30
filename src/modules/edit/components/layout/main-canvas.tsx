/**
 * Main canvas area for grid-based component editing
 * Enhanced with shadcn/ui styling conventions
 */

import { cn } from "@/lib/utils";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useEditStore } from "../../store/use-edit-store";
import { ComponentRenderer } from "../editable/component-renderer";
import { GridOverlay } from "../grid/grid-overlay";
import { EmptyState } from "./empty-state";

export function MainCanvas() {
	// Use specific selectors to prevent unnecessary re-renders
	const components = useEditStore((state) => state.components);
	const showGridLines = useEditStore((state) => state.settings.showGridLines);
	const grid = useEditStore((state) => state.grid);
	const selectedComponentId = useEditStore(
		(state) => state.selection.selectedComponentId,
	);
	const selectComponent = useEditStore((state) => state.selectComponent);
	const toggleRightSidebar = useEditStore((state) => state.toggleRightSidebar);
	const rightSidebarOpen = useEditStore(
		(state) => state.sidebars.rightSidebar.isOpen,
	);

	const canvasRef = useRef<HTMLDivElement>(null);
	const hasComponents = components.length > 0;

	// Handle background click to deselect
	const handleCanvasClick = useCallback(
		(e: React.MouseEvent) => {
			// Only deselect if clicking directly on the canvas background
			if (e.target === e.currentTarget) {
				selectComponent(null);
			}
		},
		[selectComponent],
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!hasComponents) return;

			const currentIndex = selectedComponentId
				? components.findIndex((c) => c.id === selectedComponentId)
				: -1;

			switch (e.key) {
				case "ArrowDown":
				case "ArrowRight":
					e.preventDefault();
					const nextIndex =
						currentIndex < components.length - 1 ? currentIndex + 1 : 0;
					selectComponent(components[nextIndex].id);
					break;
				case "ArrowUp":
				case "ArrowLeft":
					e.preventDefault();
					const prevIndex =
						currentIndex > 0 ? currentIndex - 1 : components.length - 1;
					selectComponent(components[prevIndex].id);
					break;
				case "Escape":
					e.preventDefault();
					selectComponent(null);
					break;
				case "Enter":
				case " ":
					if (selectedComponentId && !rightSidebarOpen) {
						e.preventDefault();
						toggleRightSidebar();
					}
					break;
			}
		},
		[
			components,
			selectedComponentId,
			selectComponent,
			hasComponents,
			rightSidebarOpen,
			toggleRightSidebar,
		],
	);

	// Focus management
	useEffect(() => {
		if (selectedComponentId && canvasRef.current) {
			canvasRef.current.focus();
		}
	}, [selectedComponentId]);

	return (
		<div className="relative h-full overflow-auto bg-background">
			{/* Enhanced Grid Container with selection system */}
			<div
				ref={canvasRef}
				className={cn(
					// Base layout
					"min-h-full relative",
					// shadcn/ui styling conventions
					"bg-card/30", // Subtle background using card color
					"border-border/20", // Subtle border
					// Transitions
					"transition-all duration-200 ease-in-out",
					// Focus and interaction states
					"focus-within:bg-card/40",
					// Enhanced keyboard navigation
					"focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-inset",
				)}
				style={{
					padding: `${grid.containerPadding.top}px ${grid.containerPadding.right}px ${grid.containerPadding.bottom}px ${grid.containerPadding.left}px`,
				}}
				onClick={handleCanvasClick}
				onKeyDown={handleKeyDown}
				tabIndex={0}
				role="application"
				aria-label="Component canvas - use arrow keys to navigate, Enter to open properties"
			>
				{/* Grid Overlay */}
				{showGridLines && (
					<GridOverlay
						grid={grid}
						className="absolute inset-0 pointer-events-none z-10"
					/>
				)}

				{/* Empty State */}
				{!hasComponents && <EmptyState />}

				{/* Component Grid - Enhanced with responsive shadcn/ui patterns */}
				{hasComponents && (
					<div
						className={cn(
							// Grid layout with responsive behavior
							"relative grid",
							// Base: 2 columns (as per design requirements)
							"grid-cols-2",
							// NO GAPS - components should be flush against each other
							"gap-0",
							// shadcn/ui spacing and styling
							"rounded-md p-2 sm:p-3 md:p-4",
							// Enhanced visual feedback
							"transition-all duration-200 ease-in-out",
							// Focus and interaction states
							"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
							"hover:bg-card/20",
							// Mobile optimizations
							"touch-pan-y", // Better touch scrolling on mobile
						)}
						style={{
							gap: "0px", // Force no gap regardless of grid config
							gridAutoRows: "auto", // Allow rows to size automatically
							alignItems: "start", // Align items to start of their grid area
							// Responsive grid adjustments
							minHeight: "200px", // Ensure minimum usable space
						}}
					>
						{components.map((component) => (
							<ComponentRenderer
								key={component.id}
								component={component}
								grid={grid}
							/>
						))}
					</div>
				)}

				{/* Drop Zones - Enhanced for future drag & drop */}
				<div
					className={cn(
						"absolute inset-0 pointer-events-none",
						"transition-opacity duration-200",
						// Will be enhanced when drag & drop is implemented
					)}
				>
					{/* TODO: Add drop zone indicators during drag operations */}
					{/* Will use shadcn/ui Badge components for drop zone labels */}
				</div>
			</div>
		</div>
	);
}
