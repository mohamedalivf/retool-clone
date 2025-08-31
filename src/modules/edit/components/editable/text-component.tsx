import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { HUG_HEIGHT, MIN_HUGS, pixelsToHugs } from "../../constants/hug-system";
import type { ComponentState, TextAttributes } from "../../store/types";
import { useEditStore } from "../../store/use-edit-store";

function calculateHugsFromElement(
	element: HTMLElement | null,
	content: string,
): number {
	if (!content) return MIN_HUGS;

	if (!element) {
		const lines = content.split("\n").length;
		const estimatedHeight = Math.max(48, lines * 24 + 48); // Rough estimate
		return pixelsToHugs(estimatedHeight);
	}

	const actualHeight = element.offsetHeight;
	const hugs = pixelsToHugs(actualHeight);

	return hugs;
}

interface TextComponentProps {
	component: ComponentState;
}

export const TextComponent = React.memo(function TextComponent({
	component,
}: TextComponentProps) {
	const attributes = component.attributes as TextAttributes;
	const styles = component.styles;
	const updateComponent = useEditStore((state) => state.updateComponent);
	const isSelected = useEditStore(
		(state) => state.selection.selectedComponentId === component.id,
	);

	// Inline editing state
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(attributes.content || "");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const componentRef = useRef<HTMLDivElement>(null);

	// Calculate required height in hugs using actual DOM measurement
	const [requiredHugs, setRequiredHugs] = useState(component.size.height);

	// Measure actual component height after render
	React.useEffect(() => {
		if (componentRef.current && attributes.content) {
			const measuredHugs = calculateHugsFromElement(
				componentRef.current,
				attributes.content,
			);
			if (measuredHugs !== requiredHugs) {
				setRequiredHugs(measuredHugs);
			}
		}
	}, [attributes.content, requiredHugs]);

	// Auto-fix height mismatch when measured height differs from stored height
	React.useEffect(() => {
		if (
			component.size.height !== requiredHugs &&
			attributes.content &&
			requiredHugs !== component.size.height
		) {
			updateComponent(component.id, {
				size: {
					...component.size,
					height: requiredHugs,
				},
			});
		}
	}, [
		component.id,
		component.size,
		requiredHugs,
		attributes.content,
		updateComponent,
	]);

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

	// Handle double-click to enter edit mode
	const handleDoubleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (isSelected) {
				setIsEditing(true);
				setEditValue(attributes.content || "");
			}
		},
		[isSelected, attributes.content],
	);

	// Handle save changes
	const handleSave = useCallback(() => {
		// First update the content
		updateComponent(component.id, {
			attributes: {
				...attributes,
				content: editValue,
			},
		});
		setIsEditing(false);

		// Height will be measured and updated automatically by the useEffect after render
	}, [component.id, attributes, editValue, updateComponent]);

	// Handle cancel editing
	const handleCancel = useCallback(() => {
		setEditValue(attributes.content || "");
		setIsEditing(false);
	}, [attributes.content]);

	// Handle keyboard shortcuts
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				handleSave();
			} else if (e.key === "Escape") {
				e.preventDefault();
				handleCancel();
			}
		},
		[handleSave, handleCancel],
	);

	// Focus textarea when entering edit mode
	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
			textareaRef.current.select();
		}
	}, [isEditing]);

	// Render editing mode
	if (isEditing) {
		return (
			<div
				className={cn(
					"w-full min-h-[2.5rem]",
					"bg-white border-2 border-primary",
					"p-2", // Reduced padding for editing mode
				)}
				style={componentStyles}
			>
				<Textarea
					ref={textareaRef}
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleSave}
					className={cn(
						"w-full min-h-[2rem] resize-none border-0 p-0",
						"focus:ring-0 focus:outline-none",
						"bg-transparent",
						`text-${attributes.textAlign}`,
					)}
					style={{ color: attributes.color }}
					placeholder="Enter your text here..."
					aria-label="Edit text content"
					rows={Math.max(2, editValue.split("\n").length)}
				/>
				<div className="mt-1 text-xs text-muted-foreground">
					Press Ctrl+Enter to save, Esc to cancel
				</div>
			</div>
		);
	}

	// Render display mode
	return (
		<div
			ref={componentRef}
			className={cn(
				"w-full",
				"flex items-center justify-start",
				"bg-white border border-gray-200",
				"py-3 px-4",
				// Enhanced interaction states
				"transition-all duration-200",
				isSelected && "ring-1 ring-primary/50",
				"hover:bg-gray-50",
				// Cursor indicates editability when selected
				isSelected && "cursor-text",
			)}
			style={{
				...componentStyles,
				minHeight: `${HUG_HEIGHT}px`, // Minimum 1 hug
			}}
			onDoubleClick={handleDoubleClick}
			// biome-ignore lint/a11y/useSemanticElements: <explanation>
			role="textbox"
			aria-label={`Text component: ${attributes.content || "Empty text"}`}
			aria-readonly={!isSelected}
			tabIndex={isSelected ? 0 : -1}
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
					<span className="text-muted-foreground italic">
						{isSelected ? "Double-click to edit text" : "Empty text"}
					</span>
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
