

// Depends on month - MONTHS ARE 0 based

const config = require('./config');
const Calculator = require('./calculator');

const commandLineArgs = require('command-line-args');

const optionDefinitions = [
	{ name: 'from', type: String },
	{ name: 'to', type: String },
	{ name: 'filename', type: String },
	{ name: 'battery_size', type: Number, defaultValue: config.BATTERY_SIZE_KWH },
	{ name: 'kwh_per_transaction', type: Number, defaultValue: config.KWH_SOLD_PER_TRANSACTION },
	{ name: 'max_trades', type: Number, defaultValue: config.MAX_BUY_SELLS_PER_DAY },
	{ name: 'output', type: String, defaultValue: 'DEFAULT'},
	{ name: 'min_profit_per_transaction', type: Number, defaultValue: config.MIN_PROFIT_PER_KW}
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

config.BATTERY_SIZE_KWH = options.battery_size;
config.KWH_SOLD_PER_TRANSACTION = options.kwh_per_transaction;
config.MAX_BUY_SELLS_PER_DAY = options.max_trades;
config.OUTPUT = options.output.toUpperCase();
config.MIN_PROFIT_PER_KW = options.min_profit_per_transaction;

if (!['DEFAULT', 'JSON'].includes(config.OUTPUT)) {
	throw Error('Output given is invalid');
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
