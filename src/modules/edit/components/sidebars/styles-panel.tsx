/**
 * Styles panel for editing component styling properties
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { ComponentState, ComponentStyles } from "../../store/types";
import { useEditStore } from "../../store/use-edit-store";

interface StylesPanelProps {
	component: ComponentState;
}

export function StylesPanel({ component }: StylesPanelProps) {
	// Use specific selectors to prevent unnecessary re-renders
	const updateComponent = useEditStore((state) => state.updateComponent);

	const handleUpdateStyles = (updates: Partial<ComponentStyles>) => {
		updateComponent(component.id, {
			styles: { ...component.styles, ...updates },
		});
	};

	const styles = component.styles;

	return (
		<div className="space-y-6">
			{/* Background */}
			<div>
				<h3 className="font-medium mb-3">Background</h3>
				<div>
					<Label htmlFor="bg-color">Background Color</Label>
					<Input
						id="bg-color"
						type="color"
						value={styles.backgroundColor || "#ffffff"}
						onChange={(e) =>
							handleUpdateStyles({ backgroundColor: e.target.value })
						}
						className="mt-1 h-10"
					/>
				</div>
			</div>

			{/* Border */}
			<div>
				<h3 className="font-medium mb-3">Border</h3>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="border-width">Width</Label>
							<Input
								id="border-width"
								type="number"
								min="0"
								value={styles.border?.width || 0}
								onChange={(e) =>
									handleUpdateStyles({
										border: {
											...styles.border,
											width: Number.parseInt(e.target.value) || 0,
											style: styles.border?.style || "solid",
											color: styles.border?.color || "#e5e7eb",
										},
									})
								}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="border-style">Style</Label>
							<Select
								value={styles.border?.style || "solid"}
								onValueChange={(
									value: "solid" | "dashed" | "dotted" | "none",
								) =>
									handleUpdateStyles({
										border: {
											...styles.border,
											width: styles.border?.width || 0,
											style: value,
											color: styles.border?.color || "#e5e7eb",
										},
									})
								}
							>
								<SelectTrigger id="border-style" className="mt-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None</SelectItem>
									<SelectItem value="solid">Solid</SelectItem>
									<SelectItem value="dashed">Dashed</SelectItem>
									<SelectItem value="dotted">Dotted</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div>
						<Label htmlFor="border-color">Color</Label>
						<Input
							id="border-color"
							type="color"
							value={styles.border?.color || "#e5e7eb"}
							onChange={(e) =>
								handleUpdateStyles({
									border: {
										...styles.border,
										width: styles.border?.width || 0,
										style: styles.border?.style || "solid",
										color: e.target.value,
									},
								})
							}
							className="mt-1 h-10"
						/>
					</div>
				</div>
			</div>

			{/* Spacing */}
			<div>
				<h3 className="font-medium mb-3">Padding</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="padding-top">Top</Label>
						<Input
							id="padding-top"
							type="number"
							min="0"
							value={styles.padding?.top || 16}
							onChange={(e) =>
								handleUpdateStyles({
									padding: {
										...styles.padding,
										top: Number.parseInt(e.target.value) || 0,
										right: styles.padding?.right || 16,
										bottom: styles.padding?.bottom || 16,
										left: styles.padding?.left || 16,
									},
								})
							}
							className="mt-1"
						/>
					</div>
					<div>
						<Label htmlFor="padding-right">Right</Label>
						<Input
							id="padding-right"
							type="number"
							min="0"
							value={styles.padding?.right || 16}
							onChange={(e) =>
								handleUpdateStyles({
									padding: {
										...styles.padding,
										top: styles.padding?.top || 16,
										right: Number.parseInt(e.target.value) || 0,
										bottom: styles.padding?.bottom || 16,
										left: styles.padding?.left || 16,
									},
								})
							}
							className="mt-1"
						/>
					</div>
					<div>
						<Label htmlFor="padding-bottom">Bottom</Label>
						<Input
							id="padding-bottom"
							type="number"
							min="0"
							value={styles.padding?.bottom || 16}
							onChange={(e) =>
								handleUpdateStyles({
									padding: {
										...styles.padding,
										top: styles.padding?.top || 16,
										right: styles.padding?.right || 16,
										bottom: Number.parseInt(e.target.value) || 0,
										left: styles.padding?.left || 16,
									},
								})
							}
							className="mt-1"
						/>
					</div>
					<div>
						<Label htmlFor="padding-left">Left</Label>
						<Input
							id="padding-left"
							type="number"
							min="0"
							value={styles.padding?.left || 16}
							onChange={(e) =>
								handleUpdateStyles({
									padding: {
										...styles.padding,
										top: styles.padding?.top || 16,
										right: styles.padding?.right || 16,
										bottom: styles.padding?.bottom || 16,
										left: Number.parseInt(e.target.value) || 0,
									},
								})
							}
							className="mt-1"
						/>
					</div>
				</div>
			</div>

			{/* Shadow */}
			<div>
				<h3 className="font-medium mb-3">Shadow</h3>
				<div>
					<Label htmlFor="shadow">Shadow Size</Label>
					<Select
						value={styles.shadow || "none"}
						onValueChange={(value: "none" | "sm" | "md" | "lg" | "xl") =>
							handleUpdateStyles({ shadow: value })
						}
					>
						<SelectTrigger id="shadow" className="mt-1">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							<SelectItem value="sm">Small</SelectItem>
							<SelectItem value="md">Medium</SelectItem>
							<SelectItem value="lg">Large</SelectItem>
							<SelectItem value="xl">Extra Large</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Opacity */}
			<div>
				<h3 className="font-medium mb-3">Opacity</h3>
				<div>
					<Label htmlFor="opacity">
						Opacity: {Math.round((styles.opacity || 1) * 100)}%
					</Label>
					<Slider
						id="opacity"
						min={0}
						max={1}
						step={0.1}
						value={[styles.opacity || 1]}
						onValueChange={([value]) => handleUpdateStyles({ opacity: value })}
						className="mt-2"
					/>
				</div>
			</div>
		</div>
	);
}
