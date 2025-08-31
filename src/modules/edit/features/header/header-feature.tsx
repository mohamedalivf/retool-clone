/**
 * Application header with title, controls, and sidebar toggles
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
	Download,
	Eye,
	LayoutGrid,
	Menu,
	Palette,
	Redo2,
	Save,
	Settings,
	Undo2,
	Upload,
} from "lucide-react";
import { useEditStore } from "../../store/use-edit-store";

export function HeaderFeature() {
	// Use specific selectors to prevent unnecessary re-renders
	const leftSidebarOpen = useEditStore(
		(state) => state.sidebars.leftSidebar.isOpen,
	);
	const rightSidebarOpen = useEditStore(
		(state) => state.sidebars.rightSidebar.isOpen,
	);
	const showGridLines = useEditStore((state) => state.settings.showGridLines);
	const toggleLeftSidebar = useEditStore((state) => state.toggleLeftSidebar);
	const toggleRightSidebar = useEditStore((state) => state.toggleRightSidebar);
	const updateSettings = useEditStore((state) => state.updateSettings);

	const navigate = useNavigate();

	const handleExport = () => {
		// TODO: Implement export functionality
		console.log("Export layout");
	};

	const handleImport = () => {
		// TODO: Implement import functionality
		console.log("Import layout");
	};

	const handleSave = () => {
		// TODO: Implement save functionality
		console.log("Save layout");
	};

	const toggleGridLines = () => {
		updateSettings({ showGridLines: !showGridLines });
	};

	const handlePreview = () => {
		navigate({ to: "/preview" });
	};

	return (
		<header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
			{/* Left Section */}
			<div className="flex items-center gap-3">
				{/* Left Sidebar Toggle */}
				<Button
					variant="ghost"
					size="sm"
					onClick={toggleLeftSidebar}
					className={cn(
						"p-2",
						leftSidebarOpen && "bg-accent text-accent-foreground",
					)}
					aria-label="Toggle component library"
				>
					<Menu className="h-4 w-4" />
				</Button>

				{/* Application Title */}
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
						<LayoutGrid className="h-4 w-4 text-primary-foreground" />
					</div>
					<div>
						<h1 className="text-lg font-semibold text-foreground">
							Component Editor
						</h1>
						<p className="text-xs text-muted-foreground">
							Drag & drop interface builder
						</p>
					</div>
				</div>
			</div>

			{/* Center Section - Controls */}
			<div className="flex items-center gap-1">
				{/* Undo/Redo */}
				<Button
					variant="ghost"
					size="sm"
					className="p-2"
					disabled
					aria-label="Undo"
				>
					<Undo2 className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="p-2"
					disabled
					aria-label="Redo"
				>
					<Redo2 className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-2" />

				{/* Grid Toggle */}
				<Button
					variant="ghost"
					size="sm"
					onClick={toggleGridLines}
					className={cn(
						"p-2",
						showGridLines && "bg-accent text-accent-foreground",
					)}
					aria-label="Toggle grid lines"
				>
					<LayoutGrid className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-2" />

				{/* File Operations */}
				<Button
					variant="ghost"
					size="sm"
					onClick={handleSave}
					className="p-2"
					aria-label="Save layout"
				>
					<Save className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleExport}
					className="p-2"
					aria-label="Export layout"
				>
					<Download className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleImport}
					className="p-2"
					aria-label="Import layout"
				>
					<Upload className="h-4 w-4" />
				</Button>
			</div>

			{/* Right Section */}
			<div className="flex items-center gap-2">
				{/* Preview Button */}
				<Button
					variant="default"
					size="sm"
					onClick={handlePreview}
					className="gap-2"
				>
					<Eye className="h-4 w-4" />
					Preview
				</Button>

				<div className="w-px h-6 bg-border mx-2" />

				{/* Theme Toggle */}
				<Button
					variant="ghost"
					size="sm"
					className="p-2"
					aria-label="Theme settings"
				>
					<Palette className="h-4 w-4" />
				</Button>

				{/* Settings */}
				<Button variant="ghost" size="sm" className="p-2" aria-label="Settings">
					<Settings className="h-4 w-4" />
				</Button>

				{/* Right Sidebar Toggle */}
				<Button
					variant="ghost"
					size="sm"
					onClick={toggleRightSidebar}
					className={cn(
						"p-2",
						rightSidebarOpen && "bg-accent text-accent-foreground",
					)}
					aria-label="Toggle properties panel"
				>
					<Menu className="h-4 w-4 rotate-180" />
				</Button>
			</div>
		</header>
	);
}
