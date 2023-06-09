import type { CommandHandler } from "./CommandHandler.js";
import { help } from "./help.js";
import { invite } from "./invite.js";
import { unwhitelist } from "./unwhitelist.js";
import { whitelist } from "./whitelist.js";

/** The list of all command handlers. */
const commands = new Map<string, CommandHandler>();

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
function addCommandHandler (command: CommandHandler): void {
	if (commands.has(command.name)) {
		throw new TypeError(`Failed to add command '${command.name}' because a command with that name already exists.`);
	}

	commands.set(command.name, command);
}

/**
 * @returns A read-only list of the command handlers
 */
export function getCommandHandlers (): ReadonlyMap<string, CommandHandler> {
	return commands;
}

/**
 * @returns The handler with the given command name, or undefined
 */
export function getCommandHandler (name: string): CommandHandler | undefined {
	return commands.get(name);
}
