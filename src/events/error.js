module.exports = {
	name: 'error',
	once: false,
	async execute(error) {
		try {
			onError(error);
		}
		catch (error2) {
			eventError('error', error2);
		}
	},
};

const logger = require('../helpers/logger');
const { eventError } = require('./');

// Called whenever the discord.js client encounters an error
const onError = function(error) {
	logger.info();
	logger.warn('Discord Client encountered error');
	logger.error(error);
	logger.info();
};
