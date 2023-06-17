import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

import { replyWithError } from "../helpers/replyWithError.js";
import { error } from "../logger.js";

/**
 * An add-on to the `SlashCommandBuilder` class from discord.js that adds a command execution
 * method to streamline command handler creation.
 */
export class CommandHandler extends SlashCommandBuilder {
	/** The method to call when the command is received. */
	private execution?: typeof this.execute;

	/**
	 * Sets the method to call when the command is received.
	 *
	 * @param execution The method to call
	 */
	public setExecution (execution: typeof this.execute): this {
		this.execution = execution;
		return this;
	}

	/**
	 * This is the callback method for when the command is received.
	 * Calls the command execution method, with proper error handling provided.
	 *
	 * @param interaction The command interaction received
	 */
	public async execute (interaction: ChatInputCommandInteraction): Promise<void> {
		if (this.execution) {
			try {
				return await this.execution(interaction);
			}
			catch (err) {
				error(`Command handler for /${this.name} encountered an error:`);
				error(err);
				void replyWithError(interaction, err);
			}
		}
	}
}
