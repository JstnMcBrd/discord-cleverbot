import type { Client, Message, OmitPartialGroupDMChannel } from 'discord.js';

import { messageCreate } from './events/messageCreate.js';
import { isFromSelf } from './utils/messageAnalysis.js';
import { generateContext, getContext, removeLastMessageFromContext } from './memory/context.js';
import { load as loadWhitelist, getWhitelist } from './memory/whitelist.js';
import { info } from './logger.js';

/** How often to refresh (in seconds). */
const refreshFrequency = 1 * 60 * 60;

/**
 * Completely initializes (or re-initializes) the bot's internal state. Intended to have a similar
 * effect to restarting. Generates (or re-generates) all local memory and caches.
 *
 * This helps the bot recover from anomalies, such as channel permissions changing, bugs in context
 * updates, missing messages during Discord API outages, or crashes.
 *
 * This process will automatically repeat itself regularly.
 *
 * @param client The current logged-in client
 */
export async function refresh(client: Client<true>): Promise<void> {
	async function update(): Promise<void> {
		info('Refreshing...');

		// Validate the whitelist
		await loadWhitelist(client);

		// Update context for all whitelisted channels (in parallel)
		await Promise.all(
			getWhitelist().map(generateContext),
		);

		// Follow-up on any missed messages
		resumeConversations();
	}

	// Do now
	await update();
	// Then repeat
	setInterval(() => void update(), refreshFrequency * 1000);
}

/**
 * Searchs for unread messages in whitelisted channels and responds to them.
 */
function resumeConversations(): void {
	for (const channel of getWhitelist()) {
		// Get the context
		const context = getContext(channel);
		if (!context) {
			continue;
		}

		// Get the last message
		const lastMessage = context.at(context.length - 1);
		if (!lastMessage) {
			continue;
		}

		// Check who it is from
		if (isFromSelf(lastMessage)) {
			continue;
		}

		// If the last message is from another user, respond to it
		removeLastMessageFromContext(lastMessage.channel);
		void messageCreate.execute(lastMessage as OmitPartialGroupDMChannel<Message>);
	}
}
