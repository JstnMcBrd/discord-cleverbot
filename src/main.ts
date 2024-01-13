/** discord-cleverbot */

import { Client, Partials, GatewayIntentBits } from 'discord.js';

import { registerEventHandlers } from './events/index.js';
import { getToken, load as loadEnv } from './memory/env.js';
import { info } from './logger.js';

info('discord-cleverbot');
info();

// Load environment variables
loadEnv();
const token = getToken();

// Setup client
const client = new Client({
	partials: [
		// Necessary to receive DMs
		// https://discordjs.guide/additional-info/changes-in-v13.html#dm-channels
		Partials.Channel,
	],
	intents: [
		// Necessary for channels to be cached
		GatewayIntentBits.Guilds,
		// Necessary to receive messageCreate events
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		// Necessary to read message content
		GatewayIntentBits.MessageContent,
	],
});

registerEventHandlers(client);

// Login
info('Logging in...');
await client.login(token);
