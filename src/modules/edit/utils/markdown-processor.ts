

export function processInlineMarkdown(content: string): string {
	if (!content) return "";

	const singleLine = content
		.replace(/\n+/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	return (
		singleLine

			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			.replace(/__(.*?)__/g, "<strong>$1</strong>")

			.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
			.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>")

			.replace(
				/`([^`]+)`/g,
				'<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
			)

			.replace(
				/\[([^\]]+)\]\(([^)]+)\)/g,
				'<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
			)

			.replace(/~~(.*?)~~/g, "<del>$1</del>")
	);
}

export function processBlockMarkdown(content: string): string {
	if (!content) return "";

	const lines = content.split("\n");
	const processedLines: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (!line) {
			processedLines.push("<br>");
			continue;
		}

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

		else if (line.startsWith("> ")) {
			processedLines.push(
				`<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">${processInlineFormatting(line.slice(2))}</blockquote>`,
			);
		}

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

		else if (line.startsWith("```")) {

			processedLines.push(
				'<pre class="bg-gray-100 p-2 rounded text-sm font-mono">',
			);
		} else if (line === "```") {
			processedLines.push("</pre>");
		}

		else {
			processedLines.push(
				`<p class="mb-2">${processInlineFormatting(line)}</p>`,
			);
		}
	}

	return processedLines.join("");
}

function processInlineFormatting(text: string): string {
	return (
		text

			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			.replace(/__(.*?)__/g, "<strong>$1</strong>")

			.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
			.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>")

			.replace(
				/`([^`]+)`/g,
				'<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
			)

			.replace(
				/\[([^\]]+)\]\(([^)]+)\)/g,
				'<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
			)

			.replace(/~~(.*?)~~/g, "<del>$1</del>")
	);
}

export function stripMarkdown(content: string): string {
	if (!content) return "";

	return (
		content

			.replace(/^#{1,6}\s+/gm, "")

			.replace(/\*\*(.*?)\*\*/g, "$1")
			.replace(/__(.*?)__/g, "$1")
			.replace(/\*(.*?)\*/g, "$1")
			.replace(/_(.*?)_/g, "$1")

			.replace(/`([^`]+)`/g, "$1")

			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

			.replace(/~~(.*?)~~/g, "$1")

			.replace(/^>\s+/gm, "")

			.replace(/^[-*+]\s+/gm, "")
			.replace(/^\d+\.\s+/gm, "")

			.replace(/\n+/g, " ")
			.replace(/\s+/g, " ")
			.trim()
	);
}

export function countWords(content: string): number {
	const plainText = stripMarkdown(content);
	if (!plainText) return 0;

	return plainText.split(/\s+/).filter((word) => word.length > 0).length;
}

export function countCharacters(content: string): number {
	const plainText = stripMarkdown(content);
	return plainText.length;
}

export function truncateMarkdown(content: string, maxLength: number): string {
	if (!content || content.length <= maxLength) return content;

	const truncated = content.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");

	if (lastSpace > maxLength * 0.8) {
		return `${truncated.substring(0, lastSpace)}...`;
	}

	return `${truncated}...`;
}

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

export function createMarkdownPreview(
	content: string,
	maxLength = 100,
): string {
	const plainText = stripMarkdown(content);

	if (!plainText) return "Click to edit text";

	if (plainText.length <= maxLength) return plainText;

	return truncateMarkdown(plainText, maxLength);
}

export function escapeHtml(text: string): string {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

export function sanitizeMarkdown(content: string): string {
	if (!content) return "";

	const escaped = escapeHtml(content);

	return processInlineMarkdown(escaped);
}
