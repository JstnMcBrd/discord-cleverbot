/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 */

import { Client } from "discord.js";
import type { ApplicationCommandDataResolvable } from "discord.js";

import { getCommandHandlers } from "./commands/index.js";
import { getToken, load as loadEnv } from "./memory/env.js";

// Load environment variables
loadEnv();
const token = getToken();

// Get the JSON data of the commands
const commandJSONs: ApplicationCommandDataResolvable[] = [];
getCommandHandlers().forEach(command => {
	commandJSONs.push(command.toJSON());
});

// Log in to the Client
const client = new Client({ intents: [] });
void client.login(token);

// Register the commands with Discord
client.once("ready", async c => {
	await c.application.commands.set(commandJSONs);
	// Make sure to log out
	c.destroy();
});
