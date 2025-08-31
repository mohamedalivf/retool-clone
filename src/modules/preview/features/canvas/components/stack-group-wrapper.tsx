/**
 * Stack Group Wrapper - Renders overlapped components as a unified group
 * Uses relative positioning to maintain stacking relationships
 */

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
	// Calculate grid positioning for the group container
	const gridColumn =
		stackGroup.width === 2 // full-width
			? "1 / -1"
			: stackGroup.position.x === 0
				? "1"
				: "2";

	const gridRow = `${stackGroup.position.y + 1} / span ${stackGroup.height}`;

	return (
		<div
			className={cn(
				"relative", // Enable absolute positioning for children
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
							// Add component-specific styling
							component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
							component.type === "image" &&
								`min-h-[${hugsToPixels(component.size.height)}px]`,
							// Add z-index classes similar to edit mode for proper layering
							component.type === "text" && "z-10", // Text components get higher z-index
							component.type === "image" && "z-0", // Image components get lower z-index
						)}
						style={{
							top: `${hugsToPixels(stackPosition.y)}px`,
							left: `${hugsToPixels(stackPosition.x)}px`,
							width: "100%", // Grid system handles the column width
							height: `${hugsToPixels(component.size.height)}px`,
							zIndex: index, // Stack components on top of each other
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
	// In mobile, the stack group becomes a single full-width container
	const gridColumn = "1 / -1";
	const gridRow = `${mobileRowStart} / span ${stackGroup.height}`;

	return (
		<div
			className={cn(
				"relative", // Enable absolute positioning for children
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
							// Add component-specific styling
							component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
							component.type === "image" &&
								`min-h-[${hugsToPixels(component.size.height)}px]`,
							// Add z-index classes similar to edit mode for proper layering
							component.type === "text" && "z-10", // Text components get higher z-index
							component.type === "image" && "z-0", // Image components get lower z-index
						)}
						style={{
							top: `${hugsToPixels(stackPosition.y)}px`,
							left: 0, // In mobile, all components are full-width and start at left edge
							width: "100%", // All components are full-width in mobile
							height: `${hugsToPixels(component.size.height)}px`,
							zIndex: index, // Stack components on top of each other
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
