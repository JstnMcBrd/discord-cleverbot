import { isDeepStrictEqual } from 'node:util';

import type { ApplicationCommand } from 'discord.js';

import { CommandHandler } from '../commands/CommandHandler.js';

/**
 * @param deployedCommands A list of commands currently deployed, pulled from the Discord API
 * @param localCommands A list of command handlers from local definitions
 * @returns Whether the deployed and local command definitions are in sync
 */
export function areCommandsInSync(deployedCommands: ApplicationCommand[], localCommands: CommandHandler[]): boolean {
	if (deployedCommands.length !== localCommands.length) {
		return false;
	}
	for (const deployedCommand of deployedCommands) {
		const localCommand = localCommands.find(cmd => cmd.name === deployedCommand.name);
		if (!localCommand) {
			return false;
		}

		// Comparing all the different values of two distinct types is difficult
		// So we'll break them down into their comparable values and use `util.isDeepStrictEqual()`
		const deployedValues = getCommandComparableValues(deployedCommand);
		const localValues = getCommandComparableValues(localCommand);
		if (!isDeepStrictEqual(deployedValues, localValues)) {
			return false;
		}
	}
	return true;
}

/**
 * @returns An object of the comparable values between `ApplicationCommand` and `CommandHandler`
 */
function getCommandComparableValues(command: ApplicationCommand | CommandHandler) {
	const options = command instanceof CommandHandler
		? command.options.map(opt => opt.toJSON())
		: command.options;
	return {
		name: command.name,
		description: command.description,
		options: options.map(opt => ({
			name: opt.name,
			description: opt.description,
			type: opt.type,
			// required: opt.required,
		})),
	};
}
