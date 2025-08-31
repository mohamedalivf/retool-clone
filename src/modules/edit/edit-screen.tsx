import { cn } from "@/lib/utils";
import { HeaderFeature } from "./features/header/header-feature";
import { LeftSidebarFeature } from "./features/left-sidebar/left-sidebar-feature";
import { MainCanvasFeature } from "./features/main-canvas/main-canvas-feature";
import { RightSidebarFeature } from "./features/right-sidebar/right-sidebar-feature";
import { useEditStore } from "./store/use-edit-store";

interface AppLayoutProps {
	children?: React.ReactNode;
}

export function EditScreen({ children }: AppLayoutProps) {

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
			<HeaderFeature />

			<div className={cn("flex-1 flex overflow-hidden", "relative")}>
				<LeftSidebarFeature isOpen={leftSidebarOpen} width={leftSidebarWidth} />

				{}
				<main
					className={cn(

						"flex-1 transition-all duration-300 ease-in-out",
						"bg-muted/30 border-x border-border",
						"min-w-0",
						"sm:min-w-[400px]",
						"md:min-w-[500px]",
						"lg:min-w-[600px]",
						leftSidebarOpen && "ml-0",
						rightSidebarOpen && "mr-0",
						"relative z-10",
					)}
				>
					<MainCanvasFeature />
					{children}
				</main>

				{}
				<RightSidebarFeature
					isOpen={rightSidebarOpen}
					width={rightSidebarWidth}
					activeTab={rightSidebarActiveTab}
				/>
			</div>
		</div>
	);
}
