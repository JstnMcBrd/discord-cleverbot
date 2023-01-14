/**
 * Replaces @ mentions of the user with 'Cleverbot' to avoid confusing the Cleverbot AI
 */
export function replaceMentions(username: string, content: string): string {
	return content.replaceAll(`@${username}`, "Cleverbot");
}
