import EditScreen from "@/modules/edit/edit-screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: EditScreen,
});
