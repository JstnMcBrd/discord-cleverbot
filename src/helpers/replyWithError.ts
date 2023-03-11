import type { ChatInputCommandInteraction, Message } from "discord.js";
import { EmbedBuilder } from "discord.js";

import * as logger from "../logger";
import { embedColors } from "../parameters";

/**
 * Replies to a Discord message with an error message.
 */
export function replyWithError(message: Message|ChatInputCommandInteraction, internalError: Error|unknown) {
	const stringifiedError = (internalError as object).toString();

	// Format the message as an embed
	const embed = new EmbedBuilder()
		.setColor(embedColors.error)
		.setTitle("Error")
		.setDescription("I encountered an error while trying to respond. Please forward this to my developer.")
		.setFields(
			{ name: "Message", value: `\`\`${stringifiedError}\`\`` },
		);

	// Send the error message as a reply
	logger.info("Sending error message");
	message.reply({ embeds: [embed] }).then(() => {
		logger.info("Error message sent successfully");
		logger.info();
	}).catch(error => {
		logger.error(error);
		logger.warn("Failed to send error message");
		logger.info();
	});
}
