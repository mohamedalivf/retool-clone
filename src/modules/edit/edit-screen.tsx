import ComponentsSidebarFeature from "./features/components-sidebar/components-sidebar-feature";

export default function EditScreen() {
	return (
		<section
			aria-labelledby="edit-screen-title"
			className="min-h-screen bg-slate-200 py-8 px-4"
		>
			<div className="flex gap-2 justify-start">
				<h1 id="edit-screen-title" className="text-2xl font-bold">
					Edit
				</h1>
				<ComponentsSidebarFeature />
			</div>
		</section>
	);
}
