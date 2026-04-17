import { Events } from 'discord.js';

import { EventHandler } from './EventHandler.ts';
import { refresh } from '../refresh.ts';
import { debug } from '../logger.ts';
import { syncCommands } from '../commands/index.ts';

/** Called once the client successfully logs in. */
export const clientReady = new EventHandler(Events.ClientReady)
	.setOnce(true)
	.setExecution(async (client) => {
		debug(`\tUser: ${client.user.username} (${client.user.id})`);
		await syncCommands(client);
		await refresh(client);
	});
