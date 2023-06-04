import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

import { replyWithError } from "../helpers/replyWithError.js";
import { error } from "../logger.js";

type CommandExecution = (interaction: ChatInputCommandInteraction) => Promise<void>;

export class CommandHandler extends SlashCommandBuilder {
	private execution?: CommandExecution;

	public setExecution (execution: CommandExecution): this {
		this.execution = execution;
		return this;
	}

	public async execute (interaction: ChatInputCommandInteraction): Promise<void> {
		if (this.execution) {
			try {
				await this.execution(interaction);
			}
			catch (err) {
				error(err);
				replyWithError(interaction, err);
			}
		}
	}
}
