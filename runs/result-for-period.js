const config = require('../config');
const { exec } = require('child_process');

const fromDate = new Date('2023-05-01');
fromDate.setHours(0, 0, 0, 0);


const toDate = new Date('2023-05-31');
toDate.setHours(0, 0, 0, 0);

const cursorDate = new Date(fromDate);

const batterySize = 12;

const kwhPerTransaction = 1000;

async function run() {
	while (toDateIsHigherOrEqual(cursorDate, toDate)) {
		let output = await runProgram(cursorDate, batterySize, kwhPerTransaction);
		console.log(output);
		cursorDate.setDate(cursorDate.getDate() + 1);
	}
	

}




async function runProgram(from, batterySize, kwhPerTransaction) {
	return new Promise((resolve, reject) => {
		let month = from.getMonth() + 1;
		if (month < 10) {
			month = `0${month}`;
		}
		let day = from.getDate();
		if (day < 10) {
			day = `0${day}`;
		}
		const fromAsString = `${from.getFullYear()}-${month}-${day}`;
		exec(`node app.js --from=${fromAsString} --battery_size=${batterySize} --kwh_per_transaction=${kwhPerTransaction} --output=DEFAULT --max_trades=10 --min_profit_per_transaction=50`, (err, stdout, stderr) => {
			if (err) {
				return reject(err);
			}
			if (stderr) {
				return reject(stderr);
			}
			resolve(stdout);
		});

	});

}


function toDateIsHigherOrEqual(from, to) {
	if (to.getFullYear() > from.getFullYear()) {
		return true;
	}
	if (to.getMonth() > from.getMonth()) {
		return true;
	}
	if (to.getDate() >= from.getDate() && to.getMonth() >= from.getMonth()) {
		return true;
	}
	return false;
}

run()
	.then(() => {})
	.catch(console.error);