import { exit } from 'node:process';

import { Events } from 'discord.js';

import { EventHandler } from './EventHandler.ts';
import { debug, error, info } from '../logger.ts';
import { refresh } from '../refresh.ts';
import { syncCommands } from '../syncCommands.ts';

/** Called once the client successfully logs in. */
export const clientReady = new EventHandler(Events.ClientReady)
	.setOnce(true)
	.setExecution(async (client) => {
		try {
			debug(`\tUser: ${client.user.username} (${client.user.id})`);
			await syncCommands(client);
			await refresh(client);
		}
		catch (err) {
			error(err);

			// If the clientReady event fails, the bot is not properly initialized and must abort
			info('Aborting...');
			exit(1);
		}
	});
