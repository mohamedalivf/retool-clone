


import { cn } from "@/lib/utils";
import { hugsToPixels } from "@/modules/edit/constants/hug-system";
import type { ComponentState } from "@/modules/edit/store/types";
import { PreviewImageComponent } from "./preview-image-component";
import { PreviewTextComponent } from "./preview-text-component";

interface PreviewDesktopRendererProps {
	component: ComponentState;
}

export function PreviewDesktopRenderer({
	component,
}: PreviewDesktopRendererProps) {

	const gridColumn =
		component.size.width === "full"
			? "1 / -1"
			: component.position.x === 0
				? "1"
				: "2";


	const gridRow =
		component.type === "text"
			? `${component.position.y + 1}`
			: `${component.position.y + 1} / span ${component.size.height}`;

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
			aria-label={`${component.type} component in desktop preview mode`}
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
