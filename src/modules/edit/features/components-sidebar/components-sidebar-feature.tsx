import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { CirclePlus, Image, Text } from "lucide-react";
import { useState } from "react";
import ComponentsCard from "./components/components-card";

export default function ComponentsSidebarFeature() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const COMPONENTS = [
		{
			id: 1,
			name: "Image",
			icon: <Image />,
		},
		{
			id: 2,
			name: "Text",
			icon: <Text />,
		},
	];

	return (
		<div>
			<Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
				<SheetTrigger asChild>
					<Button variant="outline">
						<CirclePlus />
					</Button>
				</SheetTrigger>
				<SheetContent className="bg-white" side="left">
					<SheetHeader>
						<SheetTitle>Select Components</SheetTitle>
						<SheetDescription>
							<div className="grid grid-cols-2 gap-2">
								{COMPONENTS.map((component) => (
									<ComponentsCard
										key={component.id}
										name={component?.name}
										icon={component?.icon}
									/>
								))}
							</div>
						</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
		</div>
	);
}
