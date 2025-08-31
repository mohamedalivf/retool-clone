/**
 * Grid overlay component to show visual grid lines
 * Enhanced with shadcn/ui components and styling
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GridConfiguration } from "@/modules/edit/store/types";

interface GridOverlayProps {
	grid: GridConfiguration;
	className?: string;
}

export function GridOverlay({ grid, className }: GridOverlayProps) {
	const { cols, rows, cellHeight, gap, containerPadding } = grid;

	// Calculate grid dimensions
	const gridWidth = `calc(100% - ${containerPadding.left + containerPadding.right}px)`;
	const gridHeight = rows * cellHeight + (rows - 1) * gap;

	return (
		<div
			className={cn(
				"absolute inset-0",
				// shadcn/ui styling enhancements
				"transition-opacity duration-300 ease-in-out",
				"pointer-events-none select-none",
				className,
			)}
			style={{
				left: containerPadding.left,
				top: containerPadding.top,
				width: gridWidth,
				height: gridHeight,
			}}
		>
			{/* Enhanced Grid Lines with shadcn/ui styling */}
			<svg
				className={cn(
					"absolute inset-0 w-full h-full",
					"text-border/40", // Using shadcn/ui border color with opacity
				)}
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<defs>
					<pattern
						id="grid-pattern"
						width={`${100 / cols}%`}
						height={cellHeight + gap}
						patternUnits="userSpaceOnUse"
					>
						{/* Vertical lines - enhanced with shadcn/ui colors */}
						<line
							x1="0"
							y1="0"
							x2="0"
							y2={cellHeight + gap}
							stroke="hsl(var(--border))"
							strokeWidth="1"
							opacity="0.3"
							strokeDasharray="2,2" // Subtle dashed pattern
						/>
						{/* Horizontal lines - enhanced with shadcn/ui colors */}
						<line
							x1="0"
							y1="0"
							x2={`${100 / cols}%`}
							y2="0"
							stroke="hsl(var(--border))"
							strokeWidth="1"
							opacity="0.3"
							strokeDasharray="2,2" // Subtle dashed pattern
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid-pattern)" />

				{/* Enhanced border lines */}
				<line
					x1="100%"
					y1="0"
					x2="100%"
					y2="100%"
					stroke="hsl(var(--border))"
					strokeWidth="1.5"
					opacity="0.4"
				/>
				<line
					x1="0"
					y1="100%"
					x2="100%"
					y2="100%"
					stroke="hsl(var(--border))"
					strokeWidth="1.5"
					opacity="0.4"
				/>
			</svg>

			{/* Enhanced Grid Cell Indicators using shadcn/ui Badge */}
			{process.env.NODE_ENV === "development" && (
				<div className="absolute inset-0">
					{Array.from({ length: rows }, (_, row) =>
						Array.from({ length: cols }, (_, col) => (
							<div
								key={`cell-${row}-${
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									col
								}`}
								className={cn(
									"absolute flex items-center justify-center",
									"border border-border/20 rounded-sm",
									"bg-card/10 backdrop-blur-sm",
									"transition-all duration-200",
									"hover:bg-card/20 hover:border-border/40",
								)}
								style={{
									left: `${(col / cols) * 100}%`,
									top: row * (cellHeight + gap),
									width: `${100 / cols}%`,
									height: cellHeight,
								}}
							>
								<Badge
									variant="outline"
									className={cn(
										"text-xs font-mono",
										"bg-background/80 text-muted-foreground",
										"border-border/30",
										"pointer-events-none",
									)}
								>
									{row},{col}
								</Badge>
							</div>
						)),
					)}
				</div>
			)}
		</div>
	);
}
