/**
 * Main application layout with three-panel design
 * Left sidebar: Component selection
 * Main canvas: Grid-based editing area
 * Right sidebar: Properties editor
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
			{/* Header */}
			<Header />

			{/* Main Content Area */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left Sidebar */}
				<LeftSidebar isOpen={leftSidebarOpen} width={leftSidebarWidth} />

				{/* Main Canvas */}
				<main
					className={cn(
						"flex-1 transition-all duration-300 ease-in-out",
						"bg-gray-50 border-x border-border",
						leftSidebarOpen && "ml-0",
						rightSidebarOpen && "mr-0",
					)}
				>
					<MainCanvas />
					{children}
				</main>

				{/* Right Sidebar */}
				<RightSidebar
					isOpen={rightSidebarOpen}
					width={rightSidebarWidth}
					activeTab={rightSidebarActiveTab}
				/>
			</div>
		</div>
	);
}
