import type { Interaction } from "discord.js";

import type { EventHandler } from "../@types/EventHandler.js";
import * as logger from "../logger.js";
import { replyWithError } from "../helpers/replyWithError.js";
import { getCommandHandler } from "../commands/index.js";
import { logEventError } from "./index.js";

export const interactionCreate: EventHandler<"interactionCreate"> = {
	name: "interactionCreate",
	once: false,
	async execute(interaction: Interaction) {
		try {
			await onInteraction(interaction);
		}
		catch (error) {
			logEventError(interactionCreate.name, error);
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
	const command = getCommandHandler(interaction.commandName);
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
		replyWithError(interaction, error);
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
	if (interaction.channel !== null && !interaction.channel.isDMBased() && !interaction.channel.partial) {
		str += `\nChannel: ${interaction.channel.name} (${interaction.channel.id})`;
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
