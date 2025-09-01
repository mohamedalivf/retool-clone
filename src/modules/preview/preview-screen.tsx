


import { useEditStore } from "@/modules/edit/store/use-edit-store";
import { useEffect } from "react";
import { PreviewCanvasFeature } from "./features/canvas/preview-canvas-feature";
import { PreviewHeaderFeature } from "./features/header/preview-header-feature";
import { usePreviewStore } from "./store/use-preview-store";

export default function PreviewScreen() {

	const editComponents = useEditStore((state) => state.components);
	const setPreviewComponents = usePreviewStore((state) => state.setComponents);


	useEffect(() => {
		setPreviewComponents(editComponents);
	}, [editComponents, setPreviewComponents]);

	return (
		<div className="h-screen flex flex-col bg-background">
			<PreviewHeaderFeature />

			<PreviewCanvasFeature />
		</div>
	);
}
