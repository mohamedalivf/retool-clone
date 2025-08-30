/**
 * Enhanced Text component with inline editing, markdown rendering, and accessibility
 * Optimized with React.memo for performance
 */

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { ComponentState, TextAttributes } from "../../store/types";
import { useEditStore } from "../../store/use-edit-store";

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
		updateComponent(component.id, {
			attributes: {
				...attributes,
				content: editValue,
			},
		});
		setIsEditing(false);
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
						`text-${attributes.fontSize}`,
						`font-${attributes.fontWeight}`,
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
			className={cn(
				"w-full min-h-[2.5rem]",
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
			style={componentStyles}
			onDoubleClick={handleDoubleClick}
			role="textbox"
			aria-label={`Text component: ${attributes.content || "Empty text"}`}
			aria-readonly={!isSelected}
			tabIndex={isSelected ? 0 : -1}
		>
			<div
				className={cn(
					"w-full prose prose-sm max-w-none",
					`text-${attributes.fontSize}`,
					`font-${attributes.fontWeight}`,
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
