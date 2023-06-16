import type { Interaction } from "discord.js";

import { EventHandler } from "./EventHandler.js";
import { getCommandHandler } from "../commands/index.js";
import { debug, info } from "../logger.js";

/** Called whenever the discord.js client receives an interaction (usually a slash command). */
export const interactionCreate = new EventHandler("interactionCreate")
	.setOnce(false)
	.setExecution(async function (interaction: Interaction): Promise<void> {
		// Ignore any interactions that are not commands
		if (!interaction.isChatInputCommand()) {
			return;
		}

		// Ignore any commands that are not recognized
		const command = getCommandHandler(interaction.commandName);
		if (!command) {
			return;
		}

		// Execute the command script
		info(`Executing command /${interaction.commandName}`);
		if (interaction.channel) {
			debug(`\tChannel: ${
				interaction.channel.isDMBased()
					? `@${interaction.channel.recipient?.username ?? "unknown user"}`
					: `#${interaction.channel.name}`
			} (${interaction.channelId})`);
		}
		debug(`\tUser: ${interaction.user.username} (${interaction.user.id})`);
		await command.execute(interaction);
	});
