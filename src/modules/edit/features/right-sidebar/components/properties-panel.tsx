

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import type {
	ComponentState,
	ImageAttributes,
	TextAttributes,
} from "../../../store/types";
import { isImageAttributes, isTextAttributes } from "../../../store/types";
import { useEditStore } from "../../../store/use-edit-store";

interface PropertiesPanelProps {
	component: ComponentState;
}

export function PropertiesPanel({ component }: PropertiesPanelProps) {

	const updateComponent = useEditStore((state) => state.updateComponent);
	const deleteComponent = useEditStore((state) => state.deleteComponent);

	const handleUpdateAttributes = (
		updates: Partial<TextAttributes | ImageAttributes>,
	) => {
		updateComponent(component.id, {
			attributes: { ...component.attributes, ...updates },
		});
	};

	const handleDelete = () => {
		if (confirm("Are you sure you want to delete this component?")) {
			deleteComponent(component.id);
		}
	};

	return (
		<div className="space-y-6">
			{}
			<div>
				<h3 className="font-medium mb-3">Component Information</h3>
				<div className="space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Type:</span>
						<span className="capitalize">{component.type}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">ID:</span>
						<span className="font-mono text-xs">{component.id}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Position:</span>
						<span>
							({component.position.x}, {component.position.y})
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Size:</span>
						<span>
							{component.size.width} × {component.size.height}
						</span>
					</div>
				</div>
			</div>

			{}
			{isTextAttributes(component.attributes) && (
				<TextProperties
					attributes={component.attributes}
					onUpdate={handleUpdateAttributes}
				/>
			)}

			{}
			{isImageAttributes(component.attributes) && (
				<ImageProperties
					attributes={component.attributes}
					onUpdate={handleUpdateAttributes}
				/>
			)}

			{}
			<div className="pt-4 border-t">
				<Button
					variant="destructive"
					size="sm"
					onClick={handleDelete}
					className="w-full flex items-center gap-2"
				>
					<Trash2 className="h-4 w-4" />
					Delete Component
				</Button>
			</div>
		</div>
	);
}

function TextProperties({
	attributes,
	onUpdate,
}: {
	attributes: TextAttributes;
	onUpdate: (updates: Partial<TextAttributes>) => void;
}) {
	return (
		<div>
			<h3 className="font-medium mb-3">Text Properties</h3>
			<div className="space-y-4">
				<div>
					<Label htmlFor="text-content">Content</Label>
					<Textarea
						id="text-content"
						value={attributes.content}
						onChange={(e) => onUpdate({ content: e.target.value })}
						placeholder="Enter your text content..."
						className="mt-1"
						rows={4}
					/>
					<p className="text-xs text-muted-foreground mt-1">
						Supports markdown formatting
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="text-align">Text Align</Label>
						<Select
							value={attributes.textAlign}
							onValueChange={(value: TextAttributes["textAlign"]) =>
								onUpdate({ textAlign: value })
							}
						>
							<SelectTrigger id="text-align" className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="left">Left</SelectItem>
								<SelectItem value="center">Center</SelectItem>
								<SelectItem value="right">Right</SelectItem>
								<SelectItem value="justify">Justify</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="text-color">Text Color</Label>
						<Input
							id="text-color"
							type="color"
							value={attributes.color}
							onChange={(e) => onUpdate({ color: e.target.value })}
							className="mt-1 h-10"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function ImageProperties({
	attributes,
	onUpdate,
}: {
	attributes: ImageAttributes;
	onUpdate: (updates: Partial<ImageAttributes>) => void;
}) {
	return (
		<div>
			<h3 className="font-medium mb-3">Image Properties</h3>
			<div className="space-y-4">
				<div>
					<Label htmlFor="image-src">Image Source</Label>
					<Input
						id="image-src"
						value={attributes.src}
						onChange={(e) => onUpdate({ src: e.target.value })}
						placeholder="Enter image URL or path..."
						className="mt-1"
					/>
				</div>

				<div>
					<Label htmlFor="image-alt">Alt Text</Label>
					<Input
						id="image-alt"
						value={attributes.alt}
						onChange={(e) => onUpdate({ alt: e.target.value })}
						placeholder="Describe the image..."
						className="mt-1"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="object-fit">Object Fit</Label>
						<Select
							value={attributes.objectFit}
							onValueChange={(value: ImageAttributes["objectFit"]) =>
								onUpdate({ objectFit: value })
							}
						>
							<SelectTrigger id="object-fit" className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="cover">Cover</SelectItem>
								<SelectItem value="contain">Contain</SelectItem>
								<SelectItem value="fill">Fill</SelectItem>
								<SelectItem value="scale-down">Scale Down</SelectItem>
								<SelectItem value="none">None</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="object-position">Object Position</Label>
						<Select
							value={attributes.objectPosition}
							onValueChange={(value: ImageAttributes["objectPosition"]) =>
								onUpdate({ objectPosition: value })
							}
						>
							<SelectTrigger id="object-position" className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="center">Center</SelectItem>
								<SelectItem value="top">Top</SelectItem>
								<SelectItem value="bottom">Bottom</SelectItem>
								<SelectItem value="left">Left</SelectItem>
								<SelectItem value="right">Right</SelectItem>
								<SelectItem value="top-left">Top Left</SelectItem>
								<SelectItem value="top-right">Top Right</SelectItem>
								<SelectItem value="bottom-left">Bottom Left</SelectItem>
								<SelectItem value="bottom-right">Bottom Right</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div>
					<Label htmlFor="border-radius">Border Radius</Label>
					<Select
						value={attributes.borderRadius}
						onValueChange={(value: ImageAttributes["borderRadius"]) =>
							onUpdate({ borderRadius: value })
						}
					>
						<SelectTrigger id="border-radius" className="mt-1">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							<SelectItem value="sm">Small</SelectItem>
							<SelectItem value="md">Medium</SelectItem>
							<SelectItem value="lg">Large</SelectItem>
							<SelectItem value="full">Full</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
