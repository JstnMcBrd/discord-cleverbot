/*
 * This is a simple and lightweight script to deploy slash commands to Discord.
 * It only needs to be run when commands are updated.
 *
 * Usage: node deploy-commands.js [ACCOUNT DIRECTORY NAME]
*/

//import dependencies
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const authFilePath = "./accounts/" + process.argv[2] + "/" + "auth.json"
const { userId, token } = require(authFilePath);

//gather all the command files
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//extract the JSON contents of all the command files
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
	console.log("Retrieved /" + command.data.name);
}

//register the commands with Discord
const rest = new REST({ version: '10' }).setToken(token);
rest.put( Routes.applicationCommands(userId), { body: commands })
	.then((data) => console.log(`Successfully deployed ${data.length} application commands.`))
	.catch(console.error);