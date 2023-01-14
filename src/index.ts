/* Discord-Cleverbot */
// TODO make typescript-safe

import fs from "node:fs";
import { Client, Partials, GatewayIntentBits } from "discord.js";

import * as logger from "./helpers/logger";
import { registerEventHandlers } from "./events";
import { setAccount as setWhitelistAccount } from "./whitelist-manager.js";

logger.info("Initializing client");

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

logger.info("Initialized client successfully");
logger.info();

// Register the event handlers with the client
registerEventHandlers(client);

// Load memory files
logger.info("Loading memory files");

// Was login info provided?
if (process.argv[2] === undefined) {
	const error = new Error();
	error.name = "Missing Command-line Argument";
	error.message = "Account directory name not provided";
	error.message += "\n\tPlease follow this usage:";
	error.message += "\n\tnode index.js [ACCOUNT DIRECTORY NAME]";
	logger.error(error);
	process.exit(1);
}
const filePath = `../accounts/${process.argv[2]}`;
const configFilePath = `${filePath}/config.json`;
const whitelistFilePath = `${filePath}/whitelist.json`;

// Does the necessary directory exist?
if (!fs.existsSync(filePath)) {
	const error = new Error();
	error.name = "Missing Account Directory";
	error.message = "Account directory does not exist";
	error.message += `\n\tPlease create a directory (${filePath}) to contain the account's memory files`;
	logger.error(error);
	process.exit(1);
}

// Do the necessary files exist?
if (!fs.existsSync(configFilePath) || !fs.existsSync(whitelistFilePath)) {
	const error = new Error();
	error.name = "Missing Memory Files";
	error.message = "Account directory missing essential memory files";
	error.message += `\n\tPlease create the necessary files (${configFilePath}) (${whitelistFilePath})`;
	logger.error(error);
	process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { token } = require(configFilePath);
setWhitelistAccount(process.argv[2]);

logger.info("Loaded memory files successfully");
logger.info();

// Let's begin
// Connects the client with the discord API
function connect(): void {
	// How long to wait before trying again (seconds)
	const retryWait = 10;

	logger.info("Logging in");
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	client.login(token).then(() => {
		logger.info("Logged in successfully");
		logger.info();
	}).catch(error => {
		logger.error(error);
		logger.warn(`Retrying connection in ${retryWait} seconds...`);
		logger.info();
		// Use connect() function again
		setTimeout(connect, retryWait * 1000);
	});
}
connect();
