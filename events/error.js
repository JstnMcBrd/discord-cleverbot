module.exports = {
	name: 'error',
	once: false,
	async execute(client, error) {
		try {
			onError(client, error);
		}
		catch (error2) {
			client.eventError('error', error2);
		}
	},
};

// Called whenever the discord.js client encounters an error
const onError = function(client, error) {
	console.log();
	console.error('Discord Client encountered error'.warning);
	console.error('\t', client.debugFormatError(error));
	console.log();
};