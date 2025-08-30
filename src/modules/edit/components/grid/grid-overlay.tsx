/**
 * Grid overlay component to show visual grid lines
 */

import { cn } from "@/lib/utils";
import type { GridConfiguration } from "../../store/types";

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
			className={cn("absolute inset-0", className)}
			style={{
				left: containerPadding.left,
				top: containerPadding.top,
				width: gridWidth,
				height: gridHeight,
			}}
		>
			{/* Vertical Grid Lines */}
			<svg
				className="absolute inset-0 w-full h-full"
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
						{/* Vertical lines */}
						<line
							x1="0"
							y1="0"
							x2="0"
							y2={cellHeight + gap}
							stroke="currentColor"
							strokeWidth="1"
							className="text-border opacity-30"
						/>
						{/* Horizontal lines */}
						<line
							x1="0"
							y1="0"
							x2={`${100 / cols}%`}
							y2="0"
							stroke="currentColor"
							strokeWidth="1"
							className="text-border opacity-30"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid-pattern)" />

				{/* Right border */}
				<line
					x1="100%"
					y1="0"
					x2="100%"
					y2="100%"
					stroke="currentColor"
					strokeWidth="1"
					className="text-border opacity-30"
				/>

				{/* Bottom border */}
				<line
					x1="0"
					y1="100%"
					x2="100%"
					y2="100%"
					stroke="currentColor"
					strokeWidth="1"
					className="text-border opacity-30"
				/>
			</svg>

			{/* Grid Cell Indicators (for debugging) */}
			{process.env.NODE_ENV === "development" && (
				<div className="absolute inset-0">
					{Array.from({ length: rows }, (_, row) =>
						Array.from({ length: cols }, (_, col) => (
							<div
								key={`cell-${row}-${col}`}
								className="absolute border border-blue-200 opacity-20 flex items-center justify-center text-xs text-blue-600 font-mono"
								style={{
									left: `${(col / cols) * 100}%`,
									top: row * (cellHeight + gap),
									width: `${100 / cols}%`,
									height: cellHeight,
								}}
							>
								{row},{col}
							</div>
						)),
					)}
				</div>
			)}
		</div>
	);
}
