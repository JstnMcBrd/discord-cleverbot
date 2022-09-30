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

const { eventError } = require('./');

// Called whenever the discord.js client encounters an error
const onError = function(error) {
	console.log();
	console.error('Discord Client encountered error'.warning);
	console.error('\t', debugFormatError(error));
	console.log();
};

// Takes either a string or an Error and gives them the error color for the console
// TODO duplicate method, abstract this out
const debugFormatError = function(error) {
	// If the error is just a string, color it with the error color
	if (typeof (error) === 'string') {
		return error.error;
	}

	// If the error is an error object, color the title with the error color
	const e = new Error();
	if (error.name !== undefined) {
		e.name = error.name.error;
	}
	e.message = error.message;
	return e;
};