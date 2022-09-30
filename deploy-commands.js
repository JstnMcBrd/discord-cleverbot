/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 *
 * Usage: node deploy-commands.js [account name]
*/

// Verify input
const usage = function() {
	console.log('Usage: node deploy-commands.js [account name]');
	process.exit(1);
};
if (process.argv[2] === undefined) usage();
const account = process.argv[2];

// Import dependencies
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('discord.js');
const authFilePath = `./accounts/${account}/config.json`;
const { token } = require(authFilePath);

// Gather all the command files
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Extract the JSON contents of all the command files
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
	console.log(`Retrieved /${command.data.name}`);
}

// Log in to the Client
const client = new Client({ intents: [] });
client.login(token).then(() => console.log('Client logged in'));

// Register the commands with Discord
client.once('ready', async (c) => {
	const data = await c.application.commands.set(commands);
	console.log(`Successfully deployed ${data.size} application commands`);

	// Make sure to log out
	console.log('Client logging out...');
	c.destroy();
});