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
	if (commandHandlers.has(command.name)) {
		throw new TypeError(`Failed to add command '${command.name}' because a command with that name already exists.`);
	}

	commandHandlers.set(command.name, command);
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
 */
export async function syncCommands(client: Client<true>): Promise<void> {
	const result = await client.application.commands.fetch();

	const deployedCommands = Array.from(result.values());
	const localCommands = Array.from(getCommandHandlers().values());

	if (!areCommandsInSync(deployedCommands, localCommands)) {
		error('Deployed commands are outdated. Please run the deployment script to update them.');
		process.exit();
	}

	deployedCommands.forEach(command => getCommandHandler(command.name)?.setId(command.id));
}
