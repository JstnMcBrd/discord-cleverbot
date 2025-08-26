import { EventHandler } from './EventHandler.js';
import { refresh } from '../refresh.js';
import { debug } from '../logger.js';
import { syncCommands } from '../commands/index.js';

/** Called once the client successfully logs in. */
export const clientReady = new EventHandler('clientReady')
	.setOnce(true)
	.setExecution(async (client) => {
		debug(`\tUser: ${client.user.username} (${client.user.id})`);
		await syncCommands(client);
		await refresh(client);
	});
