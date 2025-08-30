/**
 * Properties panel for editing component-specific attributes
 */

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
} from "../../store/types";
import { isImageAttributes, isTextAttributes } from "../../store/types";
import { useEditStore } from "../../store/use-edit-store";

interface PropertiesPanelProps {
	component: ComponentState;
}

export function PropertiesPanel({ component }: PropertiesPanelProps) {
	// Use specific selectors to prevent unnecessary re-renders
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
			{/* Component Info */}
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

			{/* Text Component Properties */}
			{isTextAttributes(component.attributes) && (
				<TextProperties
					attributes={component.attributes}
					onUpdate={handleUpdateAttributes}
				/>
			)}

			{/* Image Component Properties */}
			{isImageAttributes(component.attributes) && (
				<ImageProperties
					attributes={component.attributes}
					onUpdate={handleUpdateAttributes}
				/>
			)}

			{/* Actions */}
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
						<Label htmlFor="font-size">Font Size</Label>
						<Select
							value={attributes.fontSize}
							onValueChange={(value: TextAttributes["fontSize"]) =>
								onUpdate({ fontSize: value })
							}
						>
							<SelectTrigger id="font-size" className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="xs">Extra Small</SelectItem>
								<SelectItem value="sm">Small</SelectItem>
								<SelectItem value="base">Base</SelectItem>
								<SelectItem value="lg">Large</SelectItem>
								<SelectItem value="xl">Extra Large</SelectItem>
								<SelectItem value="2xl">2X Large</SelectItem>
								<SelectItem value="3xl">3X Large</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="font-weight">Font Weight</Label>
						<Select
							value={attributes.fontWeight}
							onValueChange={(value: TextAttributes["fontWeight"]) =>
								onUpdate({ fontWeight: value })
							}
						>
							<SelectTrigger id="font-weight" className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="normal">Normal</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="semibold">Semibold</SelectItem>
								<SelectItem value="bold">Bold</SelectItem>
							</SelectContent>
						</Select>
					</div>
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
						<Label htmlFor="aspect-ratio">Aspect Ratio</Label>
						<Select
							value={attributes.aspectRatio}
							onValueChange={(value: ImageAttributes["aspectRatio"]) =>
								onUpdate({ aspectRatio: value })
							}
						>
							<SelectTrigger id="aspect-ratio" className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="auto">Auto</SelectItem>
								<SelectItem value="1:1">Square (1:1)</SelectItem>
								<SelectItem value="16:9">Widescreen (16:9)</SelectItem>
								<SelectItem value="4:3">Standard (4:3)</SelectItem>
								<SelectItem value="3:2">Photo (3:2)</SelectItem>
							</SelectContent>
						</Select>
					</div>

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
