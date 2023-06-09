/* discord-cleverbot */

import { Client, Partials, GatewayIntentBits } from "discord.js";

import { registerEventHandlers } from "./events/index.js";
import { getToken, load as loadEnv } from "./memory/env.js";
import { error, info, warn } from "./logger.js";

/**
 * How long to wait before retrying a failed Discord API connection attempt (in seconds).
 */
const connectionRetryWait = 10;

/* Load environment variables */

loadEnv();

/* Setup client */

const client = new Client({
	partials: [
		// Necessary to receive DMs
		Partials.Channel,
	],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
	],
});

registerEventHandlers(client);

/* Login */

const token = getToken();
void connect(token);

/* Methods */

/**
 * Connects the client with the discord API
 */
async function connect (authToken: string): Promise<void> {
	info("Logging in...");
	try {
		await client.login(authToken);
	}
	catch (err) {
		error(err);

		// Use connect() function again
		setTimeout(() => void connect(authToken), connectionRetryWait * 1000);
		warn(`Retrying connection in ${connectionRetryWait} seconds...`);
	}
	info();
}
