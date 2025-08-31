/**
 * Left sidebar for component selection and library
 */

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Image, Plus, Type } from "lucide-react";
import type { ComponentType } from "../../store/types";
import { useEditStore } from "../../store/use-edit-store";

interface LeftSidebarProps {
	isOpen: boolean;
	width: number;
}

export function LeftSidebar({ isOpen, width }: LeftSidebarProps) {
	// Use specific selectors to prevent unnecessary re-renders
	const addComponent = useEditStore((state) => state.addComponent);
	const toggleLeftSidebar = useEditStore((state) => state.toggleLeftSidebar);

	const handleAddComponent = (type: ComponentType) => {
		const componentId = addComponent(type);
		if (componentId) {
			console.log(`Added ${type} component:`, componentId);
		}
	};

	const componentLibrary = [
		{
			type: "text" as ComponentType,
			name: "Text",
			description: "Add text with markdown support",
			icon: Type,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			type: "image" as ComponentType,
			name: "Image",
			description: "Add images with flexible sizing",
			icon: Image,
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
	];

	return (
		<Sheet open={isOpen} onOpenChange={toggleLeftSidebar}>
			<SheetContent
				side="left"
				className={cn(" p-0 border-r  min-w-90")}
				style={{ width }}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<SheetHeader className="p-4 border-b">
						<SheetTitle className="text-left">Component Library</SheetTitle>
						<p className="text-sm text-muted-foreground text-left">
							Drag components to the canvas or click to add
						</p>
					</SheetHeader>

					{/* Component Library */}
					<div className="flex-1 overflow-y-auto p-4">
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
								Basic Components
							</h3>

							<div className="grid gap-3">
								{componentLibrary.map((component) => {
									const Icon = component.icon;
									return (
										<Button
											key={component.type}
											variant="outline"
											className={cn(
												"h-auto p-4 w-full flex flex-col items-start gap-3",
												"hover:bg-accent hover:text-accent-foreground",
												"border-2 border-dashed border-border",
												"transition-all duration-200",
												"group cursor-pointer",
											)}
											onClick={() => handleAddComponent(component.type)}
										>
											<div className="flex items-center gap-3 w-full">
												<div
													className={cn(
														"w-10 h-10 rounded-lg flex items-center justify-center",
														component.bgColor,
													)}
												>
													<Icon className={cn("h-5 w-5", component.color)} />
												</div>
												<div className="flex-1 text-left">
													<div className="font-medium text-sm">
														{component.name}
													</div>
													<div className="text-xs text-muted-foreground">
														{component.description}
													</div>
												</div>
												<Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
											</div>
										</Button>
									);
								})}
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="p-4 border-t bg-muted/30">
						<div className="text-xs text-muted-foreground">
							<p className="mb-1">
								💡 <strong>Tip:</strong>
							</p>
							<p>
								Click a component to add it to the canvas. Components will be
								automatically positioned in the next available spot.
							</p>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
