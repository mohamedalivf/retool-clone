


import { cn } from "@/lib/utils";
import { hugsToPixels } from "@/modules/edit/constants/hug-system";
import type { ComponentState } from "@/modules/edit/store/types";
import { PreviewImageComponent } from "./preview-image-component";
import { PreviewTextComponent } from "./preview-text-component";

interface PreviewMobileRendererProps {
	component: ComponentState;
	mobileRowStart: number;
}

export function PreviewMobileRenderer({
	component,
	mobileRowStart,
}: PreviewMobileRendererProps) {

	const gridColumn = "1 / -1";



	const gridRow =
		component.type === "text"
			? `${mobileRowStart}`
			: `${mobileRowStart} / span ${component.size.height}`;

	return (
		<div
			className={cn(
				"relative",

				component.type === "text" && `min-h-[${hugsToPixels(1)}px]`,
				component.type === "image" && `min-h-[${hugsToPixels(4)}px]`,

				component.type === "text" && "z-10",
				component.type === "image" && "z-0",
			)}
			style={{
				gridColumn,
				gridRow,
			}}
			aria-label={`${component.type} component in mobile preview mode`}
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
}
