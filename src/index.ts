/* Discord-Cleverbot */
// TODO find a typescript-safe way to load in the token

import fs from "node:fs";
import { Client, Partials, GatewayIntentBits } from "discord.js";

import { registerEventHandlers } from "./events";
import * as logger from "./logger";
import { setAccount as setWhitelistAccount } from "./whitelistManager";

/* Validate input */

const accountName = process.argv[2];

if (accountName === undefined) {
	logger.warn("usage: npm start [ACCOUNT NAME]");
	process.exit(1);
}

const filePath = `../accounts/${accountName}`;

if (!fs.existsSync(filePath)) {
	logger.error(`Invalid account name: ${accountName}`);
	logger.error("Account directory does not exist");
	process.exit(1);
}

const configFilePath = `${filePath}/config.json`;
const whitelistFilePath = `${filePath}/whitelist.json`;

if (!fs.existsSync(configFilePath) || !fs.existsSync(whitelistFilePath)) {
	logger.error(`Invalid account name: ${accountName}`);
	logger.error("Account directory does not contain necessary memory files");
	process.exit(1);
}

/* Setup client and whitelist */

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

setWhitelistAccount(accountName);

/* Login */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { token }: { token: string } = require(configFilePath);

void connect(token);

/* Methods */

/**
 * Connects the client with the discord API
 */
async function connect(authToken: string): Promise<void> {
	// How long to wait before trying again (seconds)
	const retryWait = 10;

	logger.info("Logging in...");
	try {
		await client.login(authToken);
	}
	catch (error) {
		logger.error(error);
		logger.warn(`Retrying connection in ${retryWait} seconds...`);
		logger.error();

		// Use connect() function again
		setTimeout(() => connect, retryWait * 1000);
		return;
	}
	logger.info();
}
