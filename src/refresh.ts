import type { Client, Message } from "discord.js";

import { messageCreate } from "./events/messageCreate.js";
import { isFromSelf } from "./utils/messageAnalysis.js";
import { generateContext, getContext, removeLastMessageFromContext } from "./memory/context.js";
import { load as loadWhitelist, getWhitelist } from "./memory/whitelist.js";
import { info } from "./logger.js";

/** How often to refresh (in seconds). */
const refreshFrequency = 1 * 60 * 60;

/**
 * Completely initializes (or re-initializes) the bot's internal state. Intended to have a similar
 * effect to restarting. Generates (or re-generates) all local memory and caches.
 *
 * This helps the bot recover from anomalies, such as channel permissions changing, bugs in context
 * updates, missing messages during Discord API outages, or crashes.
 *
 * This method will automatically repeat itself on a regular basis.
 *
 * @param client The current logged-in client
 */
export async function refresh (client: Client<true>): Promise<void> {
	info("Refreshing...");

	// Validate the whitelist
	await loadWhitelist(client);

	// Update context for all whitelisted channels (in parallel)
	await Promise.all(
		getWhitelist().map(
			async channel => await generateContext(channel),
		),
	);

	// Follow-up on any missed messages
	resumeConversations();

	// Repeat at regular intervals
	setTimeout(() => void refresh(client), refreshFrequency * 1000);
}

/**
 * Searchs for unread messages in whitelisted channels and responds to them.
 *
 * @param client The current logged-in client
 */
function resumeConversations (): void {
	const toRespondTo: Message[] = [];
	getWhitelist().forEach(channel => {
		// Get the context
		const context = getContext(channel);
		if (!context) {
			return;
		}

		// Get the last message
		const lastMessage = context.at(context.length - 1);
		if (!lastMessage) {
			return;
		}

		// If the last message isn't from the bot, then respond to it
		if (!isFromSelf(lastMessage)) {
			toRespondTo.push(lastMessage);
		}
	});

	// Respond to missed messages
	toRespondTo.forEach(message => {
		removeLastMessageFromContext(message.channel);
		void messageCreate.execute(message);
	});
}
