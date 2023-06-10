/** discord-cleverbot */

import { Client, Partials, GatewayIntentBits } from "discord.js";

import { registerEventHandlers } from "./events/index.js";
import { getToken, load as loadEnv } from "./memory/env.js";

/** How long to wait before retrying a failed Discord API connection attempt (in seconds). */
const connectionRetryWait = 10;

// Load environment variables
loadEnv();
const token = getToken();

// Setup client
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

// Login
void connect(token);

/**
 * Connects the client with the discord API
 *
 * @param authToken The authorization to use to log in
 */
async function connect (authToken: string): Promise<void> {
	try {
		await client.login(authToken);
	}
	catch (err) {
		// Use connect() function again
		setTimeout(() => void connect(authToken), connectionRetryWait * 1000);
	}
}
