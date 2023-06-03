import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

type CommandExecution = (interaction: ChatInputCommandInteraction) => Promise<void>;

export class CommandHandler extends SlashCommandBuilder {
	private execution: CommandExecution | undefined;

	setExecution (execution: CommandExecution): this {
		this.execution = execution;
		return this;
	}

	async execute (interaction: ChatInputCommandInteraction): Promise<void> {
		if (this.execution) {
			await this.execution(interaction);
		}
	}
}
