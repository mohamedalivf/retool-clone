import { Button } from "@/components/ui/button";
import { useEditStore } from "@/modules/edit/store/use-edit-store";
import { Image, LayoutGrid, Plus, Type } from "lucide-react";

export function EmptyState() {
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
				{}
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
					<LayoutGrid className="h-12 w-12 text-muted-foreground" />
				</div>

				{}
				<h2 className="text-2xl font-semibold mb-3">
					Start Building Your Interface
				</h2>

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
						className="flex items-center gap-2 mx-auto"
					>
						<Plus className="h-4 w-4" />
						Open Component Library
					</Button>
				</div>
			</div>
		</div>
	);
}
