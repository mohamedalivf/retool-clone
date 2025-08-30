/**
 * Text component for displaying markdown content
 */

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { ComponentState, TextAttributes } from "../../store/types";

interface TextComponentProps {
	component: ComponentState;
}

export function TextComponent({ component }: TextComponentProps) {
	const attributes = component.attributes as TextAttributes;
	const styles = component.styles;

	// Apply component styles
	const componentStyles = {
		backgroundColor: styles.backgroundColor,
		borderWidth: styles.border?.width,
		borderStyle: styles.border?.style,
		borderColor: styles.border?.color,
		padding: `${styles.padding?.top}px ${styles.padding?.right}px ${styles.padding?.bottom}px ${styles.padding?.left}px`,
		opacity: styles.opacity,
		boxShadow: getShadowValue(styles.shadow),
	};

	return (
		<div
			className={cn(
				"h-full w-full rounded-md",
				"flex items-center justify-start",
				"bg-white border border-gray-200",
			)}
			style={componentStyles}
		>
			<div
				className={cn(
					"w-full prose prose-sm max-w-none",
					`text-${attributes.fontSize}`,
					`font-${attributes.fontWeight}`,
					`text-${attributes.textAlign}`,
				)}
				style={{ color: attributes.color }}
			>
				<ReactMarkdown
					components={{
						// Override paragraph to remove margins
						p: ({ children }) => <span>{children}</span>,
						// Keep other inline elements
						strong: ({ children }) => <strong>{children}</strong>,
						em: ({ children }) => <em>{children}</em>,
						code: ({ children }) => (
							<code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
								{children}
							</code>
						),
						a: ({ href, children }) => (
							<a
								href={href}
								className="text-blue-600 hover:underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								{children}
							</a>
						),
					}}
				>
					{attributes.content || "Click to edit text"}
				</ReactMarkdown>
			</div>
		</div>
	);
}

function getShadowValue(shadow?: string): string {
	switch (shadow) {
		case "sm":
			return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
		case "md":
			return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
		case "lg":
			return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
		case "xl":
			return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
		default:
			return "none";
	}
}
