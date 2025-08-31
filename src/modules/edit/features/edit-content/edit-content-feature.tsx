import { cn } from "@/lib/utils";
import { Header } from "../../components/layout/header";
import { LeftSidebar } from "../../components/layout/left-sidebar";
import { MainCanvas } from "../../components/layout/main-canvas";
import { RightSidebar } from "../../components/layout/right-sidebar";
import { useEditStore } from "../../store/use-edit-store";

interface AppLayoutProps {
	children?: React.ReactNode;
}

export function EditContentFeature({ children }: AppLayoutProps) {
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
			<Header />

			<div className={cn("flex-1 flex overflow-hidden", "relative")}>
				{/* Left Sidebar - Responsive behavior */}
				<LeftSidebar isOpen={leftSidebarOpen} width={leftSidebarWidth} />

				{/* Main Canvas - Enhanced responsive design */}
				<main
					className={cn(
						// Base layout
						"flex-1 transition-all duration-300 ease-in-out",
						"bg-muted/30 border-x border-border",
						"min-w-0", // Prevent flex item from overflowing
						"sm:min-w-[400px]", // Minimum width on small screens
						"md:min-w-[500px]", // Minimum width on medium screens
						"lg:min-w-[600px]", // Minimum width on large screens
						leftSidebarOpen && "ml-0",
						rightSidebarOpen && "mr-0",
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
