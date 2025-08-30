import ComponentsSidebarFeature from "./features/components-sidebar/components-sidebar-feature";
import EditContentFeature from "./features/edit-content/edit-content-feature";

export default function EditScreen() {
	return (
		<main className="min-h-screen bg-slate-200 flex flex-col">
			<section aria-labelledby="edit-screen-title" className="py-2 px-4">
				<div className="flex gap-2 justify-start">
					<h1 id="edit-screen-title" className="text-2xl font-bold">
						Edit
					</h1>
					<ComponentsSidebarFeature />
				</div>
			</section>

			<EditContentFeature />
		</main>
	);
}
