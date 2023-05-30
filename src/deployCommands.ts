/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 *
 * Usage: node deploy-commands.js [account name]
*/

import type { ApplicationCommandDataResolvable } from "discord.js";
import { Client } from "discord.js";

import * as logger from "./logger.js";
import { getToken, setAccount as setConfigAccount } from "./memory/config.js";
import { getCommandHandlers } from "./commands/index.js";

// Verify input
function usage(): void {
	logger.error("Usage: node deploy-commands.js [account name]");
}
if (process.argv[2] === undefined) {
	usage();
	process.exit(1);
}
const accountName = process.argv[2];

// Import auth token
setConfigAccount(accountName);
const token = getToken();

// Get the JSON data of the commands
const commandJSONs: Array<ApplicationCommandDataResolvable> = [];
getCommandHandlers().forEach(command => {
	commandJSONs.push(command.toJSON());
	logger.info(`Retrieved /${command.name}`);
});

// Log in to the Client
const client = new Client({ intents: [] });
client.login(token)
	.then(() => logger.info("Client logged in"))
	.catch((error) => logger.error(error));

// Register the commands with Discord
client.once("ready", async c => {
	const data = await c.application.commands.set(commandJSONs);
	logger.info(`Successfully deployed ${data.size} application commands`);

	// Make sure to log out
	logger.info("Client logging out...");
	c.destroy();
});
