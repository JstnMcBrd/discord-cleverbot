import type { Interaction } from "discord.js";

import { EventHandler } from "./EventHandler.js";
import { getCommandHandler } from "../commands/index.js";
import { indent } from "../helpers/indent.js";
import { debug, info } from "../logger.js";

/** Called whenever the discord.js client receives an interaction (usually a slash command). */
export const interactionCreate = new EventHandler("interactionCreate")
	.setOnce(false)
	.setExecution(async function (interaction: Interaction): Promise<void> {
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
		await command.execute(interaction);
	});

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
