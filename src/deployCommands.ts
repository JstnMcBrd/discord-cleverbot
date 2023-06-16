/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 */

import { Client } from "discord.js";
import type { ApplicationCommandDataResolvable } from "discord.js";

import { getCommandHandlers } from "./commands/index.js";
import { getToken, load as loadEnv } from "./memory/env.js";
import { debug, error, info } from "./logger.js";

// Load environment variables
loadEnv();
const token = getToken();

// Get the JSON data of the commands
info("Retrieving commands...");
const commandJSONs: ApplicationCommandDataResolvable[] = [];
getCommandHandlers().forEach(command => {
	debug(`\t/${command.name}`);
	commandJSONs.push(command.toJSON());
});

// Setup client
const client = new Client({ intents: [] });
client.on("error", error);
client.once("ready", async c => {
	debug(`\tUser: ${c.user.username} (${c.user.id})`);

	info("Deploying commands...");
	await c.application.commands.set(commandJSONs);

	info("Logging out...");
	c.destroy();
});

// Login
info("Logging in...");
void client.login(token).catch(error);
