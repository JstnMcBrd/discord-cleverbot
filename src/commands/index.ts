import type { CommandHandler } from "../@types/CommandHandler";

import { help } from "./help";
import { unwhitelist } from "./unwhitelist";
import { whitelist } from "./whitelist";

const commands = new Map<string, CommandHandler>();

addCommandHandler(help);
addCommandHandler(unwhitelist);
addCommandHandler(whitelist);

function addCommandHandler(command: CommandHandler): void {
	const name = command.name;

	if (commands.has(name)) {
		throw new TypeError(`Failed to add command '${name}' when a command with that name was already added`);
	}

	commands.set(name, command);
}

export function getCommandHandlers(): ReadonlyMap<string, CommandHandler> {
	return commands;
}

export function getCommandHandler(name: string): CommandHandler | undefined {
	return commands.get(name);
}
