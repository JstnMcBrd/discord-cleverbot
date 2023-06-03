import type { Client, Message } from "discord.js";

import type { EventHandler } from "../@types/EventHandler.js";
import * as logger from "../logger.js";
import { logEventError } from "./index.js";
import { messageCreate } from "./messageCreate.js";
import { populate as populateWhitelist, getWhitelist } from "../memory/whitelist.js";
import { isFromUser } from "../helpers/messageAnalyzer.js";
import { start as manageActivity } from "../helpers/activityManager.js";
import { generateContext, getContext } from "../memory/context.js";

/**
 * How often to look for missed messages (in seconds).
 */
const missedMessageSearchFrequency = 30 * 60;

export const ready: EventHandler<"ready"> = {
	name: "ready",
	once: true,
	async execute(client: Client) {
		try {
			await onceReady(client);
		}
		catch (error) {
			logEventError(this.name, error);
		}
	},
};

/**
 * Called once the client successfully logs in.
 */
async function onceReady(client: Client): Promise<void> {
	logger.info("Client ready");
	logger.info();

	manageActivity(client);

	await populateWhitelist(client);
	await initializeContext(client);
	resumeConversations(client);
}

/**
 * // TODO
 */
async function initializeContext(client: Client) {
	for (const channel of getWhitelist()) {
		await generateContext(client, channel);
	}
}

/**
 * Searchs for unread messages in whitelisted channels that were sent when the bot was offline, and responds to them.
 */
function resumeConversations(client: Client): void {
	logger.info("Searching for missed messages...");

	const toRespondTo: Message[] = [];
	for (const channel of getWhitelist()) {
		// Get the context
		const context = getContext(channel);
		if (!context) continue;

		// Get the last message
		const lastMessage = context.at(context.length - 1);
		if (!lastMessage) continue;

		// If the last message isn't from the bot, then respond to it
		if (!isFromUser(lastMessage, client.user)) {
			toRespondTo.push(lastMessage);
		}
	}

	// Respond to missed messages
	if (toRespondTo.length !== 0) {
		logger.info(`\tFound ${toRespondTo.length} missed messages`);
		logger.info("\tForwarding messages to message handler");
		logger.info();
		toRespondTo.forEach(message => void messageCreate.execute(message));
	}

	// Check for missed messages at regular intervals
	setTimeout(() => void resumeConversations(client), missedMessageSearchFrequency * 1000);
	logger.info(`Searching again in ${missedMessageSearchFrequency} seconds`);
	logger.info();
}
