import type { Interaction, TextChannel } from "discord.js";

import type { EventHandler } from "../@types/EventHandler";
import * as logger from "../helpers/logger";
import { replyWithError } from "../helpers/replyWithError";
import { getCommand } from "../commands";
import { eventError } from "./";

export const interactionCreate: EventHandler<"interactionCreate"> = {
	name: "interactionCreate",
	once: false,
	async execute(interaction: Interaction) {
		try {
			await onInteraction(interaction);
		}
		catch (error) {
			eventError(this.name, error as Error);
		}
	},
};

/**
 * Called whenever the discord.js client receives an interaction (usually means a slash command).
 */
async function onInteraction(interaction: Interaction): Promise<void> {
	// Ignore any interactions that are not commands
	if (!interaction.isChatInputCommand()) {
		return;
	}
	logger.info("Received command interaction");
	logger.debug(indent(debugInteraction(interaction), 1));

	// Ignore any commands that are not recognized
	const command = getCommand(interaction.commandName);
	if (!command) {
		return;
	}
	logger.info("Command recognized");

	// Execute the command script
	logger.info("Executing command");
	try {
		await command.execute(interaction);
	}
	catch (error) {
		logger.error(error);
		logger.warn("Failed to execute command");
		logger.info();
		replyWithError(interaction, error as Error);
		return;
	}
	logger.info("Command executed successfully");
	logger.info();
}

/**
 * Formats important information about an interaction to a string.
 */
function debugInteraction(interaction: Interaction): string {
	let str = "INTERACTION";
	if (interaction.isChatInputCommand()) {
		str += `\nCommand: ${interaction.commandName}`;
	}
	str += `\nUser:    ${interaction.user.tag} (${interaction.user.id})`;
	if (interaction.channel !== null) {
		str += `\nChannel: ${(interaction.channel as TextChannel).name} (${interaction.channel.id})`;
	}
	// Compensate for DMs
	if (interaction.guild !== null) {
		str += `\nGuild:   ${interaction.guild.name} (${interaction.guild.id})`;
	}
	return str;
}

/**
 * Indents strings that have more than one line.
 */
function indent(str: string, numTabs: number): string {
	let tabs = "";
	while (numTabs > 0) {
		tabs += "\t";
		numTabs--;
	}
	return (tabs + str).replaceAll("\n", `\n${tabs}`);
}
