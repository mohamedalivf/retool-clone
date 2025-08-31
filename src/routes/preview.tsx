import PreviewScreen from "@/modules/preview/preview-screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/preview")({
	component: PreviewScreen,
});
