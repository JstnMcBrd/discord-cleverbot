/* Discord-Cleverbot */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { Client, Partials, GatewayIntentBits } from "discord.js";

import { registerEventHandlers } from "./events";
import * as logger from "./logger";
import { getToken, setAccount as setConfigAccount } from "./memory/config";
import { setAccount as setWhitelistAccount } from "./memory/whitelist";

/**
 * How long to wait before retrying a failed Discord API connection attempt (in seconds).
 */
const connectionRetryWait = 10;


/* Validate input */

const accountName = process.argv[2];

if (accountName === undefined) {
	logger.warn("usage: npm start [ACCOUNT NAME]");
	process.exit(1);
}

const filePath = join("..", "accounts", accountName);

if (!existsSync(filePath)) {
	logger.error(`Invalid account name: ${accountName}`);
	logger.error("Account directory does not exist");
	process.exit(1);
}

const configFilePath = join(filePath, "config.json");
const whitelistFilePath = join(filePath, "whitelist.json");

if (!existsSync(configFilePath) || !existsSync(whitelistFilePath)) {
	logger.error(`Invalid account name: ${accountName}`);
	logger.error("Account directory does not contain necessary memory files");
	process.exit(1);
}

/* Load memory files */

setConfigAccount(accountName);
setWhitelistAccount(accountName);

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
async function connect(authToken: string): Promise<void> {
	logger.info("Logging in...");
	try {
		await client.login(authToken);
	}
	catch (error) {
		logger.error(error);

		// Use connect() function again
		setTimeout(() => void connect(authToken), connectionRetryWait * 1000);
		logger.warn(`Retrying connection in ${connectionRetryWait} seconds...`);
	}
	logger.info();
}
