/**
 * Preview Screen - Main preview mode interface
 * Displays components in read-only mode with navigation back to edit
 */

import { useEditStore } from "@/modules/edit/store/use-edit-store";
import { useEffect } from "react";
import { PreviewCanvasFeature } from "./features/canvas/preview-canvas-feature";
import { PreviewHeaderFeature } from "./features/header/preview-header-feature";
import { usePreviewStore } from "./store/use-preview-store";

export default function PreviewScreen() {
	// Get components from edit store
	const editComponents = useEditStore((state) => state.components);
	const setPreviewComponents = usePreviewStore((state) => state.setComponents);

	// Sync components from edit store to preview store
	useEffect(() => {
		setPreviewComponents(editComponents);
	}, [editComponents, setPreviewComponents]);

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Header with back to edit button */}
			<PreviewHeaderFeature />

			{/* Main preview canvas */}
			<PreviewCanvasFeature />
		</div>
	);
}
