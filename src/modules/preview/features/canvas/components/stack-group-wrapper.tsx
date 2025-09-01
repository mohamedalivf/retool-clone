


import { cn } from "@/lib/utils";
import { hugsToPixels } from "@/modules/edit/constants/hug-system";
import type {
	ProcessedComponent,
	StackGroup,
} from "@/modules/preview/utils/stack-group-processor";
import { PreviewImageComponent } from "./preview-image-component";
import { PreviewTextComponent } from "./preview-text-component";

interface StackGroupWrapperProps {
	stackGroup: StackGroup;
	processedComponents: ProcessedComponent[];
	isDesktop: boolean;
	mobileRowStart?: number;
}

export function StackGroupWrapper({
	stackGroup,
	processedComponents,
	isDesktop,
	mobileRowStart,
}: StackGroupWrapperProps) {
	if (isDesktop) {
		return (
			<DesktopStackGroup
				stackGroup={stackGroup}
				processedComponents={processedComponents}
			/>
		);
	}

	return (
		<MobileStackGroup
			stackGroup={stackGroup}
			processedComponents={processedComponents}
			mobileRowStart={mobileRowStart || 1}
		/>
	);
}

function DesktopStackGroup({
	stackGroup,
	processedComponents,
}: { stackGroup: StackGroup; processedComponents: ProcessedComponent[] }) {

	const gridColumn =
		stackGroup.width === 2
			? "1 / -1"
			: stackGroup.position.x === 0
				? "1"
				: "2";

	const gridRow = `${stackGroup.position.y + 1} / span ${stackGroup.height}`;

	return (
		<div
			className={cn(
				"relative",
				`min-h-[${hugsToPixels(stackGroup.height)}px]`,
			)}
			style={{
				gridColumn,
				gridRow,
			}}
			aria-label={`Stack group with ${stackGroup.components.length} components`}
		>
			{processedComponents.map((component, index) => {
				const stackPosition = component.stackPosition || { x: 0, y: 0 };

				return (
					<div
						key={component.id}
						className={cn(
							"absolute",

							component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
							component.type === "image" &&
								`min-h-[${hugsToPixels(component.size.height)}px]`,

							component.type === "text" && "z-10",
							component.type === "image" && "z-0",
						)}
						style={{
							top: `${hugsToPixels(stackPosition.y)}px`,
							left: `${hugsToPixels(stackPosition.x)}px`,
							width: "100%",
							height: `${hugsToPixels(component.size.height)}px`,
							zIndex: index,
						}}
						aria-label={`${component.type} component in desktop stack group`}
					>
						<div className="w-full h-full">
							{component.type === "text" && (
								<PreviewTextComponent component={component} />
							)}
							{component.type === "image" && (
								<PreviewImageComponent component={component} />
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}

function MobileStackGroup({
	stackGroup,
	processedComponents,
	mobileRowStart,
}: {
	stackGroup: StackGroup;
	processedComponents: ProcessedComponent[];
	mobileRowStart: number;
}) {

	const gridColumn = "1 / -1";
	const gridRow = `${mobileRowStart} / span ${stackGroup.height}`;

	return (
		<div
			className={cn(
				"relative",
				`min-h-[${hugsToPixels(stackGroup.height)}px]`,
			)}
			style={{
				gridColumn,
				gridRow,
			}}
			aria-label={`Mobile stack group with ${stackGroup.components.length} components`}
		>
			{processedComponents.map((component, index) => {
				const stackPosition = component.stackPosition || { x: 0, y: 0 };

				return (
					<div
						key={component.id}
						className={cn(
							"absolute",

							component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
							component.type === "image" &&
								`min-h-[${hugsToPixels(component.size.height)}px]`,

							component.type === "text" && "z-10",
							component.type === "image" && "z-0",
						)}
						style={{
							top: `${hugsToPixels(stackPosition.y)}px`,
							left: 0,
							width: "100%",
							height: `${hugsToPixels(component.size.height)}px`,
							zIndex: index,
						}}
						aria-label={`${component.type} component in mobile stack group`}
					>
						<div className="w-full h-full">
							{component.type === "text" && (
								<PreviewTextComponent component={component} />
							)}
							{component.type === "image" && (
								<PreviewImageComponent component={component} />
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
