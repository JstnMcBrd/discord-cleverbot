import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandHandler } from "../commands/CommandHandler.js";
import { EventHandler } from "./EventHandler.js";
import { getCommandHandler } from "../commands/index.js";
import { debug, info } from "../logger.js";

/** Called whenever the client receives an interaction (usually a slash command). */
export const interactionCreate = new EventHandler("interactionCreate")
	.setOnce(false)
	.setExecution(async interaction => {
		// Ignore any interactions that are not commands
		if (!interaction.isChatInputCommand()) {
			return;
		}

		// Ignore any commands that are not recognized
		const command = getCommandHandler(interaction.commandName);
		if (!command) {
			return;
		}

		logInteraction(interaction, command);

		// Execute the command script
		await command.execute(interaction);
	});

/**
 * Logs the current interaction.
 */
function logInteraction (interaction: ChatInputCommandInteraction, command: CommandHandler): void {
	info(`Executing command ${command.getSlashName()}`);
	if (interaction.channel) {
		debug(`\tChannel: ${
			interaction.channel.isDMBased()
				? `@${interaction.channel.recipient?.username ?? "unknown user"}`
				: `#${interaction.channel.name}`
		} (${interaction.channelId})`);
	}
	debug(`\tUser: ${interaction.user.username} (${interaction.user.id})`);
}
