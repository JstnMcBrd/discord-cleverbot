/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 *
 * Usage: node deploy-commands.js [account name]
 *
 * // TODO make this file typescript-safe
*/

import fs from 'node:fs';
import path from 'node:path';
import { ApplicationCommandDataResolvable, Client } from 'discord.js';

// Verify input
function usage(): void {
	console.log('Usage: node deploy-commands.js [account name]');
}
if (process.argv[2] === undefined) {
	usage();
	process.exit(1);
}
const account = process.argv[2];

// Import auth token
const authFilePath = `../accounts/${account}/config.json`;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { token } = require(authFilePath);

// Gather all the command files
const commands: Array<ApplicationCommandDataResolvable> = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Extract the JSON contents of all the command files
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
	const command = require(filePath);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
	commands.push(command.data.toJSON());
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
	console.log(`Retrieved /${command.data.name}`);
}

// Log in to the Client
const client = new Client({ intents: [] });
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
client.login(token)
	.then(() => console.log('Client logged in'))
	.catch((error) => console.error(error));

// Register the commands with Discord
client.once('ready', async (c) => {
	const data = await c.application.commands.set(commands);
	console.log(`Successfully deployed ${data.size} application commands`);

	// Make sure to log out
	console.log('Client logging out...');
	c.destroy();
});