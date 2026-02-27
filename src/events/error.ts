import { Events } from 'discord.js';

import { EventHandler } from './EventHandler.js';
import { error as errorLog } from '../logger.js';

/** Called whenever the client encounters an error. */
export const error = new EventHandler(Events.Error)
	.setOnce(false)
	.setExecution(async (err) => {
		errorLog('Client encountered an error:');
		errorLog(err);
		return Promise.resolve();
	});
