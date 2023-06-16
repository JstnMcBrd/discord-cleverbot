/** discord-cleverbot */

import { Client, Partials, GatewayIntentBits } from "discord.js";

import { registerEventHandlers } from "./events/index.js";
import { getToken, load as loadEnv } from "./memory/env.js";
import { connect } from "./connect.js";
import { info } from "./logger.js";

info("discord-cleverbot");
info();

// Load environment variables
loadEnv();
const token = getToken();

// Setup client
const client = new Client({
	partials: [
		// Necessary to receive DMs
		Partials.Channel,
	],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
	],
});

registerEventHandlers(client);

// Login
info("Logging in...");
void connect(client, token);
