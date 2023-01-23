import { CategoryChannel, Client, PartialGroupDMChannel, StageChannel } from "discord.js";

import type { EventHandler } from "../@types/EventHandler";
import * as logger from "../logger";
import { logEventError } from "./";
import { messageCreate } from "./messageCreate";
import { verify as verifyWhitelist, getWhitelist } from "../memory/whitelist";
import { isMarkedAsIgnore, isEmpty, isFromUser } from "../helpers/messageAnalyzer";
import { start as manageActivity } from "../activityManager";

/**
 * How often to look for missed messages (in seconds).
 */
const missedMessageSearchFrequency = 30 * 60;

/**
 * How many messages back to look when searching for missed messages.
 */
const missedMessageSearchDepth = 10;

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

	// Unlike setUserActivity and resumeConversations, verifyWhitelist will not repeat after startup
	await verifyWhitelist(client);

	await resumeConversations(client);
}

/**
 * Searchs for unread messages in whitelisted channels that were sent when the bot was offline, and responds to them.
 */
async function resumeConversations(client: Client): Promise<void> {
	// Verify the whitelist first every time
	// TODO This is a temporary solution
	await verifyWhitelist(client);

	logger.info("Searching for missed messages...");
	const toRespondTo = [];
	for (const channelID of getWhitelist()) {

		// Fetch the channel
		const channel = await client.channels.fetch(channelID);

		if (!channel) continue;
		if (channel instanceof CategoryChannel) continue;
		if (channel instanceof StageChannel) continue;
		if (channel instanceof PartialGroupDMChannel) continue;

		// Request the most recent messages of the channel
		const messagesMap = await channel.messages.fetch({ limit: missedMessageSearchDepth });

		// Convert map to array
		const messages = messagesMap.first(messagesMap.size);

		if (!messages) continue;
		if (!(messages instanceof Array)) continue;

		// Search for messages that haven't been replied to
		for (const message of messages) {
			if (isEmpty(message) || isMarkedAsIgnore(message)) continue;
			if (!client.user || !isFromUser(message, client.user)) toRespondTo.push(message);
			break;
		}
	}
	if (toRespondTo.length !== 0) {
		logger.info(`\tFound ${toRespondTo.length} missed messages`);
	}

	// Respond to missed messages
	if (toRespondTo.length !== 0) {
		logger.info("\tForwarding messages to message handler");
		logger.info();
		toRespondTo.forEach(message => void messageCreate.execute(message));
	}

	// Check for missed messages at regular intervals
	setTimeout(() => void resumeConversations(client), missedMessageSearchFrequency * 1000, client);
	logger.info(`Searching again in ${missedMessageSearchFrequency} seconds`);
	logger.info();
}
