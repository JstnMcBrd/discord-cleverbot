import { exit } from 'node:process';

import type { Client } from 'discord.js';

import type { CommandHandler } from './CommandHandler.js';
import { help } from './help.js';
import { invite } from './invite.js';
import { unwhitelist } from './unwhitelist.js';
import { whitelist } from './whitelist.js';
import { error } from '../logger.js';
import { areCommandsInSync } from '../utils/areCommandsInSync.js';

/** The list of all command handlers. */
const commandHandlers = new Map<string, CommandHandler>();

addCommandHandler(help);
addCommandHandler(invite);
addCommandHandler(unwhitelist);
addCommandHandler(whitelist);

/**
 * Add the given command handler to the list of command handlers.
 *
 * @param command The command to add to the list
 * @throws If there is already a handler with the same command name in the list
 */
function addCommandHandler(command: CommandHandler): void {
	const name = command.name;

	if (commandHandlers.has(name)) {
		throw new Error(`Failed to add command '${name}' because a command with that name already exists.`);
	}
	commandHandlers.set(name, command);
}

/**
 * @returns A read-only map of the command handlers
 */
export function getCommandHandlers(): ReadonlyMap<string, CommandHandler> {
	return commandHandlers;
}

/**
 * @returns The handler with the given command name, or undefined
 */
export function getCommandHandler(name: string): CommandHandler | undefined {
	return commandHandlers.get(name);
}

/**
 * Fetches deployed commands from the client application and verifies they match the commands
 * stored locally, and sets the command IDs of each of the command handlers.
 *
 * @param client The current logged-in client
 * @exits If the deployed commands are outdated
 */
export async function syncCommands(client: Client<true>): Promise<void> {
	const result = await client.application.commands.fetch();

	const deployedCommands = Array.from(result.values());
	const localCommands = Array.from(getCommandHandlers().values());

	if (!areCommandsInSync(deployedCommands, localCommands)) {
		error('Deployed commands are outdated. Please run the deployment script to update them.');
		exit(1);
	}

	for (const command of deployedCommands) {
		getCommandHandler(command.name)?.setId(command.id);
	}
}
