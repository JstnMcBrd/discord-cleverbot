const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints a simple guide about me'),
		
	async execute(interaction) {
		var userMention = "<@"+interaction.client.user.id+">";
		
		var embed = {
			title: "User Guide",
			description: "Hello! I am " + userMention + ", a chat bot for Discord. I respond to your messages using artifical intelligence from the [Cleverbot](https://www.cleverbot.com/) API.",
			color: 13621503, //icy white
			fields: [
				{
					name: "Whitelisting",
					value: "By default, I will not respond to any messages in any channels to avoid spam. Use the **/whitelist** command in a channel to allow me to talk there. After that, I will respond to every message sent in that channel."
				},
				{
					name: "Unwhitelisting",
					value: "If you would like me to stop responding to messages in a whitelisted channel, use the **/unwhitelist** command there. After that, I won't respond to any messages until you whitelist the channel again."
				},
				{
					name: "Mentioning",
					value: "If you would like me to reply to a single message, just include " + userMention + " in your message. I will always respond, even in unwhitelisted channels."
				},
				{
					name: "Ignoring",
					value: "If you would like me to ignore a message in a whitelisted channel, begin the message with '> '. I will pretend I never saw it. You can use this to talk about me behind my back or laugh with your friends about something I said."
				},
				{
					name: "Adding To Other Servers",
					value: "For now, this feature is disabled. Please check with my developer if you would like to add me to your server."
				}
			],
			timestamp: interaction.extraInfo.lastUpdated.toISOString(),
			footer: {
				icon_url: interaction.client.user.avatarURL(),
				text: "Last Updated"
			}
		}
		
		interaction.reply({embeds: [embed]});
	},
};