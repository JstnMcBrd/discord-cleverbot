import { EmbedBuilder } from "discord.js";
import type { ChatInputCommandInteraction, Message } from "discord.js";

import { error, info, warn } from "../logger.js";
import { embedColors } from "../parameters.js";

/**
 * Replies to a Discord message with an error message.
 */
export async function replyWithError (message: Message|ChatInputCommandInteraction, internalError: Error|unknown): Promise<void> {
	const stringifiedError = String(internalError);

	// Format the message as an embed
	const embed = new EmbedBuilder()
		.setColor(embedColors.error)
		.setTitle("Error")
		.setDescription("I encountered an error while trying to respond. Please forward this to my developer.")
		.setFields(
			{ name: "Message", value: `\`\`${stringifiedError}\`\`` },
		);

	// Send the error message as a reply
	info("Sending error message");
	try {
		await message.reply({ embeds: [embed] });
		info("Error message sent successfully");
		info();
	}
	catch (err) {
		error(err);
		warn("Failed to send error message");
		warn();
	}
}
