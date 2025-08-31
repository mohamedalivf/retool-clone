/**
 * Preview-only Text component - renders text without edit controls
 * Based on the edit TextComponent but simplified for read-only display
 */

import { cn } from "@/lib/utils";
import { HUG_HEIGHT } from "@/modules/edit/constants/hug-system";
import type {
	ComponentState,
	TextAttributes,
} from "@/modules/edit/store/types";
import React from "react";
import ReactMarkdown from "react-markdown";

interface PreviewTextComponentProps {
	component: ComponentState;
}

export const PreviewTextComponent = React.memo(function PreviewTextComponent({
	component,
}: PreviewTextComponentProps) {
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
				"w-full",
				"flex items-center justify-start",
				"bg-white border border-gray-200",
				"py-3 px-4",
			)}
			style={{
				...componentStyles,
				minHeight: `${HUG_HEIGHT}px`, // Minimum 1 hug
			}}
			aria-label={`Text component: ${attributes.content || "Empty text"}`}
		>
			<div
				className={cn(
					"w-full prose prose-sm max-w-none",
					`text-${attributes.textAlign}`,
					// Handle text overflow
					"overflow-hidden",
					"break-words",
				)}
				style={{ color: attributes.color }}
			>
				{attributes.content ? (
					<ReactMarkdown
						components={{
							// Allow natural paragraph styling with reduced margins
							p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
							// Headings with proper hierarchy
							h1: ({ children }) => (
								<h1 className="text-2xl font-bold mb-2">{children}</h1>
							),
							h2: ({ children }) => (
								<h2 className="text-xl font-semibold mb-2">{children}</h2>
							),
							h3: ({ children }) => (
								<h3 className="text-lg font-medium mb-1">{children}</h3>
							),
							h4: ({ children }) => (
								<h4 className="text-base font-medium mb-1">{children}</h4>
							),
							h5: ({ children }) => (
								<h5 className="text-sm font-medium mb-1">{children}</h5>
							),
							h6: ({ children }) => (
								<h6 className="text-xs font-medium mb-1">{children}</h6>
							),
							// Lists with proper spacing
							ul: ({ children }) => (
								<ul className="list-disc list-inside mb-2 space-y-1">
									{children}
								</ul>
							),
							ol: ({ children }) => (
								<ol className="list-decimal list-inside mb-2 space-y-1">
									{children}
								</ol>
							),
							li: ({ children }) => <li>{children}</li>,
							// Inline elements
							strong: ({ children }) => (
								<strong className="font-semibold">{children}</strong>
							),
							em: ({ children }) => <em className="italic">{children}</em>,
							code: ({ children }) => (
								<code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
									{children}
								</code>
							),
							// Code blocks
							pre: ({ children }) => (
								<pre className="bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto mb-2">
									{children}
								</pre>
							),
							// Links
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
							// Blockquotes
							blockquote: ({ children }) => (
								<blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">
									{children}
								</blockquote>
							),
						}}
					>
						{attributes.content}
					</ReactMarkdown>
				) : (
					<span className="text-muted-foreground italic">Empty text</span>
				)}
			</div>
		</div>
	);
});

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
