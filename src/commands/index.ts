import type { CommandHandler } from './CommandHandler.ts';
import { help } from './help.ts';
import { invite } from './invite.ts';
import { unwhitelist } from './unwhitelist.ts';
import { whitelist } from './whitelist.ts';

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
