/**
 * Main application layout with three-panel design
 * Left sidebar: Component selection
 * Main canvas: Grid-based editing area
 * Right sidebar: Properties editor
 * Enhanced with shadcn/ui responsive breakpoints
 */

import { cn } from "@/lib/utils";
import { useEditStore } from "../../store/use-edit-store";
import { Header } from "./header";
import { LeftSidebar } from "./left-sidebar";
import { MainCanvas } from "./main-canvas";
import { RightSidebar } from "./right-sidebar";

interface AppLayoutProps {
	children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	// Use specific selectors to prevent unnecessary re-renders
	const leftSidebarOpen = useEditStore(
		(state) => state.sidebars.leftSidebar.isOpen,
	);
	const leftSidebarWidth = useEditStore(
		(state) => state.sidebars.leftSidebar.width,
	);
	const rightSidebarOpen = useEditStore(
		(state) => state.sidebars.rightSidebar.isOpen,
	);
	const rightSidebarWidth = useEditStore(
		(state) => state.sidebars.rightSidebar.width,
	);
	const rightSidebarActiveTab = useEditStore(
		(state) => state.sidebars.rightSidebar.activeTab,
	);

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Header - Always visible */}
			<Header />

			{/* Main Content Area - Enhanced with responsive behavior */}
			<div
				className={cn(
					"flex-1 flex overflow-hidden",
					// Responsive layout adjustments
					"relative", // For mobile overlay positioning
				)}
			>
				{/* Left Sidebar - Responsive behavior */}
				<LeftSidebar isOpen={leftSidebarOpen} width={leftSidebarWidth} />

				{/* Main Canvas - Enhanced responsive design */}
				<main
					className={cn(
						// Base layout
						"flex-1 transition-all duration-300 ease-in-out",
						"bg-muted/30 border-x border-border",
						// Responsive spacing
						"min-w-0", // Prevent flex item from overflowing
						// Mobile adaptations (shadcn/ui breakpoints)
						"sm:min-w-[400px]", // Minimum width on small screens
						"md:min-w-[500px]", // Minimum width on medium screens
						"lg:min-w-[600px]", // Minimum width on large screens
						// Sidebar interactions
						leftSidebarOpen && "ml-0",
						rightSidebarOpen && "mr-0",
						// Mobile overlay handling
						"relative z-10",
					)}
				>
					<MainCanvas />
					{children}
				</main>

				{/* Right Sidebar - Responsive behavior */}
				<RightSidebar
					isOpen={rightSidebarOpen}
					width={rightSidebarWidth}
					activeTab={rightSidebarActiveTab}
				/>
			</div>
		</div>
	);
}
