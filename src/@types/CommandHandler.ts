import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

type CommandExecution = (interaction: ChatInputCommandInteraction) => Promise<void>;

export class CommandHandler extends SlashCommandBuilder {
	private execution: CommandExecution | undefined;

	setExecution(execution: CommandExecution): void {
		this.execution = execution;
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (this.execution) {
			await this.execution(interaction);
		}
	}
}
