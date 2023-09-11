import { SlashCommandBuilder, chatInputApplicationCommandMention } from "discord.js";
import type { ChatInputCommandInteraction, Snowflake } from "discord.js";

import { replyWithError } from "../utils/replyWithError.js";
import { error } from "../logger.js";

/**
 * An add-on to the `SlashCommandBuilder` class from discord.js that adds a command execution
 * method to streamline command handler creation.
 */
export class CommandHandler extends SlashCommandBuilder {
	/** The method to call when the command is received. */
	private execution?: typeof this.execute;

	/** The ID of this command. */
	public readonly id?: Snowflake;

	/**
	 * Sets the ID of this command.
	 * Do not use this method when setting up the command. The `id` will be set automatically
	 * when the commands are synced after logging in.
	 *
	 * @param id The new ID to use
	 */
	public setId (id: Snowflake): this {
		Reflect.set(this, "id", id);
		return this;
	}

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
				await this.execution(interaction);
			}
			catch (err) {
				error(`Command handler for /${this.name} encountered an error:`);
				error(err);
				void replyWithError(interaction, err);
			}
		}
	}

	/**
	 * @returns A clickable command mention if the command ID is set, and a markdown formatted
	 * 			`/name` string if not
	 */
	public getMention (): string {
		if (this.id) {
			return chatInputApplicationCommandMention(this.name, this.id);
		}
		return this.getMarkdownSlashName();
	}

	/**
	 * @returns The simple `/name` string with Discord markdown formatting to appear as code
	 */
	public getMarkdownSlashName () : string {
		return `\`${this.getSlashName()}\``;
	}

	/**
	 * @returns The name of the command, prefixed by a slash
	 */
	public getSlashName (): string {
		return `/${this.name}`;
	}
}
