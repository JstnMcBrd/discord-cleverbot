/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 *
 * Usage: node deploy-commands.js [account name] [options]
*/

// Verify input
const usage = function() {
	console.log('Usage: node deploy-commands.js [account name] [options]');
	process.exit(1);
};
if (process.argv[2] === undefined) usage();
const account = process.argv[2];
const reset = (process.argv[3] === '--reset');

// Import dependencies
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const authFilePath = './accounts/' + account + '/' + 'config.json';
const { clientId, token } = require(authFilePath);

// Gather all the command files
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Extract the JSON contents of all the command files
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
	console.log('Retrieved /' + command.data.name);
}

// Register the commands with Discord
const rest = new REST({ version: '10' }).setToken(token);
const deploy = async function(cmds) {
	return rest.put(Routes.applicationCommands(clientId), { body: cmds });
};

// If reset option was selected, delete all commands before deploying new ones
if (reset) {
	deploy([]).then(() => {
		console.log('Successfully deleted all application commands.');
		deploy(commands)
			.then((data) => console.log(`Successfully deployed ${data.length} application commands.`))
			.catch(console.error);
	}).catch(console.error);
}
// Otherwise, just deploy an update
else {
	deploy(commands)
		.then((data) => console.log(`Successfully deployed ${data.length} application commands.`))
		.catch(console.error);
}