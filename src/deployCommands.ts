/*
 * A simple and lightweight script to deploy slash commands to Discord.
 * Only needs to be run when commands are updated.
 */

import { Client } from 'discord.js';

import { getCommandHandlers } from './commands/index.js';
import { getToken } from './memory/env.js';
import { debug, error, info } from './logger.js';

// Get the JSON data of the commands
info('Retrieving commands...');
const commandHandlers = Array.from(getCommandHandlers().values());
const commandJSONs = commandHandlers.map(command => command.toJSON());
commandHandlers.forEach((command) => {
	debug(`\t${command.getSlashName()}`);
});

// Setup client
const client = new Client<false>({ intents: [] });
client.on('error', error);
client.once('ready', client => void (async function () {
	debug(`\tUser: ${client.user.username} (${client.user.id})`);

	info('Deploying commands...');
	await client.application.commands.set(commandJSONs);

	info('Logging out...');
	await client.destroy();
})());

// Login
const token = getToken();
info('Logging in...');
await client.login(token);
