/* discord-cleverbot */

import { existsSync } from "node:fs";
import { join } from "node:path";

import { Client, Partials, GatewayIntentBits } from "discord.js";

import { registerEventHandlers } from "./events/index.js";
import { getCurrentDirectory } from "./helpers/getCurrentDirectory.js";
import { getToken, loadFrom as loadConfigFrom } from "./memory/config.js";
import { loadFrom as loadWhitelistFrom } from "./memory/whitelist.js";
import { error, info, warn } from "./logger.js";

/**
 * How long to wait before retrying a failed Discord API connection attempt (in seconds).
 */
const connectionRetryWait = 10;


/* Validate input */

const accountName = process.argv[2];

if (accountName === undefined) {
	warn("usage: npm start [ACCOUNT NAME]");
	process.exit(1);
}

const filePath = join(getCurrentDirectory(import.meta.url), "..", "accounts", accountName);

if (!existsSync(filePath)) {
	error(`Invalid account name: ${accountName}`);
	error("Account directory does not exist");
	process.exit(1);
}

const configFilePath = join(filePath, "config.json");
const whitelistFilePath = join(filePath, "whitelist.json");

if (!existsSync(configFilePath) || !existsSync(whitelistFilePath)) {
	error(`Invalid account name: ${accountName}`);
	error("Account directory does not contain necessary memory files");
	process.exit(1);
}

/* Load memory files */

loadConfigFrom(accountName);
loadWhitelistFrom(accountName);

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
