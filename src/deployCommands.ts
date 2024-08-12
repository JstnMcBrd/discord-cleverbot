/*
 * A simple and lightweight script to deploy slash commands to Discord.
 * Only needs to be run when commands are updated.
 */

import { Client } from 'discord.js';

import { getCommandHandlers } from './commands/index.js';
import { getToken, load as loadEnv } from './memory/env.js';
import { debug, error, info } from './logger.js';

async function deployCommands(c: Client<true>): Promise<void> {
	debug(`\tUser: ${c.user.username} (${c.user.id})`);

	info('Deploying commands...');
	await c.application.commands.set(commandJSONs);

	info('Logging out...');
	await c.destroy();
}

// Load environment variables
loadEnv();
const token = getToken();

// Get the JSON data of the commands
info('Retrieving commands...');
const commandHandlers = Array.from(getCommandHandlers().values());
const commandJSONs = commandHandlers.map(command => command.toJSON());
commandHandlers.forEach((command) => {
	debug(`\t${command.getSlashName()}`);
});

// Setup client
const client = new Client({ intents: [] });
client.on('error', error);
client.once('ready', c => void deployCommands(c));

// Login
info('Logging in...');
await client.login(token);
