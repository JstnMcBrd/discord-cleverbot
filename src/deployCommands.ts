/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 *
 * Usage: node deploy-commands.js [account name]
*/

import type { ApplicationCommandDataResolvable } from "discord.js";
import { Client } from "discord.js";

import { error, info } from "./logger.js";
import { getToken, loadFrom as loadConfigFrom } from "./memory/config.js";
import { getCommandHandlers } from "./commands/index.js";

// Verify input
function usage(): void {
	error("Usage: node deploy-commands.js [account name]");
}
if (process.argv[2] === undefined) {
	usage();
	process.exit(1);
}
const accountName = process.argv[2];

// Import auth token
loadConfigFrom(accountName);
const token = getToken();

// Get the JSON data of the commands
const commandJSONs: Array<ApplicationCommandDataResolvable> = [];
getCommandHandlers().forEach(command => {
	commandJSONs.push(command.toJSON());
	info(`Retrieved /${command.name}`);
});

// Log in to the Client
const client = new Client({ intents: [] });
client.login(token)
	.then(() => info("Client logged in"))
	.catch(error);

// Register the commands with Discord
client.once("ready", async c => {
	const data = await c.application.commands.set(commandJSONs);
	info(`Successfully deployed ${data.size} application commands`);

	// Make sure to log out
	info("Client logging out...");
	c.destroy();
});
