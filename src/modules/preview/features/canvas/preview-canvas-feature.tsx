


import { cn } from "@/lib/utils";
import { HUG_HEIGHT } from "@/modules/edit/constants/hug-system";
import { usePreviewComponents } from "../../store/use-preview-store";
import { processComponentsForStacking } from "../../utils/stack-group-processor";
import { PreviewDesktopRenderer } from "./components/preview-desktop-renderer";
import { PreviewMobileRenderer } from "./components/preview-mobile-renderer";
import { StackGroupWrapper } from "./components/stack-group-wrapper";

export function PreviewCanvasFeature() {
	const components = usePreviewComponents();


	const { stackGroups, processedComponents } =
		processComponentsForStacking(components);


	const individualComponents = processedComponents.filter(
		(component) => !component.stackGroupId,
	);


	const sortedIndividualComponents = [...individualComponents].sort((a, b) => {

		if (a.position.y !== b.position.y) {
			return a.position.y - b.position.y;
		}


		if (a.position.x !== b.position.x) {
			return a.position.x - b.position.x;
		}


		return a.createdAt - b.createdAt;
	});


	const sortedStackGroups = [...stackGroups].sort((a, b) => {
		if (a.position.y !== b.position.y) {
			return a.position.y - b.position.y;
		}
		return a.position.x - b.position.x;
	});


	const renderingItems: Array<
		| { type: "component"; component: (typeof sortedIndividualComponents)[0] }
		| { type: "stackGroup"; stackGroup: (typeof sortedStackGroups)[0] }
	> = [];


	for (const component of sortedIndividualComponents) {
		renderingItems.push({ type: "component", component });
	}


	for (const stackGroup of sortedStackGroups) {
		renderingItems.push({ type: "stackGroup", stackGroup });
	}


	renderingItems.sort((a, b) => {
		const aPos =
			a.type === "component" ? a.component.position : a.stackGroup.position;
		const bPos =
			b.type === "component" ? b.component.position : b.stackGroup.position;

		if (aPos.y !== bPos.y) {
			return aPos.y - bPos.y;
		}
		return aPos.x - bPos.x;
	});

	const hasComponents = renderingItems.length > 0;

	return (
		<div className="flex-1 overflow-auto bg-gray-50">
			<div className="h-full p-4">
				<div
					className={cn(
						"mx-auto bg-white shadow-sm border border-gray-200",
						"min-h-full",

						"max-w-4xl",
					)}
				>
					{!hasComponents && <PreviewEmptyState />}

					{hasComponents && (
						<div
							className={cn(

								"relative grid",

								"grid-cols-1 md:grid-cols-2",

								"gap-0",

								"h-full min-h-screen",
							)}
							style={{
								gap: "0px",
								gridAutoRows: `${HUG_HEIGHT}px`,
								alignItems: "start",
							}}
						>
							<div className="hidden md:contents">
								{renderingItems.map((item) => {
									if (item.type === "component") {
										return (
											<PreviewDesktopRenderer
												key={`desktop-${item.component.id}`}
												component={item.component}
											/>
										);
									}


									const stackGroupProcessedComponents =
										processedComponents.filter(
											(comp) => comp.stackGroupId === item.stackGroup.id,
										);

									return (
										<StackGroupWrapper
											key={`desktop-stack-${item.stackGroup.id}`}
											stackGroup={item.stackGroup}
											processedComponents={stackGroupProcessedComponents}
											isDesktop={true}
										/>
									);
								})}
							</div>

							<div className="contents md:hidden">
								{renderingItems.map((item, index) => {

									let mobileRowStart = 1;
									for (let i = 0; i < index; i++) {
										const prevItem = renderingItems[i];
										const height =
											prevItem.type === "component"
												? prevItem.component.size.height
												: prevItem.stackGroup.height;
										mobileRowStart += height;
									}

									if (item.type === "component") {
										return (
											<PreviewMobileRenderer
												key={`mobile-${item.component.id}`}
												component={item.component}
												mobileRowStart={mobileRowStart}
											/>
										);
									}


									const stackGroupProcessedComponents =
										processedComponents.filter(
											(comp) => comp.stackGroupId === item.stackGroup.id,
										);

									return (
										<StackGroupWrapper
											key={`mobile-stack-${item.stackGroup.id}`}
											stackGroup={item.stackGroup}
											processedComponents={stackGroupProcessedComponents}
											isDesktop={false}
											mobileRowStart={mobileRowStart}
										/>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function PreviewEmptyState() {
	return (
		<div className="flex items-center justify-center h-full min-h-[400px]">
			<div className="text-center">
				<div className="mx-auto h-12 w-12 text-gray-400 mb-4">
					<svg
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					No components to preview
				</h3>
				<p className="text-gray-500 mb-4">
					Create some components in edit mode to see them here.
				</p>
			</div>
		</div>
	);
}
