/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 *
 * Usage: node deploy-commands.js [account name]
 *
 * // TODO make this file typescript-safe
*/

import type { ApplicationCommandDataResolvable } from "discord.js";
import { Client } from "discord.js";

import * as logger from "./helpers/logger";
import { getCommandHandlers } from "./commands";

// Verify input
function usage(): void {
	logger.error("Usage: node deploy-commands.js [account name]");
}
if (process.argv[2] === undefined) {
	usage();
	process.exit(1);
}
const account = process.argv[2];

// Import auth token
const authFilePath = `../accounts/${account}/config.json`;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { token } = require(authFilePath);

// Get the JSON data of the commands
const commandJSONs: Array<ApplicationCommandDataResolvable> = [];
getCommandHandlers().forEach(command => {
	commandJSONs.push(command.toJSON());
	logger.info(`Retrieved /${command.name}`);
});

// Log in to the Client
const client = new Client({ intents: [] });
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
