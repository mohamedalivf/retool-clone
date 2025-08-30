/**
 * Data panel for component metadata and advanced settings
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import type { ComponentState } from "../../store/types";
import { useEditStore } from "../../store/use-edit-store";

interface DataPanelProps {
	component: ComponentState;
}

export function DataPanel({ component }: DataPanelProps) {
	// Note: duplicateComponent was removed from simplified store
	// We'll need to implement this functionality later

	const handleCopyId = () => {
		navigator.clipboard.writeText(component.id);
	};

	const handleDuplicate = () => {
		// TODO: Implement duplicate functionality in simplified store
		console.log("Duplicate functionality not yet implemented");
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	return (
		<div className="space-y-6">
			{/* Component Metadata */}
			<div>
				<h3 className="font-medium mb-3">Component Data</h3>
				<div className="space-y-3">
					<div>
						<Label htmlFor="component-id">Component ID</Label>
						<div className="flex gap-2 mt-1">
							<Input
								id="component-id"
								value={component.id}
								readOnly
								className="font-mono text-sm"
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={handleCopyId}
								className="px-3"
							>
								<Copy className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Type</Label>
							<div className="mt-1">
								<Badge variant="secondary" className="capitalize">
									{component.type}
								</Badge>
							</div>
						</div>
						<div>
							<Label>Status</Label>
							<div className="mt-1">
								<Badge
									variant={
										component.status === "active" ? "default" : "outline"
									}
									className="capitalize"
								>
									{component.status || "active"}
								</Badge>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Position & Size Data */}
			<div>
				<h3 className="font-medium mb-3">Layout Data</h3>
				<div className="space-y-3">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Grid Position</Label>
							<div className="mt-1 text-sm text-muted-foreground">
								Column: {component.position.x}, Row: {component.position.y}
							</div>
						</div>
						<div>
							<Label>Grid Size</Label>
							<div className="mt-1 text-sm text-muted-foreground">
								{component.size.width} × {component.size.height}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Timestamps */}
			<div>
				<h3 className="font-medium mb-3">Timestamps</h3>
				<div className="space-y-3">
					<div>
						<Label>Created</Label>
						<div className="mt-1 text-sm text-muted-foreground">
							{formatDate(component.createdAt)}
						</div>
					</div>
					<div>
						<Label>Last Modified</Label>
						<div className="mt-1 text-sm text-muted-foreground">
							{formatDate(component.updatedAt)}
						</div>
					</div>
				</div>
			</div>

			{/* Component Actions */}
			<div>
				<h3 className="font-medium mb-3">Actions</h3>
				<div className="space-y-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleDuplicate}
						className="w-full flex items-center gap-2"
					>
						<Copy className="h-4 w-4" />
						Duplicate Component
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled
						className="w-full flex items-center gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Reset to Defaults
					</Button>
				</div>
			</div>

			{/* Raw Data (Development) */}
			{process.env.NODE_ENV === "development" && (
				<div>
					<h3 className="font-medium mb-3">Raw Data (Dev)</h3>
					<div className="bg-muted p-3 rounded-md">
						<pre className="text-xs overflow-auto max-h-40">
							{JSON.stringify(component, null, 2)}
						</pre>
					</div>
				</div>
			)}
		</div>
	);
}
