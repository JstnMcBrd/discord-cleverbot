/* Discord-Cleverbot */

const logger = require("./helpers/logger");

logger.info("Importing packages");

// Load in all the required packages
const fs = require("node:fs");
const { Client, Partials, GatewayIntentBits } = require("discord.js");

const { setEventHandlers } = require("./events");
const { setAccount: setWhitelistAccount } = require("./whitelist-manager.js");

// Create a discord client and give it helper functions and values
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

// Executes the code for a particular handler without needing to receive the event
client.executeEvent = async function(eventName, ...args) {
	const event = client.events.get(eventName);
	if (!event) throw new Error(`Could not find handler for event '${eventName}'`);

	return await event.execute(client, ...args);
};

logger.info("Imported packages successfully");
logger.info();

// Retrieve the event handler files and give them to the client
setEventHandlers(client);

// Load memory files
logger.info("Loading memory files");

// Was login info provided?
if (process.argv[2] === undefined) {
	const error = new Error();
	error.name = "Missing Command-line Argument";
	error.message = "Account directory name not provided";
	error.message += "\n\tPlease follow this usage:";
	error.message += "\n\tnode index.js " + "[ACCOUNT DIRECTORY NAME]".underline;
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

const { token } = require(configFilePath);
setWhitelistAccount(process.argv[2]);

logger.info("Loaded memory files successfully");
logger.info();

// Let's begin
// Connects the client with the discord API
const connect = function() {
	// How long to wait before trying again (seconds)
	const retryWait = 10;

	logger.info("Logging in");
	client.login(token).then(() => {
		logger.info("Logged in successfully");
		logger.info();
	}).catch(error => {
		logger.error(error);
		logger.warn(`Retrying connection in ${retryWait} seconds...`);
		logger.log();
		// Use connect() function again
		setTimeout(connect, retryWait * 1000);
	});
}; connect();
