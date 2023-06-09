/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
*/

import { Client } from "discord.js";
import type { ApplicationCommandDataResolvable } from "discord.js";

import { getCommandHandlers } from "./commands/index.js";
import { getToken, load as loadEnv } from "./memory/env.js";
import { error, info } from "./logger.js";

// Import token
loadEnv();
const token = getToken();

// Get the JSON data of the commands
const commandJSONs: ApplicationCommandDataResolvable[] = [];
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
