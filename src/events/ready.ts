import type { Client, Message } from "discord.js";

import type { EventHandler } from "../@types/EventHandler.js";
import { info } from "../logger.js";
import { logEventError } from "./index.js";
import { messageCreate } from "./messageCreate.js";
import { populate as populateWhitelist, getWhitelist } from "../memory/whitelist.js";
import { isFromUser } from "../helpers/messageAnalyzer.js";
import { start as manageActivity } from "../helpers/activityManager.js";
import { generateContext, getContext, removeLastMessageFromContext } from "../memory/context.js";

/**
 * How often to refresh the state (in seconds).
 */
const refreshStateFrequency = 1 * 60 * 60;

export const ready: EventHandler<"ready"> = {
	name: "ready",
	once: true,
	async execute (client: Client) {
		try {
			await onceReady(client);
		}
		catch (error) {
			logEventError(ready.name, error);
		}
	},
};

/**
 * Called once the client successfully logs in.
 */
async function onceReady (client: Client): Promise<void> {
	info("Client ready");
	info();

	manageActivity(client);

	await refreshState(client);
}

/**
 * Completely refreshes the state of the bot. Is intended to have a similar effect to restarting.
 * Generates (or re-generates) all local memory and caches.
 *
 * This helps the bot recover from anomalies, such as channel permissions changing,
 * bugs in context updates, missing messages during Discord API outages, or crashes.
 *
 * This method will automatically repeat itself on a regular basis.
 */
async function refreshState (client: Client): Promise<void> {
	info("Refreshing state...");

	await refreshWhitelist(client);
	await refreshContext(client);
	resumeConversations(client);

	// Refresh the state at regular intervals
	setTimeout(() => void refreshState(client), refreshStateFrequency * 1000);
	info(`Refreshing again in ${refreshStateFrequency} seconds`);
}

/**
 * Populates (or re-populates) the whitelist from a list of channel IDs from memory.
 */
async function refreshWhitelist (client: Client): Promise<void> {
	info("\tRefreshing whitelist channels...");
	await populateWhitelist(client);
}

/**
 * Generates (or re-generates) context for every whitelisted channel.
 */
async function refreshContext (client: Client): Promise<void> {
	info("\tRefreshing context...");

	for (const channel of getWhitelist()) {
		await generateContext(channel, client);
	}
}

/**
 * Searchs for unread messages in whitelisted channels and responds to them.
 */
function resumeConversations (client: Client): void {
	info("\tSearching for missed messages...");

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
		if (!isFromUser(lastMessage, client.user)) {
			toRespondTo.push(lastMessage);
		}
	});

	// Respond to missed messages
	if (toRespondTo.length !== 0) {
		info(`\t\tFound ${toRespondTo.length} missed messages`);
		info("\t\tForwarding messages to message handler");
		info();
		toRespondTo.forEach(message => {
			removeLastMessageFromContext(message.channel);
			void messageCreate.execute(message);
		});
	}
}
