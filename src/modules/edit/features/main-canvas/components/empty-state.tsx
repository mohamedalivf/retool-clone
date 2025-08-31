/**
 * Empty state component for when no components are on the canvas
 */

import { Button } from "@/components/ui/button";
import { useEditStore } from "@/modules/edit/store/use-edit-store";
import { Image, LayoutGrid, Plus, Type } from "lucide-react";

export function EmptyState() {
	// Use specific selectors to prevent unnecessary re-renders
	const addComponent = useEditStore((state) => state.addComponent);
	const toggleLeftSidebar = useEditStore((state) => state.toggleLeftSidebar);

	const handleAddText = () => {
		addComponent("text");
	};

	const handleAddImage = () => {
		addComponent("image");
	};

	const handleOpenLibrary = () => {
		toggleLeftSidebar();
	};

	return (
		<div className="flex items-center justify-center min-h-[60vh]">
			<div className="text-center max-w-md mx-auto">
				{/* Icon */}
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
					<LayoutGrid className="h-12 w-12 text-muted-foreground" />
				</div>

				{/* Title and Description */}
				<h2 className="text-2xl font-semibold mb-3">
					Start Building Your Interface
				</h2>
				<p className="text-muted-foreground mb-8 leading-relaxed">
					Your canvas is empty. Add components from the library to start
					building your interface. You can drag, resize, and customize each
					component to create the perfect layout.
				</p>

				{/* Quick Actions */}
				<div className="space-y-4">
					<div className="flex gap-3 justify-center">
						<Button onClick={handleAddText} className="flex items-center gap-2">
							<Type className="h-4 w-4" />
							Add Text
						</Button>
						<Button
							onClick={handleAddImage}
							variant="outline"
							className="flex items-center gap-2"
						>
							<Image className="h-4 w-4" />
							Add Image
						</Button>
					</div>

					<div className="text-sm text-muted-foreground">or</div>

					<Button
						onClick={handleOpenLibrary}
						variant="ghost"
						className="flex items-center gap-2"
					>
						<Plus className="h-4 w-4" />
						Open Component Library
					</Button>
				</div>

				{/* Tips */}
				<div className="mt-12 p-4 bg-muted/30 rounded-lg text-left">
					<h3 className="font-medium mb-2 flex items-center gap-2">
						💡 Getting Started Tips
					</h3>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li>• Components automatically snap to a 2-column grid</li>
						<li>• Click any component to select and edit its properties</li>
						<li>• Use the grid toggle in the header to show/hide grid lines</li>
						<li>
							• Components can be half-width (1 column) or full-width (2
							columns)
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
