import type { CommandHandler } from "../@types/CommandHandler";

import { help } from "./help";
import { unwhitelist } from "./unwhitelist";
import { whitelist } from "./whitelist";

const commands = new Map<string, CommandHandler>();

addCommand(help);
addCommand(unwhitelist);
addCommand(whitelist);

function addCommand(cmd: CommandHandler): void {
	const name = cmd.name;

	if (commands.has(name)) {
		throw new TypeError(`Failed to add command '${name}' when a command with that name was already added`);
	}

	commands.set(name, cmd);
}

export function getCommands(): ReadonlyMap<string, CommandHandler> {
	return commands;
}

export function getCommand(name: string): CommandHandler | undefined {
	return commands.get(name);
}
