/**
 * Right sidebar for component properties and styling
 */

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Database, Palette, Settings } from "lucide-react";
import { useEditStore, useSelectedComponent } from "../../store/use-edit-store";
import { DataPanel } from "./components/data-panel";
import { PropertiesPanel } from "./components/properties-panel";
import { StylesPanel } from "./components/styles-panel";

interface RightSidebarFeatureProps {
	isOpen: boolean;
	width: number;
	activeTab?: "properties" | "styles" | "data";
}

export function RightSidebarFeature({
	isOpen,
	width,
	activeTab = "properties",
}: RightSidebarFeatureProps) {
	const selectedComponent = useSelectedComponent();
	// Use specific selectors to prevent unnecessary re-renders
	const toggleRightSidebar = useEditStore((state) => state.toggleRightSidebar);
	const setRightSidebarTab = useEditStore((state) => state.setRightSidebarTab);

	return (
		<Sheet open={isOpen} onOpenChange={toggleRightSidebar}>
			<SheetContent
				side="right"
				className={cn("p-0 border-l")}
				style={{ width }}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<SheetHeader className="p-4 border-b">
						<div className="flex items-center justify-between">
							<SheetTitle className="text-left">
								{selectedComponent ? "Component Properties" : "Properties"}
							</SheetTitle>
						</div>
						{selectedComponent && (
							<p className="text-sm text-muted-foreground text-left">
								Editing {selectedComponent.type} component
							</p>
						)}
					</SheetHeader>

					{/* Content */}
					<div className="flex-1 overflow-hidden">
						{selectedComponent ? (
							<Tabs
								value={activeTab}
								onValueChange={(value) =>
									setRightSidebarTab(value as "properties" | "styles" | "data")
								}
								className="h-full flex flex-col"
							>
								{/* Tab Navigation */}
								<TabsList className="grid w-full grid-cols-3 m-4 mb-0">
									<TabsTrigger
										value="properties"
										className="flex items-center gap-2"
									>
										<Settings className="h-4 w-4" />
										<span className="hidden sm:inline">Properties</span>
									</TabsTrigger>
									<TabsTrigger
										value="styles"
										className="flex items-center gap-2"
									>
										<Palette className="h-4 w-4" />
										<span className="hidden sm:inline">Styles</span>
									</TabsTrigger>
									<TabsTrigger value="data" className="flex items-center gap-2">
										<Database className="h-4 w-4" />
										<span className="hidden sm:inline">Data</span>
									</TabsTrigger>
								</TabsList>

								{/* Tab Content */}
								<div className="flex-1 overflow-y-auto">
									<TabsContent value="properties" className="m-0 p-4">
										<PropertiesPanel component={selectedComponent} />
									</TabsContent>
									<TabsContent value="styles" className="m-0 p-4">
										<StylesPanel component={selectedComponent} />
									</TabsContent>
									<TabsContent value="data" className="m-0 p-4">
										<DataPanel component={selectedComponent} />
									</TabsContent>
								</div>
							</Tabs>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center">
									<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
										<Settings className="h-8 w-8 text-muted-foreground" />
									</div>
									<h3 className="text-lg font-medium mb-2">
										No Component Selected
									</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Select a component on the canvas to edit its properties,
										styles, and data.
									</p>
									<Button
										variant="outline"
										size="sm"
										onClick={toggleRightSidebar}
									>
										Close Panel
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
