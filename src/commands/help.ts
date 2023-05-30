import type { User } from "discord.js";
import { EmbedBuilder, userMention } from "discord.js";

import { CommandHandler } from "../@types/CommandHandler.js";
import { lastUpdated, embedColors, version } from "../parameters.js";

export const help = new CommandHandler()
	.setName("help")
	.setDescription("Prints a simple guide about me")
	.setExecution(async interaction => {
		const embed = createHelpEmbed(interaction.client.user);
		await interaction.reply({ embeds: [embed] });
	});

function createHelpEmbed(user: User): EmbedBuilder {
	const mention = userMention(user.id);
	const avatarURL = user.avatarURL();
	return new EmbedBuilder()
		.setColor(embedColors.info)
		.setTitle("User Guide")
		.setDescription(`Hello! I am ${mention}, a chat bot for Discord. I respond to your messages using artifical intelligence from the [Cleverbot](https://www.cleverbot.com/) API.`)
		.setFields(
			{ name: "Whitelisting", value: "By default, I will not respond to any messages in any channels to avoid spam. Use the **/whitelist** command in a channel to allow me to talk there. After that, I will respond to every message sent in that channel." },
			{ name: "Unwhitelisting", value: "If you would like me to stop responding to messages in a whitelisted channel, use the **/unwhitelist** command there. After that, I won't respond to any messages until you whitelist the channel again." },
			{ name: "Mentioning", value: `If you would like me to reply to a single message, just include ${mention} in your message. I will always respond, even in unwhitelisted channels.` },
			{ name: "Ignoring", value: "If you would like me to ignore a message in a whitelisted channel, begin the message with '> '. I will pretend I never saw it. You can use this to talk about me behind my back or laugh with your friends about something I said." },
			{ name: "Adding To Other Servers", value: "For now, this feature is disabled. Please check with my developer if you would like to add me to your server." },
		)
		.setFooter({
			text: `Version ${version}\nLast Updated`,
			iconURL: (avatarURL !== null) ? avatarURL : undefined,
		})
		.setTimestamp(lastUpdated);
}
