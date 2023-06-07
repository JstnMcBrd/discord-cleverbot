import { SlashCommandBuilder, type Awaitable } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

import { replyWithError } from "../helpers/replyWithError.js";
import { error } from "../logger.js";

export class CommandHandler extends SlashCommandBuilder {
	private execution?: typeof this.execute;

	public setExecution (execution: typeof this.execute): this {
		this.execution = execution;
		return this;
	}

	public execute (interaction: ChatInputCommandInteraction): Awaitable<void> {
		if (this.execution) {
			try {
				return this.execution(interaction);
			}
			catch (err) {
				error(err);
				replyWithError(interaction, err);
			}
		}
	}
}
