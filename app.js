

// Depends on month - MONTHS ARE 0 based

const config = require('./config');
const Calculator = require('./calculator');

const commandLineArgs = require('command-line-args');

const optionDefinitions = [
	{ name: 'from', type: String },
	{ name: 'to', type: String },
	{ name: 'filename', type: String },

	{ name: 'src', type: String, multiple: true, defaultOption: true },
	{ name: 'timeout', alias: 't', type: Number }
];

const options = commandLineArgs(optionDefinitions);

const parsedFrom = new Date(options.from);
const parsedTo = new Date(options.to);

config.FROM_DATE = parsedFrom;

if (options.to) {
	config.TO_DATE = parsedTo;
} else {
	config.TO_DATE = new Date(parsedFrom);
}



if (isNaN(config.FROM_DATE.getDate())) {
	console.error('From date is not valid');
	process.exit(1);
}

if (isNaN(config.TO_DATE.getDate())) {
	console.error('To date is not valid');
	process.exit(1);
}

config.FROM_DATE.setHours(0, 0, 0, 0);
config.TO_DATE.setHours(23, 59, 59, 59);

Calculator.init(config)
	.then(() => {})
	.catch(console.error)
	.finally(() => {});



module.exports = exports = Calculator;
