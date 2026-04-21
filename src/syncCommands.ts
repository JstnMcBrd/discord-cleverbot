import type { ApplicationCommand, Client } from 'discord.js';

import type { CommandHandler } from './commands/CommandHandler.ts';
import { getCommandHandler, getCommandHandlers } from './commands/index.ts';
import { areCommandsInSync } from './utils/areCommandsInSync.ts';
import { info } from './logger.ts';

/**
 * - Fetches deployed commands from the client application
 * - Checks if they match the commands stored locally
 * - Re-deploys commands if necessary
 * - Sets the command IDs of each command handler
 *
 * @param client The current logged-in client
 * @throws If the commands are not in-sync even after re-deploying
 */
export async function syncCommands(client: Client<true>): Promise<void> {
	const localCommands = Array.from(getCommandHandlers().values());

	let deployedCommands = await getDeployedCommands(client);

	if (!areCommandsInSync(deployedCommands, localCommands)) {
		info('Deploying commands...');
		await deployCommands(client, localCommands);

		deployedCommands = await getDeployedCommands(client);
		if (!areCommandsInSync(deployedCommands, localCommands)) {
			throw new Error('Failed to deploy commands');
		}
	}

	for (const command of deployedCommands) {
		getCommandHandler(command.name)?.setId(command.id);
	}
}

/**
 * @returns The list of commands currently deployed
 */
async function getDeployedCommands(client: Client<true>): Promise<ApplicationCommand[]> {
	const result = await client.application.commands.fetch();
	return Array.from(result.values());
}

/**
 * Re-deploys the given commands, overwriting the currently deployed commands.
 */
async function deployCommands(client: Client<true>, commands: CommandHandler[]): Promise<void> {
	const commandJSONs = commands.map(command => command.toJSON());
	await client.application.commands.set(commandJSONs);
}
