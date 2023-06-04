import type { Interaction } from "discord.js";

import type { EventHandler } from "../@types/EventHandler.js";
import { getCommandHandler } from "../commands/index.js";
import { logEventError } from "./index.js";
import { indent } from "../helpers/indent.js";
import { replyWithError } from "../helpers/replyWithError.js";
import { debug, error, info, warn } from "../logger.js";

export const interactionCreate: EventHandler<"interactionCreate"> = {
	name: "interactionCreate",
	once: false,
	async execute (interaction: Interaction) {
		try {
			await onInteraction(interaction);
		}
		catch (err) {
			logEventError(interactionCreate.name, err);
		}
	},
};

/**
 * Called whenever the discord.js client receives an interaction (usually means a slash command).
 */
async function onInteraction (interaction: Interaction): Promise<void> {
	// Ignore any interactions that are not commands
	if (!interaction.isChatInputCommand()) {
		return;
	}
	info("Received command interaction");
	debug(indent(debugInteraction(interaction), 1));

	// Ignore any commands that are not recognized
	const command = getCommandHandler(interaction.commandName);
	if (!command) {
		return;
	}
	info("Command recognized");

	// Execute the command script
	info("Executing command");
	try {
		await command.execute(interaction);
	}
	catch (err) {
		error(err);
		warn("Failed to execute command");
		info();
		replyWithError(interaction, err);
		return;
	}
	info("Command executed successfully");
	info();
}

/**
 * Formats important information about an interaction to a string.
 */
function debugInteraction (interaction: Interaction): string {
	let str = "INTERACTION";
	if (interaction.isChatInputCommand()) {
		str += `\nCommand: ${interaction.commandName}`;
	}
	str += `\nUser:    ${interaction.user.tag} (${interaction.user.id})`;
	if (interaction.channel !== null && !interaction.channel.isDMBased()) {
		str += `\nChannel: ${interaction.channel.name} (${interaction.channel.id})`;
	}
	// Compensate for DMs
	if (interaction.guild !== null) {
		str += `\nGuild:   ${interaction.guild.name} (${interaction.guild.id})`;
	}
	return str;
}
