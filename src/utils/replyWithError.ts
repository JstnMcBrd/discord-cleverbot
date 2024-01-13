import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction, Message } from 'discord.js';

import { embedColors } from '../parameters.js';
import { error } from '../logger.js';

/**
 * Replies to a Discord message or interaction with an error message.
 *
 * @param message The message or interaction to reply to
 * @param internalError The error to send
 */
export async function replyWithError(message: Message | ChatInputCommandInteraction, internalError: unknown): Promise<void> {
	const stringifiedError = String(internalError);

	const embed = new EmbedBuilder()
		.setColor(embedColors.error)
		.setTitle('Error')
		.setDescription('I encountered an error while trying to respond. Please forward this to my developer.')
		.setFields(
			{ name: 'Message', value: `\`\`${stringifiedError}\`\`` },
		);

	try {
		await message.reply({ embeds: [embed] });
	}
	catch (err) {
		error(err);
	}
}
