/**
 * Replaces unknown discord emojis with the name of the emoji as *emphasized* text to avoid confusing the Cleverbot AI
 */
export function replaceUnknownEmojis(content: string): string {
	// Start with custom emojis
	content = content.replaceAll(/<:[\w\W][^:\s]+:\d+>/g, match => {
		match = match.replace("<:", "");
		match = match.replace(/:\d+>/g, "");
		match = match.replace("_", " ");
		return `*${match}*`;
	});
	// Now replace any unknown emojis that aren't custom
	content = content.replaceAll(":", "*").replaceAll("_", " ");
	return content;
}
