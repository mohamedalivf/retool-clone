/**
 * Markdown processing utilities for text components
 * Handles both inline and block markdown rendering
 */

/**
 * Process markdown content for inline display (single line)
 * Converts newlines to spaces and applies basic markdown formatting
 */
export function processInlineMarkdown(content: string): string {
	if (!content) return "";

	// First, convert to single line by replacing newlines with spaces
	const singleLine = content
		.replace(/\n+/g, " ") // Replace newlines with spaces
		.replace(/\s+/g, " ") // Collapse multiple spaces
		.trim();

	// Apply basic markdown formatting using regex
	return (
		singleLine
			// Bold: **text** or __text__
			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			.replace(/__(.*?)__/g, "<strong>$1</strong>")

			// Italic: *text* or _text_ (but not if it's part of bold)
			.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
			.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>")

			// Code: `code`
			.replace(
				/`([^`]+)`/g,
				'<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
			)

			// Links: [text](url)
			.replace(
				/\[([^\]]+)\]\(([^)]+)\)/g,
				'<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
			)

			// Strikethrough: ~~text~~
			.replace(/~~(.*?)~~/g, "<del>$1</del>")
	);
}

/**
 * Process markdown content for block display (multi-line)
 * Preserves line breaks and applies full markdown formatting
 */
export function processBlockMarkdown(content: string): string {
	if (!content) return "";

	// Split into lines for processing
	const lines = content.split("\n");
	const processedLines: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Skip empty lines (will be handled as <br> tags)
		if (!line) {
			processedLines.push("<br>");
			continue;
		}

		// Headers
		if (line.startsWith("# ")) {
			processedLines.push(
				`<h1 class="text-2xl font-bold mb-2">${processInlineFormatting(line.slice(2))}</h1>`,
			);
		} else if (line.startsWith("## ")) {
			processedLines.push(
				`<h2 class="text-xl font-bold mb-2">${processInlineFormatting(line.slice(3))}</h2>`,
			);
		} else if (line.startsWith("### ")) {
			processedLines.push(
				`<h3 class="text-lg font-bold mb-2">${processInlineFormatting(line.slice(4))}</h3>`,
			);
		} else if (line.startsWith("#### ")) {
			processedLines.push(
				`<h4 class="text-base font-bold mb-2">${processInlineFormatting(line.slice(5))}</h4>`,
			);
		}

		// Blockquotes
		else if (line.startsWith("> ")) {
			processedLines.push(
				`<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">${processInlineFormatting(line.slice(2))}</blockquote>`,
			);
		}

		// Lists (basic implementation)
		else if (line.startsWith("- ") || line.startsWith("* ")) {
			processedLines.push(
				`<li class="ml-4">${processInlineFormatting(line.slice(2))}</li>`,
			);
		} else if (/^\d+\.\s/.test(line)) {
			const text = line.replace(/^\d+\.\s/, "");
			processedLines.push(
				`<li class="ml-4">${processInlineFormatting(text)}</li>`,
			);
		}

		// Code blocks (simple implementation)
		else if (line.startsWith("```")) {
			// This is a simplified code block handler
			processedLines.push(
				'<pre class="bg-gray-100 p-2 rounded text-sm font-mono">',
			);
		} else if (line === "```") {
			processedLines.push("</pre>");
		}

		// Regular paragraphs
		else {
			processedLines.push(
				`<p class="mb-2">${processInlineFormatting(line)}</p>`,
			);
		}
	}

	return processedLines.join("");
}

/**
 * Process inline formatting within a line of text
 */
function processInlineFormatting(text: string): string {
	return (
		text
			// Bold: **text** or __text__
			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			.replace(/__(.*?)__/g, "<strong>$1</strong>")

			// Italic: *text* or _text_
			.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
			.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>")

			// Code: `code`
			.replace(
				/`([^`]+)`/g,
				'<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
			)

			// Links: [text](url)
			.replace(
				/\[([^\]]+)\]\(([^)]+)\)/g,
				'<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
			)

			// Strikethrough: ~~text~~
			.replace(/~~(.*?)~~/g, "<del>$1</del>")
	);
}

/**
 * Strip all markdown formatting and return plain text
 */
export function stripMarkdown(content: string): string {
	if (!content) return "";

	return (
		content
			// Remove headers
			.replace(/^#{1,6}\s+/gm, "")

			// Remove bold and italic
			.replace(/\*\*(.*?)\*\*/g, "$1")
			.replace(/__(.*?)__/g, "$1")
			.replace(/\*(.*?)\*/g, "$1")
			.replace(/_(.*?)_/g, "$1")

			// Remove code
			.replace(/`([^`]+)`/g, "$1")

			// Remove links but keep text
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

			// Remove strikethrough
			.replace(/~~(.*?)~~/g, "$1")

			// Remove blockquotes
			.replace(/^>\s+/gm, "")

			// Remove list markers
			.replace(/^[-*+]\s+/gm, "")
			.replace(/^\d+\.\s+/gm, "")

			// Clean up whitespace
			.replace(/\n+/g, " ")
			.replace(/\s+/g, " ")
			.trim()
	);
}

/**
 * Count words in markdown content (excluding formatting)
 */
export function countWords(content: string): number {
	const plainText = stripMarkdown(content);
	if (!plainText) return 0;

	return plainText.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Count characters in markdown content (excluding formatting)
 */
export function countCharacters(content: string): number {
	const plainText = stripMarkdown(content);
	return plainText.length;
}

/**
 * Truncate markdown content to a specific length while preserving formatting
 */
export function truncateMarkdown(content: string, maxLength: number): string {
	if (!content || content.length <= maxLength) return content;

	// Simple truncation that tries to preserve word boundaries
	const truncated = content.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");

	if (lastSpace > maxLength * 0.8) {
		return `${truncated.substring(0, lastSpace)}...`;
	}

	return `${truncated}...`;
}

/**
 * Validate markdown content for common issues
 */
export function validateMarkdown(content: string): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!content) {
		return { isValid: true, errors, warnings };
	}

	// Check for unclosed formatting
	const boldCount = (content.match(/\*\*/g) || []).length;
	if (boldCount % 2 !== 0) {
		warnings.push("Unclosed bold formatting (**) detected");
	}

	const italicCount = (content.match(/(?<!\*)\*(?!\*)/g) || []).length;
	if (italicCount % 2 !== 0) {
		warnings.push("Unclosed italic formatting (*) detected");
	}

	const codeCount = (content.match(/`/g) || []).length;
	if (codeCount % 2 !== 0) {
		warnings.push("Unclosed code formatting (`) detected");
	}

	// Check for malformed links
	const linkPattern = /\[([^\]]*)\]\(([^)]*)\)/g;
	const links = content.match(linkPattern) || [];

	for (const link of links) {
		const match = link.match(/\[([^\]]*)\]\(([^)]*)\)/);
		if (match) {
			const [, text, url] = match;

			if (!text.trim()) {
				warnings.push("Empty link text detected");
			}

			if (!url.trim()) {
				warnings.push("Empty link URL detected");
			}

			// Basic URL validation
			if (url && !url.match(/^(https?:\/\/|mailto:|tel:|#)/)) {
				warnings.push(`Potentially invalid URL: ${url}`);
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Convert markdown to a preview format suitable for component thumbnails
 */
export function createMarkdownPreview(
	content: string,
	maxLength = 100,
): string {
	const plainText = stripMarkdown(content);

	if (!plainText) return "Click to edit text";

	if (plainText.length <= maxLength) return plainText;

	return truncateMarkdown(plainText, maxLength);
}

/**
 * Escape HTML characters in text to prevent XSS
 */
export function escapeHtml(text: string): string {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Sanitize markdown content for safe rendering
 */
export function sanitizeMarkdown(content: string): string {
	if (!content) return "";

	// First escape any existing HTML
	const escaped = escapeHtml(content);

	// Then apply markdown processing
	return processInlineMarkdown(escaped);
}
