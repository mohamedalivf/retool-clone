


import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
	Download,
	Eye,
	LayoutGrid,
	Menu,
	Palette,
	Plus,
	Redo2,
	Save,
	Settings,
	Undo2,
	Upload,
} from "lucide-react";
import { useEditStore } from "../../store/use-edit-store";

export function HeaderFeature() {

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

		console.log("Export layout");
	};

	const handleImport = () => {

		console.log("Import layout");
	};

	const handleSave = () => {

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
			<div className="flex items-center gap-3">
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
					<Plus className="h-4 w-4" />
				</Button>

				<div className="flex items-center gap-2">
					<div>
						<h1 className="text-lg font-semibold text-foreground">
							Component Editor
						</h1>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-1">
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

			<div className="flex items-center gap-2">
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

				<Button
					variant="ghost"
					size="sm"
					className="p-2"
					aria-label="Theme settings"
				>
					<Palette className="h-4 w-4" />
				</Button>

				<Button variant="ghost" size="sm" className="p-2" aria-label="Settings">
					<Settings className="h-4 w-4" />
				</Button>

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
